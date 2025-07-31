import { initializeERPDatabase } from './erpDatabase';

async function testOPSTables() {
  try {
    console.log('🔍 Testing OPS tables structure...');
    const connection = await initializeERPDatabase();
    
    // Test vopslist table structure
    console.log('\n📋 Testing vopslist table:');
    const opsListQuery = `SELECT TOP 5 * FROM vopslist`;
    const opsListResult = await connection.request().query(opsListQuery);
    console.log('Columns found in vopslist:', Object.keys(opsListResult.recordset[0] || {}));
    console.log('Sample data:', opsListResult.recordset[0]);
    
    // Test vopslistdtl table structure  
    console.log('\n📋 Testing vopslistdtl table:');
    const opsDetailQuery = `SELECT TOP 5 * FROM vopslistdtl`;
    const opsDetailResult = await connection.request().query(opsDetailQuery);
    console.log('Columns found in vopslistdtl:', Object.keys(opsDetailResult.recordset[0] || {}));
    console.log('Sample data:', opsDetailResult.recordset[0]);
    
  } catch (error) {
    console.error('❌ Error testing OPS tables:', error);
  }
}

testOPSTables();