# LUNA – AI Chat Application

## Overview

LUNA is a web-based AI chat application inspired by modern conversational interfaces like ChatGPT. It allows users to interact with an AI assistant through a clean and responsive interface. The application supports multiple users, chat history management, and real-time AI responses powered by an external API.

The project is fully deployed and can be accessed through a public link, making it usable from any device with a browser.

---

## Features

* User authentication system (Login and Create Account)
* Separate user sessions with independent chat histories
* AI-powered responses using external API integration
* Chat history with rename and delete functionality
* New chat creation and session management
* Typing indicator and stop response feature
* Suggestion cards for quick prompts
* Dark mode toggle
* Responsive design for desktop and mobile
* Sidebar navigation with scroll support

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript (jQuery)

### Backend

* Node.js
* Express.js

### API

* OpenRouter AI API

### Deployment

* Frontend hosted on Vercel
* Backend hosted on Render

---

## Project Structure

```
luna-chat/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   └── chat.js
│
└── backend/
    ├── server.js
    ├── package.json
```

---

## How It Works

1. The user opens the application through a public URL.
2. The user can either log in or create a new account.
3. Once logged in, the user can start chatting with the AI.
4. Messages are sent to the backend server.
5. The backend communicates with the AI API and returns responses.
6. The frontend displays the response with a typing animation.
7. Chat history is stored and managed per user.

---

## Setup Instructions (Local)

1. Clone the repository
2. Navigate to the backend folder:

   ```
   cd backend
   ```
3. Install dependencies:

   ```
   npm install
   ```
4. Create a `.env` file and add:

   ```
   OPENROUTER_API_KEY=***************
   ```
5. Start the server:

   ```
   node server.js
   ```
6. Open `index.html` in your browser

---

## Deployment

The application is deployed using:

* Vercel for the frontend
* Render for the backend

The frontend communicates with the backend using the deployed API URL.

---

## Notes

* The current version uses local storage for managing user sessions on a device.
* Backend-based user storage can be added for cross-device access.
* The AI response quality depends on the external API used.

---

## Conclusion

LUNA demonstrates a complete end-to-end AI chat system with frontend, backend, and deployment. It reflects a practical implementation of a modern web application with real-world usability.
