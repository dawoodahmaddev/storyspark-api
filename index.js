import OpenAI from "openai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config';


const app = express();

const OPEN_API_KEY = "OPEN_API_KEY=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"

const URL = "https://storyspark-api.vercel.app/";

// Configure CORS
app.use(cors());


// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

const openai = new OpenAI({apiKey: OPEN_API_KEY});

// POST route to handle OpenAI prompts
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const stream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        let generatedText = "";

        for await (const chunk of stream) {
            generatedText += chunk.choices[0]?.delta?.content || "";
        }

        return res.status(200).json({ response: generatedText });
    } catch (error) {
        console.error("Error generating response:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at ${URL}`);
});

// async function main() {
//     const stream = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: "what is ai?" }],
//         stream: true,
//     });
//     for await (const chunk of stream) {
//         process.stdout.write(chunk.choices[0]?.delta?.content || "");
//     }
// }

// main();