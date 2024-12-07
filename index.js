import OpenAI from "openai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config';


const app = express();

const OPEN_API_KEY = "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"

const port = 80;

// Configure CORS
app.use(cors());

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: OPEN_API_KEY });

// POST to OpenAI prompts
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Store multiple responses
        const responses = [];

        // define number of responses you want (e.g., 5)
        const numberOfResponses = 5;

        // Generate multiple completions based on the prompt
        for (let i = 0; i < numberOfResponses; i++) {
            const stream = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                stream: true,
            });

            let generatedText = "";

            for await (const chunk of stream) {
                generatedText += chunk.choices[0]?.delta?.content || "";
            }

            // Push the generated text
            responses.push(generatedText);
        }

        // Return as a JSON object
        return res.status(200).json({ responses });
    } catch (error) {
        console.error("Error generating response:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running`);
});