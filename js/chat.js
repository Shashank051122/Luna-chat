/* =========================================================
   LUNA CHAT APPLICATION
   ========================================================= */


/* =========================================================
   API
   ========================================================= */

const API_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/chat"
        : "https://luna-backend-6vhp.onrender.com/chat";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let users = JSON.parse(
    localStorage.getItem("users") || "{}"
);

let currentUser =
    localStorage.getItem("currentUser");

let chats = {};
let chatNames = {};
let chatMemory = {};

let currentChatId = "chat1";

let currentRequest = null;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function saveUsers() {

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );
}


function saveCurrentUserData() {

    if (!currentUser || !users[currentUser]) {
        return;
    }

    users[currentUser].chats = chats;
    users[currentUser].chatNames = chatNames;
    users[currentUser].chatMemory = chatMemory;

    saveUsers();
}


function loadUserData() {

    if (!currentUser || !users[currentUser]) {
        return;
    }

    chats =
        users[currentUser].chats || {
            chat1: ""
        };

    chatNames =
        users[currentUser].chatNames || {
            chat1: "New conversation"
        };

    chatMemory =
        users[currentUser].chatMemory || {
            chat1: []
        };


    if (!chats.chat1 && Object.keys(chats).length === 0) {

        chats.chat1 = "";

        chatNames.chat1 =
            "New conversation";

        chatMemory.chat1 = [];
    }


    const chatIds =
        Object.keys(chats);

    if (!chatIds.includes(currentChatId)) {

        currentChatId =
            chatIds[0] || "chat1";
    }


    if (!chatMemory[currentChatId]) {

        chatMemory[currentChatId] = [];
    }
}


function ensureChat(chatId = currentChatId) {

    if (!chats[chatId]) {
        chats[chatId] = "";
    }

    if (!chatNames[chatId]) {
        chatNames[chatId] =
            "New conversation";
    }

    if (!Array.isArray(chatMemory[chatId])) {
        chatMemory[chatId] = [];
    }
}


