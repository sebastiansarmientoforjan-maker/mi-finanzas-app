// script.js

const TRANSACTIONS_API_URL = '/api/transactions';

// Categorías dinámicas para ingresos y gastos
const categories = {
  ingreso: ["Salario", "Regalo", "Inversión", "Reembolso", "Venta", "Otros Ingresos"],
  gasto: ["Alimentación", "Transporte", "Vivienda", "Facturas/Servicios", "Entretenimiento", "Salud", "Educación", "Compras", "Deudas", "Otros Gastos"]
};

/**
 * Populates the category dropdown based on the selected transaction type.
 */
function populateCategories() {
  const typeSelect = document.getElementById('type');
  const categorySelect = document.getElementById('category');
  const selectedType = typeSelect.value;
  categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
  categories[selectedType].forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

/**
 * Calculates and displays the total income, expenses, and balance.
 * @param {Array<Object>} transactions - The array of transaction records.
 */
function calculateTotals(transactions) {
  let income = 0,
    expense = 0;
  transactions.forEach(tx => {
    const amount = parseFloat(tx.Amount) || 0;
    if (amount >= 0) income += amount;
    else expense += amount;
  });
  const balance = income + expense;
  document.getElementById('total-income').textContent = income.toFixed(2);
  document.getElementById('total-expense').textContent = Math.abs(expense).toFixed(2);
  document.getElementById('balance').textContent = balance.toFixed(2);
}

/**
 * Renders the most recent transactions to the dashboard.
 * @param {Array<Object>} transactions - The array of transaction records.
 */
function renderTransactions(transactions) {
  const listContainer = document.getElementById('transactions-list');
  listContainer.innerHTML = '';
  const sortedTransactions = transactions.sort((a, b) => {
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });
  const recentTransactions = sortedTransactions.slice(0, 5);
  recentTransactions.forEach(tx => {
    const item = document.createElement('div');
    item.classList.add('transaction-item');
    item.dataset.id = tx.id;
    item.innerHTML = `
      <span>${tx.Description || 'Sin descripción'}</span>
      <span>${tx.Amount || 0}</span>
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Eliminar</button>
    `;
    listContainer.appendChild(item);
  });
}

/**
 * Fetches and loads dashboard data from the API.
 */
async function loadDashboard() {
  try {
    const response = await fetch(TRANSACTIONS_API_URL);
    const result = await response.json();
    console.log("Transacciones cargadas:", result);
    const transactions = result.data || [];
    calculateTotals(transactions);
    renderTransactions(transactions);
  } catch (error) {
    console.error("Error al cargar transacciones:", error);
  }
}

/**
 * Sends a POST request to create a new transaction.
 * @param {Object} fields - The transaction data.
 */
async function createTransaction(fields) {
  try {
    const response = await fetch(TRANSACTIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields
      }), // Ensures the backend receives { fields: {...} }
    });
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error.');
      throw new Error(`Failed to create transaction. ${errorText}`);
    }
    await loadDashboard();
    alert('¡Transacción guardada con éxito!');
  } catch (error) {
    console.error('Error creating transaction:', error);
    alert('Error al crear la transacción.');
  }
}

/**
 * Handles form submission for new transactions.
 */
const transactionForm = document.getElementById('new-transaction-form');
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;
  let amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const account = document.getElementById('account').value;
  const category = document.getElementById('category').value;
  const frequency = document.getElementById('frequency').value;

  if (type === 'gasto') {
    amount = -Math.abs(amount);
  }

  // Ensure field names match Airtable's schema exactly
  const fields = {
    Date: date,
    Description: description,
    Amount: amount,
    Account: account,
    Category: category,
    Frequency: frequency,
    Status: "Completed",
    LastRecurrenceDate: date,
    Type: type,
  };

  if (!description || isNaN(amount) || !category) {
    return alert('Completa todos los campos, incluyendo una categoría válida.');
  }

  await createTransaction(fields);
  e.target.reset();
});

/**
 * Handles delete and edit button clicks for transactions.
 */
document.addEventListener('click', async (e) => {
  const txItem = e.target.closest('.transaction-item');
  if (!txItem) return;
  const transactionId = txItem.dataset.id;
  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('¿Seguro que quieres eliminar esta transacción?')) return;
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}?id=${transactionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete transaction.');
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error al eliminar la transacción.');
    }
  }
  if (e.target.classList.contains('edit-btn')) {
    const newDescription = prompt('Nueva descripción:');
    if (!newDescription) return;
    try {
      const response = await fetch(TRANSACTIONS_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: transactionId,
          fields: {
            Description: newDescription
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to update transaction.');
      await loadDashboard();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error al actualizar la transacción.');
    }
  }
});

// Event listener to update categories when transaction type changes
document.getElementById('type').addEventListener('change', populateCategories);

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  loadDashboard();
});
