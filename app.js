const apiUrl = 'https://francisco-inventory.onrender.com';
let currentProductId = null;
let currentSortColumn = 'name'; // Default sort column
let sortDirection = 'asc'; // Default sort direction

document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    if (role === 'readonly') {
        window.location.href = 'soup_inventory.html'; // Redirect readonly users
    }

    // Fetch products and display them
    async function fetchProducts(sortBy = 'name', direction = 'asc') {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const products = await response.json();
            
            // Sort products if needed
            if (sortBy) {
                products.sort((a, b) => {
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

            const productList = document.getElementById('product-list');
            const grandTotalElement = document.getElementById('grand-total');
            let grandTotal = 0;

            productList.innerHTML = '';

            products.forEach(product => {
                const total = product.price * product.quantity;
                grandTotal += total;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${product.name.charAt(0).toUpperCase() + product.name.slice(1)}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td>$${total.toFixed(2)}</td>
                    <td class="actions">
                        <button onclick="startEditProduct('${product._id}', '${product.name}', ${product.price}, ${product.quantity})">Edit</button>
                        <button onclick="deleteProduct('${product._id}')">Delete</button>
                    </td>
                `;
                productList.appendChild(tr);
            });

            grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;

            // Update sort arrow
            updateSortArrows();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
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

    // Handle form submission to add or update products
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const price = document.getElementById('price').value;
        const quantity = document.getElementById('quantity').value;

        // Input validation
        if (!name || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid product name, price (greater than 0), and quantity (greater than 0).');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const method = currentProductId ? 'PUT' : 'POST';
            const url = currentProductId ? `${apiUrl}/products/${currentProductId}` : `${apiUrl}/products`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, price: parseFloat(price), quantity: parseInt(quantity) })
            });

            if (!response.ok) throw new Error(`Failed to ${currentProductId ? 'update' : 'add'} product`);

            resetForm();
            fetchProducts(currentSortColumn, sortDirection);
        } catch (error) {
            console.error(`Error ${currentProductId ? 'updating' : 'adding'} product:`, error);
        }
    });

    // Start editing a product
    window.startEditProduct = function(id, name, price, quantity) {
        currentProductId = id;
        document.getElementById('name').value = name;
        document.getElementById('price').value = price;
        document.getElementById('quantity').value = quantity;

        document.getElementById('add-btn').style.display = 'none';
        document.getElementById('update-btn').style.display = 'inline-block';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Focus and place cursor at the beginning of the name field
        document.getElementById('name').focus();
        document.getElementById('name').setSelectionRange(0, 0);
    }

    // Ensure the form will submit when clicking the 'Update' button
    document.getElementById('update-btn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('product-form').dispatchEvent(new Event('submit'));
    });

    // Reset form fields and buttons
    function resetForm() {
        currentProductId = null;
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';

        document.getElementById('add-btn').style.display = 'inline-block';
        document.getElementById('update-btn').style.display = 'none';
        document.getElementById('cancel-btn').style.display = 'none';

        // Refocus to the name field after resetting the form
        document.getElementById('name').focus();
    }

    document.getElementById('cancel-btn').addEventListener('click', resetForm);

    // Delete a product
    window.deleteProduct = async function(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete product');

            fetchProducts(currentSortColumn, sortDirection);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }

    // Handle logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Handle column sorting
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const sortBy = header.getAttribute('data-sort');
            sortDirection = (currentSortColumn === sortBy && sortDirection === 'asc') ? 'desc' : 'asc';
            currentSortColumn = sortBy;

            fetchProducts(sortBy, sortDirection);
        });
    });

    // Initialize by sorting products by name
    fetchProducts(currentSortColumn, sortDirection);
});
