const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const app = express();

// Configuration des informations d'identification AWS
AWS.config.update({
  accessKeyId: process.env.ACCES_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCES_KEY,
  region:'eu-west-3'
});

// Configuration des types MIME autorisés et de leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Configuration du stockage des fichiers avec multer-s3
const s3 = new AWS.S3();
const storage = multerS3({
  s3: s3,
  bucket: 'my-bucket-images-grimoire',
  key: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const fileName = nameWithoutExtension + Date.now() + '.' + extension;
    callback(null, fileName);
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

// Middleware multer avec le stockage sur AWS S3
const upload = multer({ storage: storage, fileFilter: fileFilter }).single('image');

// Endpoint pour la gestion des uploads d'images
app.post('/upload', (req, res) => {
  upload(req, res, (error) => {
    if (error) {
      // Gérer les erreurs d'upload
      res.status(400).json({ error: error.message });
    } else {
      // L'upload s'est terminé avec succès
      res.status(200).json({ message: 'Upload réussi' });
    }
  });
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});



