const Book = require ('../models/book')
const sharp = require('sharp');
const fs = require('fs');

exports.postBook = async (req, res) => {
  
  try {
    const bookObject = JSON.parse(req.body.book);
    const today = new Date()
    const year = today.getFullYear()
    if (bookObject.year > year){
      console.log("Année de publication postérieure de la date actuelle.")
      res.status(400).json("Année de publication postérieure de la date actuelle.")
    } else {
      delete bookObject._id;
      const imagePath = `${req.protocol}://${req.get('host')}/images/`;
 
     await sharp(req.file.path)
      .resize(404, 568)
      .webp({ quality: 80 })
      .toFile(`images/${req.file.filename.split('.')[0]}.webp`);

      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(err);
        }
    });

    const book = new Book({
      ...bookObject,
      imageUrl: `${imagePath}${req.file.filename.split('.')[0]}.webp`,
    });

    await book.save();

    res.status(201).json({ message: 'Livre enregistré !' })}
  } catch (error) {
    res.status(400).json({ error });
  }
};


exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find()
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  };
};

exports.getOneBook = async (req,res)=>{
  try {
    const book = await  Book.findOne({ _id: req.params.id })
    res.status(200).json(book)
  } catch (error) { 
    res.status(404).json({ error });
  }
}


exports.modifyBook = async (req, res, next) => {
  try {
   console.log(req.body)
    const bookObject = req.file ? { 
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename }`
    } : { ...req.body };
    delete bookObject._userId;

    const book = await Book.findOne({_id: req.params.id});
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message : 'Not authorized'});
    } else {
      if (req.file) {
        const imagePath = `images/${req.file.filename}`;  
        try {

          await sharp(imagePath)
          .resize(404, 568)  
          .webp({ quality: 70 })  
          .toFile(`images/${req.file.filename.split('.')[0]}.webp`);
          
        
          fs.unlink(req.file.path, (err) => {
            if (err) {
              console.error(err);
            }})
            
         bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0].split('.')[0]}.webp`;  //


          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, (err) => {
            if (err) throw err;
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error });
          return;
        }
        
      }
      await Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id});
      res.status(200).json({message : 'Objet modifié!'});
    }
  } catch(error) {
    res.status(400).json({ error });
  }
};


exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: 'Not authorized' });
    } else {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, async () => {
        try {
          await Book.deleteOne({ _id: req.params.id });
          res.status(200).json({ message: 'Objet supprimé !' });
        } catch (error) {
          res.status(401).json(`Il y a une erreur ici` + { error });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};


exports.rateBook = async (req,res,next)=>{
  try {
    const book = await Book.findOne({_id: req.params.id})
    const arrayRating = book.ratings
    const newRatingObject = {
      userId: req.body.userId,
      grade: req.body.rating

    };
    
    if (book.userId != req.auth.userId){
     arrayRating.push(newRatingObject) 
      const allRatings = arrayRating.map(rating => rating.grade);
      const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      book.averageRating = averageRating.toFixed(1);
      await book.save();
    }
    res.status(200).json(book)
  } catch (error) {
  res.status(401).json( { error });
  }
}

exports.getBestBooks = async (req,res,next)=>{
  console.log('meilleurs livres')
  try{
    const books = await Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
 
    res.status(200).json(books)
  } catch (error) {
  res.status(401).json({ error });
  }
}


