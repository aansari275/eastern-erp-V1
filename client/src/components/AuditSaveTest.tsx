import React from 'react';
import { firestore as db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AuditSaveTest() {
  const handleSave = async () => {
    console.log("🚀 Starting manual save...");

    try {
      const checklist = [
        {
          code: "C1",
          question: "Manual test question",
          response: "Yes",
          remark: "Testing from direct code",
          evidence: ["https://example.com/test.jpg"]
        }
      ];

      console.log('📦 Saving object with checklist:', checklist);
      console.log('🔥 Firebase db object:', db);
      console.log('📋 Collection reference:', collection(db, "audit"));

      const docRef = await addDoc(collection(db, "audit"), {
        auditDate: "2025-07-28",
        auditor: "Abdul",
        company: "EHI",
        status: "draft",
        checklist,
        createdAt: serverTimestamp()
      });

      console.log("✅ Successfully saved! Doc ID:", docRef.id);
      alert("✅ Saved");
    } catch (err: any) {
      console.error("❌ SAVE FAILED:", err);
      console.error("❌ Error name:", err?.name);
      console.error("❌ Error message:", err?.message);
      console.error("❌ Error code:", err?.code);
      console.error("❌ Full error object:", JSON.stringify(err, null, 2));
      alert("❌ Save failed. See console.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Firestore Save Test</h2>
      <button 
        onClick={handleSave} 
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Test Manual Save
      </button>
    </div>
  );
}