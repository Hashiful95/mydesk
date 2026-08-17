const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let state = JSON.parse(localStorage.getItem("mydesk") || '{"tasks":[],"expenses":[],"attendance":[],"study":[],"theme":"dark"}');

function save() { localStorage.setItem("mydesk", JSON.stringify(state)); }
function money(n) { return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }
function setActive(page) { $$("nav button").forEach(b => b.classList.toggle("active", b.dataset.page === page)) }
function layout(title, sub, body, eyebrow = "WORKSPACE") { return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div></div>${body}` }
function stat(label, value, desc) { return `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div><div class="desc">${desc}</div></div>` }

function dashboard() {
    const completed = state.tasks.filter(x => x.done).length, total = state.tasks.length;
    const hours = (state.study.reduce((a, x) => a + (x.seconds || 0), 0) / 3600).toFixed(1);
    const spent = state.expenses.reduce((a, x) => a + Number(x.amount || 0), 0);
    const pct = total ? Math.round(completed / total * 100) : 0;
    return layout("Welcome back! 👋", "Everything you need to stay organized and productive.", "<div class='cards'>" +
        stat("✓ TASKS", `${completed}/${total}`, "completed tasks") +
        stat("▣ STUDY TIME", `${hours}h`, "total focused time") +
        stat("₹ EXPENSES", money(spent), "total recorded spending") +
        "</div><div class='panel'><div class='panel-head'><div><div class='eyebrow'>SHORTCUTS</div><h2>Quick Actions</h2></div></div><div class='quick'>" +
        `<button onclick="go('tasks')"><span class='qicon'>＋</span><span><b>Add Task</b><br><small>Create a new task</small></span></button>` +
        `<button onclick="go('expenses')"><span class='qicon'>₹</span><span><b>Add Expense</b><br><small>Record spending</small></span></button>` +
        `<button onclick="go('study')"><span class='qicon'>▶</span><span><b>Start Study</b><br><small>Focus on your work</small></span></button>` +
        "</div></div><div class='panel'><div class='eyebrow'>FOCUS</div><div class='goal'><div class='ring' style='background:conic-gradient(#5d58ff 0 " + pct + "%,#172b49 " + pct + "% 100%)'><b>" + pct + "%</b></div><div><h2>Today's goal</h2><h3>Build your momentum</h3><p style='color:var(--muted)'>Complete a task or start a study session to begin tracking your day.</p></div><div></div></div></div>");
}

function tasks() {
    return layout("Tasks", "Manage your tasks and stay organized.", `<div class="cards">${stat("▣ TOTAL TASKS", state.tasks.length, "all tasks")}${stat("✓ COMPLETED", state.tasks.filter(x => x.done).length, "finished tasks")}${stat("◌ COMPLETION RATE", state.tasks.length ? Math.round(state.tasks.filter(x => x.done).length / state.tasks.length * 100) : 0 + "%", "overall progress")}</div>
 <div class="panel"><div class="panel-head"><div><h2>＋ Add New Task</h2><p>Create a task and keep your workflow moving.</p></div></div>
 <div class="grid2"><div class="field"><label>Task name</label><input id="taskName" placeholder="e.g. Complete assignment"></div><div class="field"><label>Subject</label><input id="taskSubject" placeholder="e.g. Data Structures"></div><div class="field"><label>Priority</label><select id="taskPriority"><option>Low</option><option selected>Medium</option><option>High</option></select></div><div class="field"><label>Task type</label><select id="taskType"><option>Personal study task</option><option>Assignment</option><option>Exam preparation</option><option>Project</option></select></div></div>
 <div class="form-actions"><button class="secondary" onclick="clearTask()">Clear Form</button><button class="primary" onclick="addTask()">＋ Add Task</button></div></div>
 <div class="toolbar"><div class="searchbar"><span>⌕</span><input id="taskSearch" oninput="renderTasksList()" placeholder="Search tasks..."></div><select id="taskFilter" onchange="renderTasksList()"><option>All Status</option><option>Pending</option><option>Completed</option></select><select><option>All Priority</option></select><select><option>Newest</option><option>Oldest</option></select></div>
 <div class="panel" id="taskList"></div>`);
}
function renderTasksList() { let q = ($("#taskSearch")?.value || "").toLowerCase(), f = $("#taskFilter")?.value || "All Status"; let arr = state.tasks.filter(x => (x.name + " " + x.subject).toLowerCase().includes(q)).filter(x => f === "All Status" || (f === "Completed" ? x.done : !x.done)); let box = $("#taskList"); if (!box) return; box.innerHTML = arr.length ? `<table class="table"><thead><tr><th>Task</th><th>Subject</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>${arr.map(x => `<tr><td><b>${x.name}</b></td><td>${x.subject || "—"}</td><td>${x.priority}</td><td><span class="badge ${x.done ? "green" : "yellow"}">${x.done ? "Completed" : "Pending"}</span></td><td><button class="secondary" onclick="toggleTask('${x.id}')">${x.done ? "Undo" : "Done"}</button></td></tr>`).join("")}</tbody></table>` : `<div class="empty"><div class="empty-icon">▣</div><h3>No tasks yet</h3><p>Create your first task to start organizing your day.</p><button class="primary" onclick="$('#taskName').focus()">＋ Add Your First Task</button></div>` }
function addTask() { let name = $("#taskName").value.trim(); if (!name) return alert("Enter a task name."); state.tasks.unshift({ id: Date.now().toString(), name, subject: $("#taskSubject").value.trim(), priority: $("#taskPriority").value, type: $("#taskType").value, done: false }); save(); render(); renderTasksList() }
function clearTask() { ["taskName", "taskSubject"].forEach(id => $("#" + id).value = "") }
function toggleTask(id) { let x = state.tasks.find(x => x.id === id); if (x) x.done = !x.done; save(); render(); renderTasksList() }

function expenses() {
    return layout("Expenses", "Track your spending and keep your budget under control.", "<div class='cards'>" + stat("▣ TOTAL SPENT", money(state.expenses.reduce((a, x) => a + Number(x.amount), 0)), "all time expenses") + stat("▣ THIS MONTH", money(state.expenses.reduce((a, x) => a + Number(x.amount), 0)), "current month") + stat("▥ TRANSACTIONS", state.expenses.length, "total transactions") + "</div>" +
        `<div class="panel"><div class="panel-head"><div><h2>＋ Add Expense</h2><p>Record a purchase so your dashboard stays accurate.</p></div></div><div class="grid2"><div class="field"><label>Expense name</label><input id="expName" placeholder="e.g. Books"></div><div class="field"><label>Category</label><select id="expCat"><option>Education</option><option>Food</option><option>Transport</option><option>Hostel</option><option>Other</option></select></div><div class="field"><label>Amount</label><input id="expAmount" type="number" min="0" placeholder="₹ 0.00"></div><div class="field"><label>Payment method</label><select id="expPay"><option>Cash</option><option>UPI</option><option>Card</option><option>Bank transfer</option></select></div></div><div class="form-actions"><button class="primary" onclick="addExpense()">＋ Add Expense</button></div></div>
 <div class="toolbar"><div class="searchbar"><span>⌕</span><input id="expSearch" oninput="renderExpenseList()" placeholder="Search expenses..."></div><select><option>All Categories</option></select><select><option>All Payment Methods</option></select><select><option>Newest First</option></select></div><div class="panel" id="expenseList"></div>`);
}
function renderExpenseList() { let box = $("#expenseList"); if (!box) return; let q = ($("#expSearch")?.value || "").toLowerCase(), arr = state.expenses.filter(x => x.name.toLowerCase().includes(q)); box.innerHTML = arr.length ? `<table class="table"><thead><tr><th>Expense</th><th>Category</th><th>Payment</th><th>Amount</th></tr></thead><tbody>${arr.map(x => `<tr><td>${x.name}</td><td>${x.category}</td><td>${x.pay}</td><td><b>${money(x.amount)}</b></td></tr>`).join("")}</tbody></table>` : `<div class="empty"><div class="empty-icon">▣</div><h3>No expenses recorded yet.</h3><p>Add your first expense to get started!</p><button class="primary" onclick="$('#expName').focus()">＋ Add Your First Expense</button></div>` }
function addExpense() { let name = $("#expName").value.trim(), amount = Number($("#expAmount").value); if (!name || !amount) return alert("Enter an expense name and amount."); state.expenses.unshift({ name, amount, category: $("#expCat").value, pay: $("#expPay").value, date: new Date().toISOString() }); save(); render(); renderExpenseList() }

function attendance() {
    let p = state.attendance.filter(x => x.status === "Present").length, a = state.attendance.filter(x => x.status === "Absent").length, total = p + a, pct = total ? Math.round(p / total * 100) : 0;
    return layout("Attendance", "Record your classes and keep track of your attendance.", "<div class='cards'>" + stat("✓ ATTENDANCE", pct + "%", "overall attendance") + stat("✓ PRESENT", p, "classes attended") + stat("× ABSENT", a, "classes missed") + "</div>" +
        `<div class="panel"><div class="panel-head"><div><h2>▣ Record Class</h2><p>Add the subject, date and class timing.</p></div></div><div class="grid2"><div class="field"><label>Subject</label><input id="attSubject" placeholder="e.g. Data Structures"></div><div class="field"><label>Class Date</label><input id="attDate" type="date"></div><div class="field"><label>Start Time</label><input id="attStart" type="time"></div><div class="field"><label>End Time</label><input id="attEnd" type="time"></div><div class="field"><label>Status</label><select id="attStatus"><option>Present</option><option>Absent</option></select></div><div class="field"><label>Notes (optional)</label><input id="attNotes" placeholder="Add any notes..."></div></div><div class="form-actions"><button class="primary" onclick="addAttendance()">＋ Add Class</button></div></div>
 <div class="panel" id="attendanceList"></div>`);
}
function renderAttendanceList() { let box = $("#attendanceList"); if (!box) return; box.innerHTML = state.attendance.length ? `<table class="table"><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>${state.attendance.map(x => `<tr><td>${x.subject}</td><td>${x.date}</td><td>${x.start} – ${x.end}</td><td><span class="badge ${x.status === "Present" ? "green" : "red"}">${x.status}</span></td></tr>`).join("")}</tbody></table>` : `<div class="empty"><div class="empty-icon">▣</div><h3>No classes recorded yet</h3><p>Add your first class to start tracking your attendance.</p><button class="primary" onclick="$('#attSubject').focus()">＋ Add Your First Class</button></div>` }
function addAttendance() { let subject = $("#attSubject").value.trim(); if (!subject) return alert("Enter a subject."); state.attendance.unshift({ subject, date: $("#attDate").value || new Date().toISOString().slice(0, 10), start: $("#attStart").value || "--:--", end: $("#attEnd").value || "--:--", status: $("#attStatus").value, notes: $("#attNotes").value }); save(); render(); renderAttendanceList() }

let timer = null, seconds = 0, running = false, mode = "stopwatch";
function study() {
    const history = state.study.length
        ? `
            <table class="table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Duration</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.study.map(x => `
                        <tr>
                            <td>${x.subject || "Study session"}</td>
                            <td>${fmt(x.seconds)}</td>
                            <td>${new Date(x.date).toLocaleDateString("en-IN")}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `
        : `
            <div class="empty-icon">◷</div>
            <h3>Start your first study session and track your progress!</h3>
            <p>Track your focused study time and build a consistent routine.</p>
            <button class="primary" onclick="document.querySelector('#studySubject').focus()">
                ＋ Start Your First Session
            </button>
        `;

    return layout(
        "Study",
        "Track focused study sessions and build a consistent routine.",
        `
        <div class="panel study-box">

            <div class="timer-main">

                <div class="eyebrow">FOCUS MODE</div>

                <h2>Focus Timer</h2>

                <div class="timer-status">
                    <span class="status-dot"></span>
                    Ready
                </div>

                <div class="mode-switch">
                    <button
                        class="active"
                        onclick="setMode('stopwatch')">
                        ⏱ Stopwatch
                    </button>

                    <button
                        onclick="setMode('countdown')">
                        ⌛ Countdown
                    </button>
                </div>

                <div id="timer" class="timer">
                    00:00:00
                </div>

                <div class="study-input">
                    <input
                        id="studySubject"
                        placeholder="✎ What are you studying?"
                    >
                </div>

                <div class="timer-actions">

                    <button
                        class="secondary"
                        onclick="startTimer()">
                        ▶ Start
                    </button>

                    <button
                        class="secondary"
                        onclick="pauseTimer()">
                        ⏸ Pause
                    </button>

                    <button
                        class="secondary"
                        onclick="resetTimer()">
                        ↻ Reset
                    </button>

                    <button
                        class="danger"
                        onclick="finishTimer()">
                        ■ Finish
                    </button>

                </div>

            </div>

            <div class="illustration">
                💡
                <br>
                📚
            </div>

        </div>

        <div class="panel">

            <div class="panel-head">

                <div>
                    <div class="eyebrow">HISTORY</div>
                    <h2>Study History</h2>
                </div>

                <div class="searchbar">
                    <span>⌕</span>
                    <input placeholder="Search sessions...">
                </div>

            </div>

            <div class="empty">
                ${history}
            </div>

        </div>
        `
    );
}
function fmt(s) { s = Math.max(0, s || 0); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(x => String(x).padStart(2, "0")).join(":") }
function updateTimer() { let el = $("#timer"); if (el) el.textContent = fmt(seconds) }
function startTimer() { if (running) return; running = true; timer = setInterval(() => { seconds++; updateTimer() }, 1000) }
function pauseTimer() { running = false; clearInterval(timer) }
function resetTimer() { pauseTimer(); seconds = 0; updateTimer() }
function finishTimer() { pauseTimer(); if (seconds) { state.study.unshift({ subject: $("#studySubject").value.trim(), seconds, date: new Date().toISOString() }); save() } seconds = 0; render() }
function setMode(m) { mode = m; document.querySelectorAll(".mode-switch button").forEach((b, i) => b.classList.toggle("active", (m === "stopwatch" && i === 0) || (m === "countdown" && i === 1))) }

function go(page) { location.hash = page }
function render() {
    let page = location.hash.replace("#", "") || "dashboard"; if (!["dashboard", "tasks", "expenses", "attendance", "study"].includes(page)) page = "dashboard";
    if (page !== "study") { pauseTimer() } setActive(page);
    $("#main").innerHTML = page === "dashboard" ? dashboard() : page === "tasks" ? tasks() : page === "expenses" ? expenses() : page === "attendance" ? attendance() : study();
    if (page === "tasks") renderTasksList(); if (page === "expenses") renderExpenseList(); if (page === "attendance") renderAttendanceList(); updateTimer();
}
$("#themeBtn").onclick = () => { state.theme = state.theme === "dark" ? "light" : "dark"; document.body.classList.toggle("light", state.theme === "light"); $("#themeBtn").textContent = state.theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"; save() }
$("#logoutBtn").onclick = () => alert("Demo logout — connect this button to your authentication flow.")
document.body.classList.toggle("light", state.theme === "light"); $("#themeBtn").textContent = state.theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
window.addEventListener("hashchange", render); render();
