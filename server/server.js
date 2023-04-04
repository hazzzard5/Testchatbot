import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import Pinecone from "@pinecone-io/client-js";

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.Open_API_KEY,
});

const openai = new OpenAIApi(configuration);
const pinecone = new Pinecone.Client({ apiKey: process.env.PINECONE_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from UASK!'
    })
})

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        // Get embeddings from Pinecone
        const embeddings = await pinecone.queryEmbeddings({
            index_name: process.env.PINECONE_INDEX_NAME,
            query_vector: [prompt],
            top_k: 10 // Return top 10 most similar prompts
        });
        
        const similar_prompts = embeddings.results.map(result => result.id);

        // Use OpenAI to generate response based on most similar prompt
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${similar_prompts[0]}`, // Use most similar prompt as the input
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        });

    } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
    }
})

app.listen(5000, () => console.log('Server is running on port http://localhost:5173/'));
