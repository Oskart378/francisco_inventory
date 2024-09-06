const apiUrl = 'https://francisco-inventory-2.onrender.com'; // Updated to your API endpoint
let currentProductId = null;
let token = localStorage.getItem('token'); // Retrieve the token from localStorage

async function fetchProducts() {
    try {
        const response = await fetch(`${apiUrl}/products`, {
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
    const price = document.getElementById('price').value.trim();
    const quantity = document.getElementById('quantity').value.trim();

    if (!name || !price || !quantity) {
        alert('Please fill out all fields.');
        return;
    }

    const priceNumber = parseFloat(price);
    const quantityNumber = parseInt(quantity);

    if (isNaN(priceNumber) || isNaN(quantityNumber) || priceNumber < 0 || quantityNumber < 0) {
        alert('Please enter valid numbers for Price and Quantity.');
        return;
    }

    try {
        const method = currentProductId ? 'PUT' : 'POST';
        const url = currentProductId ? `${apiUrl}/products/${currentProductId}` : `${apiUrl}/products`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, price: priceNumber, quantity: quantityNumber })
        });

        if (!response.ok) throw new Error(`Failed to ${currentProductId ? 'update' : 'add'} product`);

        resetForm();
        fetchProducts();
    } catch (error) {
        console.error(`Error ${currentProductId ? 'updating' : 'adding'} product:`, error);
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

// Ensure the form will submit when clicking the 'Update' button
document.getElementById('update-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('product-form').dispatchEvent(new Event('submit'));
});

function resetForm() {
    currentProductId = null;
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    
    document.getElementById('add-btn').style.display = 'inline-block';
    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`${apiUrl}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete product');
        fetchProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

document.getElementById('cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
});

document.addEventListener('DOMContentLoaded', fetchProducts);
