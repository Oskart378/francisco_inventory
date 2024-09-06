const apiUrl = 'https://francisco-inventory-2.onrender.com'; // Update to your API endpoint

// Check for authentication
const token = localStorage.getItem('token');

if (!token) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
}

async function fetchProducts() {
    try {
        const response = await fetch(`${apiUrl}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Failed to fetch products', error);
    }
}

async function addProduct(product) {
    try {
        const response = await fetch(`${apiUrl}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });
        const newProduct = await response.json();
        // Refresh product list after adding
        fetchProducts();
    } catch (error) {
        console.error('Failed to add product', error);
    }
}

async function updateProduct(id, product) {
    try {
        const response = await fetch(`${apiUrl}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });
        const updatedProduct = await response.json();
        // Refresh product list after updating
        fetchProducts();
    } catch (error) {
        console.error('Failed to update product', error);
    }
}

async function deleteProduct(id) {
    try {
        await fetch(`${apiUrl}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Refresh product list after deleting
        fetchProducts();
    } catch (error) {
        console.error('Failed to delete product', error);
    }
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    const grandTotalElement = document.getElementById('grand-total');

    productList.innerHTML = '';
    let grandTotal = 0;

    products.forEach(product => {
        const total = (product.price * product.quantity).toFixed(2);
        grandTotal += parseFloat(total);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>$${total}</td>
            <td>
                <button onclick="editProduct('${product._id}')">Edit</button>
                <button onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        `;
        productList.appendChild(row);
    });

    grandTotalElement.textContent = `$${grandTotal.toFixed(2)}`;
}

function setupFormHandlers() {
    const form = document.getElementById('product-form');
    const addButton = document.getElementById('add-btn');
    const updateButton = document.getElementById('update-btn');
    const cancelButton = document.getElementById('cancel-btn');
    let editingProductId = null;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value, 10);

        if (editingProductId) {
            updateProduct(editingProductId, { name, price, quantity });
            editingProductId = null;
        } else {
            addProduct({ name, price, quantity });
        }

        form.reset();
        addButton.style.display = 'block';
        updateButton.style.display = 'none';
        cancelButton.style.display = 'none';
    });

    cancelButton.addEventListener('click', () => {
        form.reset();
        addButton.style.display = 'block';
        updateButton.style.display = 'none';
        cancelButton.style.display = 'none';
    });
}

function editProduct(id) {
    fetch(`${apiUrl}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(product => {
        document.getElementById('name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('quantity').value = product.quantity;

        document.getElementById('add-btn').style.display = 'none';
        document.getElementById('update-btn').style.display = 'block';
        document.getElementById('cancel-btn').style.display = 'block';
        
        window.editingProductId = id;
    })
    .catch(error => console.error('Failed to load product for editing', error));
}

setupFormHandlers();
fetchProducts();
