/* =========================
   N PROJECT — MEMORIES
========================= */

(() => {
    const STORAGE_KEY = "n-project-memories";
    const ALBUM_KEY = "n-project-memory-albums";

    const state = {
        memories: [],
        albums: [],
        filter: "all",
        search: "",
        editingId: null,
        detailId: null,
        pendingDeleteId: null,
        pendingImage: ""
    };

    const $ = (selector) => document.querySelector(selector);
    const escapeHTML = (value = "") => String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    function uid(prefix = "memory") {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return parsed;
        } catch {
            return fallback;
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.memories));
            localStorage.setItem(ALBUM_KEY, JSON.stringify(state.albums));
            return true;
        } catch (error) {
            console.error("Memories storage error:", error);
            return false;
        }
    }

    function normalize() {
        const rawMemories = loadJSON(STORAGE_KEY, []);
        const rawAlbums = loadJSON(ALBUM_KEY, []);

        state.memories = Array.isArray(rawMemories) ? rawMemories.filter(Boolean) : [];
        state.albums = Array.isArray(rawAlbums)
            ? rawAlbums.map(String).map((v) => v.trim()).filter(Boolean)
            : [];

        state.memories = state.memories.map((memory) => ({
            id: memory.id || uid(),
            title: String(memory.title || "Untitled memory"),
            date: memory.date || new Date().toISOString().slice(0, 10),
            album: String(memory.album || "Unsorted"),
            description: String(memory.description || ""),
            image: typeof memory.image === "string" ? memory.image : "",
            createdAt: Number(memory.createdAt) || Date.now(),
            updatedAt: Number(memory.updatedAt) || Number(memory.createdAt) || Date.now()
        }));

        const usedAlbums = state.memories
            .map((memory) => memory.album)
            .filter((album) => album && album !== "Unsorted");

        state.albums = [...new Set([...state.albums, ...usedAlbums])]
            .sort((a, b) => a.localeCompare(b));
    }

    function persist() {
        const saved = saveState();
        if (!saved) showToast("Penyimpanan penuh. Coba foto yang lebih kecil.", "error");
        return saved;
    }

    function formatDate(dateString) {
        const date = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function showToast(message, type = "success") {
        const toast = $("#memoryToast");
        if (!toast) return;
        toast.textContent = message;
        toast.className = `memory-toast show ${type}`;
        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(() => {
            toast.className = "memory-toast";
        }, 2200);
    }

    function addActivitySafe(title, category = "memory") {
        if (typeof window.addActivity === "function") {
            window.addActivity(title, category);
        }
    }

    function getFilteredMemories() {
        const needle = state.search.trim().toLowerCase();
        return state.memories
            .filter((memory) => {
                if (state.filter === "unsorted") return memory.album === "Unsorted";
                if (state.filter === "all") return true;
                return memory.album === state.filter;
            })
            .filter((memory) => {
                if (!needle) return true;
                return [memory.title, memory.description, memory.album]
                    .some((value) => value.toLowerCase().includes(needle));
            })
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    }

    function renderStats() {
        const total = state.memories.length;
        const albumCount = state.albums.length + (state.memories.some((m) => m.album === "Unsorted") ? 1 : 0);
        const photoCount = state.memories.filter((m) => m.image).length;
        const latest = [...state.memories].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];

        $("#memoryTotal").textContent = total;
        $("#memoryAlbums").textContent = albumCount;
        $("#memoryPhotos").textContent = photoCount;
        $("#memoryLatest").textContent = latest ? formatDate(latest.date) : "—";
    }

    function renderFilters() {
        const container = $("#memoryFilters");
        if (!container) return;

        const filters = [
            { value: "all", label: "All" },
            { value: "unsorted", label: "Unsorted" },
            ...state.albums.map((album) => ({ value: album, label: album }))
        ];

        container.innerHTML = filters.map((item) => `
            <button class="memory-filter ${state.filter === item.value ? "active" : ""}" type="button" data-filter="${escapeHTML(item.value)}">
                ${escapeHTML(item.label)}
            </button>
        `).join("");
    }

    function renderAlbumSelect(selected = "Unsorted") {
        const select = $("#memoryAlbum");
        if (!select) return;
        const albums = state.albums;
        select.innerHTML = [
            `<option value="Unsorted">Unsorted</option>`,
            ...albums.map((album) => `<option value="${escapeHTML(album)}">${escapeHTML(album)}</option>`)
        ].join("");
        select.value = albums.includes(selected) || selected === "Unsorted" ? selected : "Unsorted";
    }

    function renderGallery() {
        const grid = $("#memoriesGrid");
        if (!grid) return;
        const memories = getFilteredMemories();

        if (!memories.length) {
            grid.innerHTML = `
                <div class="memory-empty">
                    <div class="memory-empty-icon">📸</div>
                    <div class="memory-empty-title">Belum ada memory di sini</div>
                    <p class="memory-empty-text">Tambah satu momen dulu. Nanti manusia punya arsip digital, bukan cuma galeri 7.000 screenshot.</p>
                    <button class="memories-btn primary" type="button" data-open-add style="margin-top:16px;">+ New Memory</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = memories.map((memory, index) => `
            <article class="memory-card" data-memory-id="${escapeHTML(memory.id)}" style="animation-delay:${Math.min(index * 45, 320)}ms" tabindex="0" role="button" aria-label="Buka ${escapeHTML(memory.title)}">
                ${memory.image
                    ? `<img class="memory-card-image" src="${escapeHTML(memory.image)}" alt="${escapeHTML(memory.title)}" loading="lazy">`
                    : `<div class="memory-card-placeholder" aria-hidden="true">✦</div>`}
                <div class="memory-card-body">
                    <div class="memory-card-meta">
                        <span class="memory-card-album">${escapeHTML(memory.album)}</span>
                        <span class="memory-card-date">${escapeHTML(formatDate(memory.date))}</span>
                    </div>
                    <h3 class="memory-card-title">${escapeHTML(memory.title)}</h3>
                    ${memory.description ? `<p class="memory-card-description">${escapeHTML(memory.description)}</p>` : ""}
                </div>
            </article>
        `).join("");
    }

    function render() {
        renderStats();
        renderFilters();
        renderGallery();
    }

    function setModal(modal, open) {
        if (!modal) return;
        modal.classList.toggle("open", open);
        modal.setAttribute("aria-hidden", String(!open));
        document.body.classList.toggle("modal-open", open);
    }

    function openAddModal() {
        state.editingId = null;
        state.pendingImage = "";
        $("#memoryModalKicker").textContent = "NEW MEMORY";
        $("#memoryModalTitle").textContent = "Add a memory";
        $("#memoryForm").reset();
        $("#memoryDate").value = new Date().toISOString().slice(0, 10);
        renderAlbumSelect("Unsorted");
        $("#memoryPreview").innerHTML = "";
        setModal($("#memoryFormModal"), true);
        window.setTimeout(() => $("#memoryTitle")?.focus(), 160);
    }

    function openEditModal(id) {
        const memory = state.memories.find((item) => item.id === id);
        if (!memory) return;

        state.editingId = id;
        state.pendingImage = memory.image || "";
        $("#memoryModalKicker").textContent = "EDIT MEMORY";
        $("#memoryModalTitle").textContent = "Edit memory";
        $("#memoryTitle").value = memory.title;
        $("#memoryDate").value = memory.date;
        $("#memoryDescription").value = memory.description;
        renderAlbumSelect(memory.album);
        $("#memoryFile").value = "";
        renderPreview(state.pendingImage);
        setModal($("#memoryFormModal"), true);
        window.setTimeout(() => $("#memoryTitle")?.focus(), 160);
    }

    function renderPreview(src) {
        const preview = $("#memoryPreview");
        if (!preview) return;
        preview.innerHTML = src ? `<img src="${escapeHTML(src)}" alt="Preview foto">` : "";
    }

    function openDetail(id) {
        const memory = state.memories.find((item) => item.id === id);
        if (!memory) return;
        state.detailId = id;

        $("#detailMedia").innerHTML = memory.image
            ? `<img src="${escapeHTML(memory.image)}" alt="${escapeHTML(memory.title)}">`
            : `<div class="memory-card-placeholder" aria-hidden="true">✦</div>`;
        $("#detailTitle").textContent = memory.title;
        $("#detailMeta").textContent = `${memory.album} • ${formatDate(memory.date)}`;
        $("#detailDescription").textContent = memory.description || "Tidak ada deskripsi untuk memory ini.";
        setModal($("#memoryDetailModal"), true);
    }

    function openDeleteConfirm(id) {
        const memory = state.memories.find((item) => item.id === id);
        if (!memory) return;
        state.pendingDeleteId = id;
        $("#confirmDeleteName").textContent = memory.title;
        setModal($("#memoryConfirmModal"), true);
    }

    function closeAllModals() {
        document.querySelectorAll(".memory-modal.open").forEach((modal) => setModal(modal, false));
    }

    async function fileToDataURL(file) {
        const maxSize = 8 * 1024 * 1024;
        if (!file || !file.type.startsWith("image/")) throw new Error("Pilih file gambar.");
        if (file.size > maxSize) throw new Error("Foto terlalu besar. Maksimal 8 MB.");

        const readAsDataURL = () => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Foto gagal dibaca."));
            reader.readAsDataURL(file);
        });

        const sourceURL = await readAsDataURL();

        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const maxDimension = 1400;
                const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
                const width = Math.max(1, Math.round(image.naturalWidth * scale));
                const height = Math.max(1, Math.round(image.naturalHeight * scale));
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d", { alpha: false });
                if (!ctx) {
                    resolve(sourceURL);
                    return;
                }
                ctx.drawImage(image, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            image.onerror = () => reject(new Error("Foto gagal diproses."));
            image.src = sourceURL;
        });
    }

    async function handleImageChange(event) {
        try {
            const file = event.target.files?.[0];
            if (!file) return;
            state.pendingImage = await fileToDataURL(file);
            renderPreview(state.pendingImage);
            showToast("Foto siap dipakai.");
        } catch (error) {
            event.target.value = "";
            showToast(error.message || "Foto gagal diproses.", "error");
        }
    }

    async function saveMemory(event) {
        event.preventDefault();

        const title = $("#memoryTitle").value.trim();
        const date = $("#memoryDate").value;
        const album = $("#memoryAlbum").value || "Unsorted";
        const description = $("#memoryDescription").value.trim();

        if (!title || !date) {
            showToast("Judul dan tanggal wajib diisi.", "error");
            return;
        }

        const now = Date.now();
        const existing = state.editingId
            ? state.memories.find((item) => item.id === state.editingId)
            : null;

        const memory = {
            id: existing?.id || uid(),
            title,
            date,
            album,
            description,
            image: state.pendingImage || existing?.image || "",
            createdAt: existing?.createdAt || now,
            updatedAt: now
        };

        if (existing) {
            state.memories = state.memories.map((item) => item.id === memory.id ? memory : item);
            addActivitySafe(`MEMORY UPDATED: ${title}`);
            showToast("Memory diperbarui.");
        } else {
            state.memories = [memory, ...state.memories];
            addActivitySafe(`NEW MEMORY: ${title}`);
            showToast("Memory ditambahkan.");
        }

        if (album !== "Unsorted" && !state.albums.includes(album)) {
            state.albums.push(album);
            state.albums.sort((a, b) => a.localeCompare(b));
        }

        if (!persist()) return;
        closeAllModals();
        state.filter = state.filter === "all" || state.filter === album ? state.filter : "all";
        render();
    }

    function openAlbumModal() {
        $("#memoryAlbumForm")?.reset();
        setModal($("#memoryAlbumModal"), true);
        window.setTimeout(() => $("#memoryAlbumName")?.focus(), 160);
    }

    function saveAlbum(event) {
        event.preventDefault();
        const input = $("#memoryAlbumName");
        const raw = input?.value || "";
        const album = raw.trim().replace(/\s+/g, " ");

        if (!album) {
            showToast("Nama album wajib diisi.", "error");
            input?.focus();
            return;
        }

        if (album.toLowerCase() === "unsorted") {
            showToast("Nama Unsorted sudah dipakai sistem.", "error");
            return;
        }

        if (state.albums.some((item) => item.toLowerCase() === album.toLowerCase())) {
            showToast("Album itu sudah ada.", "error");
            return;
        }

        state.albums.push(album);
        state.albums.sort((a, b) => a.localeCompare(b));

        if (!persist()) return;
        closeAllModals();
        state.filter = album;
        render();
        showToast(`Album “${album}” dibuat.`);
        addActivitySafe(`ALBUM CREATED: ${album}`);
    }

    function confirmDelete() {
        const id = state.pendingDeleteId;
        if (!id) return;
        const memory = state.memories.find((item) => item.id === id);
        state.memories = state.memories.filter((item) => item.id !== id);
        state.pendingDeleteId = null;
        if (!persist()) return;
        closeAllModals();
        render();
        showToast("Memory dihapus.");
        if (memory) addActivitySafe(`MEMORY DELETED: ${memory.title}`);
    }

    function bindEvents() {
        document.addEventListener("click", (event) => {
            const add = event.target.closest("[data-open-add]");
            if (add) {
                openAddModal();
                return;
            }

            const card = event.target.closest("[data-memory-id]");
            if (card) {
                openDetail(card.dataset.memoryId);
                return;
            }

            const filter = event.target.closest("[data-filter]");
            if (filter) {
                state.filter = filter.dataset.filter || "all";
                renderFilters();
                renderGallery();
                return;
            }

            const close = event.target.closest("[data-close-memory-modal]");
            if (close) {
                const modal = close.closest(".memory-modal");
                setModal(modal, false);
                return;
            }

            if (event.target.matches(".memory-modal")) {
                setModal(event.target, false);
                return;
            }

            if (event.target.closest("#detailEdit")) {
                const id = state.detailId;
                closeAllModals();
                openEditModal(id);
                return;
            }

            if (event.target.closest("#detailDelete")) {
                const id = state.detailId;
                openDeleteConfirm(id);
                return;
            }

            if (event.target.closest("#confirmDelete")) {
                confirmDelete();
                return;
            }

            if (event.target.closest("#createAlbumButton")) {
                openAlbumModal();
            }
        });

        $("#memorySearch")?.addEventListener("input", (event) => {
            state.search = event.target.value;
            renderGallery();
        });

        $("#memoryForm")?.addEventListener("submit", saveMemory);
        $("#memoryFile")?.addEventListener("change", handleImageChange);
        $("#memoryAlbumForm")?.addEventListener("submit", saveAlbum);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeAllModals();
        });
    }

    function initialize() {
        if (!$("#memoriesGrid")) return;
        normalize();
        bindEvents();
        render();

        document.querySelector("main")?.classList.add("memory-page-enter");
    }

    document.addEventListener("DOMContentLoaded", initialize);
})();
