/**
 * MessMate - College Mess Management Portal Engine
 * Built with vanilla JavaScript & LocalStorage persistence.
 */

// ==========================================
// 1. DEFAULT DATASETS (Used on initial run)
// ==========================================

const DEFAULT_MENUS = {
  Monday: {
    Breakfast: "Masala Dosa, Sambar, Coconut Chutney, Coffee/Tea",
    Lunch: "Steamed Rice, Dal Makhani, Aloo Gobi, Roti, Curd",
    Snacks: "Veg Cutlet, Green Chutney, Masala Chai",
    Dinner: "Chapati, Paneer Matar, Jeera Pulao, Dal Fry, Kheer"
  },
  Tuesday: {
    Breakfast: "Idli, Vada, Tomato Chutney, Sambar, Tea",
    Lunch: "Rice, Rajma Masala, Bhindi Fry, Phulka, Buttermilk",
    Snacks: "Poha with Roasted Peanuts, Adrak Chai",
    Dinner: "Veg Biryani, Boondi Raita, Mirchi Ka Salan, Gulab Jamun"
  },
  Wednesday: {
    Breakfast: "Aloo Paratha, Fresh Curd, Pickle, Tea",
    Lunch: "Rice, Chana Masala, Mixed Veg Sabzi, Roti, Salad",
    Snacks: "Samosa, Tamarind Chutney, Tea",
    Dinner: "Butter Naan, Kadai Mushroom, Dal Tadka, Rice, Fruit Custard"
  },
  Thursday: {
    Breakfast: "Puri Bhaji, Halwa, Coffee/Tea",
    Lunch: "South Indian Thali: Rice, Rasam, Sambar, Poriyal, Appalam",
    Snacks: "Sweet Corn Chaat, Lemon Tea",
    Dinner: "Methi Thepla, Dum Aloo, Green Peas Pulao, Dal, Sweet"
  },
  Friday: {
    Breakfast: "Uttapam, Sambar, Kara Chutney, Filter Coffee",
    Lunch: "Rice, Dal Palak, Baingan Bharta, Tawa Roti, Curd",
    Snacks: "Onion Pakoda, Mint Chutney, Chai",
    Dinner: "Tandoori Roti, Shahi Paneer, Pulao, Yellow Dal, Ice Cream"
  },
  Saturday: {
    Breakfast: "Upma, Kesari Bath, Coconut Chutney, Tea",
    Lunch: "Lemon Rice, Curd Rice, Potato Fry, Pickle, Papad",
    Snacks: "Biscuits & Filter Coffee",
    Dinner: "Pav Bhaji, Extra Butter Pav, Salad, Roasted Papad, Sweet"
  },
  Sunday: {
    Breakfast: "Chole Bhature, Sweet Lassi",
    Lunch: "Grand Feast: Ghee Rice, Paneer Butter Masala, Raita, Payasam",
    Snacks: "Bun Maska, Irani Chai",
    Dinner: "Special Fried Rice, Veg Manchurian Gravy, Spring Roll"
  }
};

const DEFAULT_POLLS = [
  { id: 1, dish: "Paneer Butter Masala & Naan", votes: 48 },
  { id: 2, dish: "Special Hyderabadi Veg Biryani", votes: 34 },
  { id: 3, dish: "South Indian Malabar Parotta & Veg Kurma", votes: 22 },
  { id: 4, dish: "Chole Kulche with Mint Chutney", votes: 15 }
];

const DEFAULT_ATTENDANCE = [
  { id: "A1", time: "08:15 AM", student: "Rahul Nair", roll: "CS2401", session: "Breakfast", status: "Verified" },
  { id: "A2", time: "08:22 AM", student: "anjali", roll: "CS2414", session: "Breakfast", status: "Verified" },
  { id: "A3", time: "01:05 PM", student: "Sneha Patel", roll: "EC2408", session: "Lunch", status: "Verified" },
  { id: "A4", time: "01:14 PM", student: "Karan Verma", roll: "ME2419", session: "Lunch", status: "Verified" }
];

