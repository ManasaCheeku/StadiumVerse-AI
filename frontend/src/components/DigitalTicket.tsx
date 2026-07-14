import { memo, useCallback, useMemo, useRef } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type TicketStatus = "VALID" | "USED" | "EXPIRED";

type Ticket = {
  readonly fanName: string;
  readonly match: string;
  readonly stadium: string;
  readonly gate: string;
  readonly seat: string;
  readonly ticketId: string;
  readonly kickoff: string;
  readonly date: string;
  readonly status: TicketStatus;
};

type DigitalTicketProps = {
  readonly ticket?: Ticket;
};

/** Shown when no `ticket` prop is supplied, e.g. in previews/demos. */
const DEFAULT_TICKET: Ticket = {
  fanName: "Manasa M R",
  match: "France 🇫🇷 vs Brazil 🇧🇷",
  stadium: "MetLife Stadium",
  gate: "E12",
  seat: "B203",
  ticketId: "FIFA-2026-00045829",
  kickoff: "07:30 PM",
  date: "19 July 2026",
  status: "VALID",
};

/** Badge background color per ticket status. Defined once at module scope
 * so the mapping object isn't recreated on every render. */
const STATUS_BADGE_STYLES: Record<TicketStatus, string> = {
  VALID: "bg-emerald-600",
  USED: "bg-yellow-500",
  EXPIRED: "bg-red-600",
};

const APP_TICKET_TITLE = "StadiumVerse AI - Digital Match Ticket";

// QR code rendering
const QR_CODE_SIZE_PX = 220;

// html2canvas capture settings for the downloadable PDF
const CANVAS_CAPTURE_SCALE = 2;
const TICKET_CAPTURE_BACKGROUND_COLOR = "#0f172a";

// jsPDF layout constants (all in mm, per the "p"/"mm"/"a4" document setup)
const PDF_ORIENTATION = "p";
const PDF_UNIT = "mm";
const PDF_FORMAT = "a4";
const PDF_PAGE_MARGIN_MM = 10;
const PDF_TITLE_FONT_SIZE = 18;
const PDF_TITLE_Y_MM = 12;
const PDF_IMAGE_Y_MM = 20;

/**
 * Displays a FIFA World Cup 2026 digital match ticket with a scannable QR
 * code, plus actions to download the ticket as a PDF, print it, or share
 * its details.
 *
 * @param props.ticket - Ticket details to render. Falls back to a sample
 * ticket when omitted.
 */
function DigitalTicket({ ticket = DEFAULT_TICKET }: DigitalTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        ticketId: ticket.ticketId,
        gate: ticket.gate,
        seat: ticket.seat,
        fan: ticket.fanName,
      }),
    [ticket.ticketId, ticket.gate, ticket.seat, ticket.fanName],
  );

  /** Renders the ticket card to an image and embeds it in a downloadable,
   * ticket-ID-named PDF. */
  const downloadTicket = useCallback(async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: CANVAS_CAPTURE_SCALE,
        useCORS: true,
        backgroundColor: TICKET_CAPTURE_BACKGROUND_COLOR,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF(PDF_ORIENTATION, PDF_UNIT, PDF_FORMAT);

      const pageWidth = pdf.internal.pageSize.getWidth();

      const imgWidth = pageWidth - PDF_PAGE_MARGIN_MM * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFontSize(PDF_TITLE_FONT_SIZE);
      pdf.text(APP_TICKET_TITLE, PDF_PAGE_MARGIN_MM, PDF_TITLE_Y_MM);

      pdf.addImage(imgData, "PNG", PDF_PAGE_MARGIN_MM, PDF_IMAGE_Y_MM, imgWidth, imgHeight);

      pdf.save(`${ticket.ticketId}.pdf`);
    } catch (error) {
      console.error("Failed to generate the ticket PDF", error);
    }
  }, [ticket.ticketId]);

  /** Opens the browser's print dialog for the current page. */
  const printTicket = useCallback(() => {
    window.print();
  }, []);

  /** Shares ticket details via the Web Share API when available; falls
   * back to copying the ticket ID to the clipboard, and finally to an
   * alert if clipboard access is also unavailable. */
  const shareTicket = useCallback(async () => {
    const shareData = {
      title: APP_TICKET_TITLE,
      text: `${ticket.match} at ${ticket.stadium} — Gate ${ticket.gate}, Seat ${ticket.seat}. Ticket ID: ${ticket.ticketId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Ignore user-cancelled shares; log anything unexpected for diagnostics.
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to share the digital ticket", error);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(ticket.ticketId);
      alert("Ticket ID copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy ticket ID to clipboard", error);
      alert(`Ticket ID: ${ticket.ticketId}`);
    }
  }, [ticket.match, ticket.stadium, ticket.gate, ticket.seat, ticket.ticketId]);

  return (
    <section
      ref={ticketRef}
      aria-labelledby="digital-ticket-heading"
      className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2
            id="digital-ticket-heading"
            className="text-4xl font-bold text-white"
          >
            <span aria-hidden="true">🎫</span> Digital Match Ticket
          </h2>

          <p className="mt-2 text-slate-400">FIFA World Cup 2026</p>
        </div>

        <span
          className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${STATUS_BADGE_STYLES[ticket.status]}`}
          aria-label={`Ticket status: ${ticket.status}`}
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

            <h3 className="text-2xl font-bold text-white">{ticket.match}</h3>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Stadium
            </p>

            <h3 className="text-lg text-white">{ticket.stadium}</h3>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Gate
              </p>

              <h3 className="text-xl font-bold text-white">{ticket.gate}</h3>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Seat
              </p>

              <h3 className="text-xl font-bold text-white">{ticket.seat}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Date
              </p>

              <h3 className="text-white">{ticket.date}</h3>
            </div>

            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Kickoff
              </p>

              <h3 className="text-white">{ticket.kickoff}</h3>
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadTicket}
              aria-label="Download Digital Ticket"
              title="Download this ticket as a PDF"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Download Ticket
            </button>

            <button
              type="button"
              onClick={printTicket}
              aria-label="Print Digital Ticket"
              title="Print this ticket"
              className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
            >
              Print Ticket
            </button>

            <button
              type="button"
              onClick={shareTicket}
              aria-label="Share Digital Ticket"
              title="Share this ticket's details"
              className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              Share Ticket
            </button>
          </div>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 shadow-lg">
          <QRCode value={qrPayload} size={QR_CODE_SIZE_PX} aria-label="Digital ticket QR code" />

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

export default memo(DigitalTicket);
