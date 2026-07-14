import QRCode from "react-qr-code";

interface CodeBlockProps {
  text: string;
}

export default function CodeBlock({ text }: CodeBlockProps) {
  const downloadQR = () => {
    const svg = document.getElementById("ticket-qr");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;

      ctx?.fillRect(0, 0, 300, 300);
      ctx?.drawImage(img, 0, 0, 300, 300);

      const png = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.download = "StadiumVerse-Ticket.png";
      link.href = png;
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "16px",
        }}
      >
        <QRCode
          id="ticket-qr"
          value={text}
          size={220}
        />
      </div>

      <button
        onClick={downloadQR}
        style={{
          padding: "10px 18px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        ⬇ Download QR Ticket
      </button>
    </div>
  );
}