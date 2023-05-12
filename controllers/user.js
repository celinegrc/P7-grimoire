const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
     // Vérifier que l'email est au format valide
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(req.body.email)) {
      console.log("Adresse non valide.")
      res.status(400).json("Adresse non valide" )
       } else {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash
    });

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé !' })}
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
          return res.status(401).json({ error: 'Mot de passe incorrect !' });
        } else {
            const userId = user._id;
            const token = jwt.sign({ userId }, 'SECRET_KEY');
            console.log (token)
            res.status(200).json({
                userId: user._id,
                token: token
            })
        }   
    } catch (error) {
        res.status(400).json({ error });
    }
 };
