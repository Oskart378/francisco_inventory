// nav.js
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const role = localStorage.getItem('role');

    if (role === 'readonly') {
        // Remove links that are not relevant to readonly users
        nav.innerHTML = `
            <a href="soup_inventory.html">Soup Inventory</a>
            <button id="logout-btn">Logout</button>
        `;
    } else {
        // Add links for admin or other roles
        nav.innerHTML = `
            <a href="index.html">Company Inventory</a>
            <a href="soup_inventory.html">Soup Inventory</a>
            <a href="employees.html">Employee Management</a>
            <button id="logout-btn">Logout</button>
        `;
    }

    // Logout button functionality
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html'; // Redirect to login page
    });
});
