const jwt = require('jsonwebtoken')
 
module.exports = (req, res, next) => {
    try {
        // Récupérer le token de l'en-tête d'autorisation
        const token = req.headers.authorization.split(' ')[1]
        
        // Décoder le token en vérifiant sa validité avec la clé secrète
        const decodedToken = jwt.verify(token, process.env.CLE_SECRETE)
        
        // Extraire l'identifiant de l'utilisateur du token décodé
        const userId = decodedToken.userId
        
        // Ajouter l'identifiant de l'utilisateur à l'objet req
        req.auth = {
            userId: userId,
        }
        
        next()
    } catch(error) {
        res.status(401).json({ error })
    }
 }
 