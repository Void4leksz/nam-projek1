/* =========================
   APP STATE
========================= */

let currentAppData = null;

/* =========================
   STORED APP DATA
========================= */

function getStoredAppData() {

    const storedData =
        loadAppData();

    if (isValidAppData(storedData)) {
        return storedData;
    }

    const defaultData =
        getAppData();

    saveAppData(
        defaultData
    );

    return defaultData;

}

/* =========================
   APP STATE INITIALIZER
========================= */

function initializeAppState() {

    const appData =
        getStoredAppData();

    if (!isValidAppData(appData)) {
        return false;
    }

    currentAppData =
        appData;

    return true;

}

/* =========================
   APP STATE GETTER
========================= */

function getAppState() {

    return currentAppData;

}

/* =========================
   APP STATE UPDATE
========================= */

function updateAppData(newData) {

    if (!isValidAppData(newData)) {
        return false;
    }

    const saved =
        saveAppData(
            newData
        );

    if (!saved) {
        return false;
    }

    currentAppData =
        newData;

    return true;

}

/* =========================
   APP STATE RESET
========================= */

function resetAppData() {

    const defaultData =
        getAppData();

    if (!isValidAppData(defaultData)) {
        return false;
    }

    const saved =
        saveAppData(
            defaultData
        );

    if (!saved) {
        return false;
    }

    currentAppData =
        defaultData;

    return true;

}

/* =========================
   STORAGE CHECK
========================= */

function hasStoredAppData() {

    const storedData =
        loadAppData();

    return isValidAppData(
        storedData
    );

}

/* =========================
   APP STATE
========================= */

const appState = {

    data: null,

    initialized: false

};

/* =========================
   MODULE HELPERS
========================= */

function getModules() {

    const appState =
        getAppState();

    if (appState) {
        return appState.modules;
    }

    return modules;

}

function getModule(moduleName) {

    const currentModules =
        getModules();

    return currentModules[moduleName] || null;

}

function getModulesByCategory(category) {

    const currentModules =
        getModules();

    return Object.values(
        currentModules
    ).filter(
        (module) => module.category === category
    );

}

function getModuleNav(moduleName) {

    const module =
        getModule(moduleName);

    if (!module) {
        return null;
    }

    return module.nav;

}

function getModuleStatus(moduleName) {

    const module =
        getModule(moduleName);

    if (!module) {
        return null;
    }

    return module.status;

}

function getModuleCount() {

    const currentModules =
        getModules();

    return Object.keys(
        currentModules
    ).length;

}

function getStats() {

    const appState =
        getAppState();

    if (appState) {
        return appState.stats;
    }

    return stats;

}

function getActivity(activityId) {

    const currentActivities =
        getActivities();

    return currentActivities.find(
        (activity) => activity.id === activityId
    ) || null;

}

function getActivities() {

    const appState =
        getAppState();

    if (appState) {
        return appState.activities;
    }

    return activities;

}

function generateActivityId() {

    return `activity-${Date.now()}`;

}

function getActivityTime() {

    const now =
        new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    return `${hours}:${minutes}`;

}

function addActivity(title, category = "system") {

    if (!title) {
        return false;
    }

    if (!isValidActivityCategory(category)) {
        category = "system";
    }

    const appState =
        getAppState();

    if (!isValidAppData(appState)) {
        return false;
    }

    const newActivity = {
        id: generateActivityId(),
        title: title,
        time: getActivityTime(),
        category: category
    };

    const updatedData = {
        ...appState,
        activities: [
            newActivity,
            ...appState.activities
        ].slice(0,5)
    };

    const updated =
        updateAppData(
            updatedData
        );

    if (updated) {
        refreshActivities();
    }

    return updated;

}

function removeActivity(activityId) {

    if (!activityId) {
        return false;
    }

    const appState =
        getAppState();

    if (!isValidAppData(appState)) {
        return false;
    }

    const activityExists =
        appState.activities.some(
            (activity) =>
                activity.id === activityId
        );

    if (!activityExists) {
        return false;
    }

    const updatedData = {
        ...appState,
        activities:
            appState.activities.filter(
                (activity) =>
                    activity.id !== activityId
            )
    };

    const updated =
        updateAppData(
            updatedData
        );

    if (updated) {
        refreshActivities();
    }

    return updated;

}

function clearActivities() {

    const appState =
        getAppState();

    if (!isValidAppData(appState)) {
        return false;
    }

    const updatedData = {
        ...appState,
        activities: []
    };

    const updated =
        updateAppData(
            updatedData
        );

    if (updated) {
        refreshActivities();
    }

    return updated;

}

function updateActivity(activityId, newTitle, newCategory) {

    if (!activityId || !newTitle) {
        return false;
    }

    const appState =
        getAppState();

    if (!isValidAppData(appState)) {
        return false;
    }

    if (
        newCategory &&
        !isValidActivityCategory(newCategory)
    ) {
        newCategory = "system";
    }

    const activityExists =
        appState.activities.some(
            (activity) =>
                activity.id === activityId
        );

    if (!activityExists) {
        return false;
    }

    const updatedData = {
        ...appState,
        activities:
            appState.activities.map(
                (activity) => {

                    if (
                        activity.id !== activityId
                    ) {
                        return activity;
                    }

                    return {
                        ...activity,
                        title: newTitle,
                        category:
                            newCategory ||
                            activity.category
                    };

                }
            )
    };

    const updated =
        updateAppData(
            updatedData
        );

    if (updated) {
        refreshActivities();
    }

    return updated;

}

function refreshActivities() {

    renderActivities();

}