function generateId(prefix = "id") {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


function getTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   AUTH VALIDATION
   ========================================================= */

function validUsername(username) {

    return /^[A-Za-z0-9_]{4,20}$/.test(
        username
    );
}


function validPassword(password) {

    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}


/* =========================================================
   SCREEN CONTROL
   ========================================================= */

function showStartScreen() {

    $("#startScreen").removeClass("d-none");
    $("#authScreen").addClass("d-none");
    $("#app").addClass("d-none");
}


function showAuthScreen() {

    $("#startScreen").addClass("d-none");
    $("#authScreen").removeClass("d-none");
    $("#app").addClass("d-none");
}


function showApp() {

    $("#startScreen").addClass("d-none");
    $("#authScreen").addClass("d-none");
    $("#app").removeClass("d-none");

    updateProfileUI();

    loadUserData();

    renderChats();

    loadChat(currentChatId);
}


/* =========================================================
   PROFILE UI
   ========================================================= */

function updateProfileUI() {

    if (!currentUser || !users[currentUser]) {
        return;
    }

    const name =
        users[currentUser].name ||
        currentUser;

    $("#headerUsername")
        .text(name);

    $("#headerAvatar")
        .text(
            name
                .charAt(0)
                .toUpperCase()
        );
}


/* =========================================================
   WELCOME SCREEN
   ========================================================= */

function showWelcome(show = true) {

    if (show) {

        $("#welcomeScreen")
            .removeClass("hidden");

    } else {

        $("#welcomeScreen")
            .addClass("hidden");
    }
}


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function renderChats() {

    const container =
        $("#chatHistory");

    container.empty();

    const ids =
        Object.keys(chats);

    ids.forEach((id) => {

        ensureChat(id);

        const name =
            chatNames[id] ||
            "New conversation";


        const item = $(`
            <div
                class="chat-item ${id === currentChatId ? "active-chat" : ""}"
                data-id="${id}"
            >

                <div class="chat-item-name">

                    <i class="fas fa-message"></i>

                    <span>
                        ${escapeHTML(name)}
                    </span>

                </div>

                <div class="chat-item-actions">

                    <button
                        type="button"
                        class="rename-btn"
                        title="Rename"
                    >
                        <i class="fas fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        title="Delete"
                    >
                        <i class="fas fa-trash"></i>
                    </button>

                </div>

            </div>
        `);

        container.append(item);
    });
}


/* =========================================================
   LOAD CHAT
   ========================================================= */

function loadChat(chatId) {

    clearActiveRequest();

    ensureChat(chatId);

    currentChatId =
        chatId;

    const html =
        chats[chatId] || "";

    $("#messages")
        .children()
        .not("#welcomeScreen")
        .not(".typing-indicator")
        .remove();


    if (!html.trim()) {

        showWelcome(true);

    } else {

        showWelcome(false);

        $("#messages")
            .prepend(html);
    }


    renderChats();

    scrollToBottom();
}


/* =========================================================
   SAVE CHAT
   ========================================================= */

function saveCurrentChat() {

    if (!currentChatId) {
        return;
    }

    const messageHTML =
        $("#messages")
            .children(".message")
            .toArray()
            .map((element) => element.outerHTML)
            .join("");

    chats[currentChatId] =
        messageHTML;

    saveCurrentUserData();
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    const messages =
        document.getElementById(
            "messages"
        );

    if (!messages) {
        return;
    }

    messages.scrollTop =
        messages.scrollHeight;
}


/* =========================================================
   ADD USER MESSAGE
   ========================================================= */

function addUserMessage(text) {

    const name =
        users[currentUser]?.name ||
        currentUser ||
        "U";

    const avatar =
        name
            .charAt(0)
            .toUpperCase();


    const id =
        generateId("user");


    const html = `

        <article
            class="message user"
            data-message-id="${id}"
            data-role="user"
        >

            <div class="message-main">

                <div class="message-meta">

                    <span>
                        You
                    </span>

                    <span>
                        ${getTime()}
                    </span>

                </div>


                <div class="msg-content">

                    <div class="msg-body">
                        ${escapeHTML(text)
                            .replace(/\n/g, "<br>")}
                    </div>

                </div>


                <div class="message-actions">

                    <button
                        class="edit-message-btn"
                        type="button"
                    >

                        <i class="fas fa-pen"></i>

                        <span>
                            Edit
                        </span>

                    </button>

                </div>

            </div>


            <div class="avatar user-avatar">
                ${escapeHTML(avatar)}
            </div>

        </article>
    `;


    $("#messages")
        .append(html);

    scrollToBottom();
}


/* =========================================================
   MARKDOWN
   ========================================================= */

function renderMarkdown(text) {

    const normalized =
        String(text || "")
            .replace(/\r\n/g, "\n")
            .trim();


    if (!window.marked) {

        return escapeHTML(
            normalized
        ).replace(/\n/g, "<br>");
    }


    marked.setOptions({
        gfm: true,
        breaks: true
    });


    const html =
        marked.parse(normalized);


    const holder =
        document.createElement("div");

    holder.innerHTML =
        html;


    holder
        .querySelectorAll(
            "script, iframe, object, embed, style, link"
        )
        .forEach((element) => {
            element.remove();
        });


    holder
        .querySelectorAll(
            "[onerror], [onclick], [onload], [onmouseover]"
        )
        .forEach((element) => {

            element.removeAttribute(
                "onerror"
            );

            element.removeAttribute(
                "onclick"
            );

            element.removeAttribute(
                "onload"
            );

            element.removeAttribute(
                "onmouseover"
            );
        });


    holder
        .querySelectorAll("pre")
        .forEach((pre) => {

            const code =
                pre.querySelector("code");

            if (!code) {
                return;
            }


            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "code-wrapper";


            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "code-header";


            const language =
                document.createElement(
                    "span"
                );

            language.className =
                "code-language";

            language.textContent =
                getCodeLanguage(code);


            const copyButton =
                document.createElement(
                    "button"
                );

            copyButton.type =
                "button";

            copyButton.className =
                "copy-code-btn";

            copyButton.innerHTML =
                '<i class="fas fa-copy"></i> Copy code';


            header.append(
                language,
                copyButton
            );


            wrapper.append(
                header,
                pre.cloneNode(true)
            );


            pre.replaceWith(
                wrapper
            );
        });


    return holder.innerHTML;
}


function getCodeLanguage(code) {

    const className =
        code.className || "";

    const match =
        className.match(
            /language-([\w-]+)/i
        );

    return match
        ? match[1].toUpperCase()
        : "CODE";
}


/* =========================================================
   ADD AI MESSAGE
   ========================================================= */

function addAssistantMessage(text) {

    const id =
        generateId("assistant");

    const formatted =
        renderMarkdown(text);


    const html = `

        <article
            class="message ai"
            data-message-id="${id}"
            data-role="assistant"
        >

            <div class="avatar ai-avatar">
                AI
            </div>


            <div class="message-main">

                <div class="message-meta">

                    <span>
                        LUNA
                    </span>

                    <span>
                        ${getTime()}
                    </span>

                </div>


                <div class="msg-content ai-content">

                    <div class="msg-body">
                        ${formatted}
                    </div>

                </div>


                <div class="message-actions assistant-actions">

                    <button
                        class="copy-response-btn"
                        type="button"
                    >

                        <i class="fas fa-copy"></i>

                        <span>
                            Copy
                        </span>

                    </button>

                </div>

            </div>

        </article>
    `;


    $("#messages")
        .append(html);

    scrollToBottom();
}


/* =========================================================
   TYPING
   ========================================================= */

function showTyping() {

    $(".typing-indicator")
        .removeClass("d-none");

    $(".send-btn")
        .addClass("d-none");

    $(".stop-btn")
        .removeClass("d-none");

    scrollToBottom();
}


function hideTyping() {

    $(".typing-indicator")
        .addClass("d-none");

    $(".send-btn")
        .removeClass("d-none");

    $(".stop-btn")
        .addClass("d-none");
}


/* =========================================================
   STOP REQUEST
   ========================================================= */

function clearActiveRequest() {

    if (currentRequest) {

        currentRequest.abort();

        currentRequest =
            null;
    }

    hideTyping();
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    const textarea =
        document.getElementById(
            "messageInput"
        );


    if (!textarea) {

        console.error(
            "LUNA: messageInput not found."
        );

        return;
    }


    const text =
        textarea.value.trim();


    if (!text) {
        return;
    }


    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;
    }


    ensureChat();


    clearActiveRequest();


    showWelcome(false);


    addUserMessage(
        text
    );


    chatMemory[currentChatId]
        .push({
            role: "user",
            content: text
        });


    textarea.value = "";

    textarea.style.height =
        "auto";


    saveCurrentChat();


    showTyping();


    currentRequest =
        new AbortController();


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: text,

                            history:
                                chatMemory[
                                    currentChatId
                                ]
                        }),

                    signal:
                        currentRequest.signal
                }
            );


        const data =
            await response
                .json()
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.reply ||
                data.error?.message ||
                "AI request failed"
            );
        }


        const reply =
            String(
                data.reply ||
                "I couldn't generate a response."
            );


        chatMemory[currentChatId]
            .push({
                role: "assistant",
                content: reply
            });


        hideTyping();


        addAssistantMessage(
            reply
        );


        saveCurrentChat();

    }


    catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return;
        }


        hideTyping();


        console.error(
            "LUNA API error:",
            error
        );


        addAssistantMessage(
            "I couldn't connect to the AI service right now. Please try again."
        );


        saveCurrentChat();
    }


    finally {

        currentRequest =
            null;
    }
}


