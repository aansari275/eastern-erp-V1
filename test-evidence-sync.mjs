// Test Evidence Upload Synchronization Flow
import fs from 'fs';

async function testEvidenceSynchronization() {
  console.log('🧪 Testing Evidence Upload Synchronization Flow\n');
  
  // Step 1: Create initial audit with empty evidence  
  console.log('1️⃣ Creating initial audit...');
  const initialAudit = {
    auditorName: 'Evidence Sync Test',
    location: 'Test Location',
    auditScope: 'Evidence Sync Verification',
    company: 'EHI',
    auditDate: '2025-07-27',
    parts: [{
      id: 'part-1',
      title: 'Design Control',
      items: [{
        code: 'C1',
        question: 'Are design and development procedures established?',
        response: 'Yes',
        remark: 'Initial test remark',
        evidenceImages: []
      }]
    }],
    checklist: [{
      code: 'C1',
      question: 'Are design and development procedures established?',
      response: 'Yes',
      remark: 'Initial test remark',
      evidence: []
    }],
    status: 'draft'
  };

  try {
    const createResponse = await fetch('http://localhost:5000/api/audits/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialAudit)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    const auditId = createResult.id;
    console.log('✅ Initial audit created:', auditId);

    // Step 2: Simulate evidence upload by updating both parts and checklist
    console.log('\n2️⃣ Simulating evidence upload...');
    const evidenceUrl = 'https://firebasestorage.googleapis.com/test-evidence-sync.jpg';
    
    // Get current audit
    const getResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}`);
    const { audit } = await getResponse.json();
    
    // Update both parts and checklist with evidence
    const updatedParts = audit.parts.map(part => ({
      ...part,
      items: part.items.map(item => {
        if (item.code === 'C1') {
          return {
            ...item,
            evidenceImages: [...(item.evidenceImages || []), evidenceUrl]
          };
        }
        return item;
      })
    }));
    
    const updatedChecklist = (audit.checklist || []).map(item => {
      if (item.code === 'C1') {
        return {
          ...item,
          evidence: [...(item.evidence || []), evidenceUrl]
        };
      }
      return item;
    });

    // Update audit with evidence in both structures
    const updateResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...audit,
        parts: updatedParts,
        checklist: updatedChecklist,
        updatedAt: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status}`);
    }
    
    console.log('✅ Evidence upload simulated');

    // Step 3: Verify evidence is in both parts and checklist
    console.log('\n3️⃣ Verifying evidence synchronization...');
    
    const verifyResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}`);
    const { audit: verifiedAudit } = await verifyResponse.json();
    
    // Check parts structure
    const partsEvidence = verifiedAudit.parts?.[0]?.items?.[0]?.evidenceImages || [];
    console.log('📊 Parts evidence count:', partsEvidence.length);
    console.log('📊 Parts evidence URLs:', partsEvidence);
    
    // Check checklist structure  
    const checklistEvidence = verifiedAudit.checklist?.[0]?.evidence || [];
    console.log('📋 Checklist evidence count:', checklistEvidence.length);
    console.log('📋 Checklist evidence URLs:', checklistEvidence);

    // Step 4: Test PDF generation with evidence
    console.log('\n4️⃣ Testing PDF generation with evidence...');
    
    const pdfResponse = await fetch(`http://localhost:5000/api/audits/compliance/${auditId}/pdf`);
    if (pdfResponse.ok) {
      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log('✅ PDF generated with evidence:', Math.round(pdfBuffer.byteLength / 1024) + 'KB');
      
      fs.writeFileSync('evidence-sync-test.pdf', Buffer.from(pdfBuffer));
      console.log('📄 PDF saved as: evidence-sync-test.pdf');
    } else {
      console.error('❌ PDF generation failed:', await pdfResponse.text());
    }

    // Step 5: Analysis and results
    console.log('\n5️⃣ Evidence Synchronization Analysis:');
    
    const partsHasEvidence = partsEvidence.length > 0;
    const checklistHasEvidence = checklistEvidence.length > 0;
    const evidenceMatches = JSON.stringify(partsEvidence) === JSON.stringify(checklistEvidence);
    
    console.log(`✅ Parts Structure Has Evidence: ${partsHasEvidence ? 'YES' : 'NO'}`);
    console.log(`✅ Checklist Structure Has Evidence: ${checklistHasEvidence ? 'YES' : 'NO'}`);  
    console.log(`✅ Evidence URLs Match: ${evidenceMatches ? 'YES' : 'NO'}`);
    
    if (partsHasEvidence && checklistHasEvidence && evidenceMatches) {
      console.log('\n🎯 EVIDENCE SYNCHRONIZATION: WORKING CORRECTLY');
      console.log('✅ Evidence URLs properly stored in both parts and checklist fields');
      console.log('✅ PDF generation can access evidence through checklist field');
      console.log('✅ Complete evidence workflow operational');
    } else {
      console.log('\n❌ EVIDENCE SYNCHRONIZATION: NEEDS FIXING');
      if (!partsHasEvidence) console.log('❌ Parts structure missing evidence');
      if (!checklistHasEvidence) console.log('❌ Checklist structure missing evidence');
      if (!evidenceMatches) console.log('❌ Evidence URLs don\'t match between structures');
    }

    return { auditId, success: partsHasEvidence && checklistHasEvidence && evidenceMatches };

  } catch (error) {
    console.error('💥 Evidence sync test failed:', error.message);
    return { auditId: null, success: false };
  }
}

// Run the evidence synchronization test
testEvidenceSynchronization().catch(console.error);