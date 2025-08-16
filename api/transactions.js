// api/transactions.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export default async function handler(req, res) {
  try {
    const table = base('Transactions');

    switch (req.method) {
      case 'DELETE': {
        const { id: deleteId } = req.query; // 👈 Ahora lo tomamos de la query
        console.log("Attempting to delete record with ID:", deleteId);

        if (!deleteId) {
          return res.status(400).json({ status: 'error', message: 'Transaction ID is required.' });
        }

        const deleteResult = await table.destroy([deleteId]);
        return res.status(200).json({ status: 'success', data: deleteResult });
      }

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in transactions API:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to process transaction.' });
  }
}
