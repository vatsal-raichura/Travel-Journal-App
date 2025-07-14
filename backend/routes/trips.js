const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Cloudinary + Multer

const {
  createTrip,
 
  getTripById,
  updateTrip,
  deleteTrip,
  getTripsByUser,
  getAllTrips
} = require('../controllers/tripController');

router.post('/', auth,upload.single('coverImage'), createTrip);
router.get('/my', auth, getTripsByUser); 
router.get('/', auth, getAllTrips);
router.get('/:id', auth, getTripById);
router.put('/:id', auth, updateTrip);
router.delete('/:id', auth, deleteTrip);

router.get('/test', (req, res) => res.send('Trips route working!'));

module.exports = router;
