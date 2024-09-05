const apiUrl = 'https://francisco-inventory.onrender.com';
let currentProductId = null;

async function fetchProducts() {
    try {
        const response = await fetch(`${apiUrl}/products`);
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
    const quantity = parseInt(document.getElementById('quantity').value);

    if (!name || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0) {
        alert('Please enter valid product details.');
        return;
    }

    try {
        const method = currentProductId ? 'PUT' : 'POST';
        const url = currentProductId ? `${apiUrl}/products/${currentProductId}` : `${apiUrl}/products`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity })
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
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-quantity').value = quantity;

    document.getElementById('edit-form').style.display = 'block';
    document.getElementById('product-form').style.display = 'none';
}

document.getElementById('save-edit').addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value.trim();
    const price = parseFloat(document.getElementById('edit-price').value);
    const quantity = parseInt(document.getElementById('edit-quantity').value);

    if (!name || isNaN(price) || price < 0 || isNaN(quantity) || quantity < 0) {
        alert('Please enter valid product details.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/products/${currentProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity })
        });

        if (!response.ok) throw new Error('Failed to update product');

        resetForm();
        fetchProducts();
    } catch (error) {
        console.error('Error updating product:', error);
    }
});

document.getElementById('cancel-edit').addEventListener('click', resetForm);

function resetForm() {
    currentProductId = null;
    document.getElementById('name').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('edit-name').value = '';
    document.getElementById('edit-price').value = '';
    document.getElementById('edit-quantity').value = '';

    document.getElementById('product-form').style.display = 'block';
    document.getElementById('edit-form').style.display = 'none';
}

async function deleteProduct(id) {
    try {
        const response = await fetch(`${apiUrl}/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete product');

        fetchProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Initial fetch of products when the page loads
fetchProducts();
