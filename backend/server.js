const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server running...");
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const history = req.body.history || [];

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "You are LUNA, a smart and helpful AI assistant."
                    },
                    ...history,
                    {
                        role: "user",
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = response.data.choices[0].message.content;

        res.json({ reply });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ reply: "Error from AI" });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});