function getUIConfig() {

    const appState =
        getAppState();

    if (appState) {
        return appState.uiConfig;
    }

    return uiConfig;

}

/* TV94 */
function getPKLJournal() {

    const appState =
        getAppState();

    if (
        appState &&
        Array.isArray(
            appState.pklJournal
        )
    ) {
        return appState.pklJournal;
    }

    return pklJournal;
}

function getDefaultAppData() {

    return {
        modules: modules,
        stats: stats,
        activities: activities,
        uiConfig: uiConfig,
        pklJournal: pklJournal
    };

}

/* =========================
   APP DATA VALIDATION
========================= */

function isValidAppData(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {
        return false;
    }

    if (
        !data.modules ||
        typeof data.modules !== "object" ||
        Object.keys(data.modules).length === 0
    ) {
        return false;
    }

    return (
        data.stats &&
        typeof data.stats === "object" &&
        Object.keys(data.stats).length > 0 &&
        Array.isArray(data.activities) &&
        data.uiConfig &&
        typeof data.uiConfig === "object" &&
        Object.keys(data.uiConfig).length > 0
    );

}

function getAppData() {

    return getDefaultAppData();

}

function validateAppData() {

    const appState =
        getAppState();

    return isValidAppData(
        appState
    );

}

function getAppStatus() {

    if (!validateAppData()) {
        return "error";
    }

    return "ready";

}

function getActivitiesByCategory(category) {

    const currentActivities =
        getActivities();

    return currentActivities.filter(
        (activity) => activity.category === category
    );

}

function filterActivitiesByCategory(category) {

    if (!isValidActivityCategory(category)) {
        return [];
    }

    return getActivitiesByCategory(
        category
    );

}

function searchActivities(keyword) {

    if (!keyword) {
        return getActivities();
    }

    const searchKeyword =
        keyword
            .toLowerCase()
            .trim();

    return getActivities().filter(
        (activity) =>
            activity.title
                .toLowerCase()
                .includes(searchKeyword)
    );

}

function queryActivities(
    keyword = "",
    category = ""
) {

    let results =
        getActivities();

    if (keyword) {

        const searchKeyword =
            keyword
                .toLowerCase()
                .trim();

        results =
            results.filter(
                (activity) =>
                    activity.title
                        .toLowerCase()
                        .includes(searchKeyword)
            );

    }

    if (category) {

        if (
            !isValidActivityCategory(
                category
            )
        ) {
            return [];
        }

        results =
            results.filter(
                (activity) =>
                    activity.category === category
            );

    }

    return results;

}

function sortActivitiesByLatest(activityData) {

    if (!Array.isArray(activityData)) {
        return [];
    }

    return [...activityData].sort(
        (a, b) => {

            const timeA =
                Number(
                    a.id.replace(
                        "activity-",
                        ""
                    )
                );

            const timeB =
                Number(
                    b.id.replace(
                        "activity-",
                        ""
                    )
                );

            return timeB - timeA;

        }
    );

}

function getActivityResults(
    keyword = "",
    category = ""
) {

    let results =
        queryActivities(
            keyword,
            category
        );

    results =
        sortActivitiesByLatest(
            results
        );

    return results;

}

function isValidActivityCategory(category) {

    const validCategories = [
        "system",
        "project",
        "memory",
        "focus"
    ];

    return validCategories.includes(
        category
    );

}

function savePKLJournalData(journalData) {

    currentAppData.pklJournal =
        journalData;

    localStorage.setItem(
        "nProjectAppData",
        JSON.stringify(
            currentAppData
        )
    );

    renderPKLJournal();

    const form =
        document.querySelector(
            "#pklJournalForm"
        );

    const button =
        document.querySelector(
            "#addPKLJournal"
        );

    if (form) {
        form.hidden = true;
    }

    if (button) {
        button.hidden = false;
    }

    resetPKLJournalForm();

}

function resetPKLJournalForm() {

    const form =
        document.querySelector(
            "#pklJournalForm"
        );

    if (!form) {
        return;
    }

    form.reset();

    const preview =
        document.querySelector(
            "#pklImagePreview"
        );

    const previewImage =
        document.querySelector(
            "#pklPreviewImage"
        );

    if (preview) {
        preview.hidden = true;
    }

    if (previewImage) {
        previewImage.src = "";
    }

}

function renderPKLJournal() {

    const journalList =
         document.querySelector(
              ".pkl-journal-list"
         );
    if (!journalList)
         return;
    const journalData =
         getPKLJournal();
    journalList.innerHTML =
         "";
    if (!Array.isArray(journalData)
        || journalData.length === 0) {
        journalList.innerHTML =
             '<article class="ui-card pkl-entry"><p class="pkl-activity">Belum ada jurnal PKL.</p></article>';
        return;
    }
    journalData.forEach(
         (entry, index) => {
        const article =
             document.createElement(
                  "article"
             );
        article.className =
             "ui-card pkl-entry pkl-entry-clickable";
        article.tabIndex =
             0;
        article.setAttribute(
             "role", "button"
        );
        article.setAttribute(
             "aria-label",
             `Buka detail jurnal
             ${entry.title || "PKL"}`
        );
        article.innerHTML =
             `<div class="pkl-entry-thumb">
             </div>
             <div class="pkl-entry-content">
             <div class="pkl-entry-header">
             <span class="pkl-date">
             </span>
             <span class="pkl-status">
             </span>
             </div>
             <h3 class="pkl-title">
             </h3>
             <p class="pkl-activity">
             </p>
             <span class="pkl-detail-hint">
             KETUK UNTUK DETAIL ↗
             </span>
             </div>`;
        article.querySelector(
             ".pkl-date"
        )
             .textContent =
             entry.date ||
             "Tanggal belum diisi";
        article.querySelector(
             ".pkl-status"
        )
             .textContent =
             (entry.status ||
              "completed"
             )
             .toUpperCase();
        article.querySelector(
             ".pkl-title"
        )
             .textContent =
             entry.title ||
             "Tanpa judul";
        article.querySelector(
             ".pkl-activity"
        ).textContent =
             entry.activity ||
             "";
        const thumb =
             article.querySelector(
                  ".pkl-entry-thumb"
             );
        if (entry.image) {
             const img =
                  document.createElement(
                       "img"
                  );
             img.src =
                  entry.image;
             img.alt =
                  "Foto dokumentasi";
             thumb.appendChild(img);
        }
        else thumb.classList.add(
             "pkl-no-image"
        );
        const open =
             () =>
                  openPKLJournalDetail(index);
        article.addEventListener(
             "click",
             open
        );
        article.addEventListener(
             "keydown",
             e => {
                  if (e.key === "Enter" ||
                      e.key === " "
                     ) {
                       e.preventDefault();
                       open();
                  }
             }
        );
        journalList.appendChild(article);
    });
     updatePKLJournalStats();
     renderDashboardOverview();
}