const DEFAULT_LEAVES = [
  { id: "L1", student: "anjali", from: "2026-11-04", to: "2026-11-06", days: 3, status: "Approved" },
  { id: "L2", student: "Sneha Patel", from: "2026-11-10", to: "2026-11-11", days: 2, status: "Pending" }
];

const DEFAULT_SUGGESTIONS = [
  { id: 1, user: "Rahul Nair", category: "Food Quality", text: "Please increase the spiciness of Rasam on Thursdays.", votes: 14 },
  { id: 2, user: "Karan Verma", category: "Hygiene", text: "Water cooler in dining hall B requires filter replacement.", votes: 21 }
];

const DEFAULT_EXPENSES = [
  { date: "2026-10-28", cat: "Groceries", desc: "100kg Rice & Pulses procurement", amt: 12500, by: "Admin" },
  { date: "2026-10-29", cat: "Fuel/LPG", desc: "Commercial LPG cylinder refill (3 units)", amt: 6450, by: "Admin" },
  { date: "2026-10-30", cat: "Dairy", desc: "Fresh milk & curd daily intake", amt: 3200, by: "Admin" }
];

// ==========================================
// 2. STATE MANAGER & PERSISTENCE
// ==========================================

const State = {
  currentUser: null, // { id: 'admin'|'student', role: 'admin'|'student', name: '...' }
  selectedDay: "Monday",
  menus: JSON.parse(localStorage.getItem("mm_menus")) || DEFAULT_MENUS,
  polls: JSON.parse(localStorage.getItem("mm_polls")) || DEFAULT_POLLS,
  attendance: JSON.parse(localStorage.getItem("mm_attendance")) || DEFAULT_ATTENDANCE,
  leaves: JSON.parse(localStorage.getItem("mm_leaves")) || DEFAULT_LEAVES,
  suggestions: JSON.parse(localStorage.getItem("mm_suggestions")) || DEFAULT_SUGGESTIONS,
  expenses: JSON.parse(localStorage.getItem("mm_expenses")) || DEFAULT_EXPENSES,

  save(key) {
    localStorage.setItem("mm_" + key, JSON.stringify(this[key]));
  }
};

// ==========================================
// 3. INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupLiveClock();
  setupForms();
  setupRoleToggle();
  
  // Check previous session
  const savedUser = sessionStorage.getItem("mm_session");
  if (savedUser) {
    applyUserSession(JSON.parse(savedUser));
  } else {
    document.getElementById("auth-modal").style.display = "flex";
  }

  renderMenu();
  renderAttendanceTable();
  renderPolls();
  renderLeaves();
  renderSuggestions();
  renderExpenses();
  renderTimeline();
  updateFinancialDues();
});

// ==========================================
// 4. AUTHENTICATION & SESSIONS
// ==========================================

function fillCredentials(id, pass) {
  document.getElementById("login-id").value = id;
  document.getElementById("login-pass").value = pass;
}

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("login-id").value.trim().toLowerCase();
  const pass = document.getElementById("login-pass").value;

  if (id === "admin" && pass === "admin123") {
    applyUserSession({ id: "admin", role: "admin", name: "Chief Warden (Admin)" });
  } else if (id === "student" && pass === "student123") {
    applyUserSession({ id: "student", role: "student", name: "anjali (Student)" });
  } else {
    showToast("Invalid credentials. Use admin/admin123 or student/student123", "error");
  }
});

function applyUserSession(user) {
  State.currentUser = user;
  sessionStorage.setItem("mm_session", JSON.stringify(user));
  document.getElementById("auth-modal").style.display = "none";

  // Update UI headers
  document.getElementById("user-display-name").innerText = user.name;
  document.getElementById("user-avatar").innerText = user.role === "admin" ? "AD" : "ST";
  document.getElementById("user-role-badge").innerText = user.role.toUpperCase();
  document.getElementById("toggle-target-role").innerText = user.role === "admin" ? "Student" : "Admin";

  // Apply css classes for conditional element display
  document.body.classList.remove("role-admin", "role-student");
  document.body.classList.add(user.role === "admin" ? "role-admin" : "role-student");

  showToast(`Authenticated as ${user.name}`);
  updateFinancialDues();
}

document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.removeItem("mm_session");
  window.location.reload();
});

