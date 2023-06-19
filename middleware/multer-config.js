const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');

// Définition des types MIME autorisés et de leurs extensions correspondantes
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Configuration du stockage des fichiers avec multer
const storage = multer.memoryStorage();

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

const upload = multer({ storage: storage, fileFilter: fileFilter }).single('image');

const s3Client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  const uploadParams = {
    Bucket: "my-bucket-images-grimoire",
    Key: file.originalname,
    Body: file.buffer,
    ACL: "public-read",
  };

  const command = new PutObjectCommand(uploadParams);

  try {
    await s3Client.send(command);
    console.log("Upload réussi");
  } catch (error) {
    console.error("Erreur lors de l'upload :", error);
    throw error;
  }
};

// Middleware multer pour l'upload vers AWS S3
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: error.message });
    } else if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier à uploader' });
    }

    next();
  });
};

module.exports = uploadMiddleware;