let activePKLJournalIndex = null;
let isEditingPKLJournal = false;
let activePKLCategory = null;

function showPKLModal(message, options = {}) {
    const modal =
         document.querySelector(
              "#pklMessageModal"
         );
    if (!modal)
         return
              Promise.resolve(
                   false
              );
    modal.querySelector(
         ".pkl-message-text"
    )
         .textContent =
         message;
    const cancel =
         modal.querySelector(
              "#pklMessageCancel"
         );
    const confirm =
         modal.querySelector(
              "#pklMessageConfirm"
         );
    cancel.hidden =
         !options.confirm;
    confirm.textContent =
         options.confirm ? (
              options.confirmText ||
              "YA, LANJUTKAN"
         ) : "MENGERTI";
    modal.hidden =
         false;
    document.body.classList.add(
         "pkl-detail-open"
    );
    return new Promise(
         resolve => {
         const finish =
              value => {
                   modal.hidden =
                        true;
                   document.body.classList.remove(
                        "pkl-detail-open"
                   );
                   cancel.removeEventListener(
                        "click",
                        onCancel
                   );
                   confirm.removeEventListener(
                        "click",
                        onConfirm
                   );
                   resolve(value);
              };
        const onCancel =
             () => finish(
                  false
             );
        const onConfirm =
             () => finish(
                  true
             );
        cancel.addEventListener(
             "click",
             onCancel
        );
        confirm.addEventListener(
             "click",
             onConfirm
        );

      }

   );
}

function deletePKLJournal() {
    if (activePKLJournalIndex === null)
         return;
    showPKLModal(
         "Hapus jurnal ini?\nJurnal yang dihapus tidak bisa dikembalikan!!!. Yakin ingin melanjutkan?",
         {
              confirm:
                   true,
              confirmText:
                   "YA, HAPUS"
         }
    )
         .then(
              confirmed => {
        if (!confirmed)
             return;
        const journalData =
             getPKLJournal();
        if (!Array.isArray(
             journalData
        ) ||
            !journalData[
            activePKLJournalIndex
            ]
           )
             return;
        journalData.splice(
             activePKLJournalIndex, 1
        );
        currentAppData.pklJournal =
             journalData;
        localStorage.setItem(
             "nProjectAppData",
             JSON.stringify(
                  currentAppData
             )
        );
        renderPKLJournal();
        const detail =
             document.querySelector(
                  "#pklJournalDetail"
             );
        if (detail)
             detail.hidden =
                  true;
        document.body.classList.remove(
             "pkl-detail-open"
        );
        activePKLJournalIndex = null;
    }

  );

}

function openPKLJournalDetail(index) {
    const entry =
         getPKLJournal()[index];
    const modal =
         document.querySelector(
              "#pklJournalDetail"
         );
    if (!entry || !modal)
         return;
    activePKLJournalIndex = index;
    const image =
         modal.querySelector(
              ".pkl-detail-image"
         );
    image.innerHTML = "";
    if (entry.image) {
         const img =
              document.createElement(
                   "img"
              );
         img.src =
              entry.image;
         img.alt =
              "Foto dokumentasi jurnal";
         image.appendChild(img);
         image.hidden =
              false;
    }
    else image.hidden =
         true;
    modal.querySelector(
         ".pkl-detail-date"
    )
         .textContent =
         entry.date ||
         "Tanggal belum diisi";
    modal.querySelector(
         ".pkl-detail-status"
    )
         .textContent = (
              entry.status || "completed"
         )
         .toUpperCase();
    modal.querySelector(
         ".pkl-detail-title"
    )
         .textContent =
         entry.title ||
         "Tanpa judul";
    modal.querySelector(
         ".pkl-detail-activity"
    )
         .textContent =
         entry.activity ||
         "Belum ada keterangan kegiatan.";
    modal.querySelector(
         ".pkl-detail-learning"
    )
         .textContent =
         entry.learning ||
         "Belum ada catatan pembelajaran.";
    modal.hidden =
         false;
    document.body.classList.add(
         "pkl-detail-open"
    );
}

