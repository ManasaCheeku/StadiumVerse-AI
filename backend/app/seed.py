from sqlalchemy.orm import Session

from .domain import Role, User
from .security import hash_password


SEED_USERS = [
    ("fan@stadiumverse.ai", "Fan Demo", Role.fan.value),
    ("security@stadiumverse.ai", "Security Demo", Role.security.value),
    ("volunteer@stadiumverse.ai", "Volunteer Demo", Role.volunteer.value),
    ("manager@stadiumverse.ai", "Ops Manager Demo", Role.manager.value),
    ("admin@stadiumverse.ai", "Admin Demo", Role.admin.value),
]


def seed_database(db: Session) -> None:
    for email, name, role in SEED_USERS:
        exists = db.query(User).filter(User.email == email).one_or_none()
        if exists is None:
            db.add(User(email=email, full_name=name, role=role, password_hash=hash_password("Password123!")))
    db.commit()

