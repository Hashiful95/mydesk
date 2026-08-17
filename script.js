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

/* =========================================================
   STUDY TIMER
========================================================= */

let timer = null;
let seconds = 0;
let running = false;
let mode = "stopwatch";

let countdownTotal = 25 * 60;
let countdownRemaining = 25 * 60;
let elapsedSeconds = 0;


/* =========================================================
   STUDY PAGE
========================================================= */

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

            <h3>
                Start your first study session and track your progress!
            </h3>

            <p>
                Track your focused study time and build a consistent routine.
            </p>

            <button
                class="primary"
                onclick="document.querySelector('#studySubject').focus()">
                ＋ Start Your First Session
            </button>
        `;

    return layout(
        "Study",
        "Track focused study sessions and build a consistent routine.",
        `

        <div class="panel study-box">

            <!-- TIMER AREA -->
            <div class="timer-main">

                <div class="eyebrow">
                    FOCUS MODE
                </div>

                <h2>
                    Focus Timer
                </h2>

                <div class="timer-status" id="timerStatus">
                    <span class="status-dot"></span>
                    ${running ? "Focusing..." : (elapsedSeconds > 0 ? "Paused" : "Ready")}
                </div>


                <!-- STOPWATCH / COUNTDOWN -->
                <div class="mode-switch">

                    <button
                        class="${mode === "stopwatch" ? "active" : ""}"
                        onclick="setMode('stopwatch')">
                        ⏱ Stopwatch
                    </button>

                    <button
                        class="${mode === "countdown" ? "active" : ""}"
                        onclick="setMode('countdown')">
                        ⌛ Countdown
                    </button>

                </div>


                <!-- CUSTOM COUNTDOWN -->
                <div
                    id="countdownSettings"
                    class="countdown-settings"
                    style="${mode === "countdown" ? "" : "display:none;"}">

                    <label>
                        Set countdown duration
                    </label>

                    <div class="countdown-input-row">

                        <input
                            id="customHours"
                            type="number"
                            min="0"
                            max="24"
                            value="${Math.floor(countdownTotal / 3600)}"
                            placeholder="Hours">

                        <span>:</span>

                        <input
                            id="customMinutes"
                            type="number"
                            min="0"
                            max="59"
                            value="${Math.floor((countdownTotal % 3600) / 60)}"
                            placeholder="Minutes">

                        <span>:</span>

                        <input
                            id="customSeconds"
                            type="number"
                            min="0"
                            max="59"
                            value="${countdownTotal % 60}"
                            placeholder="Seconds">

                        <button
                            class="secondary"
                            onclick="setCustomCountdown()">
                            Set
                        </button>

                    </div>

                </div>


                <!-- BIG TIMER -->
                <div
                    id="timer"
                    class="timer">
                    ${fmt(mode === "countdown" ? countdownRemaining : seconds)}
                </div>


                <!-- SUBJECT -->
                <div class="study-input">

                    <input
                        id="studySubject"
                        placeholder="✎ What are you studying?"
                        value="${document.querySelector("#studySubject")?.value || ""}">

                </div>


                <!-- ACTION BUTTONS -->
                <div class="timer-actions">

                    <button
                        id="startTimerBtn"
                        class="secondary"
                        onclick="startTimer()">
                        ${running ? "▶ Running" : (elapsedSeconds > 0 ? "▶ Resume" : "▶ Start")}
                    </button>

                    <button
                        id="pauseTimerBtn"
                        class="secondary"
                        onclick="pauseTimer()"
                        ${!running ? "disabled" : ""}>
                        ⏸ Pause
                    </button>

                    <button
                        id="resetTimerBtn"
                        class="secondary"
                        onclick="resetTimer()"
                        ${!elapsedSeconds && !(mode === "countdown" && countdownRemaining !== countdownTotal) ? "disabled" : ""}>
                        ↻ Reset
                    </button>

                    <button
                        id="finishTimerBtn"
                        class="danger"
                        onclick="finishTimer()"
                        ${elapsedSeconds <= 0 ? "disabled" : ""}>
                        ■ Finish
                    </button>

                </div>

            </div>


            <!-- RIGHT SIDE IMAGE -->
            <div class="study-illustration">

                <img
                    src="study-lamp.png"
                    alt="Study lamp and books">

            </div>

        </div>


        <!-- STUDY HISTORY -->
        <div class="panel">

            <div class="panel-head">

                <div>

                    <div class="eyebrow">
                        HISTORY
                    </div>

                    <h2>
                        Study History
                    </h2>

                </div>

                <div class="searchbar">

                    <span>⌕</span>

                    <input
                        placeholder="Search sessions...">

                </div>

            </div>

            <div class="empty">

                ${history}

            </div>

        </div>

        `
    );
}


/* =========================================================
   FORMAT TIME
========================================================= */

function fmt(totalSeconds) {

    totalSeconds = Math.max(
        0,
        Number(totalSeconds) || 0
    );

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return [
        hours,
        minutes,
        seconds
    ]
        .map(x => String(x).padStart(2, "0"))
        .join(":");
}


/* =========================================================
   UPDATE TIMER UI
========================================================= */

function updateTimer() {

    const timerElement = $("#timer");

    if (!timerElement) {
        return;
    }


    /* Display correct timer */

    if (mode === "countdown") {

        timerElement.textContent =
            fmt(countdownRemaining);

    } else {

        timerElement.textContent =
            fmt(seconds);

    }


    /* Buttons */

    const startBtn =
        $("#startTimerBtn");

    const pauseBtn =
        $("#pauseTimerBtn");

    const resetBtn =
        $("#resetTimerBtn");

    const finishBtn =
        $("#finishTimerBtn");

    const status =
        $("#timerStatus");


    if (startBtn) {

        if (running) {

            startBtn.textContent =
                "▶ Running";

            startBtn.disabled = true;

        } else if (elapsedSeconds > 0) {

            startBtn.textContent =
                "▶ Resume";

            startBtn.disabled = false;

        } else {

            startBtn.textContent =
                "▶ Start";

            startBtn.disabled = false;
        }
    }


    if (pauseBtn) {

        pauseBtn.textContent =
            running ? "⏸ Pause" : "⏸ Paused";

        pauseBtn.disabled =
            !running;
    }


    if (resetBtn) {

        const hasTime =
            elapsedSeconds > 0 ||
            (
                mode === "countdown" &&
                countdownRemaining !== countdownTotal
            );

        resetBtn.disabled =
            !hasTime;
    }


    if (finishBtn) {

        finishBtn.disabled =
            elapsedSeconds <= 0;
    }


    /* Status */

    if (status) {

        if (running) {

            status.innerHTML =
                `<span class="status-dot running"></span> Focusing...`;

        } else if (elapsedSeconds > 0) {

            status.innerHTML =
                `<span class="status-dot paused"></span> Paused`;

        } else {

            status.innerHTML =
                `<span class="status-dot"></span> Ready`;
        }
    }
}


/* =========================================================
   START TIMER
========================================================= */

function startTimer() {

    if (running) {
        return;
    }


    /* Countdown must have a duration */

    if (
        mode === "countdown" &&
        countdownRemaining <= 0
    ) {

        alert(
            "Please set a countdown duration first."
        );

        return;
    }


    running = true;

    updateTimer();


    timer = setInterval(() => {

        /* STOPWATCH */

        if (mode === "stopwatch") {

            seconds++;
            elapsedSeconds++;

        }


        /* COUNTDOWN */

        else {

            if (countdownRemaining > 0) {

                countdownRemaining--;

                elapsedSeconds++;

            }


            /* Finished */

            if (countdownRemaining <= 0) {

                countdownRemaining = 0;

                pauseTimer();

                updateTimer();

                alert(
                    "Countdown finished!"
                );

                return;
            }
        }


        updateTimer();

    }, 1000);
}


/* =========================================================
   PAUSE TIMER
========================================================= */

function pauseTimer() {

    running = false;

    if (timer) {

        clearInterval(timer);

        timer = null;
    }

    updateTimer();
}


/* =========================================================
   RESET TIMER
========================================================= */

function resetTimer() {

    pauseTimer();

    seconds = 0;

    elapsedSeconds = 0;

    countdownRemaining =
        countdownTotal;

    updateTimer();
}


/* =========================================================
   FINISH TIMER
========================================================= */

function finishTimer() {

    if (elapsedSeconds <= 0) {

        alert(
            "Start studying before finishing the session."
        );

        return;
    }


    pauseTimer();


    const subject =
        $("#studySubject")?.value.trim() ||
        "Study session";


    state.study.unshift({

        subject: subject,

        seconds: elapsedSeconds,

        date: new Date().toISOString()

    });


    save();


    /* Reset timer */

    seconds = 0;

    elapsedSeconds = 0;

    countdownRemaining =
        countdownTotal;


    render();
}


/* =========================================================
   CUSTOM COUNTDOWN
========================================================= */

function setCustomCountdown() {

    const hours =
        Number($("#customHours")?.value || 0);

    const minutes =
        Number($("#customMinutes")?.value || 0);

    const secondsInput =
        Number($("#customSeconds")?.value || 0);


    if (
        hours < 0 ||
        minutes < 0 ||
        secondsInput < 0
    ) {

        alert(
            "Enter a valid duration."
        );

        return;
    }


    if (
        minutes > 59 ||
        secondsInput > 59 ||
        hours > 24
    ) {

        alert(
            "Use Hours 0–24, Minutes 0–59 and Seconds 0–59."
        );

        return;
    }


    const total =
        hours * 3600 +
        minutes * 60 +
        secondsInput;


    if (total <= 0) {

        alert(
            "Please set a duration greater than 0."
        );

        return;
    }


    pauseTimer();


    mode = "countdown";

    countdownTotal = total;

    countdownRemaining = total;

    elapsedSeconds = 0;

    seconds = 0;


    updateTimer();

    render();
}


/* =========================================================
   SWITCH STOPWATCH / COUNTDOWN
========================================================= */

function setMode(newMode) {

    if (running) {
        return;
    }


    mode = newMode;

    seconds = 0;

    elapsedSeconds = 0;


    if (mode === "countdown") {

        countdownRemaining =
            countdownTotal;

    } else {

        countdownRemaining =
            countdownTotal;
    }


    render();
}
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