function editPKLJournal() {
    if (activePKLJournalIndex === null)
         return;

    const journalData =
         getPKLJournal();
    const entry =
         journalData[activePKLJournalIndex];

    if (!entry)
         return;

    const form =
         document.querySelector(
              "#pklJournalForm"
         );
    const addButton =
         document.querySelector(
              "#addPKLJournal"
         );
    const detail =
         document.querySelector(
              "#pklJournalDetail"
         );
    const category = document.querySelector(
         "#pklCategory"
    );

    if (category) {
         category.value =
              entry.category ||
              "other";
    }

    const date =
         document.querySelector(
              "#pklDate"
         );
    const title =
         document.querySelector(
              "#pklTitle"
         );
    const activity =
         document.querySelector(
              "#pklActivity"
         );
    const learning =
         document.querySelector(
              "#pklLearning"
         );

    const preview =
         document.querySelector(
              "#pklImagePreview"
         );
    const previewImage =
         document.querySelector(
              "#pklPreviewImage"
         );

    const saveButton =
         document.querySelector(
              "#savePKLJournal"
         );

    if (
         !form ||
         !date ||
         !title ||
         !activity ||
         !learning
    )
         return;

    isEditingPKLJournal =
         true;

    date.value =
         entry.date || "";
    title.value =
         entry.title || "";
    activity.value =
         entry.activity || "";
    learning.value =
         entry.learning || "";

    if (entry.image) {
        previewImage.src =
             entry.image;
        preview.hidden =
             false;
    } else {
        previewImage.src =
             "";
        preview.hidden =
             true;
    }

    if (saveButton) {
        saveButton.textContent =
             "UPDATE";
    }

    form.hidden =
         false;

    if (addButton) {
        addButton.hidden =
             true;
    }

    if (detail) {
        detail.hidden =
             true;
    }

    document.body.classList.remove(
         "pkl-detail-open"
    );
}

function searchPKLJournal(keyword) {
    const journalList =
         document.querySelector(
              ".pkl-journal-list"
         );
    if (!journalList)
         return;

    const query =
         keyword.trim().toLowerCase();
    const journalData =
         getPKLJournal();

    const filteredData =
         journalData.filter(
              entry => {
        const searchableText = [
            entry.title,
            entry.activity,
            entry.learning,
            entry.date
        ].join(" ").toLowerCase();

        return
             searchableText.includes(query);
             }
         );

    journalList.innerHTML = "";

    if (filteredData.length === 0) {
        journalList.innerHTML = `
            <article class="ui-card pkl-entry">
                <p class="pkl-activity">
                    JURNAL TIDAK DITEMUKAN
                </p>
            </article>
        `;
        return;
    }

    filteredData.forEach(entry => {
        const originalIndex =
             journalData.findIndex(
            item =>
                 item.id === entry.id
        );

        const article =
             document.createElement(
                  "article"
             );
        article.className =
             "ui-card pkl-entry pkl-entry-clickable";
        article.tabIndex =
             0;
        article.setAttribute(
             "role", "button"
        );

        article.innerHTML = `
            <div class="pkl-entry-thumb"></div>
            <div class="pkl-entry-content">
                <div class="pkl-entry-header">
                    <span class="pkl-date"></span>
                </div>
                <h3 class="pkl-title"></h3>
                <p class="pkl-activity"></p>
                <span class="pkl-detail-hint">
                    KETUK UNTUK DETAIL ↗
                </span>
            </div>
        `;

        article.querySelector(
             ".pkl-date"
        )
             .textContent =
            entry.date ||
             "Tanggal belum diisi";

        article.querySelector(
             ".pkl-title"
        )
             .textContent =
            entry.title ||
             "Tanpa judul";

        article.querySelector(
             ".pkl-activity"
        )
             .textContent =
            entry.activity ||
             "";

        const thumb =
             article.querySelector(
                  ".pkl-entry-thumb"
             );

        if (entry.image) {
            const img =
                 document.createElement(
                      "img"
                 );
            img.src =
                 entry.image;
            img.alt =
                 "Foto dokumentasi";
            thumb.appendChild(img);
        } else {
            thumb.classList.add(
                 "pkl-no-image"
            );
        }

        const open =
             () =>
                  openPKLJournalDetail(originalIndex);

        article.addEventListener(
             "click",
             open
        );

        article.addEventListener(
             "keydown",
             event => {
            if (event.key ===
                "Enter" ||
                event.key === " "
               ) {
                event.preventDefault();
                open();
            }
          }
        );

        journalList.appendChild(article);
      }
    );
     updatePKLJournalStats();
}

function updatePKLJournalStats() {
    const journalData =
         getPKLJournal();

    const data =
         Array.isArray(journalData)
        ? journalData
        : [];

    const totalJournal =
         data.length;

    const totalActivity =
         data.filter(
              entry =>
        entry.activity &&
                   entry.activity.trim() !== ""
    )
         .length;

    const totalPhotos =
         data.filter(
              entry =>
        entry.image &&
                   entry.image.trim() !== ""
    )
         .length;

    const latestJournal =
         data.length > 0
        ? data[0].date ||
         "-"
        : "-";

    const totalJournalElement =
        document.querySelector(
             "#pklTotalJournal"
        );

    const totalActivityElement =
        document.querySelector(
             "#pklTotalActivity"
        );

    const totalPhotosElement =
        document.querySelector(
             "#pklTotalPhotos"
        );

    const latestJournalElement =
        document.querySelector(
             "#pklLatestJournal"
        );

    if (totalJournalElement) {
        totalJournalElement.textContent =
             totalJournal;
    }

    if (totalActivityElement) {
        totalActivityElement.textContent =
             totalActivity;
    }

    if (totalPhotosElement) {
        totalPhotosElement.textContent =
             totalPhotos;
    }

    if (latestJournalElement) {
        latestJournalElement.textContent =
             latestJournal;
    }
}

