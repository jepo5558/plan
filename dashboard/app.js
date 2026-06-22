const state = {
  plans: [],
  filteredPlans: [],
  selectedId: null,
  view: "plans",
  filters: {
    context: "all",
    agent: "all",
    project: "all",
    status: "all",
    priority: "all"
  }
};

const elements = {
  list: document.querySelector("#plan-list"),
  detail: document.querySelector("#plan-detail"),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  filters: {
    context: document.querySelector("#filter-context"),
    agent: document.querySelector("#filter-agent"),
    project: document.querySelector("#filter-project"),
    status: document.querySelector("#filter-status"),
    priority: document.querySelector("#filter-priority")
  },
  stats: {
    total: document.querySelector("#stat-total"),
    active: document.querySelector("#stat-active"),
    blocked: document.querySelector("#stat-blocked"),
    done: document.querySelector("#stat-done")
  }
};

async function loadPlans() {
  const indexResponse = await fetch("../data/plans-index.json");

  if (!indexResponse.ok) {
    throw new Error("Could not load data/plans-index.json");
  }

  const planPaths = await indexResponse.json();
  const planResponses = await Promise.all(
    planPaths.map(async (path) => {
      const response = await fetch(`../${path}`);

      if (!response.ok) {
        throw new Error(`Could not load ${path}`);
      }

      return response.json();
    })
  );

  return planResponses.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function uniqueValues(plans, field) {
  return Array.from(new Set(plans.map((plan) => plan[field]).filter(Boolean))).sort();
}

function populateFilter(select, values) {
  const currentValue = select.value;

  select.innerHTML = '<option value="all">All</option>';
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if (values.includes(currentValue)) {
    select.value = currentValue;
  }
}

function updateFilterOptions() {
  populateFilter(elements.filters.context, uniqueValues(state.plans, "context"));
  populateFilter(elements.filters.agent, uniqueValues(state.plans, "agent"));
  populateFilter(elements.filters.project, uniqueValues(state.plans, "project"));
  populateFilter(elements.filters.status, uniqueValues(state.plans, "status"));
  populateFilter(elements.filters.priority, uniqueValues(state.plans, "priority"));
}

function applyFilters() {
  state.filteredPlans = state.plans.filter((plan) => {
    const matchesView =
      state.view === "plans" ||
      (state.view === "blocked" && plan.status === "blocked") ||
      (state.view === "done" && plan.status === "done");

    const matchesFilters = Object.entries(state.filters).every(([field, value]) => {
      return value === "all" || plan[field] === value;
    });

    return matchesView && matchesFilters;
  });

  if (!state.filteredPlans.some((plan) => plan.id === state.selectedId)) {
    state.selectedId = state.filteredPlans[0]?.id ?? null;
  }
}

function updateStats() {
  elements.stats.total.textContent = state.plans.length;
  elements.stats.active.textContent = state.plans.filter((plan) => plan.status === "active").length;
  elements.stats.blocked.textContent = state.plans.filter((plan) => plan.status === "blocked").length;
  elements.stats.done.textContent = state.plans.filter((plan) => plan.status === "done").length;
}

function badgeClass(value) {
  if (["active", "blocked", "done", "high"].includes(value)) {
    return value;
  }

  return "";
}

function renderPlanList() {
  if (state.filteredPlans.length === 0) {
    elements.list.innerHTML = '<p class="empty-state plan-card">No plans match the current filters.</p>';
    return;
  }

  elements.list.innerHTML = state.filteredPlans
    .map((plan) => {
      const selected = plan.id === state.selectedId ? " selected" : "";

      return `
        <button class="plan-card${selected}" type="button" data-plan-id="${escapeHtml(plan.id)}">
          <div class="plan-title-row">
            <span class="plan-title">${escapeHtml(plan.title)}</span>
            <span class="badge ${badgeClass(plan.status)}">${escapeHtml(plan.status)}</span>
          </div>
          <div class="meta-row">
            <span>${escapeHtml(plan.context)}</span>
            <span>${escapeHtml(plan.agent)}</span>
            <span>${escapeHtml(plan.project)}</span>
          </div>
          <div class="meta-row">
            <span class="badge ${badgeClass(plan.priority)}">${escapeHtml(plan.priority)}</span>
            <span>Updated ${formatDate(plan.updatedAt)}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderDetail() {
  const plan = state.plans.find((item) => item.id === state.selectedId);

  if (!plan) {
    elements.detail.innerHTML =
      '<p class="empty-state">Select a plan to inspect request, goal, tasks, and updates.</p>';
    return;
  }

  elements.detail.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">${escapeHtml(plan.context)} / ${escapeHtml(plan.agent)}</p>
      <h2>${escapeHtml(plan.title)}</h2>
      <div class="meta-row">
        <span class="badge ${badgeClass(plan.status)}">${escapeHtml(plan.status)}</span>
        <span class="badge ${badgeClass(plan.priority)}">${escapeHtml(plan.priority)}</span>
        <span>${escapeHtml(plan.project)}</span>
        <span>Created ${formatDate(plan.createdAt)}</span>
      </div>
    </header>

    <section class="detail-section">
      <h3>Interpreted Goal</h3>
      <p>${escapeHtml(plan.interpretedGoal)}</p>
    </section>

    <section class="detail-section">
      <h3>Original Request</h3>
      <div class="request-box">${escapeHtml(plan.originalRequest)}</div>
    </section>

    <section class="detail-section">
      <h3>Tasks</h3>
      <ul class="task-list">
        ${renderTasks(plan.tasks)}
      </ul>
    </section>

    <section class="detail-section">
      <h3>Updates</h3>
      <ul class="update-list">
        ${renderUpdates(plan.updates)}
      </ul>
    </section>
  `;
}

function renderTasks(tasks = []) {
  if (tasks.length === 0) {
    return "<li>No tasks recorded.</li>";
  }

  return tasks
    .map(
      (task) => `
        <li>
          <div class="plan-title-row">
            <strong>${escapeHtml(task.title)}</strong>
            <span class="badge ${badgeClass(task.status)}">${escapeHtml(task.status)}</span>
          </div>
          ${task.notes ? `<p class="empty-state">${escapeHtml(task.notes)}</p>` : ""}
        </li>
      `
    )
    .join("");
}

function renderUpdates(updates = []) {
  if (updates.length === 0) {
    return "<li>No updates recorded.</li>";
  }

  return updates
    .map(
      (update) => `
        <li>
          <strong>${formatDate(update.at)}</strong>
          <p>${escapeHtml(update.message)}</p>
          <p class="empty-state">By ${escapeHtml(update.by)}</p>
        </li>
      `
    )
    .join("");
}

function render() {
  applyFilters();
  updateStats();
  renderPlanList();
  renderDetail();
}

function bindEvents() {
  elements.list.addEventListener("click", (event) => {
    const card = event.target.closest("[data-plan-id]");

    if (!card) {
      return;
    }

    state.selectedId = card.dataset.planId;
    render();
  });

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      state.view = item.dataset.view;
      elements.navItems.forEach((navItem) => navItem.classList.remove("active"));
      item.classList.add("active");
      render();
    });
  });

  Object.entries(elements.filters).forEach(([field, select]) => {
    select.addEventListener("change", () => {
      state.filters[field] = select.value;
      render();
    });
  });
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function init() {
  bindEvents();

  try {
    state.plans = await loadPlans();
    state.selectedId = state.plans[0]?.id ?? null;
    updateFilterOptions();
    render();
  } catch (error) {
    elements.list.innerHTML = `<p class="error-state plan-card">${escapeHtml(error.message)}</p>`;
    elements.detail.innerHTML =
      '<p class="empty-state">Start a local HTTP server from the repository root and open dashboard/index.html.</p>';
  }
}

init();