/* =========================================================
   NEW CHAT
   ========================================================= */

function createNewChat() {

    clearActiveRequest();


    const id =
        generateId("chat");


    chats[id] =
        "";

    chatNames[id] =
        "New conversation";

    chatMemory[id] =
        [];


    currentChatId =
        id;


    saveCurrentUserData();


    $("#messages")
        .children(".message")
        .remove();


    $("#messageInput")
        .val("")
        .css(
            "height",
            "auto"
        );


    showWelcome(true);


    renderChats();


    scrollToBottom();
}


/* =========================================================
   DELETE CHAT
   ========================================================= */

function deleteChat(chatId) {

    if (!chats[chatId]) {
        return;
    }


    if (
        !confirm(
            "Delete this conversation?"
        )
    ) {

        return;
    }


    delete chats[chatId];

    delete chatNames[chatId];

    delete chatMemory[chatId];


    const remaining =
        Object.keys(chats);


    if (
        remaining.length === 0
    ) {

        const id =
            "chat1";

        chats[id] =
            "";

        chatNames[id] =
            "New conversation";

        chatMemory[id] =
            [];

        currentChatId =
            id;

    } else if (
        !chats[currentChatId]
    ) {

        currentChatId =
            remaining[0];
    }


    saveCurrentUserData();


    loadChat(
        currentChatId
    );
}


