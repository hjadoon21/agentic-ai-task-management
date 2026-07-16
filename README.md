# Agentic AI Task Management System

## Contributors

- Hashmat Jadoon
- Gursiman Doad
- Neel Patel

---

## Overview

The Agentic AI Task Management System is a full-stack web application that helps classify and prioritize university-related tasks using multiple Large Language Models (LLMs).

The system allows users to create and manage tasks, analyze them using AI providers, compare provider responses, and evaluate provider performance using a labeled university query dataset.

The project was developed using a client-server architecture with a React frontend, Express.js backend, MongoDB Atlas database, and integrations with OpenAI, Google Gemini, and DeepSeek.

---

## Features

### Task Management

- Create tasks
- View all tasks
- Edit existing tasks
- Delete tasks
- Store task history in MongoDB Atlas

### AI Analysis

- Analyze tasks using AI
- OpenAI integration
- Google Gemini integration
- DeepSeek integration
- Provider selection before analysis
- Consensus generation across providers
- Graceful handling of provider failures
- Store AI analysis with each task

### AI Comparison

- Compare provider predictions
- View confidence scores
- Compare response times
- Compare predicted priority and category
- Consensus summary

### Dataset Evaluation

- Load university query dataset
- Training and test dataset summaries
- Select evaluation sample size
- Select evaluation providers
- Run dataset evaluations
- Accuracy calculation
- Precision calculation
- Recall calculation
- F1 Score calculation
- Confusion matrices
- Response time metrics
- Confidence metrics
- Performance charts

---

## Technology Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### AI Providers

- OpenAI
- Google Gemini
- DeepSeek

### Development Tools

- Git
- GitHub
- Postman
- VS Code

---

## Project Structure

```
agentic-ai-task-management/

├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── dataset/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── README.md
├── package.json
└── .env.example
```

---

## Installation

### Clone the repository

```bash
git clone <repository-url>

cd agentic-ai-task-management
```

### Install dependencies

Root

```bash
npm install
```

Server

```bash
cd server

npm install
```

Client

```bash
cd client

npm install
```

---

## Environment Variables

Create a `.env` file inside the **server** directory.

Example:

```text
PORT=5000

MONGODB_URI=your_mongodb_connection_string

OPENAI_API_KEY=your_openai_api_key

GEMINI_API_KEY=your_gemini_api_key

DEEPSEEK_API_KEY=your_deepseek_api_key
```

---

## Running the Application

### Backend

```bash
cd server

npm run dev
```

### Frontend

```bash
cd client

npm run dev
```

---

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/tasks | Retrieve all tasks |
| GET | /api/tasks/:id | Retrieve a task |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

---

### AI

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/ai/analyze/:taskId | Analyze a task using selected AI providers |

---

### Evaluation

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/evaluation/summary | Dataset summary |
| GET | /api/evaluation/sample | Dataset sample |
| POST | /api/evaluation/run | Run dataset evaluation |

---

## AI Workflow

1. User creates a task.
2. User selects one or more AI providers.
3. The backend sends the task to the selected providers.
4. Provider responses are collected.
5. A consensus result is generated.
6. Results are stored in MongoDB.
7. The frontend displays provider comparisons and consensus information.

---

## Evaluation Workflow

1. Load the university query dataset.
2. Select the dataset split.
3. Select sample size.
4. Select AI providers.
5. Run evaluation.
6. Compare predictions with ground-truth labels.
7. Calculate:

- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- Average Confidence
- Average Response Time

8. Display results using charts and tables.

---

## Screenshots

Include screenshots of:

- Dashboard
- Task Management
- AI Analysis
- Provider Comparison
- Evaluation Dashboard
- Performance Charts
- Confusion Matrix

---

## Future Improvements

Possible future enhancements include:

- User authentication
- Role-based access control
- Background evaluation jobs
- Export evaluation reports
- Additional AI providers
- Larger benchmark datasets
- Historical analytics
- Docker deployment

---

## License

This project was developed for educational purposes as part of a university software engineering course.