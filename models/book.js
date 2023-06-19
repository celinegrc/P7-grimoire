const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  image: {
    filename: { type: String},
    contentType: { type: String}
  },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, min: 1, max: 5, required: true }
    }
  ],
  averageRating: { type: Number, required: true }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
