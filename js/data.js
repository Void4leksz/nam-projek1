/* =========================
   N PROJECT
   DATA
========================= */

/* =========================
   MODULE REGISTRY
========================= */

const modules = {

    life: {
        name: "Life OS",
        status: "active",
        category: "main",
        nav: "life",
        description: "Organize tasks, goals and personal progress.",
        icon: "🧠",
        url: "pages/life.html"
    },

    memories: {
        name: "Memories",
        status: "active",
        category: "main",
        nav: "memories",
        description: "Keep photos, stories and moments that matter.",
        icon: "📸",
        url: "pages/memories.html"
    },

    developer: {
        name: "Developer",
        status: "active",
        category: "main",
        nav: "developer",
        description: "Build projects, experiments and digital creations.",
        icon: "💻",
        url: "pages/developer.html"
    },

    knowledge: {
        name: "Knowledge",
        status: "active",
        category: "more",
        nav: "more",
        description: "Store notes, ideas and things worth learning.",
        icon: "📚",
        url: "pages/knowledge.html"
    },

    gaming: {
        name: "Gaming",
        status: "planned",
        category: "more",
        nav: "more",
        description: "Track games, stats and personal progress.",
        icon: "🎮",
        url: "pages/gaming.html"
    },

    music: {
        name: "Music",
        status: "planned",
        category: "more",
        nav: "more",
        description: "Keep artists, albums and playlists in one place.",
        icon: "🎵",
        url: "pages/music.html"
    },

    achievements: {
        name: "Achievements",
        status: "planned",
        category: "more",
        nav: "more",
        description: "Track milestones, XP and personal progress.",
        icon: "🏆",
        url: "pages/achievements.html"
    }

};

/* =========================
   STATS DATA
========================= */

const stats = {

    projects: 7,

    notes: 12,

    progress: 85

};

/* =========================
   ACTIVITY DATA
========================= */

const activities = [

    {
        id: "project-structure",
        title: "PROJECT STRUCTURE UPDATED",
        time: "Just now",
        category: "system"
    },

    {
        id: "new-memory",
        title: "NEW MEMORY ADDED",
        time: "Today",
        category: "memory"
    },

    {
        id: "focus-session",
        title: "FOCUS SESSION COMPLETED",
        time: "Earlier today",
        category: "productivity"
    }

];

/* =========================
   UI CONFIGURATION
========================= */

const uiConfig = {

    stats: {
        label: "OVERVIEW",
        title: "Quick Stats"
    },

    activity: {
        label: "ACTIVITY",
        title: "Recent Activity"
    }

};

/* =========================
   PKL JOURNAL DATA
========================= */

const pklJournal = [
    {
        id: "pkl-001",
        date: "2026-09-18",
        title: "Setup Router Ruijie",
        activity:
            "Melakukan setup router Ruijie sesuai arahan.",
        learning:
            "Mempelajari konfigurasi dasar router dan jaringan.",
        status: "completed"
    }
];
