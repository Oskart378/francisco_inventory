// soup_inventory.js

document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');

    // Redirect users who are not logged in
    if (!role) {
        window.location.href = 'login.html'; // Redirect to login page
        return; // Stop further execution
    }

    // Hide form and action buttons for readonly users
    if (role === 'readonly') {
        document.getElementById('soup-form').style.display = 'none';
        document.getElementById('actions-header').style.display = 'none'; // Hide actions column header
    }

    const apiUrl = 'https://francisco-inventory.onrender.com';
    let currentSoupId = null;

    // Fetch soups and display them
    async function fetchSoups() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/soups`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const soups = await response.json();
            const soupList = document.getElementById('soup-list');
            const grandTotalElement = document.getElementById('grand-total');
            let grandTotal = 0;

            soupList.innerHTML = '';

            soups.forEach(soup => {
                const total = soup.price * soup.quantity;
                grandTotal += total;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${soup.name.charAt(0).toUpperCase() + soup.name.slice(1)}</td>
                    <td>$${soup.price.toFixed(2)}</td>
                    <td>${soup.quantity}</td>
                    <td>$${total.toFixed(2)}</td>
                    ${role === 'admin' ? `<td class="actions">
                        <button onclick="startEditSoup('${soup._id}', '${soup.name}', ${soup.price}, ${soup.quantity})">Edit</button>
                        <button onclick="deleteSoup('${soup._id}')">Delete</button>
                    </td>` : ''}
                `;
                soupList.appendChild(tr);
            });

            grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching soups:', error);
        }
    }

    // Handle form submission to add or update soups
    document.getElementById('soup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (!name || price < 0 || quantity < 0) {
            alert('Please enter valid soup details.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const method = currentSoupId ? 'PUT' : 'POST';
            const url = currentSoupId ? `${apiUrl}/soups/${currentSoupId}` : `${apiUrl}/soups`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, price, quantity })
            });

            if (!response.ok) throw new Error(`Failed to ${currentSoupId ? 'update' : 'add'} soup`);

            resetForm();
            fetchSoups();
        } catch (error) {
            console.error(`Error ${currentSoupId ? 'updating' : 'adding'} soup:`, error);
        }
    });

    // Start editing a soup
    window.startEditSoup = function(id, name, price, quantity) {
        if (role === 'readonly') return; // Prevent editing for readonly users
        currentSoupId = id;
        document.getElementById('name').value = name;
        document.getElementById('price').value = price;
        document.getElementById('quantity').value = quantity;

        document.getElementById('add-btn').style.display = 'none';
        document.getElementById('update-btn').style.display = 'inline-block';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        document.getElementById('name').focus();
        document.getElementById('name').setSelectionRange(0, 0);
    }

    // Ensure the form will submit when clicking the 'Update' button
    document.getElementById('update-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('soup-form').dispatchEvent(new Event('submit'));
    });

    // Reset form fields and buttons
    function resetForm() {
        currentSoupId = null;
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';

        document.getElementById('add-btn').style.display = 'inline-block';
        document.getElementById('update-btn').style.display = 'none';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    // Handle cancel button click
    document.getElementById('cancel-btn').addEventListener('click', resetForm);

    // Delete a soup
    window.deleteSoup = async function(id) {
        if (role === 'readonly') return; // Prevent deleting for readonly users
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/soups/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete soup');

            fetchSoups();
        } catch (error) {
            console.error('Error deleting soup:', error);
        }
    }

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Initial fetch of soups when the page loads
    fetchSoups();
});
