// Variable para la URL base de tu API en Vercel.
// Tu front-end se comunica con este endpoint para todas las operaciones.
const apiBaseUrl = 'https://mi-finanzas-app-nine.vercel.app/api';

// Función para inicializar el panel de control.
async function loadDashboard() {
  await renderAccounts();
  await renderBudget();
  await renderTransactions();
  await renderGoals();
  await renderDebts();
  await renderInvestments();
}

// Función principal para obtener datos de la API.
// Ahora usa un parámetro para la hoja y envía el nombre de la hoja como un query parameter.
async function fetchData(sheetName) {
  try {
    const response = await fetch(`${apiBaseUrl}/getAccounts?sheetName=${sheetName}`);
    if (!response.ok) {
      throw new Error(`Error de red en la operación ${sheetName}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.status === 'success') {
      return data.data;
    } else {
      throw new Error(`Error en la operación ${sheetName}: ${data.message}`);
    }
  } catch (error) {
    console.error(`Error de red en la operación ${sheetName}:`, error);
    throw error;
  }
}

// Funciones para renderizar cada sección del dashboard.
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
        <p>Balance: $${account['Current Balance']}</p>
      `;
      accountsContainer.appendChild(accountDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las cuentas.');
    accountsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las cuentas.</p>';
  }
}

async function renderBudget() {
  const budgetContainer = document.getElementById('budget-container');
  budgetContainer.innerHTML = '<h2>Presupuesto</h2>';
  try {
    const budget = await fetchData('Budget');
    budget.forEach(item => {
      const budgetDiv = document.createElement('div');
      budgetDiv.innerHTML = `<p>${item['BudgetCategory']}: $${item['MonthlyBudget']}</p>`;
      budgetContainer.appendChild(budgetDiv);
    });
  } catch (error) {
    console.error('No se pudo cargar el presupuesto.');
    budgetContainer.innerHTML += '<p class="error-message">No se pudo cargar el presupuesto.</p>';
  }
}

async function renderTransactions() {
  const transactionsContainer = document.getElementById('transactions-container');
  transactionsContainer.innerHTML = '<h2>Transacciones Recientes</h2>';
  try {
    const transactions = await fetchData('Transactions');
    transactions.slice(0, 5).forEach(transaction => {
      const transactionDiv = document.createElement('div');
      transactionDiv.innerHTML = `<p>${transaction['Description']} - $${transaction['Amount']}</p>`;
      transactionsContainer.appendChild(transactionDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las transacciones.');
    transactionsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las transacciones.</p>';
  }
}

async function renderGoals() {
  const goalsContainer = document.getElementById('goals-container');
  goalsContainer.innerHTML = '<h2>Objetivos Financieros</h2>';
  try {
    const goals = await fetchData('Goals');
    goals.forEach(goal => {
      const goalDiv = document.createElement('div');
      goalDiv.innerHTML = `<p>${goal['Name']}: $${goal['CurrentAmount']} / $${goal['TargetAmount']}</p>`;
      goalsContainer.appendChild(goalDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar los objetivos.');
    goalsContainer.innerHTML += '<p class="error-message">No se pudieron cargar los objetivos.</p>';
  }
}

async function renderDebts() {
  const debtsContainer = document.getElementById('debts-container');
  debtsContainer.innerHTML = '<h2>Deudas</h2>';
  try {
    const debts = await fetchData('Debts');
    debts.forEach(debt => {
      const debtDiv = document.createElement('div');
      debtDiv.innerHTML = `<p>${debt['Creditor']}: $${debt['RemainingBalance']}</p>`;
      debtsContainer.appendChild(debtDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las deudas.');
    debtsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las deudas.</p>';
  }
}

async function renderInvestments() {
  const investmentsContainer = document.getElementById('investments-container');
  investmentsContainer.innerHTML = '<h2>Inversiones</h2>';
  try {
    const investments = await fetchData('Investments');
    investments.forEach(investment => {
      const investmentDiv = document.createElement('div');
      investmentDiv.innerHTML = `<p>${investment['Name']}: $${investment['CurrentValue']}</p>`;
      investmentsContainer.appendChild(investmentDiv);
    });
  } catch (error) {
    console.error('No se pudieron cargar las inversiones.');
    investmentsContainer.innerHTML += '<p class="error-message">No se pudieron cargar las inversiones.</p>';
  }
}

// Iniciar la carga del dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadDashboard);
