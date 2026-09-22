const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("LUNA backend is running...");
});

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        const history = req.body.history || [];

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openrouter/free",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are LUNA, a smart and helpful AI assistant."
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
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = response.data.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error(
            error.response?.data || error.message
        );

        res.status(500).json({
            reply: "I couldn't connect to the AI service right now."
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`LUNA backend running on port ${PORT}`);
});