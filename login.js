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

        const data = await response.json();
        console.log('Login Response:', data); // Log full response

        const token = data.token;
        const role = data.role; // Check if role is present

        if (token && role) {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role); // Store the role
            window.location.href = 'index.html'; // Redirect to inventory management page
        } else {
            throw new Error('Invalid response data: role is missing');
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-error').style.display = 'block';
    }
});
