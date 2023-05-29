const multer = require('multer')

// Définition des types MIME autorisés et de leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.diskStorage({
  // Destination du fichier
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  // Nom du fichier
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_')
    const nameWithoutExtension = name.split('.')[0]
    const extension = MIME_TYPES[file.mimetype]
    callback(null, nameWithoutExtension + Date.now() + '.' + extension)
  }
})


module.exports = multer({ storage: storage }).single('image')


