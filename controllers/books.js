const Book = require ('../models/book')
const sharp = require('sharp');
const fs = require('fs');

exports.postBook = (req, res) => {
    console.log(req.body)
    console.log(req.file)
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id;
    const imagePath = `${req.protocol}://${req.get('host')}/images/`;
  
  sharp(req.file.path)
    .resize(404, 568)
    .toFormat('webp')
    .toFile(`images/${req.file.filename.split('.')[0]}.webp`, (err) => {
      if (err) {
        return res.status(400).json({ error: err });
      }

      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(err);
        }
      });

    const book = new Book({
      ...bookObject,
      imageUrl: `${imagePath}${req.file.filename.split('.')[0]}.webp`
    });
    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => res.status(400).json({ error }));
    })
  };


exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => {
      res.status(200).json(books);
    })
    .catch(error => {
    res.status(400).json({ error });
    });
  };

exports.getOneBook = (req,res)=>{
  Book.findOne({ _id: req.params.id })
    .then(Book => res.status(200).json(Book))
    .catch(error => res.status(404).json({ error }));
}

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
            console.log(book.ratings)
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
   Book.findOne({ _id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
            console.log(book.userId)   
              const filename = book.imageUrl.split('/images/')[1];
              console.log(filename)  
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json(`Il y a une erreur ici` + {error}));
              });
          }
      })
      .catch( error => {
        console.log(error); // Ajouter cette ligne pour afficher l'erreur sur la console
        res.status(500).json({ error })})
};


exports.rateBook = (req,res,next)=>{
  console.log('ok')
    .then(() => res.status(200).json({ message: ' !'}))
    .catch(error => res.status(400).json({ error }));
}

exports.getBestBooks = (req,res,next)=>{
  console.log('ok')
    .then(() => res.status(200).json({ message: ' !'}))
    .catch(error => res.status(400).json({ error }));
}