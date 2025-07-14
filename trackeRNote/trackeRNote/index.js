const topics = [
  "Professional Adjustment",
  "Nursing Leadership and Management",
  "Nursing Research",
  "Fundamentals of Nursing",
  "Community Health Nursing",
  "Communicable Disease Nursing",
  "Obsteric Nursing",
  "Pediatric Nursing",
  "Medical-Surgical Nursing",
  "Psychiatric Nursing",
  "Emergency Room and Disaster Nursing",
  "Pharmacology",
  "Nutrition"
];

let data = JSON.parse(localStorage.getItem("reviewData")) || {};
let schedule = JSON.parse(localStorage.getItem("reviewSchedule")) || {};
let timerInterval;
let totalSeconds = Number(localStorage.getItem("reviewTime")) || 0;

const tracker = document.getElementById("tracker");
const calendar = document.getElementById("calendar");

function render() {
  tracker.innerHTML = "";
  topics.forEach(topic => {
    if (!data[topic]) data[topic] = [];

    const doneCount = data[topic].filter(s => s.done).length;
    const total = data[topic].length;
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

    const section = document.createElement("div");
    section.classList.add("topic");
    section.setAttribute("draggable", "true");
    section.setAttribute("ondragstart", `dragTopic(event, '${topic}')`);

    section.innerHTML = `
      <h2>${topic} <span>${percent}%</span></h2>
      <div class="progress"><div class="progress-bar" style="width: ${percent}%"></div></div>
      <div class="subtopics">
        ${data[topic].map((sub, i) => `
          <div>
            <input type="checkbox" ${sub.done ? "checked" : ""} onchange="toggleSubtopic('${topic}', ${i})">${sub.name}
            <button class="delete" onclick="removeSubtopic('${topic}', ${i})">x</button>
          </div>
        `).join("")}
      </div>
      <div class="add-subtopic">
        <input type="text" placeholder="Add subtopic..." id="input-${topic}">
        <button onclick="addSubtopic('${topic}')">Add</button>
      </div>
    `;
    tracker.appendChild(section);
  });
  localStorage.setItem("reviewData", JSON.stringify(data));
}

function addSubtopic(topic) {
  const input = document.getElementById("input-" + topic);
  const name = input.value.trim();
  if (name) {
    data[topic].push({ name, done: false });
    input.value = "";
    render();
  }
}

function removeSubtopic(topic, index) {
  data[topic].splice(index, 1);
  render();
}

function toggleSubtopic(topic, index) {
  data[topic][index].done = !data[topic][index].done;
  render();
}

// Timer Functions
function updateTimerDisplay() {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSeconds % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `Review Time: ${hrs}:${mins}:${secs}`;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    totalSeconds++;
    localStorage.setItem("reviewTime", totalSeconds);
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopTimer();
  totalSeconds = 0;
  localStorage.setItem("reviewTime", totalSeconds);
  updateTimerDisplay();
}

// Calendar Functions
function renderCalendar() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  calendar.innerHTML = "";
  days.forEach(day => {
    const cell = document.createElement("div");
    cell.classList.add("day");
    cell.innerHTML = `<h4>${day}</h4><div class="droppable" ondragover="allowDrop(event)" ondrop="dropTopic(event, '${day}')">
      ${(schedule[day] || []).map((topic, i) => `
        <div class='draggable'>
          ${topic}
          <button class='delete' onclick='removeFromSchedule("${day}", ${i})'>x</button>
        </div>
      `).join('')}
    </div>`;
    calendar.appendChild(cell);
  });
  localStorage.setItem("reviewSchedule", JSON.stringify(schedule));
}

function allowDrop(ev) {
  ev.preventDefault();
}

function dragTopic(ev, topic) {
  ev.dataTransfer.setData("text/topic", topic);
}

function dropTopic(ev, day) {
  ev.preventDefault();
  const topic = ev.dataTransfer.getData("text/topic");
  if (!schedule[day]) schedule[day] = [];
  if (!schedule[day].includes(topic)) {
    schedule[day].push(topic);
    renderCalendar();
  }
}

function removeFromSchedule(day, index) {
  schedule[day].splice(index, 1);
  renderCalendar();
}

// Initialize
render();
renderCalendar();
updateTimerDisplay();