function renderPKLFolders() {

    const folderList =
        document.querySelector(
             "#pklFolderList"
        );

    if (!folderList)
         return;

    const journalData =
        getPKLJournal();

    const categories = {};

    journalData.forEach(
         entry => {

        const category =
            entry.category || "other";

        if (!categories[category]) {
            categories[category] = 0;
        }

        categories[category]++;
    });

    folderList.innerHTML = "";

    const categoryNames = {

        network: "NETWORK",

        "web-development":
            "WEB DEVELOPMENT",

        router: "ROUTER",

        html: "HTML",

        css: "CSS",

        javascript:
            "JAVASCRIPT",

        other: "LAINNYA"
    };

    Object.keys(categories).forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "pkl-folder-card";

        button.dataset.category =
            category;

        button.innerHTML = `
            <span class="pkl-folder-icon">
                □
            </span>

            <span class="pkl-folder-name">
                ${categoryNames[category] || category}
            </span>

            <span class="pkl-folder-count">
                ${categories[category]} JURNAL
            </span>
        `;

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".pkl-folder-card"
                    )
                    .forEach(card => {
                        card.classList.remove(
                            "active"
                        );
                    });

                button.classList.add("active");

                renderPKLCategory(
                    category
                );
            }
        );

        folderList.appendChild(button);

    });
}

function renderPKLCategory(category) {
    activePKLCategory = category;
    filterPKLJournal();
}

function renderFilteredPKLJournal(filteredData) {
    const journalList =
         document.querySelector(
              ".pkl-journal-list"
         );
    if (!journalList)
         return;
    const allEntries =
         getPKLJournal();
    journalList.innerHTML = "";
    if (!filteredData.length) {
        journalList.innerHTML =
             '<article class="ui-card pkl-entry pkl-filter-empty"><p class="pkl-activity">Tidak ada jurnal yang cocok dengan pilihan ini.</p></article>';
        return;
    }
    filteredData.forEach(
         entry => {
        const index =
             allEntries.indexOf(entry);
        const article =
             document.createElement(
                  "article"
             );
        article.className =
             "ui-card pkl-entry pkl-entry-clickable";
        article.tabIndex =
             0;
        article.setAttribute(
             "role", "button"
        );
        article.innerHTML =
             '<div class="pkl-entry-thumb"></div><div class="pkl-entry-content"><div class="pkl-entry-header"><span class="pkl-date"></span><span class="pkl-status"></span></div><h3 class="pkl-title"></h3><p class="pkl-activity"></p><span class="pkl-detail-hint">KETUK UNTUK DETAIL ↗</span></div>';
        article.querySelector(
             ".pkl-date"
        )
             .textContent =
             entry.date ||
             "Tanggal belum diisi";
        article.querySelector(
             ".pkl-status"
        )
             .textContent = (
                  entry.status ||
                  "completed"
             )
             .toUpperCase();
        article.querySelector(
             ".pkl-title"
        )
             .textContent =
             entry.title ||
             "Tanpa judul";
        article.querySelector(
             ".pkl-activity"
        ).textContent =
             entry.activity ||
             "";
        const thumb =
             article.querySelector(
                  ".pkl-entry-thumb"
             );
        if (entry.image) {
             const img =
                  document.createElement(
                       "img"
                  );
             img.src =
                  entry.image;
             img.alt =
                  "Foto dokumentasi";
             thumb.appendChild(img);
        }
        else thumb.classList.add(
             "pkl-no-image"
        );
        const open =
             () =>
                  openPKLJournalDetail(index);
        article.addEventListener(
             "click",
             open
        );
        article.addEventListener(
             "keydown",
             e => {
                  if (e.key ===
                      "Enter" ||
                      e.key ===
                      " "
                     ) {
                       e.preventDefault();
                       open();
                  }
             }
        );
        journalList.appendChild(article);
    });
    updatePKLJournalStats();
}

function filterPKLJournal() {
    const searchInput = document.querySelector("#pklSearchInput");
    const keyword = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const fromInput = document.querySelector("#pklFilterFrom");
    const toInput = document.querySelector("#pklFilterTo");

    const from = fromInput ? fromInput.value : "";
    const to = toInput ? toInput.value : "";

    const journalData = getPKLJournal();

    const filteredData = journalData.filter(entry => {
        const category = entry.category || "other";
        const date = entry.date || "";

        const matchesCategory =
            activePKLCategory === null ||
            category === activePKLCategory;

        const matchesFrom = !from || date >= from;
        const matchesTo = !to || date <= to;

        const searchableText = [
            entry.title,
            entry.activity,
            entry.learning,
            entry.date,
            entry.category
        ].join(" ").toLowerCase();

        const matchesKeyword = searchableText.includes(keyword);

        return (
            matchesCategory &&
            matchesFrom &&
            matchesTo &&
            matchesKeyword
        );
    });

    renderFilteredPKLJournal(filteredData);
}

/* =========================
   DASHBOARD OVERVIEW
========================= */