function setupRoleToggle() {
  document.getElementById("role-toggle-btn").addEventListener("click", () => {
    if (!State.currentUser) return;
    if (State.currentUser.role === "admin") {
      applyUserSession({ id: "student", role: "student", name: "anjali (Student)" });
    } else {
      applyUserSession({ id: "admin", role: "admin", name: "Chief Warden (Admin)" });
    }
  });
}

// ==========================================
// 5. NAVIGATION & CLOCK
// ==========================================

function setupNavigation() {
  const links = document.querySelectorAll(".nav-item");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach((el) => el.classList.remove("active"));

  const targetNav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(`tab-${tabId}`);

  if (targetNav) targetNav.classList.add("active");
  if (targetPane) targetPane.classList.add("active");

  const titles = {
    dashboard: "Operational Overview",
    menu: "Weekly Food Plan",
    attendance: "Daily Dining Verification",
    polls: "Interactive Special Dish Voting",
    leave: "Mess Leave & Rebate Requests",
    suggestions: "Institutional Suggestion Box",
    finance: "Billing Ledger & Logistics Spend"
  };
  document.getElementById("page-title").innerText = titles[tabId] || "Dashboard";
}

function setupLiveClock() {
  const clockEl = document.getElementById("live-clock");
  const dateEl = document.getElementById("current-date-display");

  function update() {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (dateEl) {
      dateEl.innerText = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
    }
  }
  update();
  setInterval(update, 1000);
}

// ==========================================
// 6. DASHBOARD TIMELINE & STATS
// ==========================================

function renderTimeline() {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[new Date().getDay()];
  const todaySchedule = State.menus[currentDayName] || State.menus["Monday"];

  document.getElementById("today-day-tag").innerText = currentDayName;

  const container = document.getElementById("today-timeline");
  container.innerHTML = "";

  const slots = [
    { name: "Breakfast", time: "07:30 AM - 09:30 AM", menu: todaySchedule.Breakfast },
    { name: "Lunch", time: "12:30 PM - 02:30 PM", menu: todaySchedule.Lunch },
    { name: "Snacks", time: "05:00 PM - 06:15 PM", menu: todaySchedule.Snacks },
    { name: "Dinner", time: "07:45 PM - 09:45 PM", menu: todaySchedule.Dinner }
  ];

  slots.forEach((s) => {
    const row = document.createElement("div");
    row.className = "meal-row";
    row.innerHTML = `
      <div class="meal-time-tag">${s.name}<br><small style="color:var(--text-muted); font-size:10px;">${s.time}</small></div>
      <div class="meal-content">
        <strong>${s.menu}</strong>
      </div>
    `;
    container.appendChild(row);
  });
}

// ==========================================
// 7. MENU MODULE
// ==========================================

document.querySelectorAll(".day-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".day-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    State.selectedDay = chip.getAttribute("data-day");
    renderMenu();
  });
});

function renderMenu() {
  const container = document.getElementById("menu-slots-container");
  const current = State.menus[State.selectedDay];
  container.innerHTML = "";

  Object.entries(current).forEach(([mealSlot, description]) => {
    const card = document.createElement("div");
    card.className = "menu-slot-card";
    card.innerHTML = `
      <h4>${mealSlot}</h4>
      <ul>
        ${description.split(",").map((item) => `<li><i class="ph-bold ph-check text-positive"></i> ${item.trim()}</li>`).join("")}
      </ul>
    `;
    container.appendChild(card);
  });
}

function openMenuEditModal() {
  const current = State.menus[State.selectedDay];
  const newBreakfast = prompt(`Edit ${State.selectedDay} Breakfast:`, current.Breakfast);
  if (newBreakfast === null) return;
  const newLunch = prompt(`Edit ${State.selectedDay} Lunch:`, current.Lunch);
  if (newLunch === null) return;
  const newDinner = prompt(`Edit ${State.selectedDay} Dinner:`, current.Dinner);
  if (newDinner === null) return;

  State.menus[State.selectedDay].Breakfast = newBreakfast;
  State.menus[State.selectedDay].Lunch = newLunch;
  State.menus[State.selectedDay].Dinner = newDinner;
  State.save("menus");

  renderMenu();
  renderTimeline();
  showToast(`${State.selectedDay}'s menu updated successfully.`);
}

