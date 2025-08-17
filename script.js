// script.js

const TRANSACTIONS_API_URL = '/api/transactions';

// Categorías dinámicas para ingresos y gastos
const categories = {
    ingreso: ["Salario", "Regalo", "Inversión", "Reembolso", "Venta", "Otros Ingresos"],
    gasto: ["Alimentación", "Transporte", "Vivienda", "Facturas/Servicios", "Entretenimiento", "Salud", "Educación", "Compras", "Deudas", "Otros Gastos"]
};

// Función para poblar el dropdown de categorías
function populateCategories() {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    if (!typeSelect || !categorySelect) return;

    const selectedType = typeSelect.value;
    categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    categories[selectedType].forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Calcular totales y balance para el dashboard
function calculateTotals(transactions) {
    let income = 0,
        expense = 0;
    transactions.forEach(tx => {
        const amount = parseFloat(tx.Amount) || 0;
        if (amount >= 0) income += amount;
        else expense += amount;
    });
    const balance = income + expense;
    document.getElementById('total-income').textContent = Math.floor(income);
    document.getElementById('total-expense').textContent = Math.floor(Math.abs(expense));
    document.getElementById('balance').textContent = Math.floor(balance);
}

// Renderizar las 5 transacciones más recientes en el dashboard
function renderRecentTransactions(transactions) {
    const listContainer = document.getElementById('transactions-list');
    if (!listContainer) return;
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
            <span>${Math.floor(tx.Amount) || 0}</span>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;
        listContainer.appendChild(item);
    });
}

// Renderizar TODAS las transacciones en la página dedicada
function renderAllTransactions(transactions) {
    const listContainer = document.getElementById('all-transactions-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    const sortedTransactions = transactions.sort((a, b) => {
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
    });
    sortedTransactions.forEach(tx => {
        const item = document.createElement('div');
        item.classList.add('transaction-item');
        item.dataset.id = tx.id;
        item.innerHTML = `
            <span>${tx.Date}</span>
            <span>${tx.Description || 'Sin descripción'}</span>
            <span>${tx.Amount || 0}</span>
            <button class="edit-btn">Editar</button>
            <button class="delete-btn">Eliminar</button>
        `;
        listContainer.appendChild(item);
    });
}

// Cargar datos desde la API
async function loadData() {
    try {
        const response = await fetch(TRANSACTIONS_API_URL);
        const result = await response.json();
        console.log("Transacciones cargadas:", result);
        const transactions = result.data || [];
        return transactions;
    } catch (error) {
        console.error("Error al cargar transacciones:", error);
        return [];
    }
}

// Crear una transacción
async function createTransaction(fields) {
    try {
        const response = await fetch(TRANSACTIONS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields
            }),
        });
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error.');
            throw new Error(`Failed to create transaction. ${errorText}`);
        }
        alert('¡Transacción guardada con éxito!');
        window.location.href = "index.html"; // Redirige al dashboard
    } catch (error) {
        console.error('Error creating transaction:', error);
        alert('Error al crear la transacción.');
    }
}

// Manejar el envío del formulario
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'new-transaction-form') {
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
    }
});

// Manejar los botones de editar y eliminar
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
            window.location.reload(); // Recarga la página para mostrar el cambio
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
            window.location.reload();
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Error al actualizar la transacción.');
        }
    }
});

// Lógica de inicialización por página
document.addEventListener('DOMContentLoaded', async () => {
    // Si estamos en el dashboard (index.html)
    if (document.getElementById('balance')) {
        const transactions = await loadData();
        calculateTotals(transactions);
        renderRecentTransactions(transactions);
    }

    // Si estamos en la página de transacciones (transactions.html)
    if (document.getElementById('all-transactions-list')) {
        const transactions = await loadData();
        renderAllTransactions(transactions);
    }

    // Si estamos en la página de añadir transacción (add-transaction.html)
    if (document.getElementById('new-transaction-form')) {
        populateCategories();
    }

    // Activar el link de navegación actual
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
