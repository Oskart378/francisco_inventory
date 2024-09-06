document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('https://francisco-inventory-2.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Login failed');
        
        const { token } = await response.json();
        localStorage.setItem('token', token);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});
