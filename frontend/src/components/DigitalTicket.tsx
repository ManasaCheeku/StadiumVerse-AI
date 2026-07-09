import QRCode from "react-qr-code";

export default function DigitalTicket() {
  const ticket = {
    match: "France 🇫🇷 vs Brazil 🇧🇷",
    stadium: "MetLife Stadium",
    gate: "E12",
    seat: "B203",
    ticketId: "FIFA-2026-00045829",
    kickoff: "07:30 PM",
    date: "19 July 2026",
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-4xl font-bold">
            🎫 Digital Match Ticket
          </h2>

          <p className="mt-2 text-slate-400">
            FIFA World Cup 2026
          </p>

        </div>

        <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold">
          VERIFIED
        </span>

      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">

        <div className="space-y-5">

          <div>
            <p className="text-slate-400">Match</p>
            <h3 className="text-2xl font-bold">
              {ticket.match}
            </h3>
          </div>

          <div>
            <p className="text-slate-400">Venue</p>
            <h3>{ticket.stadium}</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">

            <div>
              <p className="text-slate-400">Gate</p>
              <h3 className="text-xl font-bold">
                {ticket.gate}
              </h3>
            </div>

            <div>
              <p className="text-slate-400">Seat</p>
              <h3 className="text-xl font-bold">
                {ticket.seat}
              </h3>
            </div>

          </div>

          <div>
            <p className="text-slate-400">
              Kickoff
            </p>

            <h3>{ticket.date}</h3>

            <h3>{ticket.kickoff}</h3>

          </div>

          <div>
            <p className="text-slate-400">
              Ticket ID
            </p>

            <h3 className="font-mono">
              {ticket.ticketId}
            </h3>

          </div>

        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-8">

          <QRCode
            value={ticket.ticketId}
            size={220}
          />

          <p className="mt-6 text-center text-black font-semibold">
            Scan at Gate {ticket.gate}
          </p>

        </div>

      </div>

    </div>
  );
}