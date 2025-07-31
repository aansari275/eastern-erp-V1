import sql from 'mssql';
const config = {
    server: '167.71.239.104',
    database: 'empl_data19',
    user: 'sa',
    password: 'Empl@786',
    options: {
        encrypt: false, // Use true if you're on Azure
        trustServerCertificate: true // Change to false for production
    }
};
let pool = null;
export async function getConnection() {
    if (!pool) {
        pool = new sql.ConnectionPool(config);
        await pool.connect();
    }
    return pool;
}
export async function getMaterialsFromDatabase() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM vopspurchase');
        return result.recordset;
    }
    catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}
export async function closeConnection() {
    if (pool) {
        await pool.close();
        pool = null;
    }
}
