# 🧠 LIKO — Chat With Your PDF

**LIKO** is a powerful and scalable Retrieval-Augmented Generation (RAG) application that enables users to upload and interact with their own PDF documents using natural language. Whether it’s research papers, contracts, reports, or notes — LIKO helps you understand your documents faster by allowing direct Q&A interaction.

> 🚧 **Note:** The app is under active development. Frontend with authentication and core document chat functionality is in progress. Scalable backend infrastructure with user and session-based vector storage is implemented.

---

## ✨ Overview

LIKO combines AI-powered document understanding with a modern and user-friendly interface. Users can either **sign in to get more features and credits**, or use it **without signing up** for limited access. This hybrid experience makes it accessible while also being scalable via account tiers and payments.

---

## 🔧 Key Features

### ✅ Already Implemented
- 🌐 **Modern UI** using **Next.js App Router** + **Tailwind CSS**
- 🔐 **Authentication** via **Clerk** (Sign In / Sign Up / User Button)
- 💼 **Anonymous Mode** with limited API calls for quick trials
- 📄 **PDF Uploading** with per-user or per-session isolation
- 🧠 **Context-aware querying** via TogetherAI embeddings + LLMs
- 📤 **Qdrant Vector Store** integration for document chunking and retrieval
- 💬 Conversational AI using **TogetherAI** chat completions
- 🧾 Chunked retrieval with customizable `k` for precision
- 📁 Each user/session has isolated document storage and context memory

### 🔜 Coming Soon
- 💳 **Payment Integration** (Stripe/Razorpay) for credits
- 🔢 **Rate-limiting & usage tracking** (anonymous vs logged-in)
- ⚙️ **Credits management system** with incentives (free trial + discounts)
- 🧾 **Multi-PDF querying and summaries**
- 🔐 **Access roles**, advanced permission layers (team use)
- 📊 **User dashboard** for query history and document analytics

---

## 🧱 Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | Next.js, Tailwind CSS, Clerk     |
| Backend     | Express.js, Node.js              |
| Vector DB   | Qdrant                           |
| Embeddings  | TogetherAI Embedding Models      |
| LLMs        | TogetherAI Chat Models (Mixtral, LLaMA-2, etc.) |
| Storage     | File System / AWS S3             |
| Auth        | Clerk (optional login system)    |
| Payments    | Stripe / Razorpay (planned)      |
| DB          | PostgreSQL / MongoDB (for users, usage, payments) |

---

## 📁 Project Structure

