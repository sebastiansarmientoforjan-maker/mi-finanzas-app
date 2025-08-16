// api/getAccounts.js
import Airtable from "airtable";

// Inicializa Airtable con tu clave API y el ID de la base desde las variables de entorno
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

    // Usa el método select de Airtable para buscar todos los registros de la tabla especificada
    await base(sheetName)
      .select({
        view: "Grid view", // Usa "Grid view" como la vista por defecto
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
