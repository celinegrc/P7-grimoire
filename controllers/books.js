const Book = require ('../models/book')
  
exports.postBook =(function(req, res) {
    console.log(req.body)
    console.log(req.file)
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id;
    const book = new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  });

  exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => {
        res.status(200).json(books);
      })
      .catch(error => {

        res.status(400).json({ error });
      });
  };

  exports.getOneBook = (req,res,next)=>{
    console.log(req.params.id)
    Book.findOne({ _id: req.params.id })
 
    .then(Book => res.status(200).json(Book))
    .catch(error => res.status(404).json({ error }));
}