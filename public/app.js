const apiUrl = 'https://francisco-inventory.onrender.com'; // Replace with your Render URL

async function fetchProducts() {
    try {
        const response = await fetch(`${apiUrl}/products`);
        const products = await response.json();
        const productList = document.getElementById('product-list');
        const grandTotalElement = document.getElementById('grand-total');
        let grandTotal = 0;  // Initialize grand total to zero

        productList.innerHTML = '';

        products.forEach(product => {
            const total = product.price * product.quantity; // Calculate the total for each product
            grandTotal += total;  // Add each product's total to the grand total

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name.charAt(0).toUpperCase() + product.name.slice(1)}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>$${total.toFixed(2)}</td> <!-- Total for each product -->
                <td class="actions">
                    <button onclick="editProduct('${product._id}')">Edit</button>
                    <button onclick="deleteProduct('${product._id}')">Delete</button>
                </td>
            `;
            productList.appendChild(tr);
        });

        grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`; // Update the grand total display
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    if (!name || price < 0 || quantity < 0) {
        alert('Please enter valid product details.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity })
        });

        if (!response.ok) throw new Error('Failed to add product');

        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('name').focus(); // Move focus back to the name field
        fetchProducts(); // Refresh the product list
    } catch (error) {
        console.error('Error adding product:', error);
    }
});

async function deleteProduct(id) {
    try {
        const response = await fetch(`${apiUrl}/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete product');

        fetchProducts(); // Refresh the product list
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

async function editProduct(id) {
    const newName = prompt('Enter new product name:');
    const newPrice = parseFloat(prompt('Enter new product price:'));
    const newQuantity = parseInt(prompt('Enter new product quantity:'));

    if (!newName || newPrice < 0 || newQuantity < 0) {
        alert('Please enter valid product details.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, price: newPrice, quantity: newQuantity })
        });

        if (!response.ok) throw new Error('Failed to update product');

        fetchProducts(); // Refresh the product list
    } catch (error) {
        console.error('Error updating product:', error);
    }
}

// Initial fetch of products when the page loads
fetchProducts();
