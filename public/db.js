let db;
//db request for a new "budget" database.
const request = indexedDB.open("budget", 1);
request.onupgradeneeded = function(event) {
   //"pending" object & autoIncrement set to true
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};
request.onsuccess = function(event) {
  db = event.target.result;
  // checks to see if the application is online
  if (navigator.onLine) {
    checkDatabase();
  }
};
request.onerror = function(event) {
  console.log("Woops! " + event.target.errorCode);
};
function saveRecord(record) {
  //readwrite access for db
  const transaction = db.transaction(["pending"], "readwrite");
  //pending object store
  const store = transaction.objectStore("pending");
  //add method.
  store.add(record);
}
function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        //open a transaction on your pending db if successful
        const transaction = db.transaction(["pending"], "readwrite");
        // access your pending object store
        const store = transaction.objectStore("pending");
        // clear all
        store.clear();
      });
    }
  };
}
//checks database for online activity
window.addEventListener("online", checkDatabase);
