// Test script to create auditForms collection with sample data
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createAuditFormsCollection() {
  try {
    // Create a test document in auditForms collection
    const auditData = {
      createdBy: 'abdulansari@easternmills.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'draft',
      company: 'Eastern Home Industries',
      auditType: 'Final Inspection',
      sections: [
        {
          title: 'Packing',
          questions: [
            {
              question: 'Is packing as per spec?',
              answer: '',
              comments: '',
              images: []
            },
            {
              question: 'Are labels properly attached?',
              answer: '',
              comments: '',
              images: []
            }
          ]
        },
        {
          title: 'Quality Check',
          questions: [
            {
              question: 'Does the product meet quality standards?',
              answer: '',
              comments: '',
              images: []
            }
          ]
        }
      ]
    };

    const docRef = await db.collection('auditForms').add(auditData);
    console.log('✅ Created auditForms collection with document ID:', docRef.id);
    
    // Create another test document
    const auditData2 = {
      ...auditData,
      auditType: 'Washing',
      status: 'submitted',
      sections: [
        {
          title: 'Washing Process',
          questions: [
            {
              question: 'Is washing temperature correct?',
              answer: 'Yes',
              comments: 'Temperature maintained at 40°C',
              images: []
            }
          ]
        }
      ]
    };

    const docRef2 = await db.collection('auditForms').add(auditData2);
    console.log('✅ Created second audit document with ID:', docRef2.id);

  } catch (error) {
    console.error('❌ Error creating auditForms collection:', error);
  }
}

createAuditFormsCollection();