// ==========================================
// 8. ATTENDANCE TRACKER
// ==========================================

document.getElementById("btn-mark-attendance").addEventListener("click", () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const record = {
    id: "A" + (State.attendance.length + 1),
    time: timeStr,
    student: State.currentUser ? State.currentUser.name : "anjali",
    roll: "CS2414",
    session: "Dinner",
    status: "Verified"
  };

  State.attendance.unshift(record);
  State.save("attendance");
  renderAttendanceTable();
  showToast("Attendance logged successfully for tonight!");
});

function renderAttendanceTable() {
  const tbody = document.getElementById("attendance-table-body");
  tbody.innerHTML = "";

  State.attendance.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.time}</td>
      <td><strong>${row.student}</strong></td>
      <td><code>${row.roll}</code></td>
      <td>${row.session}</td>
      <td><span class="chip chip-positive">${row.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function exportAttendanceCSV() {
  let csvContent = "data:text/csv;charset=utf-8,ID,Time,Student,Roll,Session,Status\n";
  State.attendance.forEach((r) => {
    csvContent += `${r.id},${r.time},${r.student},${r.roll},${r.session},${r.status}\n`;
  });
  triggerDownload(csvContent, "MessMate_Attendance.csv");
}

// ==========================================
// 9. FOOD POLLS
// ==========================================

function renderPolls() {
  const wrapper = document.getElementById("poll-options-wrapper");
  wrapper.innerHTML = "";

  const totalVotes = State.polls.reduce((acc, p) => acc + p.votes, 0);

  State.polls.forEach((poll) => {
    const percentage = totalVotes ? Math.round((poll.votes / totalVotes) * 100) : 0;
    const row = document.createElement("div");
    row.className = "poll-option-row";
    row.innerHTML = `
      <div class="poll-info">
        <span>${poll.dish}</span>
        <span>${percentage}% (${poll.votes} votes)</span>
      </div>
      <div class="poll-bar-track">
        <div class="poll-bar-fill" style="width: ${percentage}%"></div>
      </div>
    `;
    row.addEventListener("click", () => votePoll(poll.id));
    wrapper.appendChild(row);
  });
}

function votePoll(pollId) {
  const option = State.polls.find((p) => p.id === pollId);
  if (option) {
    option.votes += 1;
    State.save("polls");
    renderPolls();
    showToast(`Vote cast for: ${option.dish}`);
  }
}

// ==========================================
// 10. LEAVE & REBATE
// ==========================================

document.getElementById("leave-request-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const from = document.getElementById("leave-from").value;
  const to = document.getElementById("leave-to").value;

  const d1 = new Date(from);
  const d2 = new Date(to);
  const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;

  if (diffDays <= 0) {
    showToast("Invalid date range. Check your departure and return dates.", "error");
    return;
  }

  const newLeave = {
    id: "L" + (State.leaves.length + 1),
    student: State.currentUser ? State.currentUser.name : "Student",
    from: from,
    to: to,
    days: diffDays,
    status: "Approved" // Automatically approved for demo speed
  };

  State.leaves.unshift(newLeave);
  State.save("leaves");
  renderLeaves();
  updateFinancialDues();
  e.target.reset();
  showToast(`Leave filed for ${diffDays} days. Rebate applied.`);
});

