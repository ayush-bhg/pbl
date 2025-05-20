// First Come First Serve (FCFS)
function fcfs(processes) {
  const n = processes.length;
  let currentTime = 0;
  let waitingTime = new Array(n).fill(0);
  let turnaroundTime = new Array(n).fill(0);
  let timeline = [];
  // Sort processes by arrival time
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  for (let i = 0; i < n; i++) {
    // If there's a gap between processes, add idle time
    if (currentTime < processes[i].arrivalTime) {
      timeline.push({
        process: "Idle",
        start: currentTime,
        end: processes[i].arrivalTime,
      });
      currentTime = processes[i].arrivalTime;
    }
    waitingTime[i] = currentTime - processes[i].arrivalTime;
    turnaroundTime[i] = waitingTime[i] + processes[i].burstTime;
    timeline.push({
      process: `P${processes[i].id}`,
      start: currentTime,
      end: currentTime + processes[i].burstTime,
    });
    currentTime += processes[i].burstTime;
  }
  return {
    waitingTime,
    turnaroundTime,
    timeline,
  };
}
// Shortest Job First (SJF)
function sjf(processes) {
  const n = processes.length;
  let currentTime = 0;
  let completed = 0;
  let waitingTime = new Array(n).fill(0);
  let turnaroundTime = new Array(n).fill(0);
  let timeline = [];
  let remainingProcesses = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));
  const isPreemptive = document.getElementById("preemptive-toggle").checked;
  while (completed < n) {
    let shortestJob = null;
    let shortestBurst = Infinity;
    // Find the process with shortest burst time that has arrived
    for (let process of remainingProcesses) {
      if (
        process.arrivalTime <= currentTime &&
        process.remainingTime < shortestBurst
      ) {
        shortestJob = process;
        shortestBurst = process.remainingTime;
      }
    }
    if (shortestJob === null) {
      // No process available, add idle time
      let nextArrival = Math.min(
        ...remainingProcesses.map((p) => p.arrivalTime)
      );
      timeline.push({
        process: "Idle",
        start: currentTime,
        end: nextArrival,
      });
      currentTime = nextArrival;
    } else {
      // Execute shortest job
      if (isPreemptive) {
        // Find next arrival time
        let nextArrival = Math.min(
          ...remainingProcesses
            .filter((p) => p !== shortestJob && p.arrivalTime > currentTime)
            .map((p) => p.arrivalTime)
        );
        // Execute until next arrival or completion
        let executionTime = Math.min(
          shortestJob.remainingTime,
          nextArrival - currentTime
        );
        timeline.push({
          process: `P${shortestJob.id}`,
          start: currentTime,
          end: currentTime + executionTime,
        });
        currentTime += executionTime;
        shortestJob.remainingTime -= executionTime;
        if (shortestJob.remainingTime === 0) {
          waitingTime[shortestJob.id - 1] =
            currentTime - shortestJob.arrivalTime - shortestJob.burstTime;
          turnaroundTime[shortestJob.id - 1] =
            currentTime - shortestJob.arrivalTime;
          remainingProcesses = remainingProcesses.filter(
            (p) => p !== shortestJob
          );
          completed++;
        }
      } else {
        // Non-preemptive: execute until completion
        waitingTime[shortestJob.id - 1] = currentTime - shortestJob.arrivalTime;
        turnaroundTime[shortestJob.id - 1] =
          waitingTime[shortestJob.id - 1] + shortestJob.burstTime;
        timeline.push({
          process: `P${shortestJob.id}`,
          start: currentTime,
          end: currentTime + shortestJob.burstTime,
        });
        currentTime += shortestJob.burstTime;
        remainingProcesses = remainingProcesses.filter(
          (p) => p !== shortestJob
        );
        completed++;
      }
    }
  }
  return {
    waitingTime,
    turnaroundTime,
    timeline,
  };
}
// Priority Scheduling
function priority(processes, higherPriority) {
  const n = processes.length;
  let currentTime = 0;
  let completed = 0;
  let waitingTime = new Array(n).fill(0);
  let turnaroundTime = new Array(n).fill(0);
  let timeline = [];
  let remainingProcesses = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));
  const isPreemptive = document.getElementById("preemptive-toggle").checked;
  while (completed < n) {
    let selectedProcess = null;
    let selectedPriority = higherPriority ? -Infinity : Infinity;
    // Find the process with highest/lowest priority that has arrived
    for (let process of remainingProcesses) {
      if (process.arrivalTime <= currentTime) {
        if (higherPriority && process.priority > selectedPriority) {
          selectedProcess = process;
          selectedPriority = process.priority;
        } else if (!higherPriority && process.priority < selectedPriority) {
          selectedProcess = process;
          selectedPriority = process.priority;
        }
      }
    }
    if (selectedProcess === null) {
      // No process available, add idle time
      let nextArrival = Math.min(
        ...remainingProcesses.map((p) => p.arrivalTime)
      );
      timeline.push({
        process: "Idle",
        start: currentTime,
        end: nextArrival,
      });
      currentTime = nextArrival;
    } else {
      if (isPreemptive) {
        // Find next arrival time
        let nextArrival = Math.min(
          ...remainingProcesses
            .filter((p) => p !== selectedProcess && p.arrivalTime > currentTime)
            .map((p) => p.arrivalTime)
        );
        // Execute until next arrival or completion
        let executionTime = Math.min(
          selectedProcess.remainingTime,
          nextArrival - currentTime
        );
        timeline.push({
          process: `P${selectedProcess.id}`,
          start: currentTime,
          end: currentTime + executionTime,
        });
        currentTime += executionTime;
        selectedProcess.remainingTime -= executionTime;
        if (selectedProcess.remainingTime === 0) {
          waitingTime[selectedProcess.id - 1] =
            currentTime -
            selectedProcess.arrivalTime -
            selectedProcess.burstTime;
          turnaroundTime[selectedProcess.id - 1] =
            currentTime - selectedProcess.arrivalTime;
          remainingProcesses = remainingProcesses.filter(
            (p) => p !== selectedProcess
          );
          completed++;
        }
      } else {
        // Non-preemptive: execute until completion
        waitingTime[selectedProcess.id - 1] =
          currentTime - selectedProcess.arrivalTime;
        turnaroundTime[selectedProcess.id - 1] =
          waitingTime[selectedProcess.id - 1] + selectedProcess.burstTime;
        timeline.push({
          process: `P${selectedProcess.id}`,
          start: currentTime,
          end: currentTime + selectedProcess.burstTime,
        });
        currentTime += selectedProcess.burstTime;
        remainingProcesses = remainingProcesses.filter(
          (p) => p !== selectedProcess
        );
        completed++;
      }
    }
  }
  return {
    waitingTime,
    turnaroundTime,
    timeline,
  };
}
// Round Robin
function roundRobin(processes, timeQuantum) {
  const n = processes.length;
  let currentTime = 0;
  let waitingTime = new Array(n).fill(0);
  let turnaroundTime = new Array(n).fill(0);
  let timeline = [];
  let remainingProcesses = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    lastExecutionTime: 0,
  }));
  while (remainingProcesses.length > 0) {
    let executed = false;
    for (let i = 0; i < remainingProcesses.length; i++) {
      let process = remainingProcesses[i];
      if (process.arrivalTime <= currentTime) {
        executed = true;
        // Update waiting time
        waitingTime[process.id - 1] += currentTime - process.lastExecutionTime;
        // Execute for time quantum or remaining time
        let executionTime = Math.min(timeQuantum, process.remainingTime);
        timeline.push({
          process: `P${process.id}`,
          start: currentTime,
          end: currentTime + executionTime,
        });
        process.remainingTime -= executionTime;
        currentTime += executionTime;
        process.lastExecutionTime = currentTime;
        if (process.remainingTime === 0) {
          // Process completed
          turnaroundTime[process.id - 1] = currentTime - process.arrivalTime;
          remainingProcesses.splice(i, 1);
          i--;
        }
      }
    }
    if (!executed) {
      // No process available, add idle time
      let nextArrival = Math.min(
        ...remainingProcesses.map((p) => p.arrivalTime)
      );
      timeline.push({
        process: "Idle",
        start: currentTime,
        end: nextArrival,
      });
      currentTime = nextArrival;
    }
  }
  return {
    waitingTime,
    turnaroundTime,
    timeline,
  };
}
// Calculate metrics and update UI
function calculateSchedule() {
  try {
    const algorithm = document.getElementById("algorithm-select").value;
    const processes = getProcesses();
    if (!processes.length) {
      console.error("No processes found");
      return null;
    }
    console.log("Running algorithm:", algorithm);
    console.log("Processes:", processes);
    let result;
    switch (algorithm) {
      case "fcfs":
        result = fcfs(processes);
        break;
      case "sjf":
        result = sjf(processes);
        break;
      case "priority":
        const higherPriority =
          document.getElementById("priority-toggle").checked;
        result = priority(processes, higherPriority);
        break;
      case "roundrobin":
        const timeQuantum = parseInt(
          document.getElementById("time-quantum").value
        );
        result = roundRobin(processes, timeQuantum);
        break;
      default:
        console.error("Invalid algorithm selected");
        return null;
    }
    if (result) {
      updateMetrics(result, processes);
      updateGanttChart(result.timeline);
      updateTimeline(result.timeline);
    }
    return result;
  } catch (error) {
    console.error("Error in calculateSchedule:", error);
    return null;
  }
}
// Helper function to get processes from input
function getProcesses() {
  try {
    const processRows = document.querySelectorAll(".process-row");
    if (!processRows.length) {
      console.error("No process rows found");
      return [];
    }
    const processes = [];
    processRows.forEach((row, index) => {
      try {
        const arrivalTimeInput = row.querySelector(".arrival-time-input");
        const burstTimeInput = row.querySelector(".burst-time-input");
        if (!arrivalTimeInput || !burstTimeInput) {
          console.error("Missing inputs for process", index + 1);
          return;
        }
        const process = {
          id: index + 1,
          arrivalTime: parseInt(arrivalTimeInput.value) || 0,
          burstTime: parseInt(burstTimeInput.value) || 1,
        };
        const priorityInput = row.querySelector(".priority-input");
        if (priorityInput) {
          process.priority = parseInt(priorityInput.value) || 1;
        }
        processes.push(process);
      } catch (error) {
        console.error("Error processing row", index + 1, error);
      }
    });
    return processes;
  } catch (error) {
    console.error("Error in getProcesses:", error);
    return [];
  }
}
// Update performance metrics
function updateMetrics(result, processes) {
  try {
    if (!result || !processes.length) {
      console.error("Invalid result or processes");
      return;
    }
    const avgWaitingTime =
      result.waitingTime.reduce((a, b) => a + b, 0) / processes.length;
    const avgTurnaroundTime =
      result.turnaroundTime.reduce((a, b) => a + b, 0) / processes.length;
    const totalTime = result.timeline[result.timeline.length - 1].end;
    const idleTime = result.timeline
      .filter((t) => t.process === "Idle")
      .reduce((sum, t) => sum + (t.end - t.start), 0);
    const cpuUtilization = ((totalTime - idleTime) / totalTime) * 100;
    const throughput = (processes.length / totalTime).toFixed(2);
    const avgWaitingTimeEl = document.getElementById("avg-waiting-time");
    const avgTurnaroundTimeEl = document.getElementById("avg-turnaround-time");
    const cpuUtilizationEl = document.getElementById("cpu-utilization");
    const throughputEl = document.getElementById("throughput");
    if (
      !avgWaitingTimeEl ||
      !avgTurnaroundTimeEl ||
      !cpuUtilizationEl ||
      !throughputEl
    ) {
      console.error("Metric elements not found");
      return;
    }
    avgWaitingTimeEl.textContent = avgWaitingTime.toFixed(2);
    avgTurnaroundTimeEl.textContent = avgTurnaroundTime.toFixed(2);
    cpuUtilizationEl.textContent = cpuUtilization.toFixed(2) + "%";
    throughputEl.textContent = throughput + " processes/unit time";
  } catch (error) {
    console.error("Error in updateMetrics:", error);
  }
}
// Update Gantt chart
function updateGanttChart(timeline) {
  try {
    const container = document.getElementById("gantt-container");
    if (!container) {
      console.error("Gantt chart container not found");
      return;
    }
    if (!timeline || !timeline.length) {
      console.error("Invalid timeline");
      return;
    }
    container.innerHTML = '<div class="gantt-chart"></div>';
    const chart = container.querySelector(".gantt-chart");
    // Add process blocks
    timeline.forEach((event, index) => {
      try {
        const block = document.createElement("div");
        block.className = `gantt-block ${
          event.process === "Idle" ? "idle" : ""
        }`;
        // Calculate width based on duration
        const duration = event.end - event.start;
        block.style.width = `${duration * 80}px`; // Increased block width
        // Add process info
        block.innerHTML = `
    <span class="block-process">${event.process}</span>
    <span class="block-time">${event.start}-${event.end}</span>
    `;
        // Add tooltip with detailed information
        block.title = `
    Process: ${event.process}
    Start Time: ${event.start}
    End Time: ${event.end}
    Duration: ${duration}
    `;
        chart.appendChild(block);
      } catch (error) {
        console.error("Error creating Gantt block:", error);
      }
    });
  } catch (error) {
    console.error("Error in updateGanttChart:", error);
  }
}
// Update timeline view
function updateTimeline(timeline) {
  try {
    const container = document.getElementById("timeline-container");
    if (!container) {
      console.error("Timeline container not found");
      return;
    }
    if (!timeline || !timeline.length) {
      console.error("Invalid timeline");
      return;
    }
    container.innerHTML = `
    <div class="timeline">
    <h3>Process Timeline</h3>
    <div class="timeline-events"></div>
    </div>
    `;
    const timelineEl = container.querySelector(".timeline-events");
    timeline.forEach((event) => {
      try {
        const duration = event.end - event.start;
        const eventEl = document.createElement("div");
        eventEl.className = `timeline-event ${
          event.process === "Idle" ? "idle" : ""
        }`;
        eventEl.innerHTML = `
    <div class="event-time">Time: ${event.start}</div>
    <div class="event-process">${event.process}</div>
    <div class="event-duration">Duration: ${duration} units</div>
    `;
        timelineEl.appendChild(eventEl);
      } catch (error) {
        console.error("Error creating timeline event:", error);
      }
    });
  } catch (error) {
    console.error("Error in updateTimeline:", error);
  }
}
// Theme Management
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme
  const currentTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", currentTheme);
  // Get theme toggle button
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    // Set initial icon
    themeToggle.innerHTML =
      currentTheme === "dark"
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    // Add click event listener
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      // Update theme
      document.body.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      // Update icon
      themeToggle.innerHTML =
        newTheme === "dark"
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';
    });
  }
  // Initialize other components
  initializeInterface();
});
// Initialize the interface
function initializeInterface() {
  // Set initial state based on selected algorithm
  updateAlgorithmOptions();
}
// Update algorithm options based on selection
function updateAlgorithmOptions() {
  const algorithm = document.getElementById("algorithm-select").value;
  const priorityOption = document.getElementById("priority-option");
  const quantumOption = document.getElementById("quantum-option");
  const priorityHeader = document.querySelector(".priority-header");
  // Reset all options
  priorityOption.classList.add("hidden");
  quantumOption.classList.add("hidden");
  priorityHeader.classList.add("hidden");
  // Show relevant options based on algorithm
  if (algorithm === "priority") {
    priorityOption.classList.remove("hidden");
    priorityHeader.classList.remove("hidden");
  } else if (algorithm === "roundrobin") {
    quantumOption.classList.remove("hidden");
  }
  // Update process table
  updateProcessesUI();
}
// Add process
function addProcess() {
  const processesContainer = document.getElementById("processes-container");
  const processId = processesContainer.children.length + 1;
  const isPriority =
    document.getElementById("algorithm-select").value === "priority";
  const processRow = document.createElement("div");
  processRow.className = "process-row";
  processRow.innerHTML = `
    <div class="process-cell">
    <span class="process-id">P${processId}</span>
    </div>
    ${
      isPriority
        ? `
    <div class="process-cell">
    <input type="number" class="priority-input" min="1" value="1"
    placeholder="Priority (1-10)"
    title="Process priority (1-10)">
    </div>
    `
        : ""
    }
    <div class="process-cell">
    <input type="number" class="arrival-time-input" min="0" value="0"
    placeholder="Arrival Time"
    title="Time at which process arrives">
    </div>
    <div class="process-cell process-cell-burst">
    <input type="number" class="burst-time-input" min="1" value="1"
    placeholder="Burst Time"
    title="Time required for process execution">
    <button class="delete-process-btn" title="Delete this process">
    <i class="fas fa-times"></i>
    </button>
    </div>
    `;
  // Add delete functionality
  const deleteBtn = processRow.querySelector(".delete-process-btn");
  deleteBtn.addEventListener("click", () => {
    processRow.remove();
    updateProcessIds();
  });
  processesContainer.appendChild(processRow);
}
// Update process IDs after add/delete
function updateProcessIds() {
  const processesContainer = document.getElementById("processes-container");
  const processRows = processesContainer.getElementsByClassName("process-row");
  for (let i = 0; i < processRows.length; i++) {
    const processIdSpan = processRows[i].querySelector(
      ".process-cell:first-child span"
    );
    processIdSpan.textContent = `P${i + 1}`;
  }
}
// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Add Process button click handler
  const addProcessBtn = document.getElementById("add-process");
  addProcessBtn.addEventListener("click", addProcess);
  // Algorithm selection change handler
  const algorithmSelect = document.getElementById("algorithm-select");
  algorithmSelect.addEventListener("change", updateAlgorithmOptions);
});
