/* =========================
   N PROJECT
   STORAGE
========================= */

const STORAGE_KEY =
    "n-project-data";

function isValidStoredData(data) {

    return (
        data &&
        typeof data === "object"
    );

}

function saveAppData(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {
        return false;
    }

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        return false;

    }

}

function loadAppData() {

    const storedData =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!storedData) {
        return null;
    }

    try {

    const parsedData =
        JSON.parse(
            storedData
        );

    if (!isValidStoredData(parsedData)) {
    return null;
}

    return parsedData;

} catch (error) {

    return null;

    }

}

function clearAppData() {

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

        return true;

    } catch (error) {

        return false;

    }

}
