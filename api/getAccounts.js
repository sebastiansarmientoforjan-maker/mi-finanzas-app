// api/getAccounts.js

import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const sheetName = req.query.sheetName;

    // A map to define the range for each sheet dynamically
    const sheetRanges = {
      Accounts: "Accounts!A:C",
      Transactions: "Transactions!A:J",
      Budget: "Budget!A:C",
      Goals: "Goals!A:E",
      Debts: "Debts!A:E",
      Investments: "Investments!A:D",
    };

    if (!sheetName || !sheetRanges[sheetName]) {
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
    const range = sheetRanges[sheetName];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const data = response.data.values;
    if (!data) {
      return res.status(200).json({ status: "success", data: [] });
    }
    
    const headers = data.shift();

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
