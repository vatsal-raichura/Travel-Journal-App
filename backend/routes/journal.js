const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createEntry,
  getEntriesByTrip,
  deleteEntry,
  getAllEntries,
  getEntriesByUser,
  getEntryById,
  updateEntry,
} = require("../controllers/journalController");

router.get("/test", (req, res) => res.send("Journal route working!"));

router.post('/', auth, upload.array('images', 5), createEntry);

router.get('/all', getAllEntries); // optional: admin or testing only
router.get('/user', auth, getEntriesByUser);
router.get('/:tripId', auth, getEntriesByTrip);
router.get('/entry/:id', auth, getEntryById);
router.put('/entry/:id', auth, updateEntry);
router.delete('/:id', auth, deleteEntry);
module.exports = router;
