// Import the functions you need from the SDKs you need

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

import {  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut,
}
 from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

 import { setDoc, doc, getFirestore, collection, query, onSnapshot, orderBy, limit,
}
 from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl5RkheUDEHkNi5uHBSUv-s1_0AoCZAdw",
  authDomain: "chat-app-c62ba.firebaseapp.com",
  projectId: "chat-app-c62ba",
  storageBucket: "chat-app-c62ba.appspot.com",
  messagingSenderId: "125010890379",
  appId: "1:125010890379:web:49effbf47d682d8687ce8e", 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const currentPageName = window.location.pathname.split("/").pop();

const loginBtn = document.getElementById("loginBtn");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const logoutBtn = document.getElementById("logoutBtn");
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("messageContainer");
const emailText = document.getElementById("emailText");

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

const loadMessages = ({ uid }) => {
  const q = query(collection(db, "messages"), orderBy("createdAt"), limit(25));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messagesHTML = querySnapshot.docs
      .map((doc) => {
        const messages = doc.data();
        const timestamp = messages.createdAt;
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formatedTime = `${hours}:${minutes}`;

        const chatType = messages.uid === uid ? "chat-end" : "chat-start";

        return `
          <div class="chat ${chatType}">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full">
                <img alt="Tailwind CSS chat bubble component" src="${messages.photoURL}" />
              </div>
            </div>
            <div class="chat-header">
              ${messages.displayName}
              <time class="text-xs opacity-50">${formatedTime}</time>
            </div>
            <div class="chat-bubble">${messages.text}</div>
            <div class="chat-footer opacity-50">Delivered</div>
          </div>
        `;
      })
      .join("");

    messageContainer.innerHTML = messagesHTML;
    scrollToBottom();
  });
};

const onLoad = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadMessages(user);
      emailText && (emailText.innerText = user.email);
      if (currentPageName !== "" && currentPageName !== "index.html") {
        window.location.href = "/";
      }
    } else {
      if (currentPageName !== "login.html") {
        window.location.href = "login.html";
      }
    }
  });
};
onLoad();

const loginWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {})
    .catch((error) => {});
};

const sendMessage = async () => {
  const user = auth.currentUser;
  const text = messageInput.value;
  const id = Date.now();
  console.log(user, "Send UID");
  try {
    if (user) {
      if (text.trim()) {
        const { email, displayName, photoURL, uid } = user;
        const payload = {
          createdAt: id,
          dicId: id,
          text,
          uid,
          email,
          displayName,
          photoURL,
        };

        await setDoc(doc(db, "messages", `${id}`), payload);
        messageInput.value = "";
        scrollToBottom();
      } else {
        alert("Please Input Text");
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const logout = () => {
  signOut(auth)
    .then(() => {})
    .catch((error) => {});
};

loginBtn && loginBtn.addEventListener("click", loginWithGoogle);
sendMessageBtn && sendMessageBtn.addEventListener("click", sendMessage);
logoutBtn && logoutBtn.addEventListener("click", logout);
