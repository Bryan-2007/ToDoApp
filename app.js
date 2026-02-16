/** * Nexus To-Do: Web3 Version
 * Logic: Connect Wallet -> Call Contract -> Sign Transaction -> Chain Update
 */

let web3;
let contract;
const contractAddress = "0x..."; // From Bryan
const abi = [...]; // From Bryan

// Web3 Connection
async function connectWallet() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            document.getElementById('connectBtn').innerHTML = `<span>${accounts[0].substring(0,6)}...</span>`;
            document.getElementById('network-status').innerText = "Mainnet/Testnet";
            
            contract = new web3.eth.Contract(abi, contractAddress);
            loadBlockchainTasks();
        } catch (err) {
            console.error("User denied account access");
        }
    }
}

// Add Task (Writing to Blockchain)
async function addTask() {
    const content = taskInput.value;
    const accounts = await web3.eth.getAccounts();
    
    showError("Transaction pending... Please check MetaMask.");
    
    try {
        // We call Bryan's "createTask" function
        await contract.methods.createTask(content).send({ from: accounts[0] });
        showError("");
        loadBlockchainTasks();
    } catch (err) {
        showError("Transaction failed or rejected.");
    }
}

// Load Tasks (Reading from Blockchain)
async function loadBlockchainTasks() {
    const taskCount = await contract.methods.taskCount().call();
    tasks = []; // Reset local array
    
    for (let i = 1; i <= taskCount; i++) {
        const task = await contract.methods.tasks(i).call();
        tasks.push({
            id: task.id,
            content: task.content,
            completed: task.completed
        });
    }
    renderApp(); // Reuse the UI engine from Phase 1
}

// Initial Hook
document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('addBtn').addEventListener('click', addTask);