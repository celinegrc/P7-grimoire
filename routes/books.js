const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config')
const auth = require('../middleware/auth')

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOneBook);
//router.get('/bestrating', bookCtrl.getBestBooks)

router.post('/', auth, multer, bookCtrl.postBook)

//router.put('/:id', auth, bookCtrl.modifyBook)
//router.delete('/:id', auth, bookCtrl.deleteBook)
//router.post('/:id/rating', auth, bookCtrl.ratetBook)

module.exports = router;