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
// // Get registration token. Initially this makes a network call, once retrieved
// // subsequent calls to getToken will return from cache.

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// function saveNotificationToDB(data) {
//   const request = indexedDB.open("notificationDB", 2); // Open with version 2 for upgrade

//   request.onupgradeneeded = (event) => {
//     const db = event.target.result;

//     // Create the object store 'notifications' if it doesn't exist
//     if (!db.objectStoreNames.contains("notifications")) {
//       console.log("Creating object store 'notifications'");
//       db.createObjectStore("notifications", {
//         keyPath: "id",
//         autoIncrement: true, // Optional: Auto-increment the 'id' for each notification
//       });
//     }
//   };

//   request.onsuccess = (event) => {
//     const db = event.target.result;

//     const tx = db.transaction("notifications", "readwrite");
//     const store = tx.objectStore("notifications");
//     const addRequest = store.add(data);

//     addRequest.onsuccess = () => {
//       console.log("Notification saved successfully");
//     };

//     addRequest.onerror = (err) => {
//       console.error("Failed to add notification:", err);
//     };

//     tx.onerror = (err) => {
//       console.error("Transaction failed:", err);
//     };
//   };

//   request.onerror = (err) => {
//     console.error("Failed to open database:", err);
//   };
// }
const DB_NAME = "notificationDB";
const DB_VERSION = 3;
const STORE_NAME = "notifications";

function openDBEnsuringStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      console.warn("IndexedDB upgrade blocked; close other tabs or clients.");
    };
  });
}

async function saveNotificationToDB(data) {
  try {
    const db = await openDBEnsuringStore();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise((res, rej) => {
      const addReq = store.add(data);
      addReq.onsuccess = () => res();
      addReq.onerror = () => rej(addReq.error);
    });
    await new Promise((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
      tx.onabort = () => rej(tx.error);
    });
  } catch (err) {
    console.error("Failed to save notification:", err);
  }
}

// Background message handler
messaging.onBackgroundMessage((payload) => {
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

  // Persist notification (best-effort)
  saveNotificationToDB({
    title: notificationTitle,
    body: notificationOptions.body,
    timestamp: Date.now(),
  });

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log("called");
  console.log("Received background message ", payload);
  console.log(payload);
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
  saveNotificationToDB({
    title: notificationTitle,
    body: notificationOptions.body,
    timestamp: Date.now(),
  });
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
