import QRCode from "react-qr-code";

type Ticket = {
  fanName: string;
  match: string;
  stadium: string;
  gate: string;
  seat: string;
  ticketId: string;
  kickoff: string;
  date: string;
  status: "VALID" | "USED" | "EXPIRED";
};

type DigitalTicketProps = {
  ticket?: Ticket;
};

export default function DigitalTicket({
  ticket = {
    fanName: "Manasa M R",
    match: "France 🇫🇷 vs Brazil 🇧🇷",
    stadium: "MetLife Stadium",
    gate: "E12",
    seat: "B203",
    ticketId: "FIFA-2026-00045829",
    kickoff: "07:30 PM",
    date: "19 July 2026",
    status: "VALID",
  },
}: DigitalTicketProps) {
  const qrPayload = JSON.stringify({
    ticketId: ticket.ticketId,
    gate: ticket.gate,
    seat: ticket.seat,
    fan: ticket.fanName,
  });

  const statusStyle = {
    VALID: "bg-emerald-600",
    USED: "bg-yellow-500",
    EXPIRED: "bg-red-600",
  };

  return (
    <section
      aria-labelledby="digital-ticket-heading"
      className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="digital-ticket-heading"
            className="text-4xl font-bold text-white"
          >
            🎫 Digital Match Ticket
          </h2>

          <p className="mt-2 text-slate-400">
            FIFA World Cup 2026
          </p>
        </div>

        <span
          className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${statusStyle[ticket.status]}`}
        >
          {ticket.status}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Ticket Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Fan
            </p>

            <h3 className="text-xl font-semibold text-white">
              {ticket.fanName}
            </h3>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Match
            </p>

            <h3 className="text-2xl font-bold text-white">
              {ticket.match}
            </h3>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Stadium
            </p>

            <h3 className="text-lg text-white">
              {ticket.stadium}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Gate
              </p>

              <h3 className="text-xl font-bold text-white">
                {ticket.gate}
              </h3>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Seat
              </p>

              <h3 className="text-xl font-bold text-white">
                {ticket.seat}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Date
              </p>

              <h3 className="text-white">
                {ticket.date}
              </h3>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Kickoff
              </p>

              <h3 className="text-white">
                {ticket.kickoff}
              </h3>
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Ticket ID
            </p>

            <h3 className="break-all font-mono text-white">
              {ticket.ticketId}
            </h3>
          </div>

          <button
            type="button"
            aria-label="Download Digital Ticket"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            📥 Download Ticket
          </button>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-lg">
          <QRCode
            value={qrPayload}
            size={220}
            aria-label="Digital ticket QR code"
          />

          <p className="mt-6 text-center text-lg font-semibold text-black">
            Scan at Gate {ticket.gate}
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            Present this QR code to security for verification.
          </p>
        </div>
      </div>
    </section>
  );
}