function renderLeaves() {
  const tbody = document.getElementById("leave-table-body");
  tbody.innerHTML = "";

  State.leaves.forEach((l) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${l.student}</strong></td>
      <td>${l.from} to ${l.to}</td>
      <td>${l.days} days</td>
      <td><span class="chip ${l.status === 'Approved' ? 'chip-positive' : 'chip-warning'}">${l.status}</span></td>
      <td class="admin-only">
        ${l.status === 'Pending' ? `<button class="btn btn-sm btn-outline" onclick="approveLeave('${l.id}')">Approve</button>` : '—'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function approveLeave(leaveId) {
  const item = State.leaves.find((l) => l.id === leaveId);
  if (item) {
    item.status = "Approved";
    State.save("leaves");
    renderLeaves();
    updateFinancialDues();
    showToast("Leave sanctioned.");
  }
}

// ==========================================
// 11. SUGGESTIONS & FEEDBACK
// ==========================================

document.getElementById("suggestion-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const cat = document.getElementById("sugg-category").value;
  const text = document.getElementById("sugg-text").value.trim();

  const newSugg = {
    id: Date.now(),
    user: State.currentUser ? State.currentUser.name : "Student",
    category: cat,
    text: text,
    votes: 1
  };

  State.suggestions.unshift(newSugg);
  State.save("suggestions");
  renderSuggestions();
  e.target.reset();
  showToast("Your suggestion has been submitted to the mess committee.");
});

function renderSuggestions() {
  const feed = document.getElementById("suggestion-feed-list");
  feed.innerHTML = "";

  State.suggestions.forEach((s) => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <div class="suggestion-meta">
        <strong>${s.user} • <span class="chip chip-neutral">${s.category}</span></strong>
        <span><i class="ph-bold ph-thumbs-up"></i> ${s.votes}</span>
      </div>
      <p style="font-size: 13px; color: var(--text-main);">${s.text}</p>
    `;
    feed.appendChild(div);
  });
}

// ==========================================
// 12. EXPENSES & FINANCE
// ==========================================

document.getElementById("expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = document.getElementById("exp-item").value.trim();
  const cat = document.getElementById("exp-category").value;
  const amt = parseFloat(document.getElementById("exp-amount").value);

  const newExp = {
    date: new Date().toISOString().split("T")[0],
    cat: cat,
    desc: desc,
    amt: amt,
    by: "Chief Warden"
  };

  State.expenses.unshift(newExp);
  State.save("expenses");
  renderExpenses();
  e.target.reset();
  showToast("Procurement expenditure logged.");
});

function renderExpenses() {
  const tbody = document.getElementById("expense-table-body");
  tbody.innerHTML = "";

  State.expenses.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td><span class="chip chip-info">${e.cat}</span></td>
      <td>${e.desc}</td>
      <td><strong>₹${e.amt.toLocaleString("en-IN")}</strong></td>
      <td>${e.by}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateFinancialDues() {
  const approvedLeaves = State.leaves.filter((l) => l.status === "Approved");
  const totalLeaveDays = approvedLeaves.reduce((sum, l) => sum + l.days, 0);

  const rebateRate = 120; // ₹120 per approved day
  const rebateTotal = totalLeaveDays * rebateRate;
  const baseBill = 4050;
  const netDue = Math.max(0, baseBill - rebateTotal);

  const rebateEl = document.getElementById("finance-rebate-amt");
  const netDueEl = document.getElementById("finance-net-due");

  if (rebateEl) rebateEl.innerText = `- ₹${rebateTotal.toLocaleString("en-IN")}.00`;
  if (netDueEl) netDueEl.innerText = `₹${netDue.toLocaleString("en-IN")}.00`;
}

function simulatePay() {
  showToast("Redirecting to campus payment gateway (SBI Collect / Razorpay)...");
  setTimeout(() => {
    showToast("Mess bill payment successful! Receipt generated.", "success");
  }, 1200);
}

function exportExpenseCSV() {
  let csv = "data:text/csv;charset=utf-8,Date,Category,Description,Amount,AuditedBy\n";
  State.expenses.forEach((e) => {
    csv += `${e.date},${e.cat},"${e.desc}",${e.amt},${e.by}\n`;
  });
  triggerDownload(csv, "MessMate_Expense_Ledger.csv");
}

// ==========================================
// 13. UTILITIES & HELPERS
// ==========================================

function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="ph-bold ${type === 'error' ? 'ph-warning-circle' : 'ph-check-circle'}"></i> <span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function triggerDownload(content, filename) {
  const encodedUri = encodeURI(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setupForms() {
  // Sets default date pickers to today's date
  const today = new Date().toISOString().split("T")[0];
  const leaveFrom = document.getElementById("leave-from");
  const leaveTo = document.getElementById("leave-to");
  if (leaveFrom) leaveFrom.value = today;
  if (leaveTo) leaveTo.value = today;
}