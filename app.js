let web3;
let todoContract;
const contractAddress = "YOUR_SMART_CONTRACT_ADDRESS_HERE"; 
const abi = [ /* PASTE BRYAN'S CONTRACT ABI HERE */ ];

const connectBtn = document.getElementById('connectBtn');
const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const walletAddress = document.getElementById('walletAddress');

// 1. Initialize Web3 and Connect Wallet
async function init() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        
        connectBtn.onclick = async () => {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            walletAddress.innerText = `Connected: ${accounts[0].substring(0,6)}...${accounts[0].slice(-4)}`;
            
            // Connect to Bryan's Smart Contract
            todoContract = new web3.eth.Contract(abi, contractAddress);
            renderTasks();
        };
    } else {
        alert("Please install MetaMask to use this To-Do App!");
    }
}

// 2. Add Task (Write to Blockchain)
addBtn.onclick = async () => {
    const content = taskInput.value;
    if (!content) return;

    const accounts = await web3.eth.getAccounts();
    
    // Logic: Calls the "createTask" function in Bryan's Solidity code
    await todoContract.methods.createTask(content).send({ from: accounts[0] });
    
    taskInput.value = "";
    renderTasks(); // Refresh list
};

// 3. Toggle Task Completion (Update Blockchain)
async function toggleTask(id) {
    const accounts = await web3.eth.getAccounts();
    await todoContract.methods.toggleCompleted(id).send({ from: accounts[0] });
    renderTasks();
}

// 4. Render Tasks (Read from Blockchain)
async function renderTasks() {
    taskList.innerHTML = "Loading tasks from blockchain...";
    const taskCount = await todoContract.methods.taskCount().call();
    taskList.innerHTML = "";

    for (let i = 1; i <= taskCount; i++) {
        const task = await todoContract.methods.tasks(i).call();
        const id = task[0];
        const content = task[1];
        const completed = task[2];

        const taskElement = document.createElement('li');
        taskElement.innerHTML = `
            <span class="${completed ? 'completed' : ''}">${content}</span>
            <button onclick="toggleTask(${id})">${completed ? 'Undo' : 'Done'}</button>
        `;
        taskList.appendChild(taskElement);
    }
}

init();