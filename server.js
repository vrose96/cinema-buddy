require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/user_movies', async (req, res) => {
  const { userId, movieId, listType } = req.body;
  const { data, error } = await supabase.from('user_movies').insert([{ user_id: userId, movie_id: movieId, list_type: listType }]);
  if (error) {
    console.error('Error inserting user movie:', error);
    res.status(400).json({ error });
  } else {
    res.status(201).json(data);
  }
});

app.post('/api/ratings', async (req, res) => {
  const { userId, movieId, rating } = req.body;
  const { data, error } = await supabase.from('ratings').insert([{ user_id: userId, movie_id: movieId, rating }]);
  if (error) {
    console.error('Error inserting rating:', error);
    res.status(400).json({ error });
  } else {
    res.status(201).json(data);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
