// Test Firebase connection and create sample lab inspection
import { firestore } from './client/src/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

async function testFirebase() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test adding a document
    const testData = {
      materialType: 'dyed',
      company: 'EHI',
      supplierName: 'Test Supplier',
      incomingDate: '2025-07-26',
      challanNumber: 'CH001',
      status: 'submitted',
      submittedAt: new Date(),
      labReportNumber: 'EHI-LAB-1001',
      overallStatus: 'pass',
      testResults: [
        { parameter: 'Moisture Content', standard: '≤ 8.5%', result: '7.2%', status: 'PASS' },
        { parameter: 'Color Fastness', standard: '≥ 4', result: '4.5', status: 'PASS' }
      ]
    };
    
    const docRef = await addDoc(collection(firestore, 'labInspections'), testData);
    console.log('✅ Test document added with ID:', docRef.id);
    
    // Test reading documents
    const snapshot = await getDocs(collection(firestore, 'labInspections'));
    console.log('✅ Found', snapshot.docs.length, 'lab inspections');
    
    snapshot.docs.forEach(doc => {
      console.log('Document ID:', doc.id, 'Data:', doc.data());
    });
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
  }
}

testFirebase();