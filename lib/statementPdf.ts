import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { statementFileName, type Statement } from "@/lib/statement";

/* The palette the printed statement uses, lifted from the reference sheet. */
const MAGENTA: [number, number, number] = [139, 22, 123];
const BLUE: [number, number, number] = [10, 109, 192];
const INK: [number, number, number] = [22, 32, 46];
const MUTED: [number, number, number] = [85, 98, 122];
const RULE: [number, number, number] = [216, 222, 232];
const TILE: [number, number, number] = [246, 248, 251];
const CREDIT: [number, number, number] = [0, 104, 27];
const DEBIT: [number, number, number] = [176, 42, 32];

const MARGIN = 22;
const ISSUER = "Vendorcliq Platforms Limited";
const TAGLINE = "DEMAND INFRASTRUCTURE FOR BEVERAGE COMMERCE";

/**
 * Postings carry no ledger balance of their own, so the column is worked back
 * from the wallet balance. Saying so keeps the sheet honest about where the
 * figure came from.
 */
const BALANCE_BASIS =
  "Balances derived from settled postings and the closing wallet balance";

const money = (value: number) =>
  value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * The reference sheet prints the naira sign from an embedded font. The core
 * PDF fonts jsPDF ships with have no glyph for it and would draw a blank, so
 * amounts stay bare and the column heading carries the currency instead.
 */
const NAIRA_HEADING = "(NGN)";

/** "2026-01-01" as it reads on the sheet: "1 Jan 2026". */
const dayLabel = (day: string) => {
  try {
    return format(new Date(`${day}T00:00:00`), "d MMM yyyy");
  } catch {
    return day;
  }
};

const bankLabel = (statement: Statement) =>
  `${statement.account.provider || "WALLET"} BANK`.toUpperCase();

/** Loads a public asset as a data URI; a miss just means no logo. */
const loadImage = async (path: string): Promise<string | null> => {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generateStatementPdf = async (statement: Statement) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
    // Long statements run to dozens of pages of text operators; without this
    // they weigh in at megabytes.
    compress: true,
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;

  const logo = await loadImage("/logo-wordmark-light.png");

  // ── Cover block ──────────────────────────────────────────────────────────
  let y = MARGIN + 6;

  if (logo) {
    try {
      doc.addImage(logo, "PNG", MARGIN, y - 4, 96, 23);
    } catch {
      // An unreadable logo should not cost us the statement.
    }
  }
  doc.setFont("helvetica", "normal").setFontSize(6);
  doc.setTextColor(...MUTED);
  doc.text(TAGLINE, MARGIN, y + 27);

  doc.setFontSize(6.4);
  doc.text("IN PARTNERSHIP WITH", pageWidth - MARGIN, y + 6, { align: "right" });
  doc.setFont("helvetica", "bold").setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(bankLabel(statement), pageWidth - MARGIN, y + 22, {
    align: "right",
  });

  y += 44;
  doc.setDrawColor(...INK).setLineWidth(1.1);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);

  y += 22;
  doc.setFont("helvetica", "bold").setFontSize(17);
  doc.setTextColor(...INK);
  doc.text("STATEMENT OF ACCOUNT", MARGIN, y);

  y += 13;
  doc.setFont("helvetica", "normal").setFontSize(8.6);
  doc.setTextColor(...MUTED);
  doc.text(
    `${statement.account.provider || "Wallet"} Provider Wallet   |   Provider Collection Wallet (Virtual Account)`,
    MARGIN,
    y,
  );

  // ── Meta grid: two columns of label/value pairs ──────────────────────────
  y += 20;
  const left: [string, string][] = [
    ["ACCOUNT NAME", statement.account.accountName || "—"],
    ["ACCOUNT NUMBER", statement.account.accountNumber || "—"],
    ["CUSTOMER", statement.account.accountName || "—"],
    ["ACCOUNT ISSUER", ISSUER],
    ["BANKING PARTNER", statement.account.provider || "—"],
  ];
  const right: [string, string][] = [
    ["STATEMENT PERIOD", statement.periodLabel],
    ["OPENING DATE", statement.openingDate],
    ["CLOSING DATE", statement.closingDate],
    ["CURRENCY", `${statement.account.currency || "NGN"}`],
    ["STATEMENT GENERATED", statement.generatedAt],
  ];

  const columnGap = contentWidth / 2;
  const rowHeight = 26;
  left.forEach(([label, value], index) => {
    metaCell(doc, MARGIN, y + index * rowHeight, label, value, columnGap - 16);
  });
  right.forEach(([label, value], index) => {
    metaCell(
      doc,
      MARGIN + columnGap,
      y + index * rowHeight,
      label,
      value,
      columnGap - 16,
    );
  });

  y += left.length * rowHeight + 6;

  // ── Summary tiles ────────────────────────────────────────────────────────
  const tiles: [string, string, string, [number, number, number]][] = [
    [
      "OPENING BALANCE",
      money(statement.openingBalance),
      dayLabel(statement.period.from),
      INK,
    ],
    [
      "TOTAL CREDIT VOLUME",
      money(statement.creditTotal),
      `${statement.creditCount} credit transactions`,
      CREDIT,
    ],
    [
      "TOTAL DEBIT VOLUME",
      money(statement.debitTotal),
      `${statement.debitCount} debit transactions`,
      DEBIT,
    ],
    [
      "CLOSING BALANCE",
      money(statement.closingBalance),
      dayLabel(statement.period.to),
      INK,
    ],
  ];

  const tileGap = 10;
  const tileWidth = (contentWidth - tileGap * 3) / 4;
  tiles.forEach(([label, value, note, tone], index) => {
    const x = MARGIN + index * (tileWidth + tileGap);
    doc.setFillColor(...TILE);
    doc.roundedRect(x, y, tileWidth, 52, 5, 5, "F");
    doc.setFont("helvetica", "bold").setFontSize(6.2);
    doc.setTextColor(...MUTED);
    doc.text(label, x + 10, y + 15);
    doc.setFont("helvetica", "bold").setFontSize(13);
    doc.setTextColor(...tone);
    doc.text(value, x + 10, y + 32);
    doc.setFont("helvetica", "normal").setFontSize(6.4);
    doc.setTextColor(...MUTED);
    doc.text(note, x + 10, y + 44);
  });

  y += 68;
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("TRANSACTION DETAIL", MARGIN, y);

  // ── Postings ─────────────────────────────────────────────────────────────
  const body = statement.lines.map((line) => [
    line.dateTime,
    line.reference,
    line.narration,
    line.status,
    line.debit == null ? "-" : money(line.debit),
    line.credit == null ? "-" : money(line.credit),
    money(line.balance),
  ]);

  body.push([
    "TOTALS",
    `${statement.lines.length} postings | ${statement.creditCount} credits, ${statement.debitCount} debits`,
    "",
    "",
    money(statement.debitTotal),
    money(statement.creditTotal),
    money(statement.closingBalance),
  ]);

  const totalsIndex = body.length - 1;

  autoTable(doc, {
    startY: y + 8,
    head: [
      [
        "DATE / TIME",
        "TRANSACTION REFERENCE",
        "NARRATION",
        "STATUS",
        `DEBIT ${NAIRA_HEADING}`,
        `CREDIT ${NAIRA_HEADING}`,
        `BALANCE ${NAIRA_HEADING}`,
      ],
    ],
    body,
    margin: { left: MARGIN, right: MARGIN, top: 62, bottom: 34 },
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 6.8,
      cellPadding: { top: 4.5, bottom: 4.5, left: 4, right: 4 },
      textColor: INK,
      lineColor: RULE,
      lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 },
      overflow: "linebreak",
    },
    headStyles: {
      fontStyle: "bold",
      fontSize: 6.2,
      textColor: MUTED,
      fillColor: TILE,
      lineWidth: { bottom: 0.7, top: 0, left: 0, right: 0 },
      lineColor: RULE,
    },
    columnStyles: {
      0: { cellWidth: 78 },
      1: { cellWidth: 150 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 48 },
      4: { cellWidth: 74, halign: "right" },
      5: { cellWidth: 74, halign: "right" },
      6: { cellWidth: 80, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.row.index === totalsIndex) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = TILE;
        data.cell.styles.fontSize = 6.8;
        return;
      }
      if (data.column.index === 4 && data.cell.raw !== "-") {
        data.cell.styles.textColor = DEBIT;
      }
      if (data.column.index === 5 && data.cell.raw !== "-") {
        data.cell.styles.textColor = CREDIT;
      }
      if (data.column.index === 3 && data.cell.raw === "FAILED") {
        data.cell.styles.textColor = DEBIT;
      }
    },
    didDrawPage: () => {
      decoratePage(doc, statement, pageWidth, pageHeight);
    },
  });

  // Page numbers need the final count, so they go on in a second pass.
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal").setFontSize(6.3);
    doc.setTextColor(...MUTED);
    doc.text(
      `Page ${page} of ${pages}`,
      pageWidth - MARGIN,
      pageHeight - 18,
      { align: "right" },
    );
  }

  doc.save(statementFileName(statement, "pdf"));
};

