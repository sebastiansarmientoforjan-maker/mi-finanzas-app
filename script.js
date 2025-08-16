/// REEMPLAZA ESTA URL CON LA URL DE TU API DE APPS SCRIPT
const API_URL = 'https://script.google.com/macros/s/AKfycbz-5VyOWxtTIGus-riV3aawbWjLW3B0PKEbRvaCwOdOt5A_RcI8Y4xG9NyckfIwaY9-4Q/exec';
const PROXY_URL = 'https://mi-finanzas-app-nine.vercel.app/'; // Reemplaza con la URL de tu app en Vercel si estás en producción

// --- FUNCIONES CORE: OBTENER Y ENVIAR DATOS ---

// Función para obtener y enviar datos
async function fetchData(endpoint, method = 'GET', payload = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (payload) {
        options.body = JSON.stringify(payload);
    }

    try {
        const url = `${PROXY_URL}?endpoint=${endpoint}`;
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.status === 'success') {
            return data.data || data; // Retorna los datos o la respuesta completa para POST
        } else {
            console.error(`Error en la operación ${endpoint}:`, data.message);
            return { status: 'error', message: data.message };
        }
    } catch (error) {
        console.error(`Error de red en la operación ${endpoint}:`, error);
        return { status: 'error', message: 'Error de red.' };
    }
}

// --- FUNCIONES PARA RENDERIZAR LA INTERFAZ ---

// Función para renderizar el resumen de cuentas
async function renderAccounts() {
    const accounts = await fetchData('getAccounts');
    const accountsSummary = document.getElementById('accountsSummary');
    accountsSummary.innerHTML = '';
    let totalBalance = 0;

    if (accounts.status === 'error' || !Array.isArray(accounts)) {
        console.error("No se pudieron cargar las cuentas.");
        return;
    }

    accounts.forEach(account => {
        const p = document.createElement('p');
        p.textContent = `${account['Account Name']}: $${account['Current Balance'].toFixed(2)}`;
        accountsSummary.appendChild(p);
        totalBalance += account['Current Balance'];
    });

    document.getElementById('netBalance').textContent = totalBalance.toFixed(2);
}

// Función para renderizar el presupuesto
async function renderBudget() {
    const budget = await fetchData('getBudget');
    if (budget.status === 'error' || !Array.isArray(budget) || budget.length === 0) {
        console.error("No se pudo cargar el presupuesto.");
        return;
    }
    
    const monthlyBudget = budget[0].MonthlyBudget;
    const spent = budget[0].SpentThisMonth;
    
    const progressPercent = (spent / monthlyBudget) * 100;

    document.getElementById('budgetAmount').textContent = monthlyBudget.toFixed(2);
    document.getElementById('spentAmount').textContent = spent.toFixed(2);
    document.getElementById('budgetProgress').style.width = `${progressPercent}%`;
}

// Función para renderizar la lista de transacciones
async function renderTransactions() {
    const transactions = await fetchData('getTransactions');
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    if (transactions.status === 'error' || !Array.isArray(transactions)) {
        console.error("No se pudieron cargar las transacciones.");
        return;
    }

    transactions.slice(0, 5).forEach(trans => {
        const p = document.createElement('p');
        p.textContent = `${trans.Date} - ${trans.Description}: $${trans.Amount.toFixed(2)}`;
        transactionList.appendChild(p);
    });
}

// Función para renderizar los objetivos
async function renderGoals() {
    const goals = await fetchData('getGoals');
    const goalList = document.getElementById('goalList');
    goalList.innerHTML = '';

    if (goals.status === 'error' || !Array.isArray(goals)) {
        console.error("No se pudieron cargar los objetivos.");
        return;
    }

    goals.forEach(goal => {
        const progress = (goal.CurrentAmount / goal.TargetAmount) * 100;
        const p = document.createElement('p');
        p.textContent = `${goal.Name}: ${progress.toFixed(0)}% completado`;
        goalList.appendChild(p);
    });
}

// Función para renderizar las deudas
async function renderDebts() {
    const debts = await fetchData('getDebts');
    const debtList = document.getElementById('debtList');
    debtList.innerHTML = '';

    if (debts.status === 'error' || !Array.isArray(debts)) {
        console.error("No se pudieron cargar las deudas.");
        return;
    }

    debts.forEach(debt => {
        const p = document.createElement('p');
        p.textContent = `${debt.Creditor}: $${debt.RemainingBalance.toFixed(2)}`;
        debtList.appendChild(p);
    });
}

// Función para renderizar las inversiones
async function renderInvestments() {
    const investments = await fetchData('getInvestments');
    const investmentList = document.getElementById('investmentList');
    investmentList.innerHTML = '';

    if (investments.status === 'error' || !Array.isArray(investments)) {
        console.error("No se pudieron cargar las inversiones.");
        return;
    }

    investments.forEach(inv => {
        const p = document.createElement('p');
        p.textContent = `${inv.Name}: $${inv.CurrentValue.toFixed(2)}`;
        investmentList.appendChild(p);
    });
}

// Función principal para cargar todos los datos al iniciar la página
async function loadDashboard() {
    await renderAccounts();
    await renderBudget();
    await renderTransactions();
    await renderGoals();
    await renderDebts();
    await renderInvestments();
}

// Llamar a la función principal cuando la página se carga
document.addEventListener('DOMContentLoaded', loadDashboard);


// --- NUEVAS FUNCIONES PARA LA FASE 2A: INTERACCIÓN ---

// Llenar el dropdown de Cuentas en el formulario
async function fillAccountDropdown() {
    const accounts = await fetchData('getAccounts');

    if (accounts.status === 'error' || !Array.isArray(accounts)) {
        console.error("No se pudieron cargar las cuentas para el dropdown.");
        return;
    }

    const accountDropdown = document.getElementById('transactionAccount');
    accountDropdown.innerHTML = ''; // Limpiar opciones anteriores
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account['Account ID'];
        option.textContent = account['Account Name'];
        accountDropdown.appendChild(option);
    });
}

// Lógica para mostrar/ocultar el modal
const modal = document.getElementById('addTransactionModal');
const showModalBtn = document.getElementById('showModalBtn');
const closeBtn = document.querySelector('.close-btn');

showModalBtn.onclick = function() {
    modal.style.display = "block";
    fillAccountDropdown();
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Lógica para enviar el formulario
document.getElementById('transactionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const type = document.getElementById('transactionType').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const description = document.getElementById('transactionDescription').value;
    const category = document.getElementById('transactionCategory').value;
    const date = document.getElementById('transactionDate').value;
    const accountID = document.getElementById('transactionAccount').value;
    const frequency = document.getElementById('transactionFrequency').value;

    const payload = {
        'ID': new Date().getTime(),
        'Type': type,
        'Category': category,
        'Description': description,
        'Amount': amount,
        'Date': date,
        'Frequency': frequency,
        'Status': 'Active',
        'LastRecurrenceDate': '',
        'Account': accountID
    };

    const result = await fetchData('addEntry', 'POST', { sheetName: 'Transactions', data: payload });

    if (result.status === 'success') {
        alert('Transacción añadida con éxito!');
        modal.style.display = "none";
        loadDashboard(); // Recarga el dashboard para mostrar la nueva transacción
    } else {
        alert('Error al añadir la transacción: ' + result.message);
    }
});




