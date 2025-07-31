
import React from 'react';
import FirebaseDatabaseViewer from '../components/FirebaseDatabaseViewer';

const DatabasePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Database Viewer</h1>
        <p className="text-gray-600 mt-2">
          Browse and inspect your Firebase Firestore collections in real-time
        </p>
      </div>
      <FirebaseDatabaseViewer />
    </div>
  );
};

export default DatabasePage;
