// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = 'mongodb://0.0.0.0:27017/event';
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB', err));

// Define the Event schema
const eventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  end: Date,
});

const Event = mongoose.model('Event', eventSchema);

// API for fetching all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// API for creating a new event
app.post('/api/events', async (req, res) => {
  try {
    const { title, start, end } = req.body;
    const newEvent = new Event({ title, start, end });
    await newEvent.save();
    res.json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

// API for updating an existing event
app.put('/api/events/:eventId', async (req, res) => {
  try {
    const { title, start, end } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      { title, start, end },
      { new: true }
    );
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

// API for deleting an event
app.delete('/api/events/:eventId', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);
    res.json(deletedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// Start the server
app.listen(8000, () => {
    console.log("Server started on port 8000");
  });
  
