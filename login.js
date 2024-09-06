const apiUrl = 'https://francisco-inventory-2.onrender.com';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Login failed');

        const { token } = await response.json();
        localStorage.setItem('token', token);
        window.location.href = 'index.html'; // Redirect to inventory management page
    } catch (error) {
        document.getElementById('login-error').style.display = 'block';
    }
});
