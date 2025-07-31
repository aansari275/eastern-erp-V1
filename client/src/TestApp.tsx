import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Eastern Mills ERP - Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Quick Links:</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/quality">Quality</a></li>
          <li><a href="/sampling">Sampling</a></li>
        </ul>
      </div>
    </div>
  );
};

export default TestApp;