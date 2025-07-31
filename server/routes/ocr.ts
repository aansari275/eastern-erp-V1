import express from "express";
import fileUpload from "express-fileupload";
import multer from "multer";
import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initialize Google Cloud Vision
const visionClient = new ImageAnnotatorClient({
  projectId: 'rugcraftpro',
  keyFilename: './server/firebaseServiceAccountKey.json'
});

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to extract PO data from text
function extractPOData(text: string) {
  console.log('🔍 Extracting PO data from text:', text.substring(0, 200) + '...');
  
  const extractedData = {
    buyerName: '',
    buyerPONo: '',
    articleNo: '',
    skuNo: '',
    shipmentDate: '',
    items: [{
      description: '',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0
    }],
    totalQty: 0,
    totalAmount: 0,
    deliveryAddress: '',
    paymentTerms: '',
    _note: ''
  };

  try {
    // Enhanced patterns for buyer name extraction
    const buyerPatterns = [
      /buyer[:\s]+([^\n\r]+)/i,
      /customer[:\s]+([^\n\r]+)/i,
      /vendor[:\s]+([^\n\r]+)/i,
      /ship\s+to[:\s]+([^\n\r]+)/i,
      /bill\s+to[:\s]+([^\n\r]+)/i
    ];

    // Enhanced patterns for PO number extraction
    const poPatterns = [
      /p\.?o\.?\s*(?:no\.?|number)[:\s]+([a-z0-9\-\/]+)/i,
      /purchase\s+order[:\s]+([a-z0-9\-\/]+)/i,
      /order\s+no[:\s]+([a-z0-9\-\/]+)/i,
      /ref[:\s]+([a-z0-9\-\/]+)/i
    ];

    // Enhanced patterns for article/style number
    const articlePatterns = [
      /article[:\s]+([a-z0-9\-\/]+)/i,
      /style[:\s]+([a-z0-9\-\/]+)/i,
      /item[:\s]+([a-z0-9\-\/]+)/i,
      /design[:\s]+([a-z0-9\-\/]+)/i
    ];

    // Enhanced patterns for shipment date
    const datePatterns = [
      /ship(?:ment)?\s+date[:\s]+([0-9\/\-\.]+)/i,
      /delivery\s+date[:\s]+([0-9\/\-\.]+)/i,
      /due\s+date[:\s]+([0-9\/\-\.]+)/i
    ];

    // Extract buyer name
    for (const pattern of buyerPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.buyerName = match[1].trim();
        console.log('✅ Found buyer name:', extractedData.buyerName);
        break;
      }
    }

    // Extract PO number
    for (const pattern of poPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.buyerPONo = match[1].trim();
        console.log('✅ Found PO number:', extractedData.buyerPONo);
        break;
      }
    }

    // Extract article number
    for (const pattern of articlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.articleNo = match[1].trim();
        console.log('✅ Found article number:', extractedData.articleNo);
        break;
      }
    }

    // Extract shipment date
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.shipmentDate = match[1].trim();
        console.log('✅ Found shipment date:', extractedData.shipmentDate);
        break;
      }
    }

  } catch (error) {
    console.log('⚠️ Error extracting data:', error);
  }

  return extractedData;
}

// Verify Storage Endpoint
router.get("/verify-storage", (req, res) => {
  const bucket = adminStorage.bucket();
  bucket.getFiles({ prefix: "uploads/" }, (err, files) => {
    if (err) {
      console.error("Storage verification error:", err);
      return res.status(500).send("Verification failed");
    }
    console.log(
      "Files in uploads/:",
      files.map((f) => f.name),
    );
    bucket.getFiles({ prefix: "images/" }, (err2, imageFiles) => {
      if (err2) {
        console.error("Images verification error:", err2);
      }
      console.log(
        "Files in images/:",
        imageFiles.map((f) => f.name),
      );
      res.send(
        `Found ${files.length} files in uploads/ and ${imageFiles.length} in images/`,
      );
    });
  });
});

