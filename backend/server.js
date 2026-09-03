const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined!');
}

// DocumentDB requires TLS options
const mongooseOptions = {
  tls: true,
  tlsCAFile: path.join(__dirname, 'global-bundle.pem'),
  retryWrites: false,
  authMechanism: 'SCRAM-SHA-1', // <--- Explicitly instruct Mongoose to use SCRAM-SHA-1
  serverSelectionTimeoutMS: 5000 // Prevents 30s connection buffering timeouts
};

// Monitor connection lifecycle in CloudWatch
mongoose.connection.on('connecting', () => console.log('Mongoose connecting to DocumentDB...'));
mongoose.connection.on('connected', () => console.log('Successfully connected to DocumentDB/MongoDB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected!'));

mongoose.connect(MONGO_URI, mongooseOptions)
  .catch(err => console.error('Initial database connection failure:', err));

// Define Schema
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// API Route: GET all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// API Route: POST new comment
app.post('/api/comments', async (req, res) => {
  try {
    const { name, country, comment } = req.body;
    
    if (!name || !country || !comment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newComment = new Comment({ name, country, comment });
    await newComment.save();
    
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

// Start Server bound to 0.0.0.0
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));