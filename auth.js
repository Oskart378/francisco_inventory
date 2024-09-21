document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role'); // Assume role is stored in localStorage
    const navBar = document.getElementById('nav-bar');
    const isReadOnly = role === 'readonly';

    if (isReadOnly) {
        navBar.innerHTML = `
            <a href="soup_inventory.html">Soup Inventory</a>
            <button id="logout-btn">Logout</button>
        `;
    } else {
        navBar.innerHTML = `
            <a href="index.html">Company Inventory</a>
            <a href="soup_inventory.html">Soup Inventory</a>
            <a href="employees.html">Employee Management</a>
            <button id="logout-btn">Logout</button>
        `;
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = 'login.html';
    });
});
