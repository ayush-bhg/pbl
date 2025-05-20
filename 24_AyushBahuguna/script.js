// Theme Management
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
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
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";
      // Update theme
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      // Update icon with animation
      themeToggle.style.transform = "rotate(360deg)";
      setTimeout(() => {
        themeToggle.innerHTML =
          newTheme === "dark"
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
        themeToggle.style.transform = "rotate(0deg)";
      }, 300);
    });
  }
  // Initialize interface and show FCFS explanation immediately
  initializeInterface();
  updateAlgorithmExplanation("fcfs");
  // Add Process button click handler
  const addProcessBtn = document.getElementById("add-process");
  if (!addProcessBtn) {
    console.error("Add Process button not found");
    return;
  }
  addProcessBtn.addEventListener("click", addProcess);
  // Algorithm selection change handler
  const algorithmSelect = document.getElementById("algorithm-select");
  if (!algorithmSelect) {
    console.error("Algorithm select not found");
    return;
  }
  // Add change event listener for algorithm selection
  algorithmSelect.addEventListener("change", () => {
    console.log("Algorithm changed to:", algorithmSelect.value);
    updateAlgorithmOptions();
    updateAlgorithmExplanation(algorithmSelect.value);
  });
  // Calculate button click handler
  const calculateBtn = document.getElementById("calculate");
  if (!calculateBtn) {
    console.error("Calculate button not found");
    return;
  }
  calculateBtn.addEventListener("click", () => {
    console.log("Calculate button clicked");
    const result = calculateSchedule();
    console.log("Calculation result:", result);
    if (result) {
      // Show the results section
      const resultsSection = document.querySelector(".results");
      if (!resultsSection) {
        console.error("Results section not found");
        return;
      }
      resultsSection.style.display = "block";
      // Switch to Gantt chart tab
      const tabButtons = document.querySelectorAll(".tab-btn");
      const tabContents = document.querySelectorAll(".tab-content");
      if (!tabButtons.length || !tabContents.length) {
        console.error("Tab buttons or contents not found");
        return;
      }
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      const ganttTab = document.querySelector('[data-tab="gantt"]');
      const ganttContainer = document.getElementById("gantt-container");
      if (!ganttTab || !ganttContainer) {
        console.error("Gantt tab or container not found");
        return;
      }
      ganttTab.classList.add("active");
      ganttContainer.classList.add("active");
    } else {
      console.error("Calculation returned no result");
    }
  });
  // Tab switching for Gantt Chart and Timeline
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = {
    gantt: document.getElementById("gantt-container"),
    timeline: document.getElementById("timeline-container"),
  };
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      tabButtons.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");
      // Hide all tab contents
      Object.values(tabContents).forEach((tc) => tc.classList.remove("active"));
      // Show the selected tab content
      const tab = this.getAttribute("data-tab");
      if (tabContents[tab]) {
        tabContents[tab].classList.add("active");
      }
    });
  });
  // Ensure only the Gantt Chart is visible by default
  if (tabContents.gantt) tabContents.gantt.classList.add("active");
  if (tabContents.timeline) tabContents.timeline.classList.remove("active");
  // Export Results button click handler
  const exportBtn = document.getElementById("export-results");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportResults);
  }
  // Reset button click handler
  const resetBtn = document.getElementById("reset-all");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAll);
  }
  // Add event listener for preemptive toggle
  const preemptiveToggle = document.getElementById("preemptive-toggle");
  if (preemptiveToggle) {
    preemptiveToggle.addEventListener("change", function () {
      const algorithm = document.getElementById("algorithm-select").value;
      const preemptiveLabel = document.getElementById("preemptive-label");
      if (algorithm === "sjf") {
        preemptiveLabel.textContent = this.checked
          ? "Current Mode: SRTF (Preemptive)"
          : "Current Mode: SJF (Non-Preemptive)";
      } else if (algorithm === "priority") {
        preemptiveLabel.textContent = this.checked
          ? "Current Mode: Preemptive Priority"
          : "Current Mode: Non-Preemptive Priority";
      } else if (algorithm === "multilevel") {
        preemptiveLabel.textContent = this.checked
          ? "Current Mode: Preemptive Multilevel"
          : "Current Mode: Non-Preemptive Multilevel";
      }
      // Update algorithm explanation
      updateAlgorithmExplanation(algorithm);
    });
  }
  // Add event listener for mode switch button
  const modeSwitchBtn = document.getElementById("mode-switch-btn");
  if (modeSwitchBtn) {
    modeSwitchBtn.addEventListener("click", function () {
      const algorithm = document.getElementById("algorithm-select").value;
      const modeSwitchLabel = document.getElementById("mode-switch-label");
      const isPreemptive =
        modeSwitchLabel.textContent.includes("Non-Preemptive");
      if (algorithm === "sjf") {
        modeSwitchLabel.textContent = isPreemptive
          ? "Switch to SJF (Non-Preemptive)"
          : "Switch to SRTF (Preemptive)";
      } else if (algorithm === "priority") {
        modeSwitchLabel.textContent = isPreemptive
          ? "Switch to Non-Preemptive Priority"
          : "Switch to Preemptive Priority";
      } else if (algorithm === "multilevel") {
        modeSwitchLabel.textContent = isPreemptive
          ? "Switch to Non-Preemptive Multilevel"
          : "Switch to Preemptive Multilevel";
      }
      // Update algorithm explanation
      updateAlgorithmExplanation(algorithm);
    });
  }
});
// Initialize the interface
function initializeInterface() {
  // Set initial state based on selected algorithm
  const algorithmSelect = document.getElementById("algorithm-select");
  if (algorithmSelect) {
    updateAlgorithmOptions();
  }
}
// Update algorithm options based on selection
function updateAlgorithmOptions() {
  const algorithm = document.getElementById("algorithm-select").value;
  const priorityOption = document.getElementById("priority-option");
  const quantumOption = document.getElementById("quantum-option");
  const priorityHeader = document.querySelector(".priority-header");
  const modeSwitchOption = document.getElementById("mode-switch-option");
  const modeSwitchBtn = document.getElementById("mode-switch-btn");
  const modeSwitchLabel = document.getElementById("mode-switch-label");
  if (
    !priorityOption ||
    !quantumOption ||
    !priorityHeader ||
    !modeSwitchOption ||
    !modeSwitchBtn ||
    !modeSwitchLabel
  ) {
    console.error("Algorithm options elements not found");
    return;
  }
  // Reset all options
  priorityOption.classList.add("hidden");
  quantumOption.classList.add("hidden");
  priorityHeader.classList.add("hidden");
  modeSwitchOption.classList.add("hidden");
  // Show relevant options based on algorithm
  switch (algorithm) {
    case "priority":
      priorityOption.classList.remove("hidden");
      priorityHeader.classList.remove("hidden");
      modeSwitchOption.classList.remove("hidden");
      modeSwitchLabel.textContent = "Switch to Preemptive Mode";
      break;
    case "roundrobin":
      quantumOption.classList.remove("hidden");
      // Round Robin is always preemptive, no mode switch needed
      break;
    case "sjf":
      modeSwitchOption.classList.remove("hidden");
      modeSwitchLabel.textContent = "Switch to SRTF (Preemptive)";
      break;
    case "fcfs":
      // FCFS is always non-preemptive, no mode switch needed
      break;
    case "srtf":
      // SRTF is always preemptive, no mode switch needed
      break;
    case "multilevel":
      modeSwitchOption.classList.remove("hidden");
      modeSwitchLabel.textContent = "Switch to Preemptive Mode";
      break;
  }
  // Update process table
  updateProcessesUI();
  // Update algorithm explanation
  updateAlgorithmExplanation(algorithm);
}
// Update algorithm explanation
function updateAlgorithmExplanation(algorithm) {
  const explanationContent = document.getElementById("explanation-content");
  if (!explanationContent) return;
  const explanations = {
    fcfs: {
      title: "First Come First Serve (FCFS)",
      description:
        "A strictly non-preemptive scheduling algorithm where processes are executed in the order they arrive.",
      working: [
        "Processes are executed in the order of their arrival time",
        "Once a process starts executing, it runs to completion",
        "No preemption is allowed",
        "Simple to implement and understand",
      ],
      advantages: [
        "Simple and easy to implement",
        "Fair to all processes",
        "No starvation",
        "Predictable execution time",
      ],
      disadvantages: [
        "Poor performance for short processes",
        "Average waiting time can be high",
        "Not suitable for time-sharing systems",
        "No priority consideration",
      ],
      example:
        "If processes arrive in order P1(4ms), P2(2ms), P3(6ms), they will execute in the same order regardless of burst time.",
    },
    sjf: {
      title: "Shortest Job First (SJF)",
      description:
        "A scheduling algorithm that selects the process with the smallest burst time for execution. Can be implemented in both preemptive (SRTF) and non-preemptive modes.",
      working: [
        "Processes are sorted by their burst time",
        "The process with shortest burst time is executed first",
        "Can be preemptive (SRTF) or non-preemptive (SJF)",
        "Requires knowledge of burst times",
      ],
      advantages: [
        "Minimizes average waiting time",
        "Optimal for minimizing waiting time",
        "Good for batch processing",
        "Efficient for short processes",
      ],
      disadvantages: [
        "Can cause starvation for long processes",
        "Requires knowledge of burst times",
        "Not suitable for interactive systems",
        "Can be complex to implement",
      ],
      example:
        "If processes have burst times P1(6ms), P2(2ms), P3(4ms), they will execute in order P2, P3, P1.",
    },
    srtf: {
      title: "Shortest Remaining Time First (SRTF)",
      description:
        "A strictly preemptive version of SJF where the process with the shortest remaining time is executed.",
      working: [
        "Processes are executed based on remaining burst time",
        "Can preempt currently running process",
        "New process can interrupt if it has shorter burst time",
        "Requires tracking of remaining time",
      ],
      advantages: [
        "Minimizes average waiting time",
        "Better than SJF for interactive systems",
        "Optimal for minimizing waiting time",
        "Good for time-sharing systems",
      ],
      disadvantages: [
        "Can cause starvation",
        "High overhead due to preemption",
        "Complex to implement",
        "Requires tracking of remaining time",
      ],
      example:
        "If P1(6ms) is running and P2(2ms) arrives, P1 will be preempted to run P2 first.",
    },
    priority: {
      title: "Priority Scheduling",
      description:
        "A scheduling algorithm where each process is assigned a priority and executed based on priority. Can be implemented in both preemptive and non-preemptive modes.",
      working: [
        "Processes are executed based on their priority",
        "Higher priority processes execute first",
        "Can be preemptive or non-preemptive",
        "Priority can be based on various factors",
      ],
      advantages: [
        "Flexible priority system",
        "Good for real-time systems",
        "Can handle urgent processes",
        "Suitable for systems with varying importance",
      ],
      disadvantages: [
        "Can cause starvation",
        "Priority inversion problem",
        "Complex to implement",
        "Requires priority assignment mechanism",
      ],
      example:
        "If P1(priority=3), P2(priority=1), P3(priority=2), they will execute in order P2, P3, P1.",
    },
    roundrobin: {
      title: "Round Robin (RR)",
      description:
        "A strictly preemptive scheduling algorithm where each process gets a small unit of CPU time (time quantum).",
      working: [
        "Each process gets a time quantum",
        "Processes are executed in circular order",
        "If process doesn't complete, it goes to end of queue",
        "Time quantum is crucial for performance",
      ],
      advantages: [
        "Fair to all processes",
        "No starvation",
        "Good for time-sharing systems",
        "Suitable for interactive systems",
      ],
      disadvantages: [
        "Performance depends on time quantum",
        "High overhead due to context switching",
        "Not optimal for batch processing",
        "Can have high waiting time",
      ],
      example:
        "With time quantum=2ms, processes P1(4ms), P2(3ms), P3(2ms) will execute in order: P1(2ms), P2(2ms), P3(2ms), P1(2ms), P2(1ms).",
    },
    multilevel: {
      title: "Multilevel Queue Scheduling",
      description:
        "A scheduling algorithm that uses multiple queues with different priorities and scheduling algorithms. Can be implemented in both preemptive and non-preemptive modes.",
      working: [
        "Processes are assigned to different queues",
        "Each queue has its own scheduling algorithm",
        "Higher priority queues are served first",
        "Can use different scheduling policies per queue",
        "Can be preemptive or non-preemptive based on queue policies",
      ],
      advantages: [
        "Flexible and adaptable",
        "Can handle different types of processes",
        "Good for systems with varying requirements",
        "Can optimize for different process types",
        "Supports both preemptive and non-preemptive modes",
      ],
      disadvantages: [
        "Complex to implement",
        "Can cause starvation",
        "Requires queue management",
        "Need to handle queue switching",
        "Configuration can be complex",
      ],
      example:
        "System processes in high priority queue (FCFS), interactive processes in medium queue (RR), batch processes in low queue (SJF). Each queue can be configured as preemptive or non-preemptive.",
    },
  };
  const algo = explanations[algorithm];
  if (!algo) return;
  explanationContent.innerHTML = `
    <div class="explanation-header">
    <h3>${algo.title}</h3>
    <p class="description">${algo.description}</p>
    </div>
    <div class="explanation-details">
    <div class="working">
    <h4><i class="fas fa-cogs"></i> How it Works</h4>
    <ol>
    ${algo.working.map((step) => `<li>${step}</li>`).join("")}
    </ol>
    </div>
    <div class="advantages">
    <h4><i class="fas fa-plus-circle"></i> Advantages</h4>
    <ul>
    ${algo.advantages.map((adv) => `<li>${adv}</li>`).join("")}
    </ul>
    </div>
    <div class="disadvantages">
    <h4><i class="fas fa-minus-circle"></i> Disadvantages</h4>
    <ul>
    ${algo.disadvantages.map((dis) => `<li>${dis}</li>`).join("")}
    </ul>
    </div>
    <div class="example">
    <h4><i class="fas fa-lightbulb"></i> Example</h4>
    <p>${algo.example}</p>
    </div>
    </div>
    `;
}
// Add process
function addProcess() {
  const processesContainer = document.getElementById("processes-container");
  if (!processesContainer) {
    console.error("Processes container not found");
    return;
  }
  const processId = processesContainer.children.length + 1;
  const isPriority =
    document.getElementById("algorithm-select").value === "priority";
  const processRow = document.createElement("div");
  processRow.className = "process-row";
  processRow.style.display = "flex";
  processRow.style.visibility = "visible";
  processRow.style.opacity = "1";
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
    title="Process priority (1-10)"
    style="display: block; visibility: visible; opacity: 1;">
    </div>
    `
        : ""
    }
    <div class="process-cell">
    <input type="number" class="arrival-time-input" min="0" value="0"
    placeholder="Arrival Time"
    title="Time at which process arrives"
    style="display: block; visibility: visible; opacity: 1;">
    </div>
    <div class="process-cell process-cell-burst">
    <input type="number" class="burst-time-input" min="0" value="0"
    placeholder="Burst Time"
    title="Time required for process execution"
    style="display: block; visibility: visible; opacity: 1;">
    <button class="delete-process-btn" title="Delete this process">
    <i class="fas fa-times"></i>
    </button>
    </div>
    `;
  // Add delete functionality
  const deleteBtn = processRow.querySelector(".delete-process-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      processRow.remove();
      updateProcessIds();
    });
  }
  processesContainer.appendChild(processRow);
  // Ensure the new row is visible
  processRow.style.display = "flex";
  processRow.style.visibility = "visible";
  processRow.style.opacity = "1";
  // Focus on the first input field
  const firstInput = processRow.querySelector("input");
  if (firstInput) {
    firstInput.focus();
  }
}
// Update process IDs after add/delete
function updateProcessIds() {
  const processesContainer = document.getElementById("processes-container");
  if (!processesContainer) {
    console.error("Processes container not found");
    return;
  }
  const processRows = processesContainer.getElementsByClassName("process-row");
  for (let i = 0; i < processRows.length; i++) {
    const processIdSpan = processRows[i].querySelector(
      ".process-cell:first-child span"
    );
    if (processIdSpan) {
      processIdSpan.textContent = `P${i + 1}`;
    }
  }
}
// Update process table UI based on selected algorithm
function updateProcessesUI() {
  const algorithm = document.getElementById("algorithm-select").value;
  const processRows = document.querySelectorAll(".process-row");
  const isPriority = algorithm === "priority";
  processRows.forEach((row) => {
    // Get existing priority cell if it exists
    let priorityCell = row.querySelector(".process-cell:nth-child(2)");
    const hasPriorityCell =
      priorityCell && priorityCell.querySelector(".priority-input");
    if (isPriority && !hasPriorityCell) {
      // Add priority cell
      priorityCell = document.createElement("div");
      priorityCell.className = "process-cell";
      priorityCell.innerHTML = `
    <input type="number" class="priority-input" min="1" value="1"
    placeholder="Priority (1-10)"
    title="Process priority (1-10)">
    `;
      row.insertBefore(priorityCell, row.children[1]);
    } else if (!isPriority && hasPriorityCell) {
      // Remove priority cell
      priorityCell.remove();
    }
  });
}
// Export results function
function exportResults() {
  try {
    // Get all the metrics
    const avgWaitingTime =
      document.getElementById("avg-waiting-time").textContent;
    const avgTurnaroundTime = document.getElementById(
      "avg-turnaround-time"
    ).textContent;
    const cpuUtilization =
      document.getElementById("cpu-utilization").textContent;
    const throughput = document.getElementById("throughput").textContent;
    // Get the algorithm used
    const algorithm = document.getElementById("algorithm-select").value;
    const algorithmName =
      document.getElementById("algorithmselect").options[
        document.getElementById("algorithm-select").selectedIndex
      ].text;
    // Get process details
    const processes = getProcesses();
    // Create the content for export
    let content = `Scheduling Algorithm Results\n`;
    content += `========================\n\n`;
    content += `Algorithm: ${algorithmName}\n\n`;
    content += `Process Details:\n`;
    content += `---------------\n`;
    processes.forEach((process) => {
      content += `Process P${process.id}:\n`;
      content += ` Arrival Time: ${process.arrivalTime}\n`;
      content += ` Burst Time: ${process.burstTime}\n`;
      if (process.priority) {
        content += ` Priority: ${process.priority}\n`;
      }
      content += "\n";
    });
    content += `Performance Metrics:\n`;
    content += `------------------\n`;
    content += `Average Waiting Time: ${avgWaitingTime}\n`;
    content += `Average Turnaround Time: ${avgTurnaroundTime}\n`;
    content += `CPU Utilization: ${cpuUtilization}\n`;
    content += `Throughput: ${throughput}\n`;
    // Get Gantt Chart data
    const ganttBlocks = document.querySelectorAll(".gantt-block");
    if (ganttBlocks.length > 0) {
      content += `\nGantt Chart:\n`;
      content += `------------\n`;
      ganttBlocks.forEach((block) => {
        const process = block.querySelector(".block-process").textContent;
        const time = block.querySelector(".block-time").textContent;
        content += `${process}: ${time}\n`;
      });
    }
    // Get Timeline data
    const timelineEvents = document.querySelectorAll(".timeline-event");
    if (timelineEvents.length > 0) {
      content += `\nTimeline:\n`;
      content += `---------\n`;
      timelineEvents.forEach((event) => {
        const time = event.querySelector(".event-time").textContent;
        const process = event.querySelector(".event-process").textContent;
        const duration = event.querySelector(".event-duration").textContent;
        content += `${time} - ${process} - ${duration}\n`;
      });
    }
    // Create a blob and download the file
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scheduling_results_${algorithm}_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error exporting results:", error);
    alert("Error exporting results. Please try again.");
  }
}
// Reset all data function
function resetAll() {
  // Store current algorithm
  const currentAlgorithm = document.getElementById("algorithm-select").value;
  // Clear all process inputs
  const processesContainer = document.getElementById("processes-container");
  if (processesContainer) {
    processesContainer.innerHTML = "";
  }
  // Reset metrics
  document.getElementById("avg-waiting-time").textContent = "-";
  document.getElementById("avg-turnaround-time").textContent = "-";
  document.getElementById("cpu-utilization").textContent = "-";
  document.getElementById("throughput").textContent = "-";
  // Clear Gantt chart
  const ganttContainer = document.getElementById("gantt-container");
  if (ganttContainer) {
    ganttContainer.innerHTML = "";
  }
  // Clear Timeline
  const timelineContainer = document.getElementById("timeline-container");
  if (timelineContainer) {
    timelineContainer.innerHTML = "";
  }
  // Reset algorithm options
  const priorityOption = document.getElementById("priority-option");
  const quantumOption = document.getElementById("quantum-option");
  const priorityHeader = document.querySelector(".priority-header");
  const modeSwitchOption = document.getElementById("mode-switch-option");
  if (priorityOption) priorityOption.classList.add("hidden");
  if (quantumOption) quantumOption.classList.add("hidden");
  if (priorityHeader) priorityHeader.classList.add("hidden");
  if (modeSwitchOption) modeSwitchOption.classList.add("hidden");
  // Reset time quantum input if it exists
  const timeQuantum = document.getElementById("time-quantum");
  if (timeQuantum) {
    timeQuantum.value = "2";
  }
  // Reset priority toggle if it exists
  const priorityToggle = document.getElementById("priority-toggle");
  if (priorityToggle) {
    priorityToggle.checked = false;
  }
  // Update algorithm explanation to maintain current algorithm info
  updateAlgorithmExplanation(currentAlgorithm);
  // Show success message
  const message = document.createElement("div");
  message.className = "reset-message";
  message.innerHTML =
    '<i class="fas fa-check-circle"></i> All data has been reset';
  document.body.appendChild(message);
  // Remove message after 3 seconds
  setTimeout(() => {
    message.remove();
  }, 3000);
}
