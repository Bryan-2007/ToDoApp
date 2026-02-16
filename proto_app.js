/** * Nexus To-Do: Professional Local Version
 * Logic: Validation -> Duplicate Check -> LocalStorage -> UI Update
 */

// State Management
let tasks = JSON.parse(localStorage.getItem('nexus_tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const errorMsg = document.getElementById('errorMessage');
const totalCount = document.getElementById('totalCount');
const progressBar = document.getElementById('progressBar');
const percentText = document.getElementById('percentComplete');
const emptyState = document.getElementById('emptyState');

// 1. Initialize
document.addEventListener('DOMContentLoaded', renderApp);

// 2. Add Task with Edge Case Handling
addBtn.addEventListener('click', () => {
    const content = taskInput.value.trim();
    
    // Edge Case: Empty Input
    if (!content) {
        showError("Task cannot be empty!");
        return;
    }

    // Edge Case: Duplicate Task
    const isDuplicate = tasks.some(t => t.content.toLowerCase() === content.toLowerCase());
    if (isDuplicate) {
        showError("This task already exists!");
        return;
    }

    // Success: Create Task object
    const newTask = {
        id: Date.now(),
        content: content,
        completed: false,
        timestamp: new Date().toLocaleDateString()
    };

    tasks.unshift(newTask); // Add to beginning
    saveAndSync();
    taskInput.value = "";
    showError(""); // Clear errors
});

// 3. Delete & Toggle Logic
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveAndSync();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveAndSync();
}

// 4. Filtering Logic
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderApp();
    });
});

// 5. Core UI Engine
function renderApp() {
    let filteredTasks = tasks.filter(t => {
        if (currentFilter === 'pending') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    taskList.innerHTML = "";
    
    // Toggle Empty State
    emptyState.style.display = filteredTasks.length === 0 ? "block" : "none";

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <div class="task-content" onclick="toggleTask(${task.id})">
                <div class="check-circle"></div>
                <span>${task.content}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        taskList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalCount.innerText = total;
    percentText.innerText = `${percent}%`;
    progressBar.style.width = `${percent}%`;
}

function saveAndSync() {
    localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
    renderApp();
}

function showError(msg) {
    errorMsg.innerText = msg;
    if(msg) taskInput.style.borderColor = "var(--danger)";
    else taskInput.style.borderColor = "rgba(255, 255, 255, 0.1)";
}