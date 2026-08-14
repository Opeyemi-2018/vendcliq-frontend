import * as XLSX from "xlsx";
import { statementFileName, type Statement } from "@/lib/statement";

const ISSUER = "Vendorcliq Platforms Limited";

type Cell = string | number | null;

/**
 * The same statement as the PDF, laid out for a spreadsheet: the header block
 * and summary sit above the postings, and amounts stay as numbers so they can
 * be summed and sorted rather than re-typed.
 */
export const generateStatementXlsx = (statement: Statement) => {
  const { account } = statement;
  const currency = account.currency || "NGN";

  const rows: Cell[][] = [
    ["STATEMENT OF ACCOUNT"],
    [`${account.provider || "Wallet"} Provider Wallet — Virtual Account`],
    [],
    ["Account name", account.accountName || "—"],
    ["Account number", account.accountNumber || "—"],
    ["Customer", account.accountName || "—"],
    ["Account issuer", ISSUER],
    ["Banking partner", account.provider || "—"],
    ["Currency", currency],
    ["Statement period", statement.periodLabel],
    ["Opening date", statement.openingDate],
    ["Closing date", statement.closingDate],
    ["Statement generated", statement.generatedAt],
    [],
    ["Opening balance", statement.openingBalance],
    ["Total credit volume", statement.creditTotal],
    ["Credit transactions", statement.creditCount],
    ["Total debit volume", statement.debitTotal],
    ["Debit transactions", statement.debitCount],
    ["Closing balance", statement.closingBalance],
    [],
    ["TRANSACTION DETAIL"],
    [
      "Date / time",
      "Transaction reference",
      "Narration",
      "Status",
      `Debit (${currency})`,
      `Credit (${currency})`,
      `Balance (${currency})`,
    ],
  ];

  const firstPostingRow = rows.length + 1; // 1-based, for the totals formula.

  statement.lines.forEach((line) => {
    rows.push([
      line.dateTime,
      line.reference,
      line.narration,
      line.status,
      line.debit,
      line.credit,
      line.balance,
    ]);
  });

  rows.push([
    "TOTALS",
    `${statement.lines.length} postings | ${statement.creditCount} credits, ${statement.debitCount} debits`,
    null,
    null,
    statement.debitTotal,
    statement.creditTotal,
    statement.closingBalance,
  ]);

  rows.push([]);
  rows.push([
    "Balances are derived from settled postings and the closing wallet balance. Pending, failed and reversed postings are listed but do not move the balance.",
  ]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 24 },
    { wch: 42 },
    { wch: 52 },
    { wch: 11 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];
  sheet["!freeze"] = { xSplit: "0", ySplit: String(firstPostingRow) };

  // Money reads as money rather than as a bare figure.
  const lastRow = rows.length;
  for (let row = firstPostingRow; row <= lastRow; row += 1) {
    for (const column of [4, 5, 6]) {
      const address = XLSX.utils.encode_cell({ r: row - 1, c: column });
      const cell = sheet[address];
      if (cell && typeof cell.v === "number") cell.z = "#,##0.00";
    }
  }
  for (const row of [15, 16, 18, 20]) {
    const address = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
    const cell = sheet[address];
    if (cell && typeof cell.v === "number") cell.z = "#,##0.00";
  }

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Statement");
  XLSX.writeFile(book, statementFileName(statement, "xlsx"));
};
