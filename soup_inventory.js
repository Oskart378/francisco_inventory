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
    let currentSortColumn = 'name'; // Default sort column
    let sortDirection = 'asc'; // Default sort direction

    fetchSoups(currentSortColumn, sortDirection);
    setupFormHandlers();
    setupLogoutHandler();
    setupSorting();

    function getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function fetchSoups(sortBy = 'name', direction = 'asc') {
        try {
            const response = await fetch(`${apiUrl}/soups`, { headers: getAuthHeader() });
            if (!response.ok) throw new Error('Network response was not ok');
            const soups = await response.json();

            // Sort soups if needed
            if (sortBy) {
                soups.sort((a, b) => {
                    const aValue = a[sortBy];
                    const bValue = b[sortBy];

                    if (typeof aValue === 'string') {
                        return direction === 'asc' 
                            ? aValue.localeCompare(bValue) 
                            : bValue.localeCompare(aValue);
                    } else {
                        return direction === 'asc' 
                            ? aValue - bValue 
                            : bValue - aValue;
                    }
                });
            }

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
            
            // Update sort arrow
            updateSortArrows();
        } catch (error) {
            console.error('Error fetching soups:', error);
        }
    }

    function setupFormHandlers() {
        document.getElementById('soup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const priceValue = document.getElementById('price').value.trim();
            const quantityValue = document.getElementById('quantity').value.trim();

            // Enhanced Validation
            if (!name) {
                alert('Name cannot be empty.');
                return;
            }

            if (priceValue === '') {
                alert('Price cannot be empty.');
                return;
            }

            if (quantityValue === '') {
                alert('Quantity cannot be empty.');
                return;
            }

            const price = parseFloat(priceValue);
            const quantity = parseInt(quantityValue, 10);

            if (isNaN(price) || price < 0) {
                alert('Please enter a valid price (a non-negative number).');
                return;
            }

            if (!Number.isInteger(quantity) || quantity < 0) {
                alert('Please enter a valid quantity (a non-negative integer).');
                return;
            }

            try {
                const method = currentSoupId ? 'PUT' : 'POST';
                const url = currentSoupId ? `${apiUrl}/soups/${currentSoupId}` : `${apiUrl}/soups`;

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    body: JSON.stringify({ name, price, quantity })
                });

                if (!response.ok) throw new Error(`Failed to ${currentSoupId ? 'update' : 'add'} soup`);

                resetForm();
                fetchSoups(currentSortColumn, sortDirection);
            } catch (error) {
                console.error(`Error ${currentSoupId ? 'updating' : 'adding'} soup:`, error);
            }
        });

        document.getElementById('update-btn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('soup-form').dispatchEvent(new Event('submit'));
        });

        document.getElementById('cancel-btn').addEventListener('click', resetForm);
    }

    function setupLogoutHandler() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    function setupSorting() {
        document.querySelectorAll('th[data-sort]').forEach(header => {
            header.addEventListener('click', () => {
                const sortBy = header.getAttribute('data-sort');
                sortDirection = (currentSortColumn === sortBy && sortDirection === 'asc') ? 'desc' : 'asc';
                currentSortColumn = sortBy;

                fetchSoups(sortBy, sortDirection);
            });
        });
    }

    function updateSortArrows() {
        // Reset arrows
        document.querySelectorAll('.sort-arrow').forEach(arrow => {
            arrow.classList.remove('asc', 'desc');
        });

        // Update arrow for the current column
        const arrow = document.getElementById(`${currentSortColumn}-arrow`);
        if (arrow) {
            arrow.classList.add(sortDirection);
        }
    }

    function resetForm() {
        currentSoupId = null;
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';

        document.getElementById('add-btn').style.display = 'inline-block';
        document.getElementById('update-btn').style.display = 'none';
        document.getElementById('cancel-btn').style.display = 'none';
    }

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

    window.deleteSoup = async function(id) {
        if (role === 'readonly') return; // Prevent deleting for readonly users
        try {
            const response = await fetch(`${apiUrl}/soups/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error('Failed to delete soup');

            fetchSoups(currentSortColumn, sortDirection);
        } catch (error) {
            console.error('Error deleting soup:', error);
        }
    }
});
