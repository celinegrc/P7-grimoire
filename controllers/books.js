const Book = require ('../models/book')
const fs = require('fs')

exports.postBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book)

    const today = new Date()
    const year = today.getFullYear()
    
    // Vérifie si l'année de publication du livre est supérieure à l'année actuelle
    if (bookObject.year > year) {
      console.log("Année de publication postérieure à la date actuelle")
      res.status(400).json("Année de publication postérieure à la date actuelle.")
    } else {
      delete bookObject._id
      delete bookObject._userId
    
      // Crée une nouvelle instance de modèle Book avec les données du livre
      const book = new Book({
      ...bookObject, 
      userId: req.auth.userId, 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}resized.webp` 
      })
    
      // Enregistre le livre dans la base de données
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
    // Vérifie si une image est attachée à la requête et construit l'objet bookObject en conséquence
    const bookObject = req.file ? { 
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.split('.')[0]}resized.webp`
    } : {...req.body}
    
    const today = new Date()
    const year = today.getFullYear()
    
    if (bookObject.year > year) {
      // Si l'année de publication du livre est supérieure à l'année actuelle, renvoie une erreur et un message correspondant
      res.status(400).json("Année de publication postérieure à la date actuelle.")
    } else {
      delete bookObject._userId
      const book = await Book.findOne({ _id: req.params.id })
      
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Not authorized' })
      } else {
        if (req.file) {
          try {
            const filename = book.imageUrl.split('/images/')[1]
            // Supprime l'ancienne image du livre du système de fichiers
            fs.unlink(`images/${filename}`, (err) => {
              if (err) throw err
            })
          } catch (error) {
            console.log(error)
            res.status(500).json({ error })
          }
        }
        
        // Met à jour le livre correspondant à l'identifiant fourni avec les nouvelles informations de bookObject
        // L'ID du livre reste le même après la mise à jour
        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
  
        res.status(200).json({ message: 'Objet modifié !' })
      }
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id })

    if (book.userId != req.auth.userId) {
      // Vérifie si l'ID de l'utilisateur du livre correspond à l'ID de l'utilisateur authentifié
      res.status(403).json({ message: 'Not authorized' })
    } else {
      const filename = book.imageUrl.split('/images/')[1]

      // Supprime le fichier d'image associé au livre du système de fichiers
      fs.unlink(`images/${filename}`, async () => {
        // Supprime le livre de la base de données en utilisant l'ID fourni
        await Book.deleteOne({ _id: req.params.id })

        res.status(200).json({ message: 'Objet supprimé !' })
      })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

/*exports.rateBook = async (req,res)=>{
  try {
    const book = await Book.findOne({_id: req.params.id})
    const newRatingObject = {
      userId: req.auth.userId,
      grade: req.body.rating
    }
    // Vérifie si l'utilisateur a déjà voté pour ce livre
    const hasUserVoted = book.ratings.find(rating => rating.userId === req.auth.userId)
    
    if  (!hasUserVoted){
      book.ratings.push(newRatingObject)
      // Calcul de la note moyenne en utilisant toutes les notes
      const allRatings = book.ratings.map(rating => rating.grade)
      const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      // Mise à jour de la note moyenne du livre arrondi à un chiffre
      book.averageRating = averageRating.toFixed(1)

      //await book.save()
      res.status(200).json(book)

    } else { 
      res.status(401).json({ error: 'Vous ne pouvez pas voter pour ce livre.'})
    }
    
  } catch (error) {
    res.status(401).json( { error })
  }
}*/

exports.rateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id })

    // Création de l'objet de nouvelle note
    const newRatingObject = {
      userId: req.auth.userId,
      grade: req.body.rating,
    }

    // Vérification si l'utilisateur a déjà voté pour ce livre
    const hasUserVoted = book.ratings.find((rating) => rating.userId === req.auth.userId)

    if (!hasUserVoted) {
      //Ajout de la nouvelle note dans le tableau ratings
      book.ratings.push(newRatingObject)

     // Récupération des valeurs des notes du tableau ratings
     const allRatings =book.ratings.map((rating)=> rating.grade)
     //Calcul de la nouvelle moyenne
      const averageRating = allRatings.reduce((acc, curr) => acc + curr, 0) / allRatings.length 
      const newAverageRating = averageRating.toFixed(1)

      // Mise à jour du livre avec les nouveaux champs de note et de note moyenne
      await Book.updateOne(
        { _id: req.params.id },
        { ratings: book.ratings, averageRating: newAverageRating,_id: req.params.id },
        { new: true }
      )

      // Recherche du livre mis à jour pour obtenir les dernières valeurs
      const updatedBook = await Book.findOne({ _id: req.params.id })

      // Mise à jour des champs  de note et de note moyenne du livre d'origine
      book.ratings = updatedBook.ratings
      book.averageRating = updatedBook.averageRating

      // Réponse avec le livre mis à jour
      res.status(200).json(updatedBook)
    } else {
      res.status(403).json({ error: 'Vous ne pouvez pas voter pour ce livre.' })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}



exports.getBestBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 }) // Tri des livres par ordre décroissant de la note moyenne
      .limit(3) // Limite le nombre de livres renvoyés à 3

    res.status(200).json(books)
  } catch (error) {
    res.status(500).json({ error })
  }
}


