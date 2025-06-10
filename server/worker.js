import { Worker } from 'bullmq';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from 'dotenv';
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { Document } from "langchain/document";

dotenv.config();

const worker = new Worker('file-upload-queue', async (job) => {
  try {
    console.log('Processing job:', job.data);
    const data = JSON.parse(job.data);
    const path = data?.path;

    if (!path) {
      console.log('No path provided in job data');
      return;
    }

    // Load and join all PDF content
    const loader = new PDFLoader(path);
    const docs = await loader.load();
    const allText = docs.map(doc => doc.pageContent).join('\n\n');
    console.log("1")
    // Chunk the content
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 0,
    });
    const chunks = await splitter.splitText(allText);
    console.log("2")
    // Wrap chunks into Document format
    const documents = chunks.map((text, i) => new Document({
      pageContent: text,
      metadata: { id: i },
    }));
    console.log("3")
    // Initialize Qdrant client
    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_ENDPOINT,
      apiKey: process.env.QDRANT_KEY,
      checkCompatibility: false,
    });
    console.log("4")
    // Use TogetherAI for cloud embeddings
    const embeddings = new TogetherAIEmbeddings({
      apiKey: process.env.TOGETHER_API_KEY,
      model: "togethercomputer/m2-bert-80M-32k-retrieval",
    });
    console.log("5")
    // Store in Qdrant
    const vectorStore = await QdrantVectorStore.fromDocuments(documents, embeddings, {
      client: qdrantClient,
      collectionName: "pdf-docs",
    });
    console.log("6")
    console.log("Stored documents in Qdrant vector store:", vectorStore);
    console.log('Job processed successfully:', job.id);
    return { success: true };

  } catch (error) {
    console.error('Job processing failed:', error);
  }
}, {
  concurrency: 100,
  connection: {
    host: 'localhost',
    port: 6379,
  }
});