// Main OCR endpoint using Firebase "Extract Text from Images" extension
router.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    console.log('📄 OCR request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        _note: 'Please upload a PDF or image file for text extraction.'
      });
    }

    console.log(`📄 Processing file: ${req.file.originalname}, Type: ${req.file.mimetype}, Size: ${req.file.size} bytes`);

    const imageBuffer = req.file.buffer;
    let extractedTextFromExtension = null;
    
    // Firebase "Extract Text from Images" extension integration
    if (req.file.mimetype === 'application/pdf' || req.file.mimetype.startsWith('image/')) {
      console.log('🔥 Using Firebase "Extract Text from Images" extension...');
      
      try {
        const timestamp = Date.now();
        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
        const fileExtension = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1];
        
        // Upload to the configured path that triggers your extension
        // Update this path based on your extension configuration:
        // "Paths that contain images you want to extract text from"
        const bucket = adminStorage.bucket();
        const triggerPath = `ocr-processing/${fileType}_${timestamp}.${fileExtension}`;
        const file = bucket.file(triggerPath);
        
        console.log(`📤 Uploading ${fileType} to Firebase Storage trigger path: ${triggerPath}`);
        
        await file.save(imageBuffer, {
          metadata: {
            contentType: req.file.mimetype,
            metadata: {
              originalName: req.file.originalname,
              timestamp: timestamp.toString(),
              purpose: 'text-extraction'
            }
          }
        });
        
        console.log('✅ File uploaded successfully, waiting for Extract Text extension processing...');
        
        // Wait for the extension to process and write to Firestore collection
        // Extension typically takes 3-15 seconds depending on file size
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // Check the Firestore collection for extracted text
        // Update this collection path based on your extension configuration:
        // "Collection path where extracted text will be written to"
        const extractedTextRef = adminDb.collection('extractedText');
        
        console.log('🔍 Checking Firestore for extracted text results...');
        
        // Try simple query first (without orderBy to avoid index requirement)
        let querySnapshot;
        try {
          querySnapshot = await extractedTextRef
            .where('input.source', '==', triggerPath)
            .limit(1)
            .get();
        } catch (indexError) {
          console.log('⚠️ Firestore index error, trying alternative query approach:', indexError.message);
          
          // Fallback: get recent documents and filter manually
          try {
            const recentDocs = await extractedTextRef
              .limit(10)
              .get();
            
            const matchingDocs = recentDocs.docs.filter(doc => {
              const data = doc.data();
              return data.input && data.input.source === triggerPath;
            });
            
            if (matchingDocs.length > 0) {
              // Create a mock query snapshot with matching docs
              querySnapshot = {
                empty: false,
                docs: matchingDocs,
                size: matchingDocs.length
              };
              console.log('✅ Found matching document using fallback method');
            } else {
              querySnapshot = { empty: true, docs: [], size: 0 };
              console.log('⚠️ No matching documents found in recent documents');
            }
          } catch (fallbackError) {
            console.log('⚠️ Fallback query also failed:', fallbackError.message);
            querySnapshot = { empty: true, docs: [], size: 0 };
          }
        }
        
        if (!querySnapshot.empty) {
          const textDoc = querySnapshot.docs[0];
          const textData = textDoc.data();
          console.log('📄 Found extracted text document:', textDoc.id);
          console.log('📋 Document structure:', Object.keys(textData));
          
          if (textData.output && textData.output.text) {
            extractedTextFromExtension = textData.output.text;
            console.log(`✅ Successfully extracted ${extractedTextFromExtension.length} characters using Firebase extension`);
            
            // Clean up the Firestore document after use
            try {
              await textDoc.ref.delete();
              console.log('🧹 Cleaned up Firestore text extraction document');
            } catch (cleanupError) {
              console.log('⚠️ Firestore cleanup warning:', cleanupError.message);
            }
          } else {
            console.log('⚠️ Text extraction document found but no text content in expected structure');
            console.log('📋 Available data:', textData);
          }
        } else {
          console.log('⚠️ No extracted text found in Firestore collection after waiting');
          
          // Try to find any documents related to our file
          const allDocsSnapshot = await extractedTextRef
            .orderBy('createTime', 'desc')
            .limit(5)
            .get();
          
          console.log(`📋 Recent documents in collection (${allDocsSnapshot.size} found):`);
          allDocsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- Document ${doc.id}:`, {
              source: data.input?.source,
              createTime: data.createTime,
              hasOutput: !!data.output
            });
          });
        }
        
        // Clean up the uploaded file
        try {
          await file.delete();
          console.log('🧹 Cleaned up uploaded file from Storage');
        } catch (cleanupError) {
          console.log('⚠️ Storage cleanup warning:', cleanupError.message);
        }
        
      } catch (firebaseError) {
        console.log('⚠️ Firebase Extract Text extension processing failed:', firebaseError.message);
        console.log('🔄 Falling back to direct Google Cloud Vision processing...');
      }
    }
    
    // If we got text from the Firebase extension, use it
    if (extractedTextFromExtension && extractedTextFromExtension.trim()) {
      console.log('📄 Using text extracted by Firebase extension:', extractedTextFromExtension.length, 'characters');
      const extractedData = extractPOData(extractedTextFromExtension);
      extractedData._note = `Data extracted using Firebase "Extract Text from Images" extension. Please review and adjust as needed.`;
      return res.json(extractedData);
    }

    // Fallback to direct Google Cloud Vision API
    console.log('🔍 Using direct Google Cloud Vision API as fallback...');
    
    try {
      let ocrResult;
      
      if (req.file.mimetype === 'application/pdf') {
        console.log('📄 Processing PDF with Document AI...');
        const [result] = await visionClient.documentTextDetection({
          image: { content: imageBuffer }
        });
        ocrResult = result;
      } else {
        console.log('🖼️ Processing image with regular text detection...');
        const [result] = await visionClient.textDetection({
          image: { content: imageBuffer }
        });
        ocrResult = result;
      }

      if (ocrResult.fullTextAnnotation && ocrResult.fullTextAnnotation.text) {
        const extractedText = ocrResult.fullTextAnnotation.text;
        console.log('📄 Direct Google Cloud Vision extraction successful:', extractedText.length, 'characters');
        const extractedData = extractPOData(extractedText);
        extractedData._note = `Data extracted using direct Google Cloud Vision API (Firebase extension fallback). Please review and adjust as needed.`;
        return res.json(extractedData);
      } else {
        console.log('⚠️ No text detected by Google Cloud Vision');
      }
      
    } catch (visionError) {
      console.log('⚠️ Google Cloud Vision processing failed:', visionError.message);
    }

    // If all methods failed, return empty form with note
    console.log('⚠️ All text extraction methods failed');
    const emptyData = {
      buyerName: '',
      buyerPONo: '',
      articleNo: '',
      skuNo: '',
      shipmentDate: '',
      items: [{
        description: '',
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0
      }],
      totalQty: 0,
      totalAmount: 0,
      deliveryAddress: '',
      paymentTerms: '',
      _note: 'OCR could not extract text from this document. The file may be a scanned image or have poor text quality. Please fill in the details manually.'
    };

    console.log('📋 Analysis:');
    console.log(`   - File size: ${req.file.size} bytes`);
    console.log(`   - MIME type: ${req.file.mimetype}`);
    console.log('   - This appears to be a scanned image PDF without readable text');
    console.log('   - Consider using a PDF with embedded text or higher quality scan');

    return res.json(emptyData);

  } catch (error) {
    console.error('❌ OCR processing error:', error);
    return res.status(500).json({ 
      error: 'OCR processing failed',
      details: error.message,
      _note: 'Server error occurred during text extraction. Please try again or contact support.'
    });
  }
});

// Legacy endpoint for backward compatibility - extract PO data
router.post('/extract-po', upload.single('file'), async (req, res) => {
  try {
    console.log('📄 OCR PO extraction request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        _note: 'Please upload a PDF or image file for text extraction.'
      });
    }

    console.log(`📄 Processing file: ${req.file.originalname}, Type: ${req.file.mimetype}, Size: ${req.file.size} bytes`);

    const imageBuffer = req.file.buffer;
    let extractedTextFromExtension = null;
    
    // Firebase "Extract Text from Images" extension integration
    if (req.file.mimetype === 'application/pdf' || req.file.mimetype.startsWith('image/')) {
      console.log('🔥 Using Firebase "Extract Text from Images" extension...');
      
      try {
        const timestamp = Date.now();
        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
        const fileExtension = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1];
        
        // Upload to the configured path that triggers your extension
        const bucket = adminStorage.bucket();
        
        // Based on user screenshots, files appear in both ocr-processing and images folders
        // This suggests the extension might be configured to trigger on "images" path
        console.log('🔄 Trying images trigger path based on Firebase Storage evidence...');
        
        const triggerPath = `images/${fileType}_${timestamp}.${fileExtension}`;
        const file = bucket.file(triggerPath);
        
        console.log(`📤 Uploading ${fileType} to Firebase Storage trigger path: ${triggerPath}`);
        
        await file.save(imageBuffer, {
          metadata: {
            contentType: req.file.mimetype,
            metadata: {
              originalName: req.file.originalname,
              timestamp: timestamp.toString(),
              purpose: 'text-extraction'
            }
          }
        });
        
        console.log('✅ File uploaded successfully, waiting for Extract Text extension processing...');
        
        // Wait for the extension to process and write to Firestore collection
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // Check the Firestore collection for extracted text
        const extractedTextRef = adminDb.collection('extractedText');
        
        console.log('🔍 Checking Firestore for extracted text results...');
        
        // Try simple query first (without orderBy to avoid index requirement)
        let querySnapshot;
        try {
          querySnapshot = await extractedTextRef
            .where('input.source', '==', triggerPath)
            .limit(1)
            .get();
        } catch (indexError) {
          console.log('⚠️ Firestore index error, trying alternative query approach:', indexError.message);
          
          // Fallback: get recent documents and filter manually
          try {
            const recentDocs = await extractedTextRef
              .limit(10)
              .get();
            
            const matchingDocs = recentDocs.docs.filter(doc => {
              const data = doc.data();
              return data.input && data.input.source === triggerPath;
            });
            
            if (matchingDocs.length > 0) {
              // Create a mock query snapshot with matching docs
              querySnapshot = {
                empty: false,
                docs: matchingDocs,
                size: matchingDocs.length
              };
              console.log('✅ Found matching document using fallback method');
            } else {
              querySnapshot = { empty: true, docs: [], size: 0 };
              console.log('⚠️ No matching documents found in recent documents');
            }
          } catch (fallbackError) {
            console.log('⚠️ Fallback query also failed:', fallbackError.message);
            querySnapshot = { empty: true, docs: [], size: 0 };
          }
        }
        
        if (!querySnapshot.empty) {
          const textDoc = querySnapshot.docs[0];
          const textData = textDoc.data();
          console.log('📄 Found extracted text document:', textDoc.id);
          console.log('📋 Document structure:', Object.keys(textData));
          
          // Handle different possible document structures
          let extractedText = null;
          if (textData.text) {
            // Direct text field (actual structure found in your Firestore)
            extractedText = textData.text;
          } else if (textData.output && textData.output.text) {
            // Standard extension output structure
            extractedText = textData.output.text;
          }
          
          if (extractedText && extractedText.trim()) {
            extractedTextFromExtension = extractedText;
            console.log(`✅ Successfully extracted ${extractedTextFromExtension.length} characters using Firebase extension`);
            
            // Clean up the Firestore document after use
            try {
              await textDoc.ref.delete();
              console.log('🧹 Cleaned up Firestore text extraction document');
            } catch (cleanupError) {
              console.log('⚠️ Firestore cleanup warning:', cleanupError.message);
            }
          } else {
            console.log('⚠️ Text extraction document found but no text content');
            console.log('📋 Available data:', textData);
          }
        } else {
          console.log('⚠️ No extracted text found in Firestore collection after waiting');
        }
        
        // Clean up the uploaded file
        try {
          await file.delete();
          console.log('🧹 Cleaned up uploaded file from Storage');
        } catch (cleanupError) {
          console.log('⚠️ Storage cleanup warning:', cleanupError.message);
        }
        
      } catch (firebaseError) {
        console.log('⚠️ Firebase Extract Text extension processing failed:', firebaseError.message);
        console.log('🔄 Falling back to direct Google Cloud Vision processing...');
      }
    }
    
    // If we got text from the Firebase extension, use it
    if (extractedTextFromExtension && extractedTextFromExtension.trim()) {
      console.log('📄 Using text extracted by Firebase extension:', extractedTextFromExtension.length, 'characters');
      const extractedData = extractPOData(extractedTextFromExtension);
      extractedData._note = `Data extracted using Firebase "Extract Text from Images" extension. Please review and adjust as needed.`;
      return res.json(extractedData);
    }

    // Fallback to direct Google Cloud Vision API
    console.log('🔍 Using direct Google Cloud Vision API as fallback...');
    
    try {
      let ocrResult;
      
      if (req.file.mimetype === 'application/pdf') {
        console.log('📄 Processing PDF with Document AI...');
        const [result] = await visionClient.documentTextDetection({
          image: { content: imageBuffer }
        });
        ocrResult = result;
      } else {
        console.log('🖼️ Processing image with regular text detection...');
        const [result] = await visionClient.textDetection({
          image: { content: imageBuffer }
        });
        ocrResult = result;
      }

      if (ocrResult.fullTextAnnotation && ocrResult.fullTextAnnotation.text) {
        const extractedText = ocrResult.fullTextAnnotation.text;
        console.log('📄 Direct Google Cloud Vision extraction successful:', extractedText.length, 'characters');
        const extractedData = extractPOData(extractedText);
        extractedData._note = `Data extracted using direct Google Cloud Vision API (Firebase extension fallback). Please review and adjust as needed.`;
        return res.json(extractedData);
      } else {
        console.log('⚠️ No text detected by Google Cloud Vision');
      }
      
    } catch (visionError) {
      console.log('⚠️ Google Cloud Vision processing failed:', visionError.message);
    }

    // If all methods failed, return empty form with note
    console.log('⚠️ All text extraction methods failed');
    const emptyData = {
      buyerName: '',
      buyerPONo: '',
      articleNo: '',
      skuNo: '',
      shipmentDate: '',
      items: [{
        description: '',
        quantity: 0,
        unitPrice: 0,
        totalAmount: 0
      }],
      totalQty: 0,
      totalAmount: 0,
      deliveryAddress: '',
      paymentTerms: '',
      _note: 'OCR could not extract text from this document. The file may be a scanned image or have poor text quality. Please fill in the details manually.'
    };

    return res.json(emptyData);

  } catch (error) {
    console.error('❌ OCR processing error:', error);
    return res.status(500).json({ 
      error: 'OCR processing failed',
      details: error.message,
      _note: 'Server error occurred during text extraction. Please try again or contact support.'
    });
  }
});

export default router;
