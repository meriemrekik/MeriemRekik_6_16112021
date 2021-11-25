const express = require('express');
const router = express.Router();
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer-config");
const auth = require("../middleware/auth");

router.get('/', sauceCtrl.getAllSauce);
router.get('/:id', sauceCtrl.getOneSauce);
router.post('/', multer, auth, sauceCtrl.createSauce);
router.put('/:id', multer, auth, sauceCtrl.modifySauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;