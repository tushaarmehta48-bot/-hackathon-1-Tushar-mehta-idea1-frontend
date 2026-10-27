import { jsPDF } from "jspdf";
import QRCode from "qrcode";

/** sRGB fills for jsPDF (html2canvas breaks on modern CSS color functions). */
const COLORS = {
  forest: [30, 61, 50] as const,
  forestLight: [47, 82, 68] as const,
  cream: [246, 241, 232] as const,
  creamDark: [235, 227, 212] as const,
  ink: [26, 24, 20] as const,
  muted: [92, 87, 79] as const,
  gold: [196, 163, 90] as const,
  white: [255, 255, 255] as const,
};

export type BookingTicketPdfInput = {
  filename: string;
  venue: string;
  passTitle: string;
  reference: string;
  statusLabel: string;
  whenLabel: string;
  whenValue: string;
  serviceLabel?: string;
  serviceValue?: string;
  tableLabel?: string;
  tableValue?: string;
  partyLabel: string;
  partyValue: string;
  notesLabel?: string;
  notesValue?: string;
  checkInLabel?: string;
  qrScanHint?: string;
  qrValue?: string | null;
};

export async function downloadBookingTicketPdf(input: BookingTicketPdfInput): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 12;

  pdf.setFillColor(...COLORS.cream);
  pdf.rect(0, 0, pageW, pageH, "F");

  const headerH = 42;
  pdf.setFillColor(...COLORS.forest);
  pdf.rect(0, 0, pageW, headerH, "F");
  pdf.setFillColor(...COLORS.forestLight);
  pdf.rect(0, headerH - 8, pageW, 8, "F");

  pdf.setTextColor(...COLORS.white);
  pdf.setFontSize(8);
  pdf.text(input.venue.toUpperCase(), margin, 14);
  pdf.setFontSize(14);
  pdf.text(input.passTitle, margin, 24);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(input.reference, margin, 36);
  pdf.setFont("helvetica", "normal");

  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.gold);
  const statusW = pdf.getTextWidth(input.statusLabel.toUpperCase());
  pdf.text(input.statusLabel.toUpperCase(), pageW - margin - statusW, 14);

  let y = headerH + 10;
  pdf.setDrawColor(...COLORS.muted);
  pdf.setLineDashPattern([1, 2], 0);
  pdf.line(margin, y, pageW - margin, y);
  pdf.setLineDashPattern([], 0);
  y += 8;

  y = drawField(pdf, margin, y, pageW - margin * 2, input.whenLabel, input.whenValue);

  if (input.serviceLabel && input.serviceValue) {
    y = drawField(pdf, margin, y, pageW - margin * 2, input.serviceLabel, input.serviceValue);
  }
  if (input.tableLabel && input.tableValue) {
    y = drawField(pdf, margin, y, pageW - margin * 2, input.tableLabel, input.tableValue);
  }
  y = drawField(pdf, margin, y, pageW - margin * 2, input.partyLabel, input.partyValue);

  if (input.notesLabel && input.notesValue?.trim()) {
    y = drawField(pdf, margin, y, pageW - margin * 2, input.notesLabel, input.notesValue, true);
  }

  if (input.qrValue?.trim()) {
    y += 4;
    const qrSize = 38;
    const qrDataUrl = await QRCode.toDataURL(input.qrValue, {
      margin: 1,
      width: 280,
      color: { dark: "#1e3d32", light: "#ffffff" },
    });

    pdf.setFillColor(...COLORS.creamDark);
    pdf.roundedRect(margin, y, pageW - margin * 2, qrSize + 22, 2, 2, "F");

    if (input.checkInLabel) {
      pdf.setFontSize(8);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(input.checkInLabel.toUpperCase(), pageW / 2, y + 6, { align: "center" });
    }

    const qrX = (pageW - qrSize) / 2;
    pdf.addImage(qrDataUrl, "PNG", qrX, y + 10, qrSize, qrSize);

    if (input.qrScanHint) {
      pdf.setFontSize(7);
      pdf.setTextColor(...COLORS.muted);
      const hintLines = pdf.splitTextToSize(input.qrScanHint, pageW - margin * 2 - 8);
      pdf.text(hintLines, pageW / 2, y + qrSize + 18, { align: "center" });
    }
  }

  pdf.save(input.filename);
}

function drawField(
  pdf: jsPDF,
  x: number,
  y: number,
  maxWidth: number,
  label: string,
  value: string,
  multiline = false,
): number {
  const boxH = multiline ? 18 : 14;
  pdf.setFillColor(...COLORS.white);
  pdf.setDrawColor(...COLORS.creamDark);
  pdf.roundedRect(x, y, maxWidth, boxH, 1.5, 1.5, "FD");

  pdf.setFontSize(7);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(label.toUpperCase(), x + 3, y + 5);

  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.forest);
  pdf.setFont("helvetica", "bold");
  const valueLines = multiline ? pdf.splitTextToSize(value, maxWidth - 6) : [value];
  pdf.text(valueLines.slice(0, 2), x + 3, y + 11);
  pdf.setFont("helvetica", "normal");

  return y + boxH + 4;
}
