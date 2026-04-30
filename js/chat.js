// ================= USER SYSTEM =================
let users = JSON.parse(localStorage.getItem("users")) || {};
let currentUser = localStorage.getItem("currentUser") || null;

let chats = {};
let chatNames = {};
let currentChatId = "chat1";

let currentRequest = null;
let typingInterval = null;
let chatMemory = {};


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

    // Username Validation
    let usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

    if (!usernameRegex.test(id)) {
        alert("Username must be 4-20 characters and contain only letters, numbers, or underscore.");
        return;
    }

        // Password Validation
    let passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(pass)) {
        alert(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
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

    if (!chatMemory[currentChatId]) {
    chatMemory[currentChatId] = [];
    }

    chatMemory[currentChatId].push({
        role: "user",
        content: text
    });


    if (!chatNames[currentChatId] || chatNames[currentChatId].startsWith("Chat")) {
        chatNames[currentChatId] = text.substring(0, 20) || "Chat";
        renderChats();
    }

    $("textarea").val("");
    saveCurrentChat();

    showTyping();

    currentRequest = new AbortController();

    fetch("https://luna-backend-6vhp.onrender.com/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
    message: text,
    history: chatMemory[currentChatId] || []
}),
    signal: currentRequest.signal
})
.then(res => res.json())
.then(data => {

    if (requestChatId !== currentChatId) return;

    typeMessage(data.reply, requestChatId);

    if (!chatMemory[requestChatId]) {
        chatMemory[requestChatId] = [];
    }

    chatMemory[requestChatId].push({
        role: "assistant",
        content: data.reply
    });

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

    if (requestChatId !== currentChatId) return;

    let words = text.split(" ");
    let index = 0;

    let formattedText = marked.parse(text);

    formattedText = formattedText.replace(
        /<pre><code>/g,
        `<div class="code-wrapper">
            <button class="copy-code-btn">Copy</button>
            <pre><code>`
    );

    formattedText = formattedText.replace(
        /<\/code><\/pre>/g,
        `</code></pre></div>`
    );

    $(".messages").append(`
        <div class="message ai">
            <div class="avatar">AI</div>
            <div class="msg-content">${formattedText}</div>
        </div>
    `);

    typingInterval = setInterval(() => {

        $(".typing-text").last().append(words[index] + " ");
        index++;

        scrollToBottom();

        if (index >= words.length) {
            clearInterval(typingInterval);
            typingInterval = null;
            hideTyping();
            saveCurrentChat();
        }

    }, 5); // 🔥 VERY FAST
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

$(document).on("click", ".copy-code-btn", function () {

    let codeText = $(this)
        .siblings("pre")
        .find("code")
        .text();

    navigator.clipboard.writeText(codeText);

    let btn = $(this);
    btn.text("Copied!");

    setTimeout(() => {
        btn.text("Copy");
    }, 1500);
});

// ================= PROFILE DROPDOWN =================

// Toggle dropdown
$("#profileToggle").click(function (e) {
    e.stopPropagation();
    $("#profileDropdown").toggleClass("d-none");
});

// Close dropdown when clicking outside
$(document).click(function () {
    $("#profileDropdown").addClass("d-none");
});

// Change Profile Name
$("#editNameBtn").click(function () {

    let newName = prompt("Enter new profile name:");

    if (!newName) return;

    newName = newName.trim();

    if (newName.length < 2) {
        alert("Name must be at least 2 characters.");
        return;
    }

    users[currentUser].name = newName;

    localStorage.setItem("users", JSON.stringify(users));

    $(".header-username").text(newName);
    $(".header-avatar").text(newName.charAt(0).toUpperCase());

    $("#profileDropdown").addClass("d-none");

    alert("Profile name updated!");
});

// Change Password
$("#changePasswordBtn").click(function () {

    let currentPass = prompt("Enter current password:");

    if (!currentPass) return;

    if (users[currentUser].password !== currentPass) {
        alert("Current password is incorrect.");
        return;
    }

    let newPass = prompt("Enter new password:");

    if (!newPass) return;

    let passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPass)) {
        alert(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        );
        return;
    }

    users[currentUser].password = newPass;

    localStorage.setItem("users", JSON.stringify(users));

    $("#profileDropdown").addClass("d-none");

    alert("Password changed successfully!");
});


// Delete Account
$(".delete-account-btn").click(function () {

    let confirmDelete = confirm(
        "Are you sure you want to delete your account? This cannot be undone."
    );

    if (!confirmDelete) return;

    delete users[currentUser];

    localStorage.setItem("users", JSON.stringify(users));

    localStorage.removeItem("currentUser");

    alert("Account deleted successfully.");

    location.reload();
});


// Show / Hide Password Toggle
$(document).on("click", ".toggle-password", function () {

    let targetId = $(this).data("target");
    let input = $("#" + targetId);

    if (input.attr("type") === "password") {
        input.attr("type", "text");
        $(this).text("🙈");
    } else {
        input.attr("type", "password");
        $(this).text("👁");
    }
});