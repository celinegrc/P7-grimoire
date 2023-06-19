const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');



// Définition des types MIME autorisés et de leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

// Configuration du stockage des fichiers avec GridFS
const storage = new GridFsStorage({
  url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster1.o21r8wy.mongodb.net/?retryWrites=true&w=majority`,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const filename = file.originalname.split(' ').join('_');
    const fileInfo = {
      filename: filename,
      bucketName: 'uploads' // Nom du bucket GridFS
    };
    return fileInfo;
  }
});

// Fonction de validation du type de fichier
const fileFilter = (req, file, callback) => {
  // Vérifier si le type MIME est autorisé
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    // Rejeter le fichier avec une erreur
    callback(new Error('Type de fichier non autorisé'));
  }
};

// Configurer Multer avec le stockage GridFS
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).single('image');

module.exports = upload;




