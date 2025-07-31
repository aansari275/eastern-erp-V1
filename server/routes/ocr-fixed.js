import express from 'express';
import multer from 'multer';
import vision from '@google-cloud/vision';
const router = express.Router();
// Configure multer for file uploads (50MB limit)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
});
// Initialize Google Cloud Vision client with proper authentication
const visionClient = new vision.ImageAnnotatorClient({
    credentials: {
        type: 'service_account',
        project_id: 'rugcraftpro',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
    }
});
// Helper function to extract PO data from text
function extractPOData(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Improved regex patterns for better text extraction
    const buyerNamePattern = /(?:buyer[:\s]*|client[:\s]*|company[:\s]*|from[:\s]*)([\w\s&.,'-]+?)(?:\n|$|tel|phone|email|address)/i;
    const poNumberPattern = /(?:po\s*(?:no|number|#)?[:\s]*|purchase\s*order[:\s]*|order\s*(?:no|number|#)?[:\s]*)([\w\/-]+)/i;
    const articlePattern = /(?:article[:\s]*|item[:\s]*|product[:\s]*|style[:\s]*)([\w\/-]+)/i;
    const shipmentDatePattern = /(?:ship(?:ment)?\s*date[:\s]*|delivery[:\s]*date[:\s]*|due[:\s]*date[:\s]*)([\d\/-]+)/i;
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
        paymentTerms: ''
    };
    // Extract buyer name
    const buyerMatch = text.match(buyerNamePattern);
    if (buyerMatch) {
        extractedData.buyerName = buyerMatch[1].trim();
    }
    // Extract PO number
    const poMatch = text.match(poNumberPattern);
    if (poMatch) {
        extractedData.buyerPONo = poMatch[1].trim();
    }
    // Extract article number
    const articleMatch = text.match(articlePattern);
    if (articleMatch) {
        extractedData.articleNo = articleMatch[1].trim();
    }
    // Extract shipment date
    const shipmentMatch = text.match(shipmentDatePattern);
    if (shipmentMatch) {
        extractedData.shipmentDate = shipmentMatch[1].trim();
    }
    return extractedData;
}
// Main OCR endpoint - extract text from PDF/image
router.post('/extract-text', upload.single('file'), async (req, res) => {
    try {
        console.log('📄 OCR text extraction request received');
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded',
                message: 'Please upload a PDF or image file for text extraction.'
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
                // Use "images" trigger path based on user's Firebase Storage evidence
                const bucket = adminStorage.bucket();
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
                await new Promise(resolve => setTimeout(resolve, 10000)); // Increased wait time
                // Check the Firestore collection for extracted text
                const extractedTextRef = adminDb.collection('extractedText');
                console.log('🔍 Checking Firestore for extracted text results...');
                // Based on actual Firestore structure: documents have 'file' and 'text' keys
                let querySnapshot;
                try {
                    // Get recent documents and filter manually to avoid index issues
                    const recentDocs = await extractedTextRef
                        .limit(20)
                        .get();
                    console.log(`📋 Checking ${recentDocs.size} recent documents for matches...`);
                    const matchingDocs = recentDocs.docs.filter(doc => {
                        const data = doc.data();
                        const docFile = data.file || '';
                        const docInputSource = data.input?.source || '';
                        // Check multiple possible ways the file path might be stored
                        return docFile === triggerPath ||
                            docFile.includes(triggerPath) ||
                            docInputSource === triggerPath ||
                            docInputSource.includes(triggerPath) ||
                            docFile.includes(timestamp.toString()) ||
                            docInputSource.includes(timestamp.toString());
                    });
                    if (matchingDocs.length > 0) {
                        querySnapshot = {
                            empty: false,
                            docs: matchingDocs,
                            size: matchingDocs.length
                        };
                        console.log('✅ Found matching document using manual filtering');
                    }
                    else {
                        querySnapshot = { empty: true, docs: [], size: 0 };
                        console.log('⚠️ No matching documents found in recent documents');
                        // Debug: show what documents we do have
                        recentDocs.docs.slice(0, 5).forEach((doc, i) => {
                            const data = doc.data();
                            console.log(`   Document ${i + 1}: file="${data.file || 'no file'}", input.source="${data.input?.source || 'no input.source'}", keys=[${Object.keys(data).join(', ')}]`);
                        });
                    }
                }
                catch (firestoreError) {
                    console.log('⚠️ Firestore query failed:', firestoreError.message);
                    querySnapshot = { empty: true, docs: [], size: 0 };
                }
                if (!querySnapshot.empty) {
                    const textDoc = querySnapshot.docs[0];
                    const textData = textDoc.data();
                    console.log('📄 Found extracted text document:', textDoc.id);
                    console.log('📋 Document structure:', Object.keys(textData));
                    // Handle different possible document structures
                    let extractedText = null;
                    if (textData.text) {
                        // Direct text field (actual structure found in Firestore)
                        extractedText = textData.text;
                    }
                    else if (textData.output && textData.output.text) {
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
                        }
                        catch (cleanupError) {
                            console.log('⚠️ Firestore cleanup warning:', cleanupError.message);
                        }
                    }
                    else {
                        console.log('⚠️ Text extraction document found but no text content');
                        console.log('📋 Available data:', textData);
                    }
                }
                // Clean up the uploaded file
                try {
                    await file.delete();
                    console.log('🧹 Cleaned up uploaded file from Storage');
                }
                catch (cleanupError) {
                    console.log('⚠️ Storage cleanup warning:', cleanupError.message);
                }
            }
            catch (firebaseError) {
                console.log('⚠️ Firebase Extract Text extension processing failed:', firebaseError.message);
                console.log('🔄 Falling back to direct Google Cloud Vision processing...');
            }
        }
        // If we got text from the Firebase extension, return it
        if (extractedTextFromExtension && extractedTextFromExtension.trim()) {
            console.log('📄 Using text extracted by Firebase extension');
            return res.json({
                text: extractedTextFromExtension,
                source: 'Firebase Extract Text from Images extension',
                success: true
            });
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
            }
            else {
                console.log('🖼️ Processing image with regular text detection...');
                const [result] = await visionClient.textDetection({
                    image: { content: imageBuffer }
                });
                ocrResult = result;
            }
            if (ocrResult.fullTextAnnotation && ocrResult.fullTextAnnotation.text) {
                const extractedText = ocrResult.fullTextAnnotation.text;
                console.log('📄 Direct Google Cloud Vision extraction successful');
                return res.json({
                    text: extractedText,
                    source: 'Google Cloud Vision API (fallback)',
                    success: true
                });
            }
            else {
                console.log('⚠️ No text detected by Google Cloud Vision');
            }
        }
        catch (visionError) {
            console.log('⚠️ Google Cloud Vision processing failed:', visionError.message);
        }
        // If all methods failed
        console.log('⚠️ All text extraction methods failed');
        return res.json({
            text: '',
            source: 'none',
            success: false,
            message: 'Could not extract text from this document. The file may be a scanned image or have poor text quality.'
        });
    }
    catch (error) {
        console.error('❌ OCR processing error:', error);
        return res.status(500).json({
            error: 'OCR processing failed',
            details: error.message,
            success: false
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
                // Use "images" trigger path based on user's Firebase Storage evidence
                const bucket = adminStorage.bucket();
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
                await new Promise(resolve => setTimeout(resolve, 10000)); // Increased wait time
                // Check the Firestore collection for extracted text
                const extractedTextRef = adminDb.collection('extractedText');
                console.log('🔍 Checking Firestore for extracted text results...');
                // Based on actual Firestore structure: documents have 'file' and 'text' keys
                let querySnapshot;
                try {
                    // Get recent documents and filter manually to avoid index issues
                    const recentDocs = await extractedTextRef
                        .limit(20)
                        .get();
                    console.log(`📋 Checking ${recentDocs.size} recent documents for matches...`);
                    const matchingDocs = recentDocs.docs.filter(doc => {
                        const data = doc.data();
                        const docFile = data.file || '';
                        const docInputSource = data.input?.source || '';
                        // Check multiple possible ways the file path might be stored
                        return docFile === triggerPath ||
                            docFile.includes(triggerPath) ||
                            docInputSource === triggerPath ||
                            docInputSource.includes(triggerPath) ||
                            docFile.includes(timestamp.toString()) ||
                            docInputSource.includes(timestamp.toString());
                    });
                    if (matchingDocs.length > 0) {
                        querySnapshot = {
                            empty: false,
                            docs: matchingDocs,
                            size: matchingDocs.length
                        };
                        console.log('✅ Found matching document using manual filtering');
                    }
                    else {
                        querySnapshot = { empty: true, docs: [], size: 0 };
                        console.log('⚠️ No matching documents found in recent documents');
                        // Debug: show what documents we do have
                        recentDocs.docs.slice(0, 5).forEach((doc, i) => {
                            const data = doc.data();
                            console.log(`   Document ${i + 1}: file="${data.file || 'no file'}", input.source="${data.input?.source || 'no input.source'}", keys=[${Object.keys(data).join(', ')}]`);
                        });
                    }
                }
                catch (firestoreError) {
                    console.log('⚠️ Firestore query failed:', firestoreError.message);
                    querySnapshot = { empty: true, docs: [], size: 0 };
                }
                if (!querySnapshot.empty) {
                    const textDoc = querySnapshot.docs[0];
                    const textData = textDoc.data();
                    console.log('📄 Found extracted text document:', textDoc.id);
                    console.log('📋 Document structure:', Object.keys(textData));
                    // Handle different possible document structures
                    let extractedText = null;
                    if (textData.text) {
                        // Direct text field (actual structure found in Firestore)
                        extractedText = textData.text;
                    }
                    else if (textData.output && textData.output.text) {
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
                        }
                        catch (cleanupError) {
                            console.log('⚠️ Firestore cleanup warning:', cleanupError.message);
                        }
                    }
                    else {
                        console.log('⚠️ Text extraction document found but no text content');
                        console.log('📋 Available data:', textData);
                    }
                }
                // Clean up the uploaded file
                try {
                    await file.delete();
                    console.log('🧹 Cleaned up uploaded file from Storage');
                }
                catch (cleanupError) {
                    console.log('⚠️ Storage cleanup warning:', cleanupError.message);
                }
            }
            catch (firebaseError) {
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
            }
            else {
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
            }
            else {
                console.log('⚠️ No text detected by Google Cloud Vision');
            }
        }
        catch (visionError) {
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
    }
    catch (error) {
        console.error('❌ OCR processing error:', error);
        return res.status(500).json({
            error: 'OCR processing failed',
            details: error.message,
            _note: 'Server error occurred during text extraction. Please try again or contact support.'
        });
    }
});
export default router;
