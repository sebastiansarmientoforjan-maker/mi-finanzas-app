// api/transactions.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export default async function handler(req, res) {
  try {
    const table = base('Transactions');

    switch (req.method) {
      case 'POST': // Create a new record
        const { date, description, amount, account, category, frequency } = req.body;
        const createResult = await table.create([{
          fields: {
            "Date": date,
            "Description": description,
            "Amount": parseFloat(amount),
            "Account": account,
            "Category": category,
            "Frequency": frequency
          }
        }]);
        return res.status(201).json({ status: 'success', data: createResult });

      case 'PUT': // Update an existing record
        const { id, fields } = req.body;
        const updateResult = await table.update([{
          id,
          fields
        }]);
        return res.status(200).json({ status: 'success', data: updateResult });

      case 'DELETE': // Delete a record
        const { id: deleteId } = req.query;
        console.log("Attempting to delete record with ID:", deleteId); // This will appear in your Vercel logs
        const deleteResult = await table.destroy([deleteId]);
        return res.status(200).json({ status: 'success', data: deleteResult });

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in transactions API:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to process transaction.' });
  }
}
