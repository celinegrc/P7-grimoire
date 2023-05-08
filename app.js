const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user')
const bookRoutes = require('./routes/books')
const path = require('path');

mongoose.connect('mongodb+srv://celinegourc:OpenClassRooms@cluster1.o21r8wy.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json())
     
app.use('/api/auth', userRoutes)
app.use('/api/books', bookRoutes)
app.use('api/books/:id', bookRoutes)
//app.use('/api/books/bestrating', bookRoutes)
app.use('/api/books/:id/rating', bookRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app;