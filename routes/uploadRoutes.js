const express = require("express");
const router = express.Router();
const multer = require("multer");
const { vendorMiddleware } = require("../middleware/authMiddleware");
const { uploadStream } = require("../utils/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_, file, cb) {
    cb(null, file.mimetype.startsWith("image/"));
  },
});

router.post("/", vendorMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No image provided" });
    const result = await uploadStream(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err.message || err)
    res.status(500).json({ msg: "Image upload failed", detail: err.message });
  }
});

module.exports = router;
