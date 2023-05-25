const Book = require ('../models/book')
const fs = require('fs')

exports.postBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book)

    const today = new Date();
    const year = today.getFullYear()
       // Si l'année de publication du livre est supérieure à l'année actuelle, renvoie une erreur et un message correspondant
    if (bookObject.year > year) {
      console.log("Année de publication postérieure de la date actuelle")
      res.status(400).json("Année de publication postérieure de la date actuelle.")
    } else {
      delete bookObject._id
      delete bookObject._userId

      const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}resized.webp`
      });

      await book.save()

      res.status(201).json({ message: 'Livre enregistré !' })
    }
  } catch (error) {
    res.status(400).json({ error })
  }
}

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.getOneBook = async (req,res)=>{
  try {
    const book = await  Book.findOne({ _id: req.params.id })
    res.status(200).json(book)
  } catch (error) { 
    res.status(404).json({ error })
  }
}

exports.modifyBook = async (req, res) => {
  try {
    // Vérifie si une image est attachée à la requête et construit l'objet book en conséquence
    const bookObject = req.file ? { 
      ...JSON.parse(req.body.book),
      imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}resized.webp`
    } : {...req.body}
    
    const today = new Date();
    const year = today.getFullYear()
    
    if (bookObject.year > year) {
      // Si l'année de publication du livre est supérieure à l'année actuelle, renvoie une erreur et un message correspondant
      console.log("Année de publication postérieure à la date actuelle");
      res.status(400).json("Année de publication postérieure à la date actuelle.")
    } else {
      delete bookObject._userId
      const book = await Book.findOne({_id: req.params.id})
      
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message : 'Not authorized'})
      } else {
        if (req.file) {
          try {
            const filename = book.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, (err) => {
              if (err) throw err
            });
          } catch (error) {
            console.log(error);
            res.status(500).json({ error })
          }
        }       
        // Met à jour le livre correspondant à l'identifiant fourni avec les nouvelles informations de bookObject
        await Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
  
        res.status(200).json({message : 'Objet modifié!'})
      }
    }
  } catch(error) {
    res.status(400).json({ error })
  }
}


exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: 'Not authorized' });
    } else {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, async () => {
        await Book.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Objet supprimé !' });
      });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

exports.rateBook = async (req,res)=>{
  try {
    const book = await Book.findOne({_id: req.params.id})
    const newRatingObject = {
      userId: req.auth.userId,
      grade: req.body.rating
    }

    const hasUserVoted = book.ratings.find(rating => rating.userId === req.auth.userId)
    
    if ((book.userId !== req.auth.userId) && (!hasUserVoted)){
      book.ratings.push(newRatingObject) 
      const allRatings = book.ratings.map(rating => rating.grade)
      const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        
      book.averageRating = averageRating.toFixed(1)

      await book.save()
      res.status(200).json(book)

    } else { 
      await res.status(401).json({ error: 'Vous ne pouvez pas voter pour ce livre.'})
    }
    
  } catch (error) {
    res.status(401).json( { error })
  }
}

exports.getBestBooks = async (req,res)=>{
  try{
    const books = await Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    res.status(200).json(books)
  } catch (error) {
    res.status(401).json({ error });
  }
}

