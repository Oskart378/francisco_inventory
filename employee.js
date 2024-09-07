document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    if (role === 'readonly') {
        window.location.href = 'soup_inventory.html'; // Redirect readonly users
        return; // Prevent further execution
    }

    const apiUrl = 'https://francisco-inventory.onrender.com'; // Update to your API endpoint
    let currentEmployeeId = null;

    fetchEmployees();
    setupFormHandlers();
    setupLogoutHandler(); // Add this function

    function getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async function fetchEmployees() {
        try {
            const response = await fetch(`${apiUrl}/employees`, { headers: getAuthHeader() });
            if (!response.ok) throw new Error('Network response was not ok');
            const employees = await response.json();
            const employeeList = document.getElementById('employee-list');
            const totalPayElement = document.getElementById('total-pay');
            let totalPay = 0;

            employeeList.innerHTML = '';

            employees.forEach(employee => {
                totalPay += employee.weeklyPay;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${employee.name.charAt(0).toUpperCase() + employee.name.slice(1)}</td>
                    <td>$${employee.weeklyPay.toFixed(2)}</td>
                    <td class="actions">
                        <button onclick="startEditEmployee('${employee._id}', '${employee.name}', ${employee.weeklyPay})">Edit</button>
                        <button onclick="deleteEmployee('${employee._id}')">Delete</button>
                    </td>
                `;
                employeeList.appendChild(tr);
            });

            totalPayElement.textContent = `$${totalPay.toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }

    function setupFormHandlers() {
        document.getElementById('employee-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('employee-name').value.trim();
            const weeklyPay = document.getElementById('weekly-pay').value.trim();

            if (!name) {
                alert('Please enter a valid employee name.');
                return;
            }

            // Validate that weekly pay is a positive number
            const weeklyPayNumber = parseFloat(weeklyPay);
            if (isNaN(weeklyPayNumber) || weeklyPayNumber < 0) {
                alert('Please enter a valid number for Weekly Pay.');
                return;
            }

            try {
                const method = currentEmployeeId ? 'PUT' : 'POST';
                const url = currentEmployeeId ? `${apiUrl}/employees/${currentEmployeeId}` : `${apiUrl}/employees`;

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...getAuthHeader()
                    },
                    body: JSON.stringify({ name, weeklyPay: weeklyPayNumber })
                });

                if (!response.ok) throw new Error(`Failed to ${currentEmployeeId ? 'update' : 'add'} employee`);

                resetForm();
                fetchEmployees();
            } catch (error) {
                console.error(`Error ${currentEmployeeId ? 'updating' : 'adding'} employee:`, error);
            }
        });

        document.getElementById('update-employee-btn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('employee-form').dispatchEvent(new Event('submit'));
        });

        document.getElementById('cancel-employee-btn').addEventListener('click', resetForm);
    }

    function setupLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role'); // Optional: remove role from localStorage
            window.location.href = 'login.html'; // Redirect to login page or home page
        });
    }

    window.startEditEmployee = function(id, name, weeklyPay) {
        currentEmployeeId = id;
        document.getElementById('employee-name').value = name;
        document.getElementById('weekly-pay').value = weeklyPay;

        document.getElementById('add-employee-btn').style.display = 'none';
        document.getElementById('update-employee-btn').style.display = 'inline-block';
        document.getElementById('cancel-employee-btn').style.display = 'inline-block';

        document.getElementById('employee-name').focus();
        document.getElementById('employee-name').setSelectionRange(0, 0);
    }

    function resetForm() {
        currentEmployeeId = null;
        document.getElementById('employee-name').value = '';
        document.getElementById('weekly-pay').value = '';

        document.getElementById('add-employee-btn').style.display = 'inline-block';
        document.getElementById('update-employee-btn').style.display = 'none';
        document.getElementById('cancel-employee-btn').style.display = 'none';
    }

    window.deleteEmployee = async function(id) {
        try {
            const response = await fetch(`${apiUrl}/employees/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (!response.ok) throw new Error('Failed to delete employee');

            fetchEmployees();
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    }
});
