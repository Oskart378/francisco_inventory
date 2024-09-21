document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const role = localStorage.getItem('role'); // Assuming role is stored in localStorage

    navLinks.forEach(link => {
        if (link.dataset.role && link.dataset.role !== role) {
            link.style.display = 'none';
        }
    });

    // Redirect if user is not allowed to access the page
    const path = window.location.pathname;
    if (path === '/employees.html' && role !== 'admin') {
        window.location.href = 'soup_inventory.html';
    } else if (path === '/index.html' && role === 'readonly') {
        window.location.href = 'soup_inventory.html';
    }
});
