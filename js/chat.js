// ================= USER SYSTEM =================
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;

let chats = {};
let chatNames = {};
let currentChatId = "chat1";

let currentRequest = null;
let typingInterval = null;


// ================= SCREEN SWITCH =================

// Go to Login
$("#goLogin").click(function () {
    $("#startScreen").hide();
    $("#loginForm").removeClass("d-none");
});

// Go to Register
$("#goRegister").click(function () {
    $("#startScreen").hide();
    $("#registerForm").removeClass("d-none");
});

// Back button
$(".back-btn").click(function () {
    $("#loginForm").addClass("d-none");
    $("#registerForm").addClass("d-none");
    $("#startScreen").show();
});


// ================= LOGIN =================
$(".login-btn").click(function () {

    let id = $("#loginId").val().trim();
    let pass = $("#loginPass").val().trim();

    if (!users[id]) {
        alert("User not found");
        return;
    }

    if (users[id].password !== pass) {
        alert("Invalid password");
        return;
    }

    currentUser = id;
    localStorage.setItem("currentUser", id);

    loadUserData();
    showApp();
});


// ================= REGISTER =================
$(".register-btn").click(function () {

    let id = $("#registerId").val().trim();
    let pass = $("#registerPass").val().trim();
    let name = $("#registerName").val().trim();

    if (!id || !pass || !name) {
        alert("Fill all fields");
        return;
    }

    if (users[id]) {
        alert("User already exists");
        return;
    }

    users[id] = {
        password: pass,
        name: name,
        chats: {},
        chatNames: {}
    };

    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created! Now login.");

    // Back to start screen
    $("#registerForm").addClass("d-none");
    $("#startScreen").show();

    $("#registerId").val("");
    $("#registerPass").val("");
    $("#registerName").val("");
});


// ================= LOAD USER =================
function loadUserData() {

    chats = users[currentUser].chats || {};
    chatNames = users[currentUser].chatNames || {};

    if (!chats["chat1"]) {
        chats["chat1"] = "";
        chatNames["chat1"] = "Chat 1";
    }

    currentChatId = Object.keys(chats)[0];
}


// ================= SHOW APP =================
function showApp() {

    $(".login-screen").addClass("d-none");
    $(".app-container").removeClass("d-none");

    // 🔥 SET USER NAME IN HEADER
    let name = users[currentUser].name || currentUser;

    // Avatar
    $(".header-avatar").text(name.charAt(0).toUpperCase());

// Username (RIGHT SIDE)
    $(".header-username").text(name);

    renderChats();
    loadChat(currentChatId);
}


// ================= LOGOUT =================
$(".logout-btn").click(function () {
    localStorage.removeItem("currentUser");
    location.reload();
});


// ================= SAVE CHAT =================
function saveCurrentChat() {

    chats[currentChatId] = $(".messages").html();

    users[currentUser].chats = chats;
    users[currentUser].chatNames = chatNames;

    localStorage.setItem("users", JSON.stringify(users));
}


// ================= ADD MESSAGE =================
function addMessage(text, sender) {

    let time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    $(".messages").append(`
        <div class="message ${sender}">
            <div class="avatar">${sender === 'user' ? 'U' : 'AI'}</div>
            <div class="msg-content">
                <small>${time}</small><br>${text}
            </div>
        </div>
    `);

    scrollToBottom();
}


// ================= SCROLL =================
function scrollToBottom() {
    let container = $(".messages");
    container.scrollTop(container[0].scrollHeight);
}


// ================= RENDER CHAT =================
function renderChats() {

    $("#chatHistory").html("");

    for (let chatId in chats) {
        $("#chatHistory").append(`
            <div class="chat-item ${chatId === currentChatId ? "active-chat" : ""}" data-id="${chatId}">
                <span class="chat-name">${chatNames[chatId]}</span>
                <button class="rename-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            </div>
        `);
    }
}


// ================= LOAD CHAT =================
function loadChat(chatId) {

    let content = chats[chatId] || "";

    $(".messages").html(content);

    if (content === "") {
        $(".welcome-screen").removeClass("hidden");
    } else {
        $(".welcome-screen").addClass("hidden");
    }

    scrollToBottom();
}


