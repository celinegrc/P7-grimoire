const sharp = require('sharp')
const fs = require('fs')
sharp.cache(false)
const resizedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const imagePath = req.file.path;
  const outputFilePath = `${imagePath.split('.')[0]}resized.webp`

  try {
    await sharp(imagePath)
      .resize(463, 595,{ fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputFilePath)

    fs.unlink(imagePath, (err) => {
        req.file.path = outputFilePath
        console.log(req.file.path)
      if (err) {
        console.error(err)
      }
      next()
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du traitement de l\'image' })
  }
};

module.exports = resizedImage;
