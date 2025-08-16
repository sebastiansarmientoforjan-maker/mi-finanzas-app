import Airtable from "airtable";

// Initialize Airtable with your API key and base ID from environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export default async function handler(req, res) {
  try {
    const sheetName = req.query.sheetName;

    if (!sheetName) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid sheetName provided." });
    }

    const allRecords = [];

    // Use Airtable's select method to fetch all records from the specified table
    await base(sheetName)
      .select({
        view: "Grid view", // Use "Grid view" as the default view
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
          allRecords.push(record.fields);
        });
        fetchNextPage();
      });

    res.status(200).json({ status: "success", data: allRecords });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch data from Airtable." });
  }
}
