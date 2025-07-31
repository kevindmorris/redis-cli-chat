# 💬 Redis CLI Chat

A simple two-way command-line chat application built with Node.js and Redis Pub/Sub.

## ⚙️ Requirements

- Node.js 18+ 🧑‍💻
- Docker 🐳 (or some Redis server to connect)

## 🚀 Usage

1. Clone the repository

2. Install dependencies

   ```bash
   npm i
   ```

3. Start a Redis server with Docker

   ```bash
   docker run --name redis -p 6379:6379 -d redis
   ```

4. Join the chat

   ```bash
   npm run chat
   # or
   node chat.js
   ```
