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
       * GET → Listar todas las transacciones
       */
      case 'GET': {
        const records = await table.select({}).all();
        const transactions = records.map((record) => ({
          id: record.id,       // 👈 Airtable ID real (ej: recKo9Ll0mCjyBpRq)
          ...record.fields,    // Campos definidos en Airtable
        }));
        return res.status(200).json({ status: 'success', data: transactions });
      }

      /**
       * POST → Crear una nueva transacción
       */
      case 'POST': {
        const { fields } = req.body;
        if (!fields) {
          return res.status(400).json({ status: 'error', message: 'Fields are required.' });
        }

        const createResult = await table.create([{ fields }]);
        return res.status(201).json({ status: 'success', data: createResult });
      }

      /**
       * PUT → Actualizar una transacción existente
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
       * DELETE → Eliminar una transacción
       */
      case 'DELETE': {
        const { id: deleteId } = req.query;
        console.log("Attempting to delete record with ID:", deleteId);

        if (!deleteId) {
          return res.status(400).json({ status: 'error', message: 'Transaction ID is required.' });
        }

        try {
          // ✅ Versión directa (más segura que pasar array)
          const deleteResult = await table.destroy(deleteId);
          return res.status(200).json({ status: 'success', data: deleteResult });
        } catch (err) {
          console.error("Airtable delete error:", err);
          return res.status(500).json({ status: 'error', message: 'Failed to delete transaction from Airtable.' });
        }
      }

      /**
       * Método no permitido
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

