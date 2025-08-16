const TRANSACTIONS_API_URL = '/api/transactions';

// Cargar y renderizar el dashboard
async function loadDashboard() {
  try {
    const response = await fetch(TRANSACTIONS_API_URL);
    const result = await response.json();

    console.log("Transacciones cargadas:", result);

    const listContainer = document.getElementById('transactions-list');
    listContainer.innerHTML = '';

    result.data.forEach(tx => {
      const item = document.createElement('div');
      item.classList.add('transaction-item');
      item.dataset.id = tx.id; // Airtable record ID
      item.innerHTML = `
        <span>${tx.Description || 'Sin descripción'}</span>
        <span>${tx.Amount || 0}</span>
        <button class="edit-btn">Editar</button>
        <button class="delete-btn">Eliminar</button>
      `;
      listContainer.appendChild(item);
    });

  } catch (error) {
    console.error("Error al cargar transacciones:", error);
  }
}

// Crear una nueva transacción
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

// Manejo de eventos global (Editar / Eliminar)
document.addEventListener('click', async (e) => {
  // Eliminar
  if (e.target.classList.contains('delete-btn')) {
    const transactionId = e.target.closest('.transaction-item').dataset.id;
    console.log("Deleting transactionId:", transactionId);

    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        const response = await fetch(`${TRANSACTIONS_API_URL}?id=${transactionId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete transaction.');

        await loadDashboard();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error al eliminar la transacción.');
      }
    }
  }

  // Editar
  if (e.target.classList.contains('edit-btn')) {
    const transactionId = e.target.closest('.transaction-item').dataset.id;
    const newDescription = prompt('Nueva descripción:');
    if (newDescription) {
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
  }
});

// Manejo del formulario de nueva transacción
document.getElementById('new-transaction-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (!description || isNaN(amount)) {
    alert('Por favor completa todos los campos.');
    return;
  }

  await createTransaction({ Description: description, Amount: amount });

  e.target.reset();
});

// Inicializar
loadDashboard();
