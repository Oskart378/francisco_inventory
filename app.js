const apiUrl = 'https://francisco-inventory-2.onrender.com/api/products';
let currentProductId = null;
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html'; // Redirect to login if not authenticated
}

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await response.json();
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
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value, 10);

    if (!name || isNaN(price) || isNaN(quantity)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    try {
        if (currentProductId) {
            await fetch(`${apiUrl}/${currentProductId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, price, quantity })
            });
        } else {
            await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, price, quantity })
            });
        }

        resetForm();
        fetchProducts();
    } catch (error) {
        console.error('Error adding/updating product:', error);
    }
});

function startEditProduct(id, name, price, quantity) {
    currentProductId = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('quantity').value = quantity;

    document.getElementById('add-btn').style.display = 'none';
    document.getElementById('update-btn').style.display = 'inline-block';
    document.getElementById('cancel-btn').style.display = 'inline-block';
}

async function deleteProduct(id) {
    try {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        fetchProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

document.getElementById('cancel-btn').addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    document.getElementById('product-form').reset();
    currentProductId = null;

    document.getElementById('add-btn').style.display = 'inline-block';
    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Initial fetch of products when the page loads
fetchProducts();
