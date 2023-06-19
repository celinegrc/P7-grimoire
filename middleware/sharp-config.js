const sharp = require('sharp')
const fs = require('fs')
sharp.cache(false)

const resizedImage = async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  const imagePath = req.file.path
  const outputFilePath = `${imagePath.split('.')[0]}resized.webp`

  try {
    // Redimensionner l'image en utilisant Sharp
    await sharp(imagePath)
      .resize(463, 595,{ fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputFilePath)

     // Supprimer l'image d'origine et mise à jour du chemin 
    fs.unlink(imagePath, (err) => {
      req.file.path = outputFilePath
      if (err) {
        console.error(err)
      }
      next()
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'image' })
  }
}

module.exports = resizedImage
