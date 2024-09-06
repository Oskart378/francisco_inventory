const apiUrl = 'https://francisco-inventory-2.onrender.com'; // Updated to your API endpoint
let currentEmployeeId = null;
let token = localStorage.getItem('token'); // Retrieve the token from localStorage

async function fetchEmployees() {
    try {
        const response = await fetch(`${apiUrl}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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

document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const weeklyPay = document.getElementById('weekly-pay').value.trim();

    if (!name || !weeklyPay) {
        alert('Please fill out all fields.');
        return;
    }

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
                'Authorization': `Bearer ${token}`
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

function startEditEmployee(id, name, weeklyPay) {
    currentEmployeeId = id;
    document.getElementById('name').value = name;
    document.getElementById('weekly-pay').value = weeklyPay;

    document.getElementById('add-btn').style.display = 'none';
    document.getElementById('update-btn').style.display = 'inline-block';
    document.getElementById('cancel-btn').style.display = 'inline-block';
}

// Ensure the form will submit when clicking the 'Update' button
document.getElementById('update-btn').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('employee-form').dispatchEvent(new Event('submit'));
});

function resetForm() {
    currentEmployeeId = null;
    document.getElementById('name').value = '';
    document.getElementById('weekly-pay').value = '';
    
    document.getElementById('add-btn').style.display = 'inline-block';
    document.getElementById('update-btn').style.display = 'none';
    document.getElementById('cancel-btn').style.display = 'none';
}

async function deleteEmployee(id) {
    try {
        const response = await fetch(`${apiUrl}/employees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to delete employee');
        fetchEmployees();
    } catch (error) {
        console.error('Error deleting employee:', error);
    }
}

document.getElementById('cancel-btn').addEventListener('click', (e) => {
    e.preventDefault();
    resetForm();
});

document.addEventListener('DOMContentLoaded', fetchEmployees);
