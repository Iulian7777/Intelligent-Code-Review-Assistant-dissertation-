# Intelligent Code Review Assistant

**Student ID:** 10438843
**Module:** Dissertation Project (QHO656)

This repository contains the prototype for the Intelligent Code Review Assistant, a decoupled MERN stack web application built to integrate ESLint static analysis directly into a remote code review interface.

## Prerequisites
To run this project locally, you will need:
* **Node.js** (v14 or higher)
* **MongoDB** (A local instance running on `mongodb://127.0.0.1:27017`)

## Installation and Run Instructions

This project is separated into a Node/Express backend and a React frontend. You will need to open two separate terminal windows to run them concurrently.

### 1. Start the Backend (API & ESLint Engine)
Open your first terminal and navigate to the backend directory:
```bash
cd code-review-backend
npm install
node server.js
```

### 2. Start the Frontend (React UI)
Open your second terminal and navigate to the frontend directory:
```bash
cd code-review-frontend
npm install
npm start
```

 