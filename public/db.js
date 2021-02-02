const indexedDB = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const req = indexedDB.open("budget", 1);

function saveEntry(entry) {
    const transaction = db.transaction(["offline"], "readwrite");
    const store = transaction.objectStore("offline");
    store.add(entry);
};

function checkDatabase() {
    const transaction = db.transaction(["offline"], "readwrite");
    const store = transaction.objectStore("offline");
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch ("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then (res => {
                return res.json();
            })
            .then(() => {
                const transaction = db.transaction(["offline"], "readwrite");
                const store = transaction.objectStore("offline");
                store.clear();
            });
        };
    };
};

req.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("offline", { autoIncrement: true });
};

req.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();    
    };
};

req.onerror = (event) => {
    console.log("Looks like something happened: " + event.target.errorCode);
};

window.addEventListener("online", checkDatabase);