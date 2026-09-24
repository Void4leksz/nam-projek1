/* =========================
   N PROJECT
   NAVIGATION
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       GET CURRENT PAGE
    ========================= */

    function getCurrentPage() {

        const path =
            window.location.pathname;

        const fileName =
            path.split("/").pop();

        return fileName || "index.html";

    }

    /* =========================
       GET NAVIGATION PAGE
    ========================= */

    function getNavigationPage(page) {

        if (page === "index.html") {
            return "index.html";
        }

        for (const module of Object.values(modules)) {

            const moduleFile =
                module.url.split("/").pop();

            if (moduleFile === page) {

                if (module.nav === "more") {
                    return "more.html";
                }

                return page;

            }

        }

        return page;

    }

    /* =========================
       CURRENT PAGE
    ========================= */

    const currentPage =
        getCurrentPage();

    const activePage =
        getNavigationPage(currentPage);

    /* =========================
       NAV ITEMS
    ========================= */

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {

        const href =
            item.getAttribute("href");

        if (!href || href === "#") {
            return;
        }

        const linkPage =
            href.split("/").pop();

        item.classList.remove("active");

        if (linkPage === activePage) {

            item.classList.add("active");

        }

    });

});
