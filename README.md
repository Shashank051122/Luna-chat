# Chat UI Application

# Description

This project is a modern and responsive chat user interface inspired by applications like ChatGPT and Claude. It is built using HTML, CSS, JavaScript, jQuery, and Bootstrap. The focus of this project is to create a smooth and interactive front-end experience without relying on any backend or real AI integration.

The application simulates a chat system with multiple chat sessions, user profile support, and various UI enhancements. It demonstrates concepts such as DOM manipulation, local storage, responsive design, and interactive UI components.


# Features

# Chat Functionality

* Send and display messages with timestamps
* Different styles for user and AI messages
* Typing indicator simulation
* AI response typing animation
* Auto-scroll when new messages are added
* Auto-resizing textarea input
* Enter to send message and Shift+Enter for new line
* Prevent sending empty messages

# Multi-Chat System

* Create multiple chat sessions
* Switch between chats from sidebar
* Each chat maintains its own message history
* Chat history is saved using localStorage
* Chats persist even after page refresh

# Chat Management

* Rename chat titles
* Delete chats with proper handling
* Automatic naming of chats (Chat 1, Chat 2, etc.)
* Auto rename based on first user message
* Active chat highlighting in sidebar

# User Interface

* Sidebar with chat history
* Mobile responsive design with hamburger menu
* Clean layout inspired by modern chat applications
* Suggestion cards on welcome screen
* Welcome screen hides after first interaction

# User Profile

* Editable user name
* Avatar generated from user’s name
* Profile data stored in localStorage
* Profile persists after page refresh

# UI Enhancements

* Dark mode toggle
* Custom scrollbar styling
* Smooth animations and transitions
* Hover effects on buttons and cards



# Technologies Used

* HTML5
* CSS3 (Flexbox, CSS Variables, Animations)
* JavaScript
* jQuery
* Bootstrap 5
* Font Awesome
* Google Fonts



# Project Structure

```
ChatUI/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── chat.js
├── screenshots/
│   ├── desktop.png
│   ├── mobile.png
│   └── tablet.png
└── README.md
```



# How to Run the Project

1. Download or extract the project folder
2. Open the folder in Visual Studio Code
3. Right click on `index.html`
4. Select "Open with Live Server"
5. The application will open in your browser



# Testing

The application has been tested for:

* Message sending and display
* Different styling for user and AI messages
* Chat switching and persistence
* Rename and delete chat functionality
* Responsive design on different screen sizes
* Sidebar toggle on mobile view
* Proper input handling and validation
* Smooth animations and transitions
* No console errors during execution



# Notes

This project is a front-end implementation and does not include real AI integration. AI responses are simulated using predefined messages. The application is designed to demonstrate UI/UX design and JavaScript functionality.



# Author

[Shashank M Y]
