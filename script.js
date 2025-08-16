// REEMPLAZA ESTA URL CON LA URL DE TU API DE APPS SCRIPT
const API_URL = 'https://script.google.com/macros/s/AKfycbzNfMfhGllurCXR0mn3XYikbFwZ-Pm-rV5V0PITwpTA-frljcPcyP00iCV72mmLn_pMow/exec';

// Función para obtener y mostrar datos
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}?endpoint=${endpoint}`);
        const data = await response.json();
        if (data.status === 'success') {
            return data.data;
        } else {
            console.error(`Error al obtener datos de ${endpoint}:`, data.message);
            return [];
        }
    } catch (error) {
        console.error(`Error de red al obtener datos de ${endpoint}:`, error);
        return [];
    }
}

// Función para renderizar el resumen de cuentas
async function renderAccounts() {
    const accounts = await fetchData('getAccounts');
    const accountsSummary = document.getElementById('accountsSummary');
    accountsSummary.innerHTML = '';
    let totalBalance = 0;

    accounts.forEach(account => {
        const p = document.createElement('p');
        p.textContent = `${account['Account Name']}: $${account['Current Balance'].toFixed(2)}`;
        accountsSummary.appendChild(p);
        totalBalance += account['Current Balance'];
    });

    // Actualizar saldo neto
    document.getElementById('netBalance').textContent = totalBalance.toFixed(2);
}

// Función para renderizar el presupuesto
async function renderBudget() {
    const budget = await fetchData('getBudget');
    if (budget.length > 0) {
        // En un proyecto real, necesitarías sumar todos los presupuestos y gastos.
        // Para este ejemplo, asumiremos un único presupuesto por simplicidad.
        const monthlyBudget = budget[0].MonthlyBudget;
        const spent = budget[0].SpentThisMonth;
        const remaining = budget[0].Remaining;
        
        const progressPercent = (spent / monthlyBudget) * 100;

        document.getElementById('budgetAmount').textContent = monthlyBudget.toFixed(2);
        document.getElementById('spentAmount').textContent = spent.toFixed(2);
        document.getElementById('budgetProgress').style.width = `${progressPercent}%`;
    }
}

// Función para renderizar la lista de transacciones
async function renderTransactions() {
    const transactions = await fetchData('getTransactions');
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    transactions.slice(0, 5).forEach(trans => { // Mostrar solo las 5 más recientes
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