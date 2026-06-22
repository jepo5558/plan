const PLAN_STATUSES = ["planned", "active", "blocked", "review", "done", "archived"];

const state = {
  plans: [],
  filteredPlans: [],
  selectedId: null,
  language: localStorage.getItem("dashboard-language") || "ko",
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
  languageSelect: document.querySelector("#language-select"),
  i18nNodes: Array.from(document.querySelectorAll("[data-i18n]")),
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

const translations = {
  en: {
    sidebarEyebrow: "Local Dashboard",
    appTitle: "AI Plans",
    navPlans: "Plans",
    navBlocked: "Blocked",
    navDone: "Done",
    topEyebrow: "Private Repository View",
    topTitle: "Shared agent work queue",
    languageLabel: "Language",
    syncNote: "Run from local repo after pulling latest changes.",
    statTotal: "Total",
    statActive: "Active",
    statBlocked: "Blocked",
    statDone: "Done",
    filterContext: "Context",
    filterAgent: "Agent",
    filterProject: "Project",
    filterStatus: "Status",
    filterPriority: "Priority",
    all: "All",
    updated: "Updated",
    created: "Created",
    changeStatus: "Change Status",
    interpretedGoal: "Interpreted Goal",
    originalRequest: "Original Request",
    tasks: "Tasks",
    updates: "Updates",
    by: "By",
    noPlans: "No plans match the current filters.",
    emptyDetail: "Select a plan to inspect request, goal, tasks, and updates.",
    noTasks: "No tasks recorded.",
    noUpdates: "No updates recorded.",
    noDate: "No date",
    statusUpdateFailed: "Could not update status.",
    syncFailed: "Saved locally, but GitHub sync failed. Check the local server log.",
    readOnlyMode: "Status editing is available only on the local Node server.",
    serverHelp: "Start the local Node server, then open the dashboard again.",
    values: {
      personal: "personal",
      work: "work",
      planned: "planned",
      active: "active",
      blocked: "blocked",
      review: "review",
      done: "done",
      archived: "archived",
      todo: "todo",
      doing: "doing",
      high: "high",
      medium: "medium",
      low: "low"
    }
  },
  ko: {
    sidebarEyebrow: "\ub85c\uceec \ub300\uc2dc\ubcf4\ub4dc",
    appTitle: "AI \uacc4\ud68d",
    navPlans: "\uc804\uccb4 \uacc4\ud68d",
    navBlocked: "\ub9c9\ud78c \ud56d\ubaa9",
    navDone: "\uc644\ub8cc",
    topEyebrow: "\ube44\uacf5\uac1c \uc800\uc7a5\uc18c \ubcf4\uae30",
    topTitle: "\uacf5\uc720 AI \uc791\uc5c5 \ubaa9\ub85d",
    languageLabel: "\uc5b8\uc5b4",
    syncNote: "\ucd5c\uc2e0 \ubcc0\uacbd\uc0ac\ud56d\uc744 pull\ud55c \ub4a4 \ub85c\uceec \uc800\uc7a5\uc18c\uc5d0\uc11c \uc2e4\ud589\ud569\ub2c8\ub2e4.",
    statTotal: "\uc804\uccb4",
    statActive: "\uc9c4\ud589 \uc911",
    statBlocked: "\ub9c9\ud798",
    statDone: "\uc644\ub8cc",
    filterContext: "\uad6c\ubd84",
    filterAgent: "Agent",
    filterProject: "\ud504\ub85c\uc81d\ud2b8",
    filterStatus: "\uc0c1\ud0dc",
    filterPriority: "\uc6b0\uc120\uc21c\uc704",
    all: "\uc804\uccb4",
    updated: "\uc218\uc815",
    created: "\uc0dd\uc131",
    changeStatus: "\uc0c1\ud0dc \ubcc0\uacbd",
    interpretedGoal: "AI \ud574\uc11d \ubaa9\ud45c",
    originalRequest: "\uc6d0\ubb38 \uc694\uccad",
    tasks: "\uc791\uc5c5",
    updates: "\uc5c5\ub370\uc774\ud2b8",
    by: "\uc791\uc131",
    noPlans: "\ud604\uc7ac \ud544\ud130\uc640 \uc77c\uce58\ud558\ub294 \uacc4\ud68d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
    emptyDetail: "\uacc4\ud68d\uc744 \uc120\ud0dd\ud558\uba74 \uc694\uccad, \ubaa9\ud45c, \uc791\uc5c5, \uc5c5\ub370\uc774\ud2b8\ub97c \ubcfc \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    noTasks: "\ub4f1\ub85d\ub41c \uc791\uc5c5\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
    noUpdates: "\ub4f1\ub85d\ub41c \uc5c5\ub370\uc774\ud2b8\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    noDate: "\ub0a0\uc9dc \uc5c6\uc74c",
    statusUpdateFailed: "\uc0c1\ud0dc\ub97c \ubcc0\uacbd\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.",
    syncFailed: "\ub85c\uceec\uc5d0\ub294 \uc800\uc7a5\ub410\uc9c0\ub9cc GitHub \ub3d9\uae30\ud654\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \ub85c\uceec \uc11c\ubc84 \ub85c\uadf8\ub97c \ud655\uc778\ud558\uc138\uc694.",
    readOnlyMode: "\uc0c1\ud0dc \ubcc0\uacbd\uc740 \ub85c\uceec Node \uc11c\ubc84\uc5d0\uc11c\ub9cc \uac00\ub2a5\ud569\ub2c8\ub2e4.",
    serverHelp: "\ub85c\uceec Node \uc11c\ubc84\ub97c \uc2e4\ud589\ud55c \ub4a4 \ub300\uc2dc\ubcf4\ub4dc\ub97c \ub2e4\uc2dc \uc5ec\uc138\uc694.",
    values: {
      personal: "\uac1c\uc778",
      work: "\uc5c5\ubb34",
      planned: "\uc608\uc815",
      active: "\uc9c4\ud589 \uc911",
      blocked: "\ub9c9\ud798",
      review: "\uac80\ud1a0",
      done: "\uc644\ub8cc",
      archived: "\ubcf4\uad00",
      todo: "\ud560 \uc77c",
      doing: "\uc9c4\ud589 \uc911",
      high: "\ub192\uc74c",
      medium: "\ubcf4\ud1b5",
      low: "\ub0ae\uc74c"
    }
  }
};

async function loadPlans() {
  const planPaths = await loadPlanIndex("../data/plans-index.json");
  const localPlanPaths = isReadOnlyHost() ? [] : await loadPlanIndex("../data/local-plans-index.json", true);
  const allPlanPaths = [...planPaths, ...localPlanPaths];

  const planResponses = await Promise.all(
    allPlanPaths.map(async (path) => {
      const response = await fetch(`../${path}?t=${Date.now()}`);

      if (!response.ok) {
        throw new Error(`Could not load ${path}`);
      }

      const plan = await response.json();
      plan.storage = path.startsWith("data/local-plans/") ? "local" : "sync";
      return plan;
    })
  );

  return planResponses.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function loadPlanIndex(indexPath, optional = false) {
  const indexResponse = await fetch(`${indexPath}?t=${Date.now()}`);

  if (!indexResponse.ok) {
    if (optional) {
      return [];
    }

    throw new Error(`Could not load ${indexPath}`);
  }

  return indexResponse.json();
}

function uniqueValues(plans, field) {
  return Array.from(new Set(plans.map((plan) => plan[field]).filter(Boolean))).sort();
}

function populateFilter(select, values) {
  const currentValue = select.value;

  select.innerHTML = `<option value="all">${t("all")}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = translateValue(value);
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

function applyLanguage() {
  document.documentElement.lang = state.language;
  elements.languageSelect.value = state.language;
  elements.i18nNodes.forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  updateFilterOptions();
}

function badgeClass(value) {
  if (["active", "blocked", "done", "high"].includes(value)) {
    return value;
  }

  return "";
}

function renderPlanList() {
  if (state.filteredPlans.length === 0) {
    elements.list.innerHTML = `<p class="empty-state plan-card">${t("noPlans")}</p>`;
    return;
  }

  elements.list.innerHTML = state.filteredPlans
    .map((plan) => {
      const selected = plan.id === state.selectedId ? " selected" : "";

      return `
        <button class="plan-card${selected}" type="button" data-plan-id="${escapeHtml(plan.id)}">
          <div class="plan-title-row">
            <span class="plan-title">${escapeHtml(plan.title)}</span>
            <span class="badge ${badgeClass(plan.status)}">${escapeHtml(translateValue(plan.status))}</span>
          </div>
          <div class="meta-row">
            <span>${escapeHtml(translateValue(plan.context))}</span>
            <span>${escapeHtml(plan.agent)}</span>
            <span>${escapeHtml(plan.project)}</span>
            ${plan.storage === "local" ? `<span class="badge">local</span>` : ""}
          </div>
          <div class="meta-row">
            <span class="badge ${badgeClass(plan.priority)}">${escapeHtml(translateValue(plan.priority))}</span>
            <span>${t("updated")} ${formatDate(plan.updatedAt)}</span>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderDetail() {
  const plan = state.plans.find((item) => item.id === state.selectedId);

  if (!plan) {
    elements.detail.innerHTML = `<p class="empty-state">${t("emptyDetail")}</p>`;
    return;
  }

  elements.detail.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">${escapeHtml(translateValue(plan.context))} / ${escapeHtml(plan.agent)}</p>
      <h2>${escapeHtml(plan.title)}</h2>
      <div class="meta-row">
        <span class="badge ${badgeClass(plan.status)}">${escapeHtml(translateValue(plan.status))}</span>
        <span class="badge ${badgeClass(plan.priority)}">${escapeHtml(translateValue(plan.priority))}</span>
        ${plan.storage === "local" ? `<span class="badge">local</span>` : ""}
        <span>${escapeHtml(plan.project)}</span>
        <span>${t("created")} ${formatDate(plan.createdAt)}</span>
      </div>
    </header>

    <section class="detail-section">
      <h3>${t("changeStatus")}</h3>
      ${isReadOnlyHost() ? `<p class="empty-state">${t("readOnlyMode")}</p>` : ""}
      <div class="status-actions">
        ${renderStatusButtons(plan.status)}
      </div>
    </section>

    <section class="detail-section">
      <h3>${t("interpretedGoal")}</h3>
      <p>${escapeHtml(plan.interpretedGoal)}</p>
    </section>

    <section class="detail-section">
      <h3>${t("originalRequest")}</h3>
      <div class="request-box">${escapeHtml(plan.originalRequest)}</div>
    </section>

    <section class="detail-section">
      <h3>${t("tasks")}</h3>
      <ul class="task-list">
        ${renderTasks(plan.tasks)}
      </ul>
    </section>

    <section class="detail-section">
      <h3>${t("updates")}</h3>
      <ul class="update-list">
        ${renderUpdates(plan.updates)}
      </ul>
    </section>
  `;
}

function renderStatusButtons(currentStatus) {
  return PLAN_STATUSES.map((status) => {
    const active = status === currentStatus ? " active" : "";
    const disabled = isReadOnlyHost() ? " disabled" : "";
    return `
      <button class="status-button${active}" type="button" data-next-status="${status}"${disabled}>
        ${escapeHtml(translateValue(status))}
      </button>
    `;
  }).join("");
}

function renderTasks(tasks = []) {
  if (tasks.length === 0) {
    return `<li>${t("noTasks")}</li>`;
  }

  return tasks
    .map(
      (task) => `
        <li>
          <div class="plan-title-row">
            <strong>${escapeHtml(task.title)}</strong>
            <span class="badge ${badgeClass(task.status)}">${escapeHtml(translateValue(task.status))}</span>
          </div>
          ${task.notes ? `<p class="empty-state">${escapeHtml(task.notes)}</p>` : ""}
        </li>
      `
    )
    .join("");
}

function renderUpdates(updates = []) {
  if (updates.length === 0) {
    return `<li>${t("noUpdates")}</li>`;
  }

  return updates
    .map(
      (update) => `
        <li>
          <strong>${formatDate(update.at)}</strong>
          <p>${escapeHtml(update.message)}</p>
          <p class="empty-state">${t("by")} ${escapeHtml(update.by)}</p>
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

  elements.detail.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-next-status]");

    if (!button || !state.selectedId) {
      return;
    }

    await updatePlanStatus(state.selectedId, button.dataset.nextStatus);
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

  elements.languageSelect.addEventListener("change", () => {
    state.language = elements.languageSelect.value;
    localStorage.setItem("dashboard-language", state.language);
    applyLanguage();
    render();
  });
}

async function updatePlanStatus(planId, nextStatus) {
  if (isReadOnlyHost()) {
    alert(t("readOnlyMode"));
    return;
  }

  const response = await fetch(`/api/plans/${encodeURIComponent(planId)}/status`, {
    method: "PUT",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ status: nextStatus })
  });

  if (!response.ok) {
    alert(t("statusUpdateFailed"));
    return;
  }

  const payload = await response.json();
  const index = state.plans.findIndex((plan) => plan.id === planId);

  if (index >= 0) {
    state.plans[index] = payload.plan;
  }

  if (payload.sync && !payload.sync.ok) {
    alert(t("syncFailed"));
  }

  state.plans.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  updateFilterOptions();
  render();
}

function formatDate(value) {
  if (!value) {
    return t("noDate");
  }

  return new Intl.DateTimeFormat(state.language === "ko" ? "ko-KR" : "en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function t(key) {
  return translations[state.language][key] || translations.en[key] || key;
}

function translateValue(value) {
  return translations[state.language].values[value] || value;
}

function isReadOnlyHost() {
  return window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost";
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
  applyLanguage();

  try {
    state.plans = await loadPlans();
    state.selectedId = state.plans[0]?.id ?? null;
    updateFilterOptions();
    render();
  } catch (error) {
    elements.list.innerHTML = `<p class="error-state plan-card">${escapeHtml(error.message)}</p>`;
    elements.detail.innerHTML = `<p class="empty-state">${t("serverHelp")}</p>`;
  }
}

init();
