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
    serverHelp: "Start a local HTTP server from the repository root and open dashboard/index.html.",
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
    sidebarEyebrow: "로컬 대시보드",
    appTitle: "AI 계획",
    navPlans: "전체 계획",
    navBlocked: "막힌 항목",
    navDone: "완료",
    topEyebrow: "비공개 저장소 보기",
    topTitle: "공유 AI 작업 목록",
    languageLabel: "언어",
    syncNote: "최신 변경사항을 pull한 뒤 로컬 저장소에서 실행합니다.",
    statTotal: "전체",
    statActive: "진행 중",
    statBlocked: "막힘",
    statDone: "완료",
    filterContext: "구분",
    filterAgent: "Agent",
    filterProject: "프로젝트",
    filterStatus: "상태",
    filterPriority: "우선순위",
    all: "전체",
    updated: "수정",
    created: "생성",
    interpretedGoal: "AI 해석 목표",
    originalRequest: "원문 요청",
    tasks: "작업",
    updates: "업데이트",
    by: "작성",
    noPlans: "현재 필터와 일치하는 계획이 없습니다.",
    emptyDetail: "계획을 선택하면 요청, 목표, 작업, 업데이트를 볼 수 있습니다.",
    noTasks: "등록된 작업이 없습니다.",
    noUpdates: "등록된 업데이트가 없습니다.",
    noDate: "날짜 없음",
    serverHelp: "저장소 루트에서 로컬 HTTP 서버를 실행한 뒤 dashboard/index.html을 여세요.",
    values: {
      personal: "개인",
      work: "업무",
      planned: "예정",
      active: "진행 중",
      blocked: "막힘",
      review: "검토",
      done: "완료",
      archived: "보관",
      todo: "할 일",
      doing: "진행 중",
      high: "높음",
      medium: "보통",
      low: "낮음"
    }
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
    elements.detail.innerHTML =
      `<p class="empty-state">${t("emptyDetail")}</p>`;
    return;
  }

  elements.detail.innerHTML = `
    <header class="detail-header">
      <p class="eyebrow">${escapeHtml(translateValue(plan.context))} / ${escapeHtml(plan.agent)}</p>
      <h2>${escapeHtml(plan.title)}</h2>
      <div class="meta-row">
        <span class="badge ${badgeClass(plan.status)}">${escapeHtml(translateValue(plan.status))}</span>
        <span class="badge ${badgeClass(plan.priority)}">${escapeHtml(translateValue(plan.priority))}</span>
        <span>${escapeHtml(plan.project)}</span>
        <span>${t("created")} ${formatDate(plan.createdAt)}</span>
      </div>
    </header>

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
