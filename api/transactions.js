// script.js

const API_URL = '/api/getAccounts';
const TRANSACTIONS_API_URL = '/api/transactions';

// Función para obtener datos de la API
async function fetchData(sheetName) {
  const response = await fetch(`${API_URL}?sheetName=${sheetName}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(result.message);
  }
  // Mapea sobre los datos para incluir el ID de registro de Airtable
  return result.data.map(record => ({ id: record.id, ...record.fields }));
}

// Función para renderizar las cuentas
async function renderAccounts() {
  const accountsContainer = document.getElementById('accounts-container');
  accountsContainer.innerHTML = '<h2>Cuentas</h2>';
  try {
    const accounts = await fetchData('Accounts');
    accounts.forEach(account => {
      const accountDiv = document.createElement('div');
      accountDiv.className = 'account-card';
      accountDiv.innerHTML = `
        <h3>${account['Account Name']}</h3>
        <p>ID: ${account['Account ID']}</p>
        <p>Balance: $${account['Current Balance']}</p>
      `;
      accountsContainer.appendChild(accountDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las cuentas.', error);
    accountsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las cuentas.</p>';
  }
}

// Función para renderizar el presupuesto
async function renderBudget() {
  const budgetContainer = document.getElementById('budget-container');
  budgetContainer.innerHTML = '<h2>Presupuesto</h2>';
  try {
    const budget = await fetchData('Budget');
    budget.forEach(item => {
      const budgetDiv = document.createElement('div');
      budgetDiv.className = 'budget-item';
      budgetDiv.innerHTML = `
        <h3>${item.BudgetCategory}</h3>
        <p>Presupuesto mensual: $${item.MonthlyBudget}</p>
      `;
      budgetContainer.appendChild(budgetDiv);
    });
  } catch (error) {
    console.error('No se pudo cargar el presupuesto.', error);
    budgetContainer.innerHTML += '<p class="error-message">No se pudo cargar el presupuesto.</p>';
  }
}

// Función para renderizar transacciones
async function renderTransactions() {
  const transactionsContainer = document.getElementById('transactions-container');
  transactionsContainer.innerHTML = '<h2>Transacciones Recientes</h2>';
  try {
    const transactions = await fetchData('Transactions');
    transactions.forEach(transaction => {
      const transactionDiv = document.createElement('div');
      transactionDiv.className = 'transaction-item';
      transactionDiv.dataset.id = transaction.id; // Add Airtable record ID
      transactionDiv.innerHTML = `
        <p><strong>Fecha:</strong> ${transaction.Date}</p>
        <p><strong>Descripción:</strong> ${transaction.Description}</p>
        <p><strong>Monto:</strong> $${transaction.Amount}</p>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      `;
      transactionsContainer.appendChild(transactionDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las transacciones.', error);
    transactionsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las transacciones.</p>';
  }
}

// Función para renderizar los objetivos
async function renderGoals() {
  const goalsContainer = document.getElementById('goals-container');
  goalsContainer.innerHTML = '<h2>Objetivos Financieros</h2>';
  try {
    const goals = await fetchData('Goals');
    goals.forEach(goal => {
      const goalDiv = document.createElement('div');
      goalDiv.className = 'goal-item';
      goalDiv.innerHTML = `
        <h3>${goal.Name}</h3>
        <p>Cantidad actual: $${goal.CurrentAmount}</p>
        <p>Cantidad objetivo: $${goal.TargetAmount}</p>
        <p>Fecha límite: ${goal.DueDate}</p>
      `;
      goalsContainer.appendChild(goalDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar los objetivos.', error);
    goalsContainer.innerHTML += '<p class="error-message">No se pudieron cargar los objetivos.</p>';
  }
}

// Función para renderizar las deudas
async function renderDebts() {
  const debtsContainer = document.getElementById('debts-container');
  debtsContainer.innerHTML = '<h2>Deudas</h2>';
  try {
    const debts = await fetchData('Debts');
    debts.forEach(debt => {
      const debtDiv = document.createElement('div');
      debtDiv.className = 'debt-item';
      debtDiv.innerHTML = `
        <h3>${debt.Creditor}</h3>
        <p>Saldo restante: $${debt.RemainingBalance}</p>
        <p>Tasa de interés: ${debt.InterestRate}%</p>
        <p>Pago mínimo: $${debt.MinimumPayment}</p>
      `;
      debtsContainer.appendChild(debtDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las deudas.', error);
    debtsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las deudas.</p>';
  }
}

// Función para renderizar las inversiones
async function renderInvestments() {
  const investmentsContainer = document.getElementById('investments-container');
  investmentsContainer.innerHTML = '<h2>Inversiones</h2>';
  try {
    const investments = await fetchData('Investments');
    investments.forEach(investment => {
      const investmentDiv = document.createElement('div');
      investmentDiv.className = 'investment-item';
      investmentDiv.innerHTML = `
        <h3>${investment.Name}</h3>
        <p>Costo original: $${investment.OriginalCost}</p>
        <p>Valor actual: $${investment.CurrentValue}</p>
      `;
      investmentsContainer.appendChild(investmentDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las inversiones.', error);
    investmentsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las inversiones.</p>';
  }
}


// Add Transaction Form Handling
const transactionForm = document.getElementById('add-transaction-form');
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value;
  let amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value; // Nueva línea
  const account = document.getElementById('account').value;
  const category = document.getElementById('category').value;
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


// Edit and Delete Buttons Handling
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const transactionId = e.target.closest('.transaction-item').dataset.id;
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        const response = await fetch(`${TRANSACTIONS_API_URL}?id=${transactionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete transaction.');
        }
        await loadDashboard(); // Reload data
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error al eliminar la transacción.');
      }
    }
  }
});


// Carga todas las secciones del panel
async function loadDashboard() {
  await renderAccounts();
  await renderBudget();
  await renderTransactions();
  await renderGoals();
  await renderDebts();
  await renderInvestments();
}


// Carga el dashboard cuando la página se carga
document.addEventListener('DOMContentLoaded', loadDashboard);
