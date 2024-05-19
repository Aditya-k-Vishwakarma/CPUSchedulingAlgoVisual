let processes = [];

function addProcess() {
    const processId = document.getElementById('processId').value;
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
    const burstTime = parseInt(document.getElementById('burstTime').value);
    const priority = parseInt(document.getElementById('priority').value) || null;

    processes.push({ id: processId, arrivalTime, burstTime, priority });
    renderProcessTable();
    clearForm();
}

function clearForm() {
    document.getElementById('processId').value = '';
    document.getElementById('arrivalTime').value = '';
    document.getElementById('burstTime').value = '';
    document.getElementById('priority').value = '';
}

function renderProcessTable() {
    const tableBody = document.getElementById('processTable').querySelector('tbody');
    tableBody.innerHTML = '';
    processes.forEach((process, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.priority !== null ? process.priority : 'N/A'}</td>
            <td>
                <button onclick="editProcess(${index})">Edit</button>
                <button onclick="deleteProcess(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editProcess(index) {
    const process = processes[index];
    document.getElementById('processId').value = process.id;
    document.getElementById('arrivalTime').value = process.arrivalTime;
    document.getElementById('burstTime').value = process.burstTime;
    document.getElementById('priority').value = process.priority;

    processes.splice(index, 1);
    renderProcessTable();
}

function deleteProcess(index) {
    processes.splice(index, 1);
    renderProcessTable();
}

function startSimulation() {
    const algorithm = document.getElementById('algorithm').value;
    const quantum = parseInt(document.getElementById('quantum').value);
    let schedule;

    if (algorithm === 'fcfs') {
        schedule = fcfs(processes);
    } else if (algorithm === 'sjf') {
        schedule = sjf(processes);
    } else if (algorithm === 'priority') {
        schedule = priorityScheduling(processes);
    } else if (algorithm === 'rr') {
        schedule = rr(processes, quantum);
    }

    const metrics = calculateMetrics(schedule);
    renderGanttChart(schedule);
    renderResultsTable(metrics);
    renderChart(metrics);
    renderPieChart(metrics);
}

function fcfs(processes) {
    return processes.slice().sort((a, b) => a.arrivalTime - b.arrivalTime);
}

function sjf(processes) {
    return processes.slice().sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
}

function priorityScheduling(processes) {
    return processes.slice().sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
}

function rr(processes, quantum) {
    let queue = processes.slice();
    let schedule = [];
    let time = 0;

    while (queue.length > 0) {
        let process = queue.shift();
        if (process.arrivalTime > time) {
            time = process.arrivalTime;
        }
        if (process.burstTime > quantum) {
            schedule.push({ ...process, burstTime: quantum });
            process.burstTime -= quantum;
            queue.push(process);
        } else {
            schedule.push({ ...process });
        }
        time += quantum;
    }
    return schedule;
}

function calculateMetrics(schedule) {
    let waitingTime = {};
    let turnaroundTime = {};
    let elapsedTime = 0;
    let startTime = {};

    schedule.forEach(process => {
        if (!(process.id in startTime)) {
            startTime[process.id] = elapsedTime;
            waitingTime[process.id] = elapsedTime - process.arrivalTime;
        } else {
            waitingTime[process.id] += elapsedTime - startTime[process.id] - process.burstTime;
        }
        elapsedTime += process.burstTime;
        startTime[process.id] = elapsedTime;
        turnaroundTime[process.id] = elapsedTime - process.arrivalTime;
    });

    return schedule.map(process => ({
        id: process.id,
        arrivalTime: process.arrivalTime,
        burstTime: process.burstTime,
        waitingTime: waitingTime[process.id],
        turnaroundTime: turnaroundTime[process.id]
    }));
}

function renderGanttChart(schedule) {
    const ganttChart = document.getElementById('lineChart');
    ganttChart.innerHTML = '';
    schedule.forEach(process => {
        const processDiv = document.createElement('div');
        processDiv.className = 'process';
        processDiv.style.flexBasis = `${process.burstTime * 50}px`;
        processDiv.textContent = process.id;
        ganttChart.appendChild(processDiv);
    });
}

function renderResultsTable(metrics) {
    const tableBody = document.getElementById('resultsTable').querySelector('tbody');
    tableBody.innerHTML = '';
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${metric.id}</td>
            <td>${metric.arrivalTime}</td>
            <td>${metric.burstTime}</td>
            <td>${metric.waitingTime}</td>
            <td>${metric.turnaroundTime}</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderChart(metrics) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const labels = metrics.map(metric => metric.id);
    const waitingTimes = metrics.map(metric => metric.waitingTime);
    const turnaroundTimes = metrics.map(metric => metric.turnaroundTime);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Waiting Time',
                    data: waitingTimes,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Turnaround Time',
                    data: turnaroundTimes,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


    
    document.getElementById('algorithm').addEventListener('change', function() {
        const quantumInput = document.getElementById('quantum');
        const quantumLabel = document.getElementById('quantumLabel');
        const priorityInput = document.getElementById('priority');
        const priorityLabel = document.getElementById('priorityLabel');
        if (this.value === 'rr') {
            quantumInput.style.display = 'inline';
            quantumLabel.style.display = 'inline';
            priorityInput.style.display = 'none';
            priorityLabel.style.display = 'none';
        } else if (this.value === 'priority') {
            quantumInput.style.display = 'none';
            quantumLabel.style.display = 'none';
            priorityInput.style.display = 'inline';
            priorityLabel.style.display = 'inline';
        } else {
            quantumInput.style.display = 'none';
            quantumLabel.style.display = 'none';
            priorityInput.style.display = 'none';
            priorityLabel.style.display = 'none';
        }
    });
    