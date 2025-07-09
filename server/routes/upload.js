import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth.js';
import Donor from '../models/Donor.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/documents', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    const userId = req.user.userId;

    // Find donor profile
    const donor = await Donor.findOne({ user: userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    // Add document to donor's documents array
    const document = {
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date()
    };

    donor.documents.push(document);
    await donor.save();

    res.json({
      message: 'Document uploaded successfully',
      document,
      filePath: `/uploads/documents/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
});

router.delete('/documents/:documentId', authMiddleware, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    const donor = await Donor.findOne({ user: userId });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    donor.documents = donor.documents.filter(doc => doc._id.toString() !== documentId);
    await donor.save();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

export default router;