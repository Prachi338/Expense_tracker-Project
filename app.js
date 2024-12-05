const API_BASE_URL = 'http://localhost:5000'; // Update as needed
let token = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const expenseForm = document.getElementById('expense-form');
const expensesTable = document.getElementById('expenses-table');
const authSection = document.getElementById('auth-section');
const expenseSection = document.getElementById('expense-section');
const expenseChart = document.getElementById('expense-chart');

// Utility function for API requests
const apiRequest = async (endpoint, method, body = null) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Something went wrong');
        throw new Error(error.error);
    }
    return response.json();
};

// Login Form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', 'POST', { email, password });
        token = data.token;
        alert('Logged in successfully');
        authSection.style.display = 'none';
        expenseSection.style.display = 'block';
        loadExpenses();
    } catch (err) {
        console.error(err);
    }
});

// Signup Form
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        await apiRequest('/auth/signup', 'POST', { email, password });
        alert('Signup successful! Please log in.');
    } catch (err) {
        console.error(err);
    }
});

// Add Expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const comments = document.getElementById('comments').value;

    try {
        await apiRequest('/expenses', 'POST', { category, amount, comments });
        alert('Expense added successfully');
        expenseForm.reset();
        loadExpenses();
    } catch (err) {
        console.error(err);
    }
});

// Load Expenses
const loadExpenses = async () => {
    try {
        const expenses = await apiRequest('/expenses', 'GET');
        expensesTable.innerHTML = '';
        const categoryData = {};

        expenses.forEach((expense) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.category}</td>
                <td>${expense.amount}</td>
                <td>${new Date(expense.createdAt).toLocaleString()}</td>
                <td>${new Date(expense.updatedAt).toLocaleString()}</td>
                <td>${expense.comments || ''}</td>
                <td>
                    <button onclick="deleteExpense('${expense._id}')">Delete</button>
                </td>
            `;
            expensesTable.appendChild(row);

            // Collect data for the chart
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        updateChart(categoryData);
    } catch (err) {
        console.error(err);
    }
};

// Delete Expense
const deleteExpense = async (id) => {
    try {
        await apiRequest(`/expenses/${id}`, 'DELETE');
        alert('Expense deleted successfully');
        loadExpenses();
    } catch (err) {
        console.error(err);
    }
};