function renderDashboardOverview() {

    const currentStats =
        getStats() || {};

    const projectsCount =
        document.getElementById("projectsCount");

    const journalsCount =
        document.getElementById("notesCount");

    const progressValue =
        document.getElementById("progressValue");

    const moduleCount =
        document.getElementById("moduleCount");

    const journalData =
        getPKLJournal();

    const journalTotal =
        Array.isArray(journalData) ? journalData.length : 0;

    const currentModules =
        Object.values(getModules() || {});

    const activeModules =
        currentModules.filter(
            (module) => module.status === "active"
        ).length;

    const plannedModules =
        currentModules.filter(
            (module) => module.status === "planned"
        ).length;

    if (projectsCount) {
        projectsCount.textContent =
            String(Number(currentStats.projects) || 0).padStart(2, "0");
    }

    if (journalsCount) {
        journalsCount.textContent =
            String(journalTotal).padStart(2, "0");
    }

    if (progressValue) {
        const progress =
            Math.min(100, Math.max(0, Number(currentStats.progress) || 0));

        progressValue.textContent =
            `${progress}%`;
    }

    if (moduleCount) {
        moduleCount.textContent =
            String(currentModules.length).padStart(2, "0");
    }

    const moduleStatusSummary =
        document.getElementById("moduleStatusSummary");

    const journalSummary =
        document.getElementById("journalSummary");

    const lastActivitySummary =
        document.getElementById("lastActivitySummary");

    if (moduleStatusSummary) {
        moduleStatusSummary.textContent =
            `${activeModules} ACTIVE · ${plannedModules} PLANNED`;
    }

    if (journalSummary) {
        journalSummary.textContent =
            `${journalTotal} ${journalTotal === 1 ? "ENTRY" : "ENTRIES"}`;
    }

    if (lastActivitySummary) {
        const latestActivity = getActivities()[0];
        lastActivitySummary.textContent =
            latestActivity
                ? latestActivity.title
                : "NO ACTIVITY";
    }

}

/* =========================
   N PROJECT
   MAIN SCRIPT
========================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("N PROJECT initialized.");

    initializeAppState();
    updatePKLJournalStats();

    const deleteButton = document.querySelector("#deletePKLJournal");
    if (deleteButton) deleteButton.addEventListener("click", deletePKLJournal);
    const editButton = document.querySelector("#editPKLJournal");

if (editButton) {
    editButton.addEventListener("click", editPKLJournal);
}
     const pklSearchInput = document.querySelector("#pklSearchInput");

if (pklSearchInput) {
    pklSearchInput.addEventListener("input", () => {
        filterPKLJournal();
    });
}
     const pklViewAll =
    document.querySelector("#pklViewAll");

const pklViewFolder =
    document.querySelector("#pklViewFolder");

const pklFolderPanel =
    document.querySelector("#pklFolderPanel");

if (pklViewAll) {

    pklViewAll.addEventListener(
        "click",
        () => {
             activePKLCategory = null;

            pklViewAll.classList.add("active");

            if (pklViewFolder) {
                pklViewFolder.classList.remove(
                    "active"
                );
            }

            if (pklFolderPanel) {
                pklFolderPanel.hidden = true;
            }

            renderPKLJournal();

        }
    );

}
     if (pklViewFolder) {

    pklViewFolder.addEventListener(
        "click",
        () => {

            pklViewFolder.classList.add(
                "active"
            );

            if (pklViewAll) {
                pklViewAll.classList.remove(
                    "active"
                );
            }

            if (pklFolderPanel) {
                pklFolderPanel.hidden = false;
            }

            renderPKLFolders();

        }
    );

     }
    const messageClose =
         document.querySelector("#pklMessageConfirm");
    if (messageClose) messageClose.addEventListener(
         "click",
         () => {
              const m = document.querySelector("#pklMessageModal"); if (m && !m.hidden) { m.hidden =
                   true; document.body.classList.remove("pkl-detail-open");
              }
         });

    const closePKLDetail = document.querySelector("#closePKLDetail");
    if (closePKLDetail) closePKLDetail.addEventListener(
         "click",
         () => {
              document.querySelector("#pklJournalDetail")
                   .hidden =
                   true;
              document.body.classList.remove("pkl-detail-open");
         });

     let activeActivityCategory = "all";

     const activitySearch =
         document.querySelector(
             "#activitySearch"
         );

     if (activitySearch) {

         activitySearch.addEventListener(
             "input",
             () => {

                 const keyword =
                     activitySearch.value;

                 const trimmedKeyword =
                     keyword.trim();

                 const category =
                     activeActivityCategory === "all"
                         ? ""
                         : activeActivityCategory;

                 const results =
                     getActivityResults(
                         trimmedKeyword,
                         category
                     );

                 renderActivities(
                     results
                 );

             }
         );

     }

     const activityFilters =
         document.querySelectorAll(
             ".activity-filter"
         );

     activityFilters.forEach(
         (filterButton) => {

             filterButton.addEventListener(
                 "click",
                 () => {

                      activityFilters.forEach(
                          (button) => {
                              button.classList.remove("active");
                          }
                      );

                      filterButton.classList.add("active");

                     const category =
                         filterButton.dataset.category;

                      activeActivityCategory =
                         category;

                     let results;

                     if (category === "all") {

                         results =
                             getActivityResults();

                     } else {

                         results =
                             getActivityResults(
                                 "",
                                 category
                             );

                     }

                     renderActivities(
                         results
                     );

                 }
             );

         }
     );

    const currentActivities =
        getActivities();

    const openedActivities =
        currentActivities.filter(
            (activity) =>
                activity.title === "N PROJECT OPENED"
        );

    if (openedActivities.length === 0) {

        addActivity(
            "N PROJECT OPENED",
            "system"
        );

    } else if (openedActivities.length > 1) {

        const firstOpenedActivity =
            openedActivities[0];

        const cleanedActivities =
            currentActivities.filter(
                (activity) =>
                    activity.title !== "N PROJECT OPENED" ||
                    activity.id === firstOpenedActivity.id
            );

        updateAppData({
            ...getAppState(),
            activities: cleanedActivities
        });

    }

     const openPKLFromHero =
         document.querySelector("#openPKLFromHero");

     if (openPKLFromHero) {
         openPKLFromHero.addEventListener("click", () => {
             const journal = document.querySelector(".pkl-section");
             if (journal) {
                 journal.scrollIntoView({ behavior: "smooth", block: "start" });
             }
         });
     }

     const openAppsFromHero =
         document.querySelector("#openAppsFromHero");

     if (openAppsFromHero) {
         openAppsFromHero.addEventListener("click", () => {
             const apps = document.querySelector("#appsSection");
             if (apps) {
                 apps.scrollIntoView({ behavior: "smooth", block: "start" });
             }
         });
     }

     const addPKLJournalButton =
         document.querySelector("#addPKLJournal");

     const pklJournalForm =
         document.querySelector("#pklJournalForm");

     const cancelPKLJournal =
         document.querySelector("#cancelPKLJournal");

     if (
         addPKLJournalButton &&
         pklJournalForm
     ) {

         addPKLJournalButton.addEventListener(
             "click",
             () => {

                 pklJournalForm.hidden = false;

                 addPKLJournalButton.hidden = true;

             }
         );

     }

     if (
         cancelPKLJournal &&
         pklJournalForm &&
         addPKLJournalButton
     ) {

         cancelPKLJournal.addEventListener(
             "click",
             () => {

                 pklJournalForm.hidden = true;
                 addPKLJournalButton.hidden = false;

                 isEditingPKLJournal = false;
                 activePKLJournalIndex = null;

                 const saveButton =
                     document.querySelector("#savePKLJournal");

                 if (saveButton) {
                     saveButton.textContent = "SIMPAN";
                 }

                 resetPKLJournalForm();
             }
         );

     }

     const pklImageInput =
         document.querySelector("#pklImage");

     const pklImagePreview =
         document.querySelector("#pklImagePreview");

     const pklPreviewImage =
         document.querySelector("#pklPreviewImage");

     if (
         pklImageInput &&
         pklImagePreview &&
         pklPreviewImage
     ) {

         pklImageInput.addEventListener(
             "change",
             () => {

                 const file =
                     pklImageInput.files[0];

                 if (!file) {
                     pklImagePreview.hidden = true;
                     pklPreviewImage.src = "";
                     return;
                 }

                 const reader =
                     new FileReader();

                 reader.addEventListener(
                     "load",
                     () => {

                         pklPreviewImage.src =
                             reader.result;

                         pklImagePreview.hidden =
                             false;

                     }
                 );

                 reader.readAsDataURL(file);

             }
         );

     }

     const savePKLJournal =
         document.querySelector("#savePKLJournal");

     if (savePKLJournal) {

         savePKLJournal.addEventListener(
             "click",
             () => {

                 const date =
                     document.querySelector("#pklDate").value;

                 const title =
                     document.querySelector("#pklTitle").value.trim();

                 const activity =
                     document.querySelector("#pklActivity").value.trim();

                 const learning =
                     document.querySelector("#pklLearning").value.trim();

                 const imageInput =
                     document.querySelector("#pklImage");

                 const file =
                     imageInput.files[0];

                 if (
                     !date ||
                     !title ||
                     !activity ||
                     !learning
                 ) {

                     showPKLModal(
                         "Lengkapi semua data jurnal terlebih dahulu."
                     );

                     return;

                 }

                 const journalData =
                     getPKLJournal();

                 /* =========================
                    MODE EDIT
                 ========================= */

                 if (
                     isEditingPKLJournal &&
                     activePKLJournalIndex !== null &&
                     journalData[activePKLJournalIndex]
                 ) {

                     const oldJournal =
                         journalData[activePKLJournalIndex];

                     const updatedJournal = {
                         ...oldJournal,

                         date: date,
                         title: title,
                         activity: activity,
                         learning: learning,
                         category: document.querySelector("#pklCategory").value,
                     };

                     if (file) {

                         const reader =
                             new FileReader();

                         reader.addEventListener(
                             "load",
                             () => {

                                 updatedJournal.image =
                                     reader.result;

                                 journalData[
                                     activePKLJournalIndex
                                 ] = updatedJournal;

                                 savePKLJournalData(
                                     journalData
                                 );

                                 isEditingPKLJournal = false;
                                 activePKLJournalIndex = null;

                             }
                         );

                         reader.readAsDataURL(file);

                     } else {

                         journalData[
                             activePKLJournalIndex
                         ] = updatedJournal;

                         savePKLJournalData(
                             journalData
                         );

                         isEditingPKLJournal = false;
                         activePKLJournalIndex = null;

                     }

                     return;
                 }

                 /* =========================
                    MODE TAMBAH
                 ========================= */

                 const newJournal = {

                     id:
                         "pkl-" +
                         Date.now(),

                     date:
                         date,

                     title:
                         title,

                     activity:
                         activity,

                     learning:
                         learning,

                     category:
                         document.querySelector("#pklCategory").value,

                     status:
                         "completed",

                     image:
                         ""
                 };

                 if (file) {

                     const reader =
                         new FileReader();

                     reader.addEventListener(
                         "load",
                         () => {

                             newJournal.image =
                                 reader.result;

                             journalData.unshift(
                                 newJournal
                             );

                             savePKLJournalData(
                                 journalData
                             );

                         }
                     );

                     reader.readAsDataURL(file);

                 } else {

                     journalData.unshift(
                    newJournal
                     );

                     savePKLJournalData(
                         journalData
                     );

                 }

             }
         );

     }

    /* =========================
       MODULE CARD RENDERER
    ========================= */

    function renderModuleCard(card, module) {

        const iconElement =
            card.querySelector(".app-card-icon");

        const titleElement =
            card.querySelector(".app-card-title");

        const descriptionElement =
            card.querySelector(".app-card-description");

        const statusElement =
            card.querySelector(".app-card-status");

        if (iconElement) {
            iconElement.textContent =
                module.icon;
        }

        if (titleElement) {
            titleElement.textContent =
                module.name;
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                module.description;
        }

        if (statusElement) {

            statusElement.classList.remove(
                "status-active",
                "status-planned"
            );

            statusElement.classList.add(
                `status-${module.status}`
            );

            statusElement.textContent =
                module.status.toUpperCase();

        }

          const isInsidePages =
              window.location.pathname.includes("/pages/");

          if (isInsidePages) {

             const fileName =
                 module.url.split("/").pop();

             card.href =
                 fileName;

          } else {

             card.href =
                 module.url;

          }

    }

     function getModuleCards() {

       return document.querySelectorAll(
            "[data-module]"
       );

     }

    /* =========================
       MODULE CARD RENDER
    ========================= */

    function renderModuleCards() {

        const moduleCards =
            getModuleCards();

        moduleCards.forEach((card) => {

            const moduleName =
                card.dataset.module;

            const module =
                getModule(moduleName);

            if (!module) {
                return;
            }

            renderModuleCard(
                card,
                module
            );

            console.log(
                `Module detected: ${module.name} (${module.status})`
            );

        });

    }

     /* =========================
        APP RENDERER
     ========================= */

     function renderApp() {

         const appState =
             getAppState();

         if (!isValidAppData(appState)) {
             return false;
         }

         renderUI();

         renderModuleCards();

          return true;

          }

          renderApp();

     function renderStats() {
         renderDashboardOverview();
     }

     /* =========================
        ACTIVITY RENDER
     ========================= */

     function renderActivities(activityData = null) {

         const currentActivities =
             activityData || getActivities();

         const activityList =
             document.querySelector(".activity-list");

         if (!activityList) {
             return;
         }

         activityList.innerHTML = "";

          if (currentActivities.length === 0) {

              const emptyState =
                  document.createElement("div");

              emptyState.className =
                  "ui-card activity-empty";

              emptyState.innerHTML = `
                  <span class="activity-title">
                      NO RECENT ACTIVITY
                  </span>

                  <span class="activity-time">
                      There are no activities yet.
                  </span>
              `;

              activityList.appendChild(
                  emptyState
              );

              return;
          }

         currentActivities.forEach((activity) => {

             const activityItem =
                 document.createElement("div");

             activityItem.className =
                 "ui-card activity-item";

             activityItem.dataset.activity =
                 activity.id;

             activityItem.dataset.category =
                 activity.category;

             activityItem.classList.add(
                 `activity-${activity.category}`,
                 "dashboard-animated-item"
              );

             activityItem.style.setProperty(
                 "--stagger",
                 `${Math.min(activityList.children.length, 5) * 70}ms`
             );

             const content =
                 document.createElement("div");

             content.className =
                 "activity-content";

             const title =
                 document.createElement("span");

             title.className =
                 "activity-title";

             title.textContent =
                 activity.title;

             const time =
                 document.createElement("span");

             time.className =
                 "activity-time";

             time.textContent =
                 activity.time;

             content.appendChild(title);
             content.appendChild(time);
             activityItem.appendChild(content);
             activityList.appendChild(activityItem);

         });

     }

     /* =========================
        UI CONFIG RENDER
     ========================= */

     function renderUIConfig() {

          const currentUIConfig =
              getUIConfig();

         const statsLabel =
             document.getElementById("statsLabel");

         const statsTitle =
             document.getElementById("statsTitle");

         const activityLabel =
             document.getElementById("activityLabel");

         const activityTitle =
             document.getElementById("activityTitle");

         if (statsLabel) {

             statsLabel.textContent =
                 currentUIConfig.stats.label;

         }

         if (statsTitle) {

             statsTitle.textContent =
                 currentUIConfig.stats.title;

         }

         if (activityLabel) {

             activityLabel.textContent =
                 currentUIConfig.activity.label;

         }

         if (activityTitle) {

             activityTitle.textContent =
                 currentUIConfig.activity.title;

         }

     }

     /* =========================
        MAIN UI RENDERER
     ========================= */

     function renderUI() {

         renderStats();

         renderActivities();

         renderPKLJournal();

         renderUIConfig();

         requestAnimationFrame(() => {
             document.body.classList.add("dashboard-ready");
             applyDashboardMotion();
         });

     }

    /* =========================
       SYSTEM CLOCK
    ========================= */

    function renderSystemClock() {

        const systemClock =
            document.getElementById("systemClock");

        if (!systemClock) {
            return;
        }

        function updateClock() {

            const now = new Date();

            const hours =
                String(now.getHours()).padStart(2, "0");

            const minutes =
                String(now.getMinutes()).padStart(2, "0");

            systemClock.textContent =
                `${hours}:${minutes}`;

        }

        updateClock();

        setInterval(
            updateClock,
            1000
        );

    }

    renderSystemClock();

});

/* =========================
   DASHBOARD MOTION FIX
========================= */

function applyDashboardMotion() {
    const sections = document.querySelectorAll(
        ".dashboard-section"
    );

    const animatedItems = document.querySelectorAll(
        ".dashboard-section .app-card, " +
        ".dashboard-section .activity-item"
    );

    sections.forEach((section, index) => {
        section.style.setProperty(
            "--section-delay",
            `${index * 70}ms`
        );
    });

    animatedItems.forEach((item, index) => {
        item.classList.add("dashboard-animated-item");

        item.style.setProperty(
            "--stagger",
            `${index * 45}ms`
        );
    });
}
