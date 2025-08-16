const TRANSACTIONS_API_URL = '/api/transactions';

// Cargar dashboard (ejemplo simple)
async function loadDashboard() {
  try {
    const response = await fetch(TRANSACTIONS_API_URL);
    const data = await response.json();
    console.log("Transacciones cargadas:", data);
    // Aquí renderizas las transacciones en tu HTML
  } catch (error) {
    console.error("Error al cargar transacciones:", error);
  }
}

// Manejo de botones Editar y Eliminar
document.addEventListener('click', async (e) => {
  // Eliminar
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

        await loadDashboard(); // Recargar datos
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error al eliminar la transacción.');
      }
    }
  }

  // Editar (ejemplo básico)
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

        if (!response.ok) {
          throw new Error('Failed to update transaction.');
        }

        await loadDashboard();
      } catch (error) {
        console.error('Error updating transaction:', error);
        alert('Error al actualizar la transacción.');
      }
    }
  }
});

// Ejemplo de crear una transacción
async function createTransaction(fields) {
  try {
    const response = await fetch(TRANSACTIONS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      throw new Error('Failed to create transaction.');
    }

    await loadDashboard();
  } catch (error) {
    console.error('Error creating transaction:', error);
    alert('Error al crear la transacción.');
  }
}

// Inicializar dashboard
loadDashboard();
