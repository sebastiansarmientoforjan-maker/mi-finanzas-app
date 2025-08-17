// api/transactions.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export default async function handler(req, res) {
  try {
    const table = base('Transactions');

    switch (req.method) {
      /**
       * GET -> List all transactions
       */
      case 'GET': {
        const records = await table.select({}).all();
        const transactions = records.map((record) => ({
          id: record.id,
          ...record.fields,
        }));
        return res.status(200).json({ status: 'success', data: transactions });
      }

      /**
       * POST -> Create a new transaction
       */
      case 'POST': {
        const fields = req.body;
        if (!fields) {
            return res.status(400).json({ status: 'error', message: 'Request body is missing fields.' });
        }
        
        const createResult = await table.create([{ fields }]);
        return res.status(201).json({ status: 'success', data: createResult });
      }

      /**
       * PUT -> Update an existing transaction
       */
      case 'PUT': {
        const { id, fields } = req.body;
        if (!id || !fields) {
          return res.status(400).json({ status: 'error', message: 'ID and fields are required.' });
        }
        const updateResult = await table.update([{ id, fields }]);
        return res.status(200).json({ status: 'success', data: updateResult });
      }

      /**
       * DELETE -> Delete a transaction
       */
      case 'DELETE': {
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ status: 'error', message: 'Transaction ID is required.' });
        }
        try {
          const deleteResult = await table.destroy([deleteId]);
          return res.status(200).json({ status: 'success', data: deleteResult });
        } catch (err) {
          console.error("Airtable delete error:", err);
          return res.status(500).json({ status: 'error', message: 'Failed to delete transaction from Airtable.' });
        }
      }

      /**
       * Method not allowed
       */
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in transactions API:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to process transaction.' });
  }
}
