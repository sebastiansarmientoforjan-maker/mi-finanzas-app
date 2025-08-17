// api/transactions.js
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

// 👉 Ajusta estos mappings si tus opciones de "single select" en Airtable
// usan nombres distintos a los que envía el frontend.
const TYPE_MAP = {
  ingreso: 'Ingreso',
  gasto: 'Gasto',
};

const FREQ_MAP = {
  none: 'Sin periodicidad',
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

function normalizeFields(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const f = { ...raw };

  // Normalizar Amount
  if (f.Amount !== undefined) {
    const n = Number(f.Amount);
    if (Number.isNaN(n)) throw new Error('Amount must be a number.');
    f.Amount = n;
  }

  // Normalizar Date (acepta YYYY-MM-DD)
  if (f.Date) {
    // Airtable acepta 'YYYY-MM-DD' pero si llega algo raro, intenta ISO
    const d = new Date(f.Date);
    if (isNaN(d.getTime())) throw new Error('Date is invalid.');
    // Mantén el string tal cual si ya viene YYYY-MM-DD; Airtable lo entiende.
    // Si quieres forzar ISO: f.Date = d.toISOString();
  }

  // Normalizar Type (si tu Airtable usa opciones con mayúscula)
  if (f.Type && TYPE_MAP[f.Type]) {
    f.Type = TYPE_MAP[f.Type];
  }

  // Normalizar Frequency (si es single select en Airtable)
  if (f.Frequency && FREQ_MAP[f.Frequency]) {
    f.Frequency = FREQ_MAP[f.Frequency];
  }

  // Nota sobre Account:
  // - Si "Account" en Airtable es "Single line text", está OK enviar string.
  // - Si es "Link to another record", DEBES enviar array de record IDs:
  //   f.Account = [ 'recXXXXXXXXXXXXXX' ]
  // Ajusta aquí si fuera tu caso.

  return f;
}

function airtableErrorPayload(err) {
  // Intenta exponer información útil sin filtrar secretos
  const payload = {
    status: 'error',
    message: 'Airtable request failed.',
  };
  if (err && err.statusCode) payload.statusCode = err.statusCode;
  if (err && err.message) payload.airtableMessage = err.message;
  return payload;
}

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
          id: record.id,
          ...record.fields,
        }));
        return res.status(200).json({ status: 'success', data: transactions });
      }

      /**
       * POST → Crear una nueva transacción
       * Contrato: body = { fields: {...} }
       * (Fallback: si recibimos el objeto plano, también lo aceptamos)
       */
      case 'POST': {
        // Acepta tanto { fields: {...} } como {...} para compatibilidad
        const body = req.body || {};
        const incomingFields = body.fields && typeof body.fields === 'object'
          ? body.fields
          : body;

        if (!incomingFields || Object.keys(incomingFields).length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Request body must include fields.',
          });
        }

        let fields;
        try {
          fields = normalizeFields(incomingFields);
        } catch (e) {
          return res.status(400).json({ status: 'error', message: e.message });
        }

        try {
          const created = await table.create([{ fields }]);
          return res.status(201).json({ status: 'success', data: created });
        } catch (err) {
          console.error('Airtable create error:', err);
          return res
            .status(err?.statusCode || 500)
            .json(airtableErrorPayload(err));
        }
      }

      /**
       * PUT → Actualizar una transacción existente
       * Contrato: body = { id, fields: {...} }
       */
      case 'PUT': {
        const { id, fields: rawFields } = req.body || {};
        if (!id || !rawFields) {
          return res
            .status(400)
            .json({ status: 'error', message: 'ID and fields are required.' });
        }

        let fields;
        try {
          fields = normalizeFields(rawFields);
        } catch (e) {
          return res.status(400).json({ status: 'error', message: e.message });
        }

        try {
          const updated = await table.update([{ id, fields }]);
          return res.status(200).json({ status: 'success', data: updated });
        } catch (err) {
          console.error('Airtable update error:', err);
          return res
            .status(err?.statusCode || 500)
            .json(airtableErrorPayload(err));
        }
      }

      /**
       * DELETE → Eliminar una transacción
       * Contrato: /api/transactions?id=recXXXXXXXXXXXX
       */
      case 'DELETE': {
        const { id } = req.query || {};
        if (!id) {
          return res
            .status(400)
            .json({ status: 'error', message: 'Transaction ID is required.' });
        }
        try {
          // Forma directa y más segura (no uses array)
          const deleted = await table.destroy(id);
          return res.status(200).json({ status: 'success', data: deleted });
        } catch (err) {
          console.error('Airtable delete error:', err);
          return res
            .status(err?.statusCode || 500)
            .json(airtableErrorPayload(err));
        }
      }

      default: {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error('Error in transactions API (outer):', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Failed to process transaction.' });
  }
}

