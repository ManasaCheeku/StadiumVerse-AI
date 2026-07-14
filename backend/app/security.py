import base64
import hashlib
import hmac
import json
import logging
import time
from collections.abc import Awaitable, Callable
from datetime import UTC, datetime, timedelta
from typing import Any, TypedDict

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse, Response

from .config import get_settings
from .database import get_db
from .domain import Role, User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class TokenClaims(TypedDict):
    sub: str
    role: str
    iss: str
    iat: int
    nbf: int
    exp: int
    type: str


# --------------------------------------------------------------------------
# Constants
# --------------------------------------------------------------------------

ACCESS_TOKEN_TYPE = "access"
RATE_LIMIT_WINDOW_SECONDS = 60


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt with a freshly generated salt.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    """
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def _b64(data: bytes) -> str:
    """
    Base64url-encode bytes without padding, per JWT convention.
    """
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64(value: str) -> bytes:
    """
    Decode a base64url string, restoring the padding JWTs omit.
    """
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _dumps(payload: dict[str, Any]) -> bytes:
    """
    Serialize a claims dict to compact, deterministic JSON bytes.
    sort_keys ensures the same claims always produce the same signing
    input (and therefore the same token), which is useful for tests
    and for reasoning about token equality/caching.
    """
    return json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()


def _unauthorized(detail: str) -> HTTPException:
    """
    Build a standard 401 Unauthorized HTTPException with the given detail.
    Centralizes the status code so every auth-failure path stays consistent.
    """
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def create_access_token(subject: str, role: str | Role) -> str:
    """
    Issue a signed HS256 access token for the given subject and role.
    Accepts either a Role enum or a plain string.
    """
    settings = get_settings()

    header = {
        "alg": "HS256",
        "typ": "JWT",
    }

    now = datetime.now(UTC)

    # Support both Role enum and string
    role_name = role.value if isinstance(role, Role) else role

    payload = {
        "sub": subject,
        "role": role_name,
        "iss": settings.jwt_issuer,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(
            (
                now
                + timedelta(
                    minutes=settings.access_token_minutes
                )
            ).timestamp()
        ),
        "type": ACCESS_TOKEN_TYPE,
    }

    signing_input = (
        f"{_b64(_dumps(header))}."
        f"{_b64(_dumps(payload))}"
    )

    signature = hmac.new(
        settings.jwt_secret.encode(),
        signing_input.encode(),
        hashlib.sha256,
    ).digest()

    return f"{signing_input}.{_b64(signature)}"


def decode_token(token: str) -> TokenClaims:
    """
    Verify a token's signature and claims, returning the decoded payload.
    Raises HTTPException(401) for any structural, signature, or claim
    validation failure.
    """
    settings = get_settings()
    try:
        header_payload, signature = token.rsplit(".", 1)
        expected = hmac.new(settings.jwt_secret.encode(), header_payload.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64(expected), signature):
            raise ValueError("invalid signature")
        payload = json.loads(_unb64(header_payload.split(".")[1]))
    except Exception as exc:
        logger.debug("Token decode failed: %s", exc)
        raise _unauthorized("Invalid token") from exc

    # Validate claim shape before trusting any field. A well-signed token
    # with a missing/malformed claim should still fail as 401, not 500.
    if not isinstance(payload.get("sub"), str) or not isinstance(payload.get("role"), str):
        raise _unauthorized("Invalid token")
    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise _unauthorized("Invalid token")

    now = int(time.time())
    if payload.get("iss") != settings.jwt_issuer:
        raise _unauthorized("Invalid token")
    if payload.get("exp", 0) < now:
        raise _unauthorized("Expired token")
    if payload.get("nbf", 0) > now:
        raise _unauthorized("Token not yet valid")

    # All required claims have been validated above, so it's safe to build
    # a properly typed TokenClaims value here instead of casting payload.
    claims: TokenClaims = {
        "sub": payload["sub"],
        "role": payload["role"],
        "iss": payload["iss"],
        "iat": int(payload.get("iat", 0)),
        "nbf": int(payload.get("nbf", 0)),
        "exp": int(payload.get("exp", 0)),
        "type": payload["type"],
    }
    return claims


def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)

    logger.debug("JWT Payload: %s", payload)

    user = db.query(User).filter(
        User.email == payload["sub"],
        User.is_active.is_(True)
    ).one_or_none()

    if user is None:
        raise _unauthorized("User not found")

    logger.debug("Database User: %s role=%s (%s)", user.email, user.role, type(user.role))

    return user


def require_roles(*roles: Role) -> Callable[[User], User]:
    """
    Build a dependency that restricts access to users holding one of the
    given roles.
    """
    allowed = {role.value for role in roles}

    def guard(user: User = Depends(current_user)) -> User:
        # --- temporary debug logging: remove once RBAC bug is confirmed fixed ---
        logger.debug("Allowed roles: %s", allowed)
        logger.debug("Current user role: %s (type=%s)", user.role, type(user.role))
        logger.debug("Authorized: %s", user.role in allowed)
        # --------------------------------------------------------------------------

        if user.role not in allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return guard


class RateLimiter:
    """
    Simple in-memory sliding-window rate limiter, keyed by client IP.
    Suitable for single-process deployments; for multi-worker or
    multi-instance production use, back this with a shared store
    (e.g. Redis) instead — not changed here per scope.
    """

    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = {}

    async def __call__(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        settings = get_settings()
        key = request.client.host if request.client else "unknown"
        now = time.time()
        self._hits[key] = [
            hit for hit in self._hits.get(key, []) if now - hit < RATE_LIMIT_WINDOW_SECONDS
        ]
        if len(self._hits[key]) >= settings.rate_limit_per_minute:
            # Must return a Response here, not raise HTTPException: this
            # middleware sits outside FastAPI's ExceptionMiddleware, so a
            # raised HTTPException would propagate as an unhandled 500
            # instead of producing the intended 429 JSON response.
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"},
            )
        self._hits[key].append(now)
        return await call_next(request)