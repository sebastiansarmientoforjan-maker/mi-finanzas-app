// script.js

const API_URL = '/api/getAccounts';
const TRANSACTIONS_API_URL = '/api/transactions';

// Calcular totales y balance
function calculateTotals(transactions) {
  let income = 0, expense = 0;
  transactions.forEach(tx => {
    const amount = parseFloat(tx.Amount) || 0;
    if (amount >= 0) income += amount;
    else expense += amount;
  });
  const balance = income + expense; // expense es negativo
  document.getElementById('total-income').textContent = income.toFixed(2);
  document.getElementById('total-expense').textContent = Math.abs(expense).toFixed(2);
  document.getElementById('balance').textContent = balance.toFixed(2);
}

// Renderizar transacciones
function renderTransactions(transactions) {
  const listContainer = document.getElementById('transactions-list');
  listContainer.innerHTML = '';

  // Ordenar transacciones por fecha (o por id para lo más reciente)
  const sortedTransactions = transactions.sort((a, b) => {
    // Suponiendo que 'id' es un buen proxy para la creación más reciente
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });
  
  // Mostrar solo las últimas 5 transacciones
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

// Cargar dashboard
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

// Crear transacción
async function createTransaction(fields) {
  try {
    const response = await fetch(TRANSACTIONS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    if (!response.ok) throw new Error('Failed to create transaction.');
    await loadDashboard();
  } catch (error) {
    console.error('Error creating transaction:', error);
    alert('Error al crear la transacción.');
  }
}

// Editar y eliminar
document.addEventListener('click', async (e) => {
  const txItem = e.target.closest('.transaction-item');
  if (!txItem) return;
  const transactionId = txItem.dataset.id;

  // Eliminar
  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('¿Seguro que quieres eliminar esta transacción?')) return;
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}?id=${transactionId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete transaction.');
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Error al eliminar la transacción.');
    }
  }

  // Editar
  if (e.target.classList.contains('edit-btn')) {
    const newDescription = prompt('Nueva descripción:');
    if (!newDescription) return;
    try {
      const response = await fetch(TRANSACTIONS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId, fields: { Description: newDescription } }),
      });
      if (!response.ok) throw new Error('Failed to update transaction.');
      await loadDashboard();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error al actualizar la transacción.');
    }
  }
});

// Formulario nuevo
document.getElementById('new-transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;
  let amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value; // Nueva línea
  const account = document.getElementById('account').value;
  const category = document.getElementById('category').value; // Nueva línea
  const frequency = document.getElementById('frequency').value;

  // Convertir el monto a negativo si es un gasto
  if (type === 'gasto') {
    amount = -Math.abs(amount); // Nueva línea
  }

  const newTransaction = { date, description, amount, account, category, frequency };

  try {
    const response = await fetch(TRANSACTIONS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransaction),
    });

    if (!response.ok) {
      throw new Error('Failed to add transaction.');
    }
    await loadDashboard(); // Reload data
    transactionForm.reset();
  } catch (error) {
    console.error('Error adding transaction:', error);
    alert('Error al guardar la transacción.');
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', loadDashboard);
