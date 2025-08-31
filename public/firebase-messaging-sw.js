importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
);
const firebaseConfig = {
  apiKey: "AIzaSyDM6R7E9NRG1FjBsu8v_T9QdKth0LUeLDU",
  authDomain: "lesp-resources-350d1.firebaseapp.com",
  databaseURL: "https://lesp-resources-350d1-default-rtdb.firebaseio.com",
  projectId: "lesp-resources-350d1",
  storageBucket: "lesp-resources-350d1.firebasestorage.app",
  messagingSenderId: "763683500399",
  appId: "1:763683500399:web:c3dc5d410d15416ac9b89a",
  measurementId: "G-8RSZWPT0XK",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

async function openNotificationDB() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open("notificationDB");

    request.onsuccess = (event) => {
      let db = event.target.result;

      if (db.objectStoreNames.contains("notifications")) {
        resolve(db);
      } else {
        const newVersion = db.version + 1;
        db.close();

        let upgradeRequest = indexedDB.open("notificationDB", newVersion);

        upgradeRequest.onupgradeneeded = (e) => {
          let upgradedDB = e.target.result;
          if (!upgradedDB.objectStoreNames.contains("notifications")) {
            upgradedDB.createObjectStore("notifications", {
              keyPath: "id",
              autoIncrement: true,
            });
            console.log("Object store 'notifications' created in upgrade");
          }
        };

        upgradeRequest.onsuccess = (e) => resolve(e.target.result);
        upgradeRequest.onerror = (e) => reject(e.target.error);
      }
    };

    request.onerror = (event) => reject(event.target.error);
  });
}

// Save notification data
async function saveNotificationToDB(data) {
  try {
    const db = await openNotificationDB();
    const tx = db.transaction("notifications", "readwrite");
    const store = tx.objectStore("notifications");
    store.add(data);

    tx.oncomplete = () => console.log("Notification saved successfully");
    tx.onerror = (err) => console.error("Transaction failed:", err);
  } catch (err) {
    console.error("Failed to open DB:", err);
  }
}

// Function to save notification
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle =
    (payload.data && payload.data.title) || "New Notification";
  const notificationOptions = {
    body: (payload.data && payload.data.body) || "You have a new message.",
    icon:
      (payload.data && payload.data.icon) ||
      "https://ik.imagekit.io/yn9gz2n2g/others/favicon.png?updatedAt=1756303018879",
    badge:
      (payload.data && payload.data.badge) ||
      "https://ik.imagekit.io/yn9gz2n2g/others/notificationIcon.png",
  };
  saveNotificationToDB(payload);
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If PWA is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new tab / PWA window
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin);
        }
      }),
  );
});
