/* =========================
   N PROJECT — LIFE OS
========================= */

(function () {
    "use strict";

    const LIFE_STORAGE_KEY = "nProjectLifeOS";
    const TODAY = () => new Date().toISOString().slice(0, 10);

    const state = {
        tasks: [],
        filter: "today",
        editingId: null,
        pendingDeleteId: null,
        focusTaskId: null
    };

    const el = {};

    function createId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }
        return `life-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function normalizeTask(task) {
        if (!task || typeof task !== "object") return null;
        const title = typeof task.title === "string" ? task.title.trim() : "";
        if (!title) return null;

        return {
            id: typeof task.id === "string" ? task.id : createId(),
            title: title.slice(0, 100),
            priority: ["low", "normal", "high"].includes(task.priority) ? task.priority : "normal",
            completed: task.completed === true,
            date: typeof task.date === "string" ? task.date : TODAY(),
            createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
            updatedAt: typeof task.updatedAt === "string" ? task.updatedAt : null
        };
    }

    function loadTasks() {
        try {
            const raw = localStorage.getItem(LIFE_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeTask).filter(Boolean);
        } catch (error) {
            console.warn("Life OS storage could not be loaded.", error);
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem(LIFE_STORAGE_KEY, JSON.stringify(state.tasks));
            return true;
        } catch (error) {
            console.warn("Life OS storage could not be saved.", error);
            return false;
        }
    }

    function getTodayTasks() {
        return state.tasks.filter((task) => task.date === TODAY());
    }

    function getActiveTasks() {
        return state.tasks.filter((task) => !task.completed);
    }

    function getDoneTasks() {
        return state.tasks.filter((task) => task.completed);
    }

    function filteredTasks() {
        const today = TODAY();

        if (state.filter === "today") return state.tasks.filter((task) => task.date === today);
        if (state.filter === "active") return state.tasks.filter((task) => !task.completed);
        if (state.filter === "done") return state.tasks.filter((task) => task.completed);
        return [...state.tasks];
    }

    function sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
            const priorityRank = { high: 0, normal: 1, low: 2 };
            if (priorityRank[a.priority] !== priorityRank[b.priority]) {
                return priorityRank[a.priority] - priorityRank[b.priority];
            }
            return b.createdAt.localeCompare(a.createdAt);
        });
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);
    }

    function getGreeting(hour) {
        if (hour < 11) return "Good morning.";
        if (hour < 15) return "Good afternoon.";
        if (hour < 19) return "Good evening.";
        return "Good night.";
    }

    function logActivity(title, category = "focus") {
        if (typeof window.addActivity === "function") {
            try {
                window.addActivity(title, category);
            } catch (error) {
                console.warn("Life OS activity log skipped.", error);
            }
        }
    }

    function renderOverview() {
        const todayTasks = getTodayTasks();
        const todayDone = todayTasks.filter((task) => task.completed);
        const todayActive = todayTasks.filter((task) => !task.completed);
        const allDone = getDoneTasks();
        const percent = todayTasks.length ? Math.round((todayDone.length / todayTasks.length) * 100) : 0;

        el.todayLabel.textContent = formatDate(new Date());
        el.greeting.textContent = getGreeting(new Date().getHours());

        if (todayTasks.length === 0) {
            el.overviewText.textContent = "No tasks for today. Add one small thing and start moving.";
        } else if (todayActive.length === 0) {
            el.overviewText.textContent = "Everything planned for today is done.";
        } else {
            el.overviewText.textContent = `${todayActive.length} active ${todayActive.length === 1 ? "task" : "tasks"} still on the board.`;
        }

        el.progressValue.textContent = `${percent}%`;
        el.progressBar.style.width = `${percent}%`;
        el.todayCount.textContent = todayTasks.length;
        el.doneCount.textContent = allDone.length;
        el.activeCount.textContent = getActiveTasks().length;
        el.totalCount.textContent = state.tasks.length;
        el.taskCountBadge.textContent = filteredTasks().length;
    }

    function priorityLabel(priority) {
        return priority.toUpperCase();
    }

    function renderTasks() {
        const tasks = sortTasks(filteredTasks());

        if (!tasks.length) {
            const filterText = {
                today: "No tasks today.",
                active: "No active tasks.",
                done: "Nothing completed yet.",
                all: "Your task list is empty."
            }[state.filter];

            el.taskList.innerHTML = `
                <div class="life-empty">
                    <strong>${filterText}</strong>
                    <span>${state.filter === "today" ? "Add something small. Humans apparently function better with a list." : "Try another filter or add a new task."}</span>
                </div>
            `;
            return;
        }

        el.taskList.innerHTML = tasks.map((task, index) => `
            <article class="life-task-item ${task.completed ? "done" : ""} life-reveal" style="--life-delay:${Math.min(index * 45, 240)}ms" data-task-id="${escapeHtml(task.id)}">
                <button type="button" class="life-checkbox" data-action="toggle" data-id="${escapeHtml(task.id)}" aria-label="${task.completed ? "Mark task active" : "Mark task done"}"></button>
                <div class="life-task-copy">
                    <div class="life-task-title">${escapeHtml(task.title)}</div>
                    <div class="life-task-meta">
                        <span class="priority-${task.priority}">${priorityLabel(task.priority)}</span>
                        <span>${task.date === TODAY() ? "TODAY" : task.date}</span>
                    </div>
                </div>
                <div class="life-task-actions">
                    <button type="button" class="life-task-action" data-action="edit" data-id="${escapeHtml(task.id)}" aria-label="Edit task">✎</button>
                    <button type="button" class="life-task-action" data-action="delete" data-id="${escapeHtml(task.id)}" aria-label="Delete task">×</button>
                </div>
            </article>
        `).join("");
    }

    function renderFilters() {
        el.filters.forEach((button) => {
            const active = button.dataset.filter === state.filter;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
    }

    function renderAll() {
        renderOverview();
        renderFilters();
        renderTasks();
    }

    function resetForm() {
        state.editingId = null;
        el.form.reset();
        el.priority.value = "normal";
        el.submit.textContent = "ADD TASK";
        el.cancelEdit.hidden = true;
    }

    function startEdit(task) {
        state.editingId = task.id;
        el.input.value = task.title;
        el.priority.value = task.priority;
        el.submit.textContent = "SAVE TASK";
        el.cancelEdit.hidden = false;
        el.input.focus();
        el.input.select();
        el.form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function addTask(title, priority) {
        const task = {
            id: createId(),
            title,
            priority,
            completed: false,
            date: TODAY(),
            createdAt: new Date().toISOString(),
            updatedAt: null
        };

        state.tasks.push(task);
        saveTasks();
        logActivity(`LIFE TASK CREATED · ${title}`.slice(0, 70), "project");
        state.filter = "today";
        renderAll();
    }

    function updateTask(task, title, priority) {
        task.title = title;
        task.priority = priority;
        task.updatedAt = new Date().toISOString();
        saveTasks();
        logActivity(`LIFE TASK UPDATED · ${title}`.slice(0, 70), "project");
        renderAll();
    }

    function toggleTask(id) {
        const task = state.tasks.find((item) => item.id === id);
        if (!task) return;

        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        saveTasks();

        if (task.completed) {
            logActivity(`TASK COMPLETED · ${task.title}`.slice(0, 70), "focus");
        } else {
            logActivity(`TASK REOPENED · ${task.title}`.slice(0, 70), "focus");
        }

        renderAll();
    }

    function openDeleteModal(id) {
        const task = state.tasks.find((item) => item.id === id);
        if (!task) return;

        state.pendingDeleteId = id;
        el.modalTitle.textContent = "Delete this task?";
        el.modalText.textContent = `“${task.title}” will be removed from Life OS.`;
        el.modal.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeDeleteModal() {
        state.pendingDeleteId = null;
        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    function confirmDelete() {
        if (!state.pendingDeleteId) return;
        const id = state.pendingDeleteId;
        const item = el.taskList.querySelector(`[data-task-id="${CSS.escape(id)}"]`);
        const task = state.tasks.find((entry) => entry.id === id);

        if (item) {
            item.classList.add("is-removing");
        }

        window.setTimeout(() => {
            state.tasks = state.tasks.filter((entry) => entry.id !== id);
            saveTasks();
            if (task) logActivity(`TASK DELETED · ${task.title}`.slice(0, 70), "system");
            closeDeleteModal();
            if (state.editingId === id) resetForm();
            if (state.focusTaskId === id) state.focusTaskId = null;
            renderAll();
        }, 180);
    }

    function getNextFocusTask() {
        const active = sortTasks(getActiveTasks());
        if (!active.length) return null;

        const currentIndex = active.findIndex((task) => task.id === state.focusTaskId);
        return active[(currentIndex + 1 + active.length) % active.length] || active[0];
    }

    function renderFocus() {
        const task = state.tasks.find((item) => item.id === state.focusTaskId && !item.completed) || getNextFocusTask();
        if (!task) {
            state.focusTaskId = null;
            el.focusTitle.textContent = "Nothing queued.";
            el.focusMeta.textContent = "Add an active task first.";
            el.focusDone.disabled = true;
            el.focusNext.disabled = true;
            return;
        }

        state.focusTaskId = task.id;
        el.focusTitle.textContent = task.title;
        el.focusMeta.textContent = `${priorityLabel(task.priority)} · ${task.date === TODAY() ? "TODAY" : task.date}`;
        el.focusDone.disabled = false;
        el.focusNext.disabled = getActiveTasks().length < 2;
    }

    function openFocus() {
        renderFocus();
        el.focusPanel.hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeFocus() {
        el.focusPanel.hidden = true;
        document.body.style.overflow = "";
    }

    function focusDone() {
        if (!state.focusTaskId) return;
        toggleTask(state.focusTaskId);
        renderFocus();
    }

    function focusNext() {
        const task = getNextFocusTask();
        if (!task) return;
        state.focusTaskId = task.id;
        renderFocus();
    }

    function handleSubmit(event) {
        event.preventDefault();
        const title = el.input.value.trim();
        const priority = el.priority.value;
        if (!title) {
            el.input.focus();
            return;
        }

        if (state.editingId) {
            const task = state.tasks.find((item) => item.id === state.editingId);
            if (task) updateTask(task, title, priority);
            resetForm();
            renderAll();
            return;
        }

        addTask(title, priority);
        resetForm();
        el.taskList.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function bindEvents() {
        el.form.addEventListener("submit", handleSubmit);
        el.cancelEdit.addEventListener("click", () => {
            resetForm();
            el.input.blur();
        });

        el.filters.forEach((button) => {
            button.addEventListener("click", () => {
                state.filter = button.dataset.filter || "today";
                renderAll();
            });
        });

        el.taskList.addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]");
            if (!action) return;
            const id = action.dataset.id;
            if (!id) return;

            if (action.dataset.action === "toggle") toggleTask(id);
            if (action.dataset.action === "edit") {
                const task = state.tasks.find((item) => item.id === id);
                if (task) startEdit(task);
            }
            if (action.dataset.action === "delete") openDeleteModal(id);
        });

        el.scrollTaskButton.addEventListener("click", () => {
            el.form.scrollIntoView({ behavior: "smooth", block: "center" });
            window.setTimeout(() => el.input.focus(), 350);
        });

        el.focusButton.addEventListener("click", openFocus);
        el.focusDone.addEventListener("click", focusDone);
        el.focusNext.addEventListener("click", focusNext);
        el.confirmDelete.addEventListener("click", confirmDelete);

        document.querySelectorAll("[data-close-life-modal]").forEach((button) => {
            button.addEventListener("click", closeDeleteModal);
        });

        document.querySelectorAll("[data-close-focus]").forEach((button) => {
            button.addEventListener("click", closeFocus);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeDeleteModal();
                closeFocus();
            }
        });
    }

    function cacheElements() {
        el.form = document.querySelector("#lifeTaskForm");
        el.input = document.querySelector("#lifeTaskInput");
        el.priority = document.querySelector("#lifeTaskPriority");
        el.submit = document.querySelector("#lifeSubmitButton");
        el.cancelEdit = document.querySelector("#lifeCancelEdit");
        el.taskList = document.querySelector("#lifeTaskList");
        el.filters = [...document.querySelectorAll(".life-filter")];
        el.todayLabel = document.querySelector("#lifeTodayLabel");
        el.greeting = document.querySelector("#lifeGreeting");
        el.overviewText = document.querySelector("#lifeOverviewText");
        el.progressValue = document.querySelector("#lifeProgressRingValue");
        el.progressBar = document.querySelector("#lifeProgressBar");
        el.todayCount = document.querySelector("#lifeTodayCount");
        el.doneCount = document.querySelector("#lifeDoneCount");
        el.activeCount = document.querySelector("#lifeActiveCount");
        el.totalCount = document.querySelector("#lifeTotalCount");
        el.taskCountBadge = document.querySelector("#lifeTaskCountBadge");
        el.focusButton = document.querySelector("#lifeFocusButton");
        el.scrollTaskButton = document.querySelector("#lifeScrollTaskButton");
        el.modal = document.querySelector("#lifeConfirmModal");
        el.modalTitle = document.querySelector("#lifeModalTitle");
        el.modalText = document.querySelector("#lifeModalText");
        el.confirmDelete = document.querySelector("#lifeConfirmDelete");
        el.focusPanel = document.querySelector("#lifeFocusPanel");
        el.focusTitle = document.querySelector("#lifeFocusTitle");
        el.focusMeta = document.querySelector("#lifeFocusMeta");
        el.focusDone = document.querySelector("#lifeFocusDone");
        el.focusNext = document.querySelector("#lifeFocusNext");
    }

    document.addEventListener("DOMContentLoaded", () => {
        cacheElements();
        state.tasks = loadTasks();
        bindEvents();
        renderAll();
    });
})();
