import React from 'react';
import AuditFormV2 from '@/components/AuditFormV2';

export default function AuditTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Audit Form V2 Test Page
          </h1>
          <p className="mt-2 text-gray-600">
            Testing the new clean checklist[] structure
          </p>
        </div>
        <AuditFormV2 />
      </div>
    </div>
  );
}