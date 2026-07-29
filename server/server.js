require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

connectDB();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/parties', require('./routes/parties'));
app.use('/api/trucks', require('./routes/trucks'));
app.use('/api/bilties', require('./routes/bilties'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/staff', require('./routes/staff'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Zipkart Integrated Logistics API running at http://localhost:${PORT}`);
});
