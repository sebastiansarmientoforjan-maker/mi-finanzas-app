// --- Airtable Configuration ---
// IMPORTANT: Replace these placeholder values with your actual Airtable credentials.
// You can find these in your Airtable account settings.
const AIRTABLE_API_KEY = 'pat8GwdzOMYyyGxGg.df57051737bc757693d41b50b04b8d190ff0d26353afb99ddab38b6d43cf5644';
const AIRTABLE_BASE_ID = 'appWjZbCM25bli7RZ';
const AIRTABLE_TABLE_NAME = 'Transactions'; // Make sure this matches your table name exactly

// --- Helper Functions ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
};

const createTransactionItem = (transaction) => {
    const item = document.createElement('div');
    item.classList.add('transaction-item');

    const amountClass = transaction.type === 'ingreso' ? 'income' : 'expense';
    const amountSign = transaction.type === 'ingreso' ? '+' : '-';

    const iconEmoji = transaction.type === 'ingreso' ? '💰' : '🛒';

    item.innerHTML = `
        <span>${iconEmoji} ${transaction.description}</span>
        <span class="${amountClass}">${amountSign}${formatCurrency(transaction.amount)}</span>
    `;

    return item;
};

// --- Main Functions ---

// Function to fetch data from Airtable
const loadData = async () => {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const transactions = data.records.map(record => ({
            id: record.id,
            description: record.fields.description,
            amount: record.fields.amount,
            type: record.fields.type,
            date: record.fields.date
        }));

        // Get the containers for the data
        const recentTransactionsList = document.getElementById('transactions-list');
        const allTransactionsList = document.getElementById('all-transactions-list');
        
        // Clear previous content
        if (recentTransactionsList) recentTransactionsList.innerHTML = '';
        if (allTransactionsList) allTransactionsList.innerHTML = '';

        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(transaction => {
            if (transaction.type === 'ingreso') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
            
            // Append all transactions to the all-transactions page
            if (allTransactionsList) {
                const item = createTransactionItem(transaction);
                allTransactionsList.appendChild(item);
            }
        });

        const balance = totalIncome - totalExpense;

        // Display totals on the dashboard page if the elements exist
        const balanceElement = document.getElementById('balance');
        const totalIncomeElement = document.getElementById('total-income');
        const totalExpenseElement = document.getElementById('total-expense');
        
        if (balanceElement) {
            balanceElement.textContent = formatCurrency(balance);
        }
        if (totalIncomeElement) {
            totalIncomeElement.textContent = formatCurrency(totalIncome);
        }
        if (totalExpenseElement) {
            totalExpenseElement.textContent = formatCurrency(totalExpense);
        }
        
        // Display only the 5 most recent transactions on the dashboard page
        if (recentTransactionsList) {
            const recentTransactions = transactions.slice(0, 5);
            recentTransactions.forEach(transaction => {
                const item = createTransactionItem(transaction);
                recentTransactionsList.appendChild(item);
            });
        }
        
    } catch (error) {
        console.error('Error al cargar transacciones:', error);
        const container = document.getElementById('transactions-container') || document.getElementById('all-transactions-container');
        if (container) {
            container.innerHTML = '<p style="color:red; text-align:center;">Hubo un error al cargar las transacciones. Por favor, inténtelo de nuevo.</p>';
        }
    }
};

// Function to handle form submission and save data to Airtable
const saveTransaction = async (event) => {
    event.preventDefault(); // Prevents the default form submission

    const form = event.target;
    const formData = new FormData(form);

    const newTransaction = {
        "fields": {
            "date": formData.get('date'),
            "description": formData.get('description'),
            "amount": parseFloat(formData.get('amount')),
            "type": formData.get('type'),
            "category": formData.get('category'),
            "account": formData.get('account'),
            "frequency": formData.get('frequency')
        }
    };
    
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "records": [newTransaction] })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // If the transaction was saved successfully, redirect to the dashboard
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error al guardar la transacción:', error);
    }
};


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    const form = document.getElementById('new-transaction-form');
    if (form) {
        form.addEventListener('submit', saveTransaction);
    }
});

