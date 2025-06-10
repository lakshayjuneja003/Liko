import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { storage } from './Storage.js';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { QdrantVectorStore } from '@langchain/qdrant';
dotenv.config(); 
const app = express();
app.use(express.json());
app.use(cors());

const queue = new Queue("file-upload-queue" ,{
    connection: {
        host: 'localhost',
        port: 6379,
    }
})

const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log(process.env.QDRANT_ENDPOINT);
});
app.post('/upload', upload.single('file'), async (req, res) => {
    await queue.add('file-ready', JSON.stringify({
      filename: req.file.originalname,
      source:req.file.destination,
      path:req.file.path,
    }))
    return res.status(200).json({
      message: 'File uploaded successfully',
    });
})

const embeddings = new TogetherAIEmbeddings({
  apiKey: process.env.TOGETHER_API_KEY,
  model: "togethercomputer/m2-bert-80M-32k-retrieval",
});

let vectorStore;
(async () => {
  vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_ENDPOINT,
      apiKey: process.env.QDRANT_KEY,
      collectionName: "pdf-docs",
    }
  );
})();

app.get("/chat", async (req, res) => {
  try {
    const userQuery = 'How does the report compare the potential impact of generative AI on advanced economies versus emerging markets, and what policy responses does it suggest for each?';

    const retriever = vectorStore.asRetriever({ k: 6 });
    const results = await retriever.invoke(userQuery);
    const context = results.map(doc => doc.pageContent).join("\n\n");

    const systemPrompt = `
        You are a helpful assistant. Answer the user's question based only on the provided context. 
        If the answer is not in the context, say "I don't know based on the provided context."

        Context:
        ${context}
            `.trim();

    //  Calling TogetherAI API
      const togetherResponse = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

    const togetherJson = await togetherResponse.json();
    if (togetherJson?.choices?.[0]?.message?.content) {
      return res.status(200).json({
        message: "Response from TogetherAI",
        answer: togetherJson.choices[0].message.content,
      });
    } else {
      return res.status(500).json({ error: "Failed to generate response from TogetherAI" });
    }
  } catch (error) {
    console.error("Error in /chat endpoint:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});