/* =========================================================
   PROFILE DROPDOWN
   ========================================================= */

function closeProfileDropdown() {

    $("#profileDropdown")
        .addClass("d-none");
}


/* =========================================================
   DOCUMENT READY
   ========================================================= */

$(document).ready(function () {


    console.log(
        "LUNA chat.js loaded successfully."
    );


    /* =====================================================
       START
       ===================================================== */

    $("#startBtn").on(
        "click",
        function () {

            showAuthScreen();

        }
    );


    /* =====================================================
       SWITCH LOGIN / REGISTER
       ===================================================== */

    $("#switchAuthBtn").on(
        "click",
        function () {

            const loginVisible =
                !$("#loginForm")
                    .hasClass("d-none");


            if (loginVisible) {

                $("#loginForm")
                    .addClass("d-none");

                $("#registerForm")
                    .removeClass("d-none");

                $("#authTitle")
                    .text(
                        "Create your LUNA account"
                    );

                $("#authSubtitle")
                    .text(
                        "Start your AI conversations"
                    );

                $("#authSwitchText")
                    .text(
                        "Already have an account?"
                    );

                $(this)
                    .text("Login");

            } else {

                $("#registerForm")
                    .addClass("d-none");

                $("#loginForm")
                    .removeClass("d-none");

                $("#authTitle")
                    .text(
                        "Login to LUNA"
                    );

                $("#authSubtitle")
                    .text(
                        "Continue your conversations"
                    );

                $("#authSwitchText")
                    .text(
                        "Don't have an account?"
                    );

                $(this)
                    .text("Register");
            }

        }
    );


    /* =====================================================
       LOGIN
       ===================================================== */

    $("#loginForm").on(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                $("#loginUser")
                    .val()
                    .trim();

            const password =
                $("#loginPassword")
                    .val();


            $("#loginError")
                .text("");


            if (
                !users[username]
            ) {

                $("#loginError")
                    .text(
                        "Account not found."
                    );

                return;
            }


            if (
                users[username]
                    .password !== password
            ) {

                $("#loginError")
                    .text(
                        "Incorrect password."
                    );

                return;
            }


            currentUser =
                username;


            localStorage.setItem(
                "currentUser",
                currentUser
            );


            loadUserData();

            showApp();

        }
    );


    /* =====================================================
       REGISTER
       ===================================================== */

    $("#registerForm").on(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                $("#registerUser")
                    .val()
                    .trim();

            const name =
                $("#registerName")
                    .val()
                    .trim();

            const password =
                $("#registerPassword")
                    .val();


            $("#registerError")
                .text("");


            if (
                !validUsername(
                    username
                )
            ) {

                $("#registerError")
                    .text(
                        "Username must contain 4–20 letters, numbers or underscore."
                    );

                return;
            }


            if (
                users[username]
            ) {

                $("#registerError")
                    .text(
                        "Username already exists."
                    );

                return;
            }


            if (
                name.length < 2
            ) {

                $("#registerError")
                    .text(
                        "Profile name must be at least 2 characters."
                    );

                return;
            }


            if (
                !validPassword(
                    password
                )
            ) {

                $("#registerError")
                    .text(
                        "Password must contain uppercase, lowercase, number, special character and at least 8 characters."
                    );

                return;
            }


            users[username] = {

                password:
                    password,

                name:
                    name,

                chats: {
                    chat1: ""
                },

                chatNames: {
                    chat1:
                        "New conversation"
                },

                chatMemory: {
                    chat1: []
                }
            };


            saveUsers();


            currentUser =
                username;


            localStorage.setItem(
                "currentUser",
                currentUser
            );


            loadUserData();

            showApp();

        }
    );


    /* =====================================================
       PASSWORD SHOW / HIDE
       ===================================================== */

    $(document).on(
        "click",
        ".password-toggle",
        function () {

            const target =
                $(this).data(
                    "target"
                );

            const input =
                $(target);

            const icon =
                $(this).find("i");


            if (
                input.attr("type") ===
                "password"
            ) {

                input.attr(
                    "type",
                    "text"
                );

                icon
                    .removeClass(
                        "fa-eye"
                    )
                    .addClass(
                        "fa-eye-slash"
                    );

            } else {

                input.attr(
                    "type",
                    "password"
                );

                icon
                    .removeClass(
                        "fa-eye-slash"
                    )
                    .addClass(
                        "fa-eye"
                    );
            }

        }
    );


    /* =====================================================
       SEND BUTTON
       ===================================================== */

    $(".send-btn").on(
        "click",
        function () {

            sendMessage();

        }
    );


    /* =====================================================
       ENTER KEY
       ===================================================== */

    $("#messageInput").on(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );


    /* =====================================================
       TEXTAREA AUTO HEIGHT
       ===================================================== */

    $("#messageInput").on(
        "input",
        function () {

            this.style.height =
                "auto";

            this.style.height =
                Math.min(
                    this.scrollHeight,
                    180
                ) + "px";
        }
    );


    /* =====================================================
       SUGGESTION CARDS
       ===================================================== */

    $(document).on(
        "click",
        ".suggestion-card",
        function () {

            const text =
                $(this)
                    .attr("data-text");


            if (!text) {
                return;
            }


            const textarea =
                document.getElementById(
                    "messageInput"
                );


            if (!textarea) {

                console.error(
                    "LUNA: messageInput not found."
                );

                return;
            }


            textarea.value =
                text;


            textarea.dispatchEvent(
                new Event(
                    "input",
                    {
                        bubbles: true
                    }
                )
            );


            sendMessage();

        }
    );


    /* =====================================================
       NEW CHAT
       ===================================================== */

    $(".new-chat-btn").on(
        "click",
        function () {

            createNewChat();

        }
    );


    /* =====================================================
       CHAT HISTORY CLICK
       ===================================================== */

    $(document).on(
        "click",
        ".chat-item",
        function (event) {

            if (
                $(event.target)
                    .closest(
                        ".chat-item-actions"
                    )
                    .length
            ) {

                return;
            }


            const id =
                $(this)
                    .attr("data-id");


            saveCurrentChat();

            loadChat(id);

        }
    );


    /* =====================================================
       RENAME CHAT
       ===================================================== */

    $(document).on(
        "click",
        ".rename-btn",
        function (event) {

            event.stopPropagation();


            const id =
                $(this)
                    .closest(
                        ".chat-item"
                    )
                    .attr("data-id");


            const oldName =
                chatNames[id] ||
                "New conversation";


            const newName =
                prompt(
                    "Enter new chat name:",
                    oldName
                );


            if (
                !newName ||
                !newName.trim()
            ) {

                return;
            }


            chatNames[id] =
                newName.trim();


            saveCurrentUserData();

            renderChats();

        }
    );


    /* =====================================================
       DELETE CHAT
       ===================================================== */

    $(document).on(
        "click",
        ".delete-btn",
        function (event) {

            event.stopPropagation();


            const id =
                $(this)
                    .closest(
                        ".chat-item"
                    )
                    .attr("data-id");


            deleteChat(id);

        }
    );


    /* =====================================================
       PROFILE TOGGLE
       ===================================================== */

    $(document).on(
        "click",
        "#profileToggle",
        function (event) {

            event.stopPropagation();


            $("#profileDropdown")
                .toggleClass(
                    "d-none"
                );
        }
    );


    /* =====================================================
       CLOSE PROFILE
       ===================================================== */

    $(document).on(
        "click",
        function () {

            closeProfileDropdown();

        }
    );


    $(document).on(
        "click",
        "#profileDropdown",
        function (event) {

            event.stopPropagation();

        }
    );


    /* =====================================================
       CHANGE PROFILE NAME
       ===================================================== */

    $(document).on(
        "click",
        "#editNameBtn",
        function () {

            const currentName =
                users[currentUser]?.name ||
                currentUser;


            const newName =
                prompt(
                    "Enter new profile name:",
                    currentName
                );


            if (
                !newName ||
                !newName.trim()
            ) {

                return;
            }


            const cleanedName =
                newName.trim();


            if (
                cleanedName.length < 2
            ) {

                alert(
                    "Name must be at least 2 characters."
                );

                return;
            }


            users[currentUser].name =
                cleanedName;


            saveUsers();

            updateProfileUI();

            closeProfileDropdown();

        }
    );


    /* =====================================================
       CHANGE PASSWORD
       ===================================================== */

    $(document).on(
        "click",
        "#changePasswordBtn",
        function () {

            closeProfileDropdown();


            $("#oldPassword")
                .val("");

            $("#newPassword")
                .val("");

            $("#confirmPassword")
                .val("");

            $("#passwordChangeError")
                .text("");


            $("#passwordModal")
                .removeClass(
                    "d-none"
                );
        }
    );


    /* =====================================================
       CLOSE PASSWORD MODAL
       ===================================================== */

    $("#closePasswordModal").on(
        "click",
        function () {

            $("#passwordModal")
                .addClass(
                    "d-none"
                );

        }
    );


    /* =====================================================
       SAVE PASSWORD
       ===================================================== */

    $("#savePasswordBtn").on(
        "click",
        function () {

            const oldPassword =
                $("#oldPassword")
                    .val();

            const newPassword =
                $("#newPassword")
                    .val();

            const confirmPassword =
                $("#confirmPassword")
                    .val();


            $("#passwordChangeError")
                .text("");


            if (
                users[currentUser]
                    .password !==
                oldPassword
            ) {

                $("#passwordChangeError")
                    .text(
                        "Current password is incorrect."
                    );

                return;
            }


            if (
                !validPassword(
                    newPassword
                )
            ) {

                $("#passwordChangeError")
                    .text(
                        "New password must contain uppercase, lowercase, number, special character and at least 8 characters."
                    );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                $("#passwordChangeError")
                    .text(
                        "Passwords do not match."
                    );

                return;
            }


            users[currentUser]
                .password =
                newPassword;


            saveUsers();


            $("#passwordModal")
                .addClass(
                    "d-none"
                );


            alert(
                "Password changed successfully."
            );

        }
    );


    /* =====================================================
       LOGOUT
       ===================================================== */

    $(document).on(
        "click",
        ".logout-btn",
        function () {

            closeProfileDropdown();

            clearActiveRequest();


            currentUser =
                null;


            localStorage.removeItem(
                "currentUser"
            );


            chats = {};

            chatNames = {};

            chatMemory = {};

            currentChatId =
                "chat1";


            $("#loginForm")
                .removeClass(
                    "d-none"
                );

            $("#registerForm")
                .addClass(
                    "d-none"
                );


            $("#loginForm")[0]
                ?.reset();

            $("#registerForm")[0]
                ?.reset();


            showStartScreen();

        }
    );


    /* =====================================================
       DELETE ACCOUNT
       ===================================================== */

    $(document).on(
        "click",
        ".delete-account-btn",
        function () {

            closeProfileDropdown();


            const confirmed =
                confirm(
                    "Are you sure you want to permanently delete your account?"
                );


            if (!confirmed) {
                return;
            }


            delete users[
                currentUser
            ];


            saveUsers();


            localStorage.removeItem(
                "currentUser"
            );


            currentUser =
                null;

            chats = {};

            chatNames = {};

            chatMemory = {};

            currentChatId =
                "chat1";


            showStartScreen();

        }
    );


    /* =====================================================
       COPY AI RESPONSE
       ===================================================== */

    $(document).on(
        "click",
        ".copy-response-btn",
        async function () {

            const body =
                $(this)
                    .closest(
                        ".message-main"
                    )
                    .find(
                        ".msg-body"
                    )
                    .text();


            try {

                await navigator.clipboard
                    .writeText(body);


                const button =
                    $(this);


                const original =
                    button.html();


                button.html(
                    '<i class="fas fa-check"></i> Copied'
                );


                setTimeout(
                    function () {

                        button.html(
                            original
                        );

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );
            }

        }
    );


    /* =====================================================
       COPY CODE
       ===================================================== */

    $(document).on(
        "click",
        ".copy-code-btn",
        async function () {

            const code =
                $(this)
                    .closest(
                        ".code-wrapper"
                    )
                    .find("code")
                    .text();


            try {

                await navigator.clipboard
                    .writeText(code);


                const button =
                    $(this);


                const original =
                    button.html();


                button.html(
                    '<i class="fas fa-check"></i> Copied'
                );


                setTimeout(
                    function () {

                        button.html(
                            original
                        );

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Code copy failed:",
                    error
                );
            }

        }
    );


    /* =====================================================
       EDIT USER MESSAGE
       ===================================================== */

    $(document).on(
        "click",
        ".edit-message-btn",
        function () {

            const message =
                $(this)
                    .closest(
                        ".message"
                    );


            const body =
                message
                    .find(".msg-body");


            const currentText =
                body.text();


            const newText =
                prompt(
                    "Edit your message:",
                    currentText
                );


            if (
                !newText ||
                !newText.trim()
            ) {

                return;
            }


            body.html(
                escapeHTML(
                    newText.trim()
                ).replace(
                    /\n/g,
                    "<br>"
                )
            );


            saveCurrentChat();

        }
    );


    /* =====================================================
       STOP BUTTON
       ===================================================== */

    $(".stop-btn").on(
        "click",
        function () {

            clearActiveRequest();

        }
    );


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    $(".mobile-menu-btn").on(
        "click",
        function () {

            $("#sidebar")
                .toggleClass(
                    "mobile-open"
                );

        }
    );


    $(".menu-btn").on(
        "click",
        function () {

            $("#sidebar")
                .toggleClass(
                    "mobile-open"
                );

        }
    );


    /* =====================================================
       DARK MODE
       ===================================================== */

    $(".mode-btn").on(
        "click",
        function () {

            $("body")
                .toggleClass(
                    "dark-mode"
                );

            const dark =
                $("body")
                    .hasClass(
                        "dark-mode"
                    );


            localStorage.setItem(
                "lunaDarkMode",
                dark
                    ? "true"
                    : "false"
            );

        }
    );


    /* =====================================================
       RESTORE DARK MODE
       ===================================================== */

    if (
        localStorage.getItem(
            "lunaDarkMode"
        ) === "true"
    ) {

        $("body")
            .addClass(
                "dark-mode"
            );
    }


    /* =====================================================
       INITIAL SCREEN
       ===================================================== */

    if (
        currentUser &&
        users[currentUser]
    ) {

        showApp();

    } else {

        showStartScreen();

    }

});