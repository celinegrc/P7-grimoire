const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


exports.signup = async (req, res) => {
  try {
    // Vérification du format de l'adresse e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(req.body.email))  {
      // Erreur si l'adresse e-mail n'est pas valide
      res.status(400).json("Adresse non valide")
    }else if (!req.body.password) {
        // Erreur si aucun mot de passe n'est fourni
        res.status(400).json("Mot de passe manquant")
    } else {

      // Génération du hachage en utilisant bcrypt 
      const hash = await bcrypt.hash(req.body.password, 10)

      // Création d'un nouvel utilisateur avec l'adresse e-mail et le mot de passe haché
      const user = new User({
        email: req.body.email,
        password: hash
      })
      await user.save()
      res.status(201).json({ message: 'Utilisateur créé !' })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

exports.login = async (req, res) => {
  try {
    // Recherche de l'utilisateur 
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).json({ error: 'Paire login/mot de passe incorrecte' })
    }

    // Vérification du mot de passe 
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if (!validPassword) {
      // Erreur si mot de passe incorrect
      return res.status(401).json({ error: 'Paire login/mot de passe incorrecte' })
    } else {
      const userId = user._id

      // Génération du token
      const token = jwt.sign(
        { userId },
        process.env.CLE_SECRETE,
        { expiresIn: '4h' }
      )

      // Réponse avec l'identifiant de l'utilisateur et le token
      res.status(200).json({
        userId: user._id,
        token: token,
      })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

