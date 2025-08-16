// api/getAccounts.js

import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const sheetName = req.query.sheetName;

    // A map to define the range and headers for each sheet dynamically
    const sheetConfig = {
      Accounts: {
        range: "Accounts!A:C",
        headers: ["ID", "Account Name", "Current Balance"]
      },
      Transactions: {
        range: "Transactions!A:J",
        headers: ["ID", "Date", "Description", "Category", "Amount", "Account", "Type", "Status", "Notes", "Attachment"]
      },
      Budget: {
        range: "Budget!A:C",
        headers: ["ID", "BudgetCategory", "MonthlyBudget"]
      },
      Goals: {
        range: "Goals!A:E",
        headers: ["ID", "Name", "TargetAmount", "CurrentAmount", "DueDate"]
      },
      Debts: {
        range: "Debts!A:E",
        headers: ["ID", "Creditor", "RemainingBalance", "InterestRate", "MinimumPayment"]
      },
      Investments: {
        range: "Investments!A:D",
        headers: ["ID", "Name", "OriginalCost", "CurrentValue"]
      },
    };

    if (!sheetName || !sheetConfig[sheetName]) {
      return res.status(400).json({ status: "error", message: "Invalid sheetName provided." });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const { range, headers } = sheetConfig[sheetName];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data = response.data.values;
    if (!data) {
      return res.status(200).json({ status: "success", data: [] });
    }
    
    // Check if the headers in the sheet match the expected headers
    const sheetHeaders = data.shift();
    if (JSON.stringify(sheetHeaders) !== JSON.stringify(headers)) {
        console.error(`Header mismatch for sheet: ${sheetName}`);
        console.error(`Expected: ${headers}`);
        console.error(`Got: ${sheetHeaders}`);
        return res.status(500).json({ status: "error", message: `Header mismatch in ${sheetName} sheet.` });
    }

    const jsonData = data.map((row) => {
      const rowObject = {};
      headers.forEach((header, index) => {
        rowObject[header] = row[index];
      });
      return rowObject;
    });

    res.status(200).json({ status: "success", data: jsonData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch data." });
  }
}