// ================= SEND MESSAGE =================
$(".send-btn").click(sendMessage);

function sendMessage() {

    let requestChatId = currentChatId;
    let text = $("textarea").val().trim();
    if (!text) return;

    if (currentRequest) currentRequest.abort();
    if (typingInterval) clearInterval(typingInterval);

    $(".welcome-screen").addClass("hidden");

    addMessage(text, "user");

    if (!chatNames[currentChatId] || chatNames[currentChatId].startsWith("Chat")) {
        chatNames[currentChatId] = text.substring(0, 20) || "Chat";
        renderChats();
    }

    $("textarea").val("");
    saveCurrentChat();

    showTyping();

    currentRequest = new AbortController();

    fetch("https://luna-backend-6vhp.onrender.com, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message: text}),
        signal: currentRequest.signal
    })
    .then(res => res.json())
    .then(data => {

        if (requestChatId !== currentChatId) return;

        typeMessage(data.reply, requestChatId);

        currentRequest = null;
    })
    .catch(err => {
        if (err.name !== "AbortError") {
            typeMessage("Error connecting AI", requestChatId);
        }
        currentRequest = null;
    });
}


// ================= TYPE MESSAGE =================
function typeMessage(text, requestChatId) {

    let index = 0;

    $(".messages").append(`
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="msg-content typing-text"></div>
        </div>
    `);

    typingInterval = setInterval(() => {

        if (requestChatId !== currentChatId) return;

        $(".typing-text").last().append(text.charAt(index));
        index++;

        scrollToBottom();

        if (index >= text.length) {
            clearInterval(typingInterval);
            typingInterval = null;
            hideTyping();
            saveCurrentChat();
        }

    }, 20);
}


// ================= TYPING =================
function showTyping() {
    $(".typing-indicator").removeClass("d-none");
    $(".send-btn").addClass("d-none");
    $(".stop-btn").removeClass("d-none");
}

function hideTyping() {
    $(".typing-indicator").addClass("d-none");
    $(".send-btn").removeClass("d-none");
    $(".stop-btn").addClass("d-none");
}


// ================= STOP =================
$(".stop-btn").click(function () {

    if (currentRequest) currentRequest.abort();
    if (typingInterval) clearInterval(typingInterval);

    hideTyping();
});


// ================= NEW CHAT =================
$(".new-chat-btn").click(function () {

    saveCurrentChat();

    let id = "chat" + (Object.keys(chats).length + 1);

    chats[id] = "";
    chatNames[id] = "Chat " + Object.keys(chats).length;

    currentChatId = id;

    $(".messages").html("");
    $(".welcome-screen").removeClass("hidden");

    renderChats();
});


// ================= CHAT CLICK =================
$(document).on("click", ".chat-item", function () {

    saveCurrentChat();

    currentChatId = $(this).data("id");

    renderChats();
    loadChat(currentChatId);
});


// ================= RENAME =================
$(document).on("click", ".rename-btn", function () {

    let id = $(this).parent().data("id");
    let name = prompt("New name:");

    if (name) {
        chatNames[id] = name;
        renderChats();
    }
});


// ================= DELETE =================
$(document).on("click", ".delete-btn", function () {

    let id = $(this).parent().data("id");

    if (confirm("Delete?")) {

        delete chats[id];
        delete chatNames[id];

        let keys = Object.keys(chats);

        if (keys.length === 0) {
            chats["chat1"] = "";
            chatNames["chat1"] = "Chat 1";
            currentChatId = "chat1";
        } else {
            currentChatId = keys[0];
        }

        renderChats();
        loadChat(currentChatId);
    }
});


// ================= INIT =================
$(document).ready(function () {

    if (currentUser && users[currentUser]) {
        loadUserData();
        showApp();
    }

    $(".menu-btn").click(() => $(".sidebar").toggleClass("active"));
    $(".mode-btn").click(() => $("body").toggleClass("dark-mode"));
});

// ================= SUGGESTION CLICK =================
$(document).on("click", ".suggestion-card", function () {

    let text = $(this).data("text");

    if (!text) return;

    // put text into textarea
    $("textarea").val(text);

    // trigger send
    sendMessage();
});