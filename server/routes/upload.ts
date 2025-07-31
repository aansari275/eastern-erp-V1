import { Router } from 'express';
import multer from 'multer';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  },
});

// Upload single file to Firebase Storage
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { path: filePath } = req.body;
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${req.file.originalname}`;
    const fullPath = filePath ? `${filePath}/${fileName}` : `uploads/${fileName}`;
    
    console.log('📤 Uploading file to Firebase Storage:', {
      fileName,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: fullPath
    });

    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file buffer to Firebase Storage
    const snapshot = await uploadBytes(storageRef, req.file.buffer, {
      contentType: req.file.mimetype,
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ File uploaded successfully:', {
      url: downloadURL,
      size: snapshot.metadata.size
    });
    
    res.status(200).json({
      success: true,
      url: downloadURL,
      fileName: fileName,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
  } catch (error) {
    console.error('❌ File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { path: basePath } = req.body;
    const uploadedFiles = [];
    
    console.log(`📤 Uploading ${files.length} files to Firebase Storage...`);

    for (const file of files) {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.originalname}`;
      const fullPath = basePath ? `${basePath}/${fileName}` : `uploads/${fileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, fullPath);
      
      // Upload file buffer
      const snapshot = await uploadBytes(storageRef, file.buffer, {
        contentType: file.mimetype,
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      uploadedFiles.push({
        url: downloadURL,
        fileName: fileName,
        size: file.size,
        mimetype: file.mimetype
      });
    }
    
    console.log(`✅ ${uploadedFiles.length} files uploaded successfully`);
    
    res.status(200).json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    });
    
  } catch (error) {
    console.error('❌ Multiple file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;