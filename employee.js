const apiUrl = 'https://francisco-inventory-2.onrender.com'; // Update to your API endpoint

// Check for authentication
const token = localStorage.getItem('token');

if (!token) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
}

async function fetchEmployees() {
    try {
        const response = await fetch(`${apiUrl}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const employees = await response.json();
        displayEmployees(employees);
    } catch (error) {
        console.error('Failed to fetch employees', error);
    }
}

async function addEmployee(employee) {
    try {
        const response = await fetch(`${apiUrl}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(employee)
        });
        const newEmployee = await response.json();
        // Refresh employee list after adding
        fetchEmployees();
    } catch (error) {
        console.error('Failed to add employee', error);
    }
}

async function updateEmployee(id, employee) {
    try {
        const response = await fetch(`${apiUrl}/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(employee)
        });
        const updatedEmployee = await response.json();
        // Refresh employee list after updating
        fetchEmployees();
    } catch (error) {
        console.error('Failed to update employee', error);
    }
}

async function deleteEmployee(id) {
    try {
        await fetch(`${apiUrl}/employees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Refresh employee list after deleting
        fetchEmployees();
    } catch (error) {
        console.error('Failed to delete employee', error);
    }
}

function displayEmployees(employees) {
    const employeeList = document.getElementById('employee-list');
    const totalPayElement = document.getElementById('total-pay');

    employeeList.innerHTML = '';
    let totalPay = 0;

    employees.forEach(employee => {
        totalPay += employee.weeklyPay;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>$${employee.weeklyPay.toFixed(2)}</td>
            <td>
                <button onclick="editEmployee('${employee._id}')">Edit</button>
                <button onclick="deleteEmployee('${employee._id}')">Delete</button>
            </td>
        `;
        employeeList.appendChild(row);
    });

    totalPayElement.textContent = `$${totalPay.toFixed(2)}`;
}

function setupFormHandlers() {
    const form = document.getElementById('employee-form');
    const addButton = document.getElementById('add-employee-btn');
    const updateButton = document.getElementById('update-employee-btn');
    const cancelButton = document.getElementById('cancel-employee-btn');
    let editingEmployeeId = null;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('employee-name').value;
        const weeklyPay = parseFloat(document.getElementById('weekly-pay').value);

        if (editingEmployeeId) {
            updateEmployee(editingEmployeeId, { name, weeklyPay });
            editingEmployeeId = null;
        } else {
            addEmployee({ name, weeklyPay });
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

function editEmployee(id) {
    fetch(`${apiUrl}/employees/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(employee => {
        document.getElementById('employee-name').value = employee.name;
        document.getElementById('weekly-pay').value = employee.weeklyPay;

        document.getElementById('add-employee-btn').style.display = 'none';
        document.getElementById('update-employee-btn').style.display = 'block';
        document.getElementById('cancel-employee-btn').style.display = 'block';

        window.editingEmployeeId = id;
    })
    .catch(error => console.error('Failed to load employee for editing', error));
}

setupFormHandlers();
fetchEmployees();
