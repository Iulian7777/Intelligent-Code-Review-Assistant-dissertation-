const express = require('express');
const cors = require('cors');
const { ESLint } = require('eslint');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json()); 

// ==========================================
// 1. DATABASE SETUP (MongoDB via Mongoose)
// ==========================================
mongoose.connect('mongodb://127.0.0.1:27017/codeReviewAssistant')
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define the exact schema we mapped out in Phase 1
const reviewSchema = new mongoose.Schema({
  fileName: String,
  sourceCode: String,
  reviewerName: String,
  automatedAnalysis: Array,
  reviewerFeedback: {
    summary: String,
    issuesFound: String,
    priority: String,
    suggestions: String
  },
  timestamp: { type: Date, default: Date.now }
});

const ReviewSession = mongoose.model('ReviewSession', reviewSchema);

// ==========================================
// 2. STATIC ANALYSIS ENGINE (ESLint)
// ==========================================
const eslint = new ESLint({
  useEslintrc: false,
  overrideConfig: {
    env: { browser: true, es2021: true, node: true },
    parserOptions: { ecmaVersion: 12, sourceType: "module" },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["warn", "single"],
      "indent": ["error", 2],
      "no-unused-vars": "warn",
      "complexity": ["warn", 10],
      "max-lines-per-function": ["warn", 50],
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error"
    }
  }
});

// Route 1: Analyze Code
app.post('/api/analyze', async (req, res) => {
  try {
    const { sourceCode } = req.body;
    if (!sourceCode) return res.status(400).json({ error: "No code provided" });

    const results = await eslint.lintText(sourceCode);
    const formattedIssues = results[0].messages.map(msg => ({
      line: msg.line,
      severity: msg.severity === 2 ? 'Error' : 'Warning',
      message: msg.message,
      ruleId: msg.ruleId
    }));

    res.json({ issues: formattedIssues });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// Route 2: Save the Review Session
app.post('/api/reviews', async (req, res) => {
  try {
    // This takes the data sent from your React form and saves it to MongoDB
    const newReview = new ReviewSession(req.body);
    await newReview.save();
    res.status(201).json({ message: "Review saved successfully!", review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));