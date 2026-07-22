require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
const { SCREENSHOT_CHECKER_PROMPT } = require("./prompt");

const app = express();
const port = process.env.PORT || 3001;

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", function (req, res) {
    res.json({
        message: "Screenshot Checker backend is running with Gemini.",
    });
});

app.post("/api/analyze", async function (req, res) {
    try {
        const { imageBase64, mimeType, questionType, followUpQuestion } = req.body;

        if (!imageBase64 || !mimeType || !questionType) {
            return res.status(400).json({
                error: "Missing screenshot, image type, or question type.",
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Missing Gemini API key. Check backend/.env.",
            });
        }

        const userQuestion = buildUserQuestion(questionType, followUpQuestion);

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${SCREENSHOT_CHECKER_PROMPT}\n\n${userQuestion}`,
                        },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: imageBase64,
                            },
                        },
                    ],
                },
            ],
        });

        res.json({
            result: response.text,
        });
    } catch (error) {
        console.error("Analyze error:", error);

        res.status(500).json({
            error: error.message || "Something went wrong while analyzing the screenshot.",
        });
    }
});

function buildUserQuestion(questionType, followUpQuestion) {
    let questionLabel = "";

    if (questionType === "meaning") {
        questionLabel = "What does this mean?";
    } else if (questionType === "safety") {
        questionLabel = "Is this safe?";
    } else if (questionType === "action") {
        questionLabel = "Should I do anything with this?";
    } else {
        questionLabel = "Other";
    }

    return `
The user selected this question: ${questionLabel}

Optional user note:
${followUpQuestion || "No additional note provided."}

Please analyze the screenshot and answer in the required structure.
`;
}

app.listen(port, function () {
    console.log(`Screenshot Checker backend running with Gemini at http://localhost:${port}`);
});