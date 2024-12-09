import OpenAI from "openai";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import 'dotenv/config';


const app = express();

const OPEN_API_KEY = process.env.OPEN_API_KEY
if (!OPEN_API_KEY) {
    console.error("API Key is missing. Please set it in Vercel environment variables.");
    process.exit(1); // Stop execution if the API key is missing
}
//PORT as per stage local or production
const port = process.env.PORT || 80;

// Specify the allowed domains
const allowedDomains = ["https://storyspark-prompt.vercel.app", "http://localhost:3000"];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedDomains.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};

// Configure CORS with the custom domains
app.use(cors(corsOptions));

// Middleware for parsing JSON request bodies
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: OPEN_API_KEY });

//Documentation
app.get("/", (req, res) => {
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>OpenAI API Service</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f9;
                }
                h1 {
                    color: #333;
                }
                pre {
                    background: #e9e9e9;
                    padding: 10px;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    margin-bottom: 10px;
                }
                .endpoint {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to the OpenAI API Service</h1>
            <p>This service allows you to generate responses from OpenAI's GPT models. Below are the available endpoints:</p>
            
            <div class="endpoint">
                <h2>POST /generate</h2>
                <p>Generates multiple responses from OpenAI based on the provided prompt.</p>
                <strong>Request Body:</strong>
                <pre>
{
    "prompt": "string (required)"
}
                </pre>
                <strong>Response:</strong>
                <pre>
{
    "responses": ["string[] - An array of generated responses"]
}
                </pre>
            </div>
            <hr />
            <div class="endpoint">
                <h2>POST /image</h2>
                <p>Generate image from OpenAI based on the provided prompt.</p>
                <strong>Request Body:</strong>
                <pre>
{
    "prompt": "string (required)"
}
                </pre>
                <strong>Response:</strong>
                <pre>
{
    "imageURL": "string - image url"
}
                </pre>
            </div>
        </body>
        </html>
    `);
});

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
                max_tokens: 150,
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

// POST to OpenAI Image
app.post("/image", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const response = await openai.images.generate({
            model: "dall-e-2",
            prompt: prompt,
            n: 1,
            size: "512x512",
        });
        return res.status(200).json(response.data[0].url);
    } catch (error) {
        console.error("Error generating response:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running`);
});