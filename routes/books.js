const express = require('express')
const router = express.Router()
const multer = require('../middleware/multer-config')
const resizedImage = require('../middleware/sharp-config');
const auth = require('../middleware/auth')

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks )
router.get('/:id', bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.rateBook)
router.post('/', auth, multer, resizedImage, bookCtrl.postBook)
router.put('/:id', auth, multer,resizedImage, bookCtrl.modifyBook)
router.delete('/:id', auth, bookCtrl.deleteBook)



module.exports = router;