function metaCell(
  doc: jsPDF,
  x: number,
  y: number,
  label: string,
  value: string,
  width: number,
) {
  doc.setFont("helvetica", "bold").setFontSize(6.2);
  doc.setTextColor(...MUTED);
  doc.text(label, x, y);
  doc.setFont("helvetica", "bold").setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(doc.splitTextToSize(value, width).slice(0, 2), x, y + 11);
}

/** The bars, running header and footer that repeat on every page. */
function decoratePage(
  doc: jsPDF,
  statement: Statement,
  pageWidth: number,
  pageHeight: number,
) {
  doc.setFillColor(...MAGENTA);
  doc.rect(0, 0, pageWidth, 5, "F");
  doc.setFillColor(...BLUE);
  doc.rect(0, 5, pageWidth, 3, "F");

  const page = doc.getCurrentPageInfo().pageNumber;
  if (page > 1) {
    doc.setFont("helvetica", "bold").setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(
      `STATEMENT OF ACCOUNT  ${bankLabel(statement)}`,
      MARGIN,
      28,
    );
    doc.setFont("helvetica", "normal").setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      `${statement.account.accountName}   |   Account ${statement.account.accountNumber}`,
      MARGIN,
      39,
    );
    doc.text(statement.periodLabel, pageWidth - MARGIN, 28, { align: "right" });
    doc.text(
      `Currency: ${statement.account.currency || "NGN"}`,
      pageWidth - MARGIN,
      39,
      { align: "right" },
    );
  }

  doc.setDrawColor(...RULE).setLineWidth(0.6);
  doc.line(MARGIN, pageHeight - 30, pageWidth - MARGIN, pageHeight - 30);
  doc.setFont("helvetica", "normal").setFontSize(6.3);
  doc.setTextColor(...MUTED);
  doc.text(
    `${ISSUER}  |  Computer-generated statement, valid without signature  |  ${BALANCE_BASIS}`,
    MARGIN,
    pageHeight - 18,
  );
  doc.text(statement.account.accountName, pageWidth / 2, pageHeight - 18, {
    align: "center",
  });
}
