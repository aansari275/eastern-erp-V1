import sql from 'mssql';
// ERP Database configuration
const config = {
    server: '167.71.239.104',
    database: 'empl_data19',
    user: 'sa',
    password: 'Empl@786',
    options: {
        encrypt: false, // Use encryption if required
        trustServerCertificate: true, // Use if self-signed certificate
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
};
let pool = null;
// Initialize connection pool
export async function initializeERPDatabase() {
    try {
        if (!pool) {
            pool = new sql.ConnectionPool(config);
            await pool.connect();
            console.log('✅ Connected to ERP database successfully');
        }
        return pool;
    }
    catch (error) {
        console.error('❌ Error connecting to ERP database:', error);
        throw error;
    }
}
// Get all materials from ERP database
export async function getMaterials() {
    try {
        const connection = await initializeERPDatabase();
        const request = connection.request();
        const query = `
      SELECT DISTINCT 
        sitem_name as materialName,
        it_rate as rate,
        s_nm as supplierName
      FROM vopspurchase 
      WHERE sitem_name IS NOT NULL 
        AND it_rate IS NOT NULL
        AND sitem_name != ''
      ORDER BY sitem_name
    `;
        const result = await request.query(query);
        console.log(`Found ${result.recordset.length} materials from ERP`);
        return result.recordset.map((record) => ({
            name: record.materialName,
            rate: parseFloat(record.rate) || 0,
            supplier: record.supplierName || '',
        }));
    }
    catch (error) {
        console.error('Error fetching materials from ERP:', error);
        throw error;
    }
}
// Get material rate by name
export async function getMaterialRate(materialName) {
    try {
        const connection = await initializeERPDatabase();
        const request = connection.request();
        request.input('materialName', sql.VarChar, materialName);
        const query = `
      SELECT TOP 1 
        it_rate as rate,
        s_nm as supplierName
      FROM vopspurchase 
      WHERE sitem_name = @materialName
        AND it_rate IS NOT NULL
      ORDER BY it_rate DESC
    `;
        const result = await request.query(query);
        if (result.recordset.length > 0) {
            return {
                rate: parseFloat(result.recordset[0].rate) || 0,
                supplier: result.recordset[0].supplierName || '',
            };
        }
        return { rate: 0, supplier: '' };
    }
    catch (error) {
        console.error('Error fetching material rate from ERP:', error);
        return { rate: 0, supplier: '' };
    }
}
// Get OPS orders data from vopslist and vopslistdtl tables
export async function getOPSOrders(startDate, endDate) {
    try {
        const connection = await initializeERPDatabase();
        const request = connection.request();
        // Default to last 6 months if no dates provided
        const defaultStartDate = new Date();
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 6);
        const start = startDate || defaultStartDate.toISOString().split('T')[0];
        const end = endDate || new Date().toISOString().split('T')[0];
        const query = `
      SELECT DISTINCT TOP 500
        o.bo_id,
        o.i_on as ops_no,
        o.b_code as buyer_code,
        o.b_name as buyer_name,
        o.o_dt as order_date,
        o.s_dt as delivery_date,
        o.EXP_VALUE as total_amount,
        o.order_Type,
        o.Incharge,
        o.ord_pcs,
        o.Area as total_area,
        COUNT(d.bo_id) as item_count,
        SUM(d.ORD_QTY) as total_ordered_qty,
        SUM(d.ISS_QTY) as total_issued_qty,
        SUM(d.BAZAR_QTY) as total_bazar_qty,
        SUM(d.SALE_QTY) as total_sale_qty,
        CASE 
          WHEN o.s_dt < GETDATE() AND SUM(d.SALE_QTY) < SUM(d.ORD_QTY) THEN 1
          ELSE 0
        END as is_delayed
      FROM vopslist o
      LEFT JOIN vopslistdtl d ON o.bo_id = d.bo_id
      WHERE o.o_dt IS NOT NULL 
        AND o.o_dt >= @startDate 
        AND o.o_dt <= @endDate
      GROUP BY o.bo_id, o.i_on, o.b_code, o.b_name, 
               o.o_dt, o.s_dt, o.EXP_VALUE, o.order_Type, o.Incharge, o.ord_pcs, o.Area
      ORDER BY o.s_dt ASC, o.bo_id DESC
    `;
        request.input('startDate', start);
        request.input('endDate', end);
        const result = await request.query(query);
        console.log(`Found ${result.recordset.length} OPS orders from ERP`);
        return result.recordset.map((record) => ({
            boId: record.bo_id,
            opsNo: record.ops_no?.trim() || '',
            buyerCode: record.buyer_code?.trim() || '',
            buyerName: record.buyer_name?.trim() || '',
            orderDate: record.order_date,
            deliveryDate: record.delivery_date,
            totalAmount: parseFloat(record.total_amount) || 0,
            currency: 'INR',
            orderType: record.order_Type?.trim() || '',
            incharge: record.Incharge?.trim() || '',
            orderedPieces: parseInt(record.ord_pcs) || 0,
            totalArea: parseFloat(record.total_area) || 0,
            itemCount: parseInt(record.item_count) || 0,
            totalOrderedQty: parseInt(record.total_ordered_qty) || 0,
            totalIssuedQty: parseInt(record.total_issued_qty) || 0,
            totalBazarQty: parseInt(record.total_bazar_qty) || 0,
            totalSaleQty: parseInt(record.total_sale_qty) || 0,
            isDelayed: record.is_delayed === 1,
            daysDelayed: record.delivery_date ? Math.max(0, Math.floor((new Date().getTime() - new Date(record.delivery_date).getTime()) / (1000 * 60 * 60 * 24))) : 0
        }));
    }
    catch (error) {
        console.error('Error fetching OPS orders from ERP:', error);
        throw error;
    }
}
// Get OPS order details by bo_id
// Import article numbers from vopslistdtl table with bo_id > 1614
export async function importArticleNumbersFromERP() {
    try {
        const connection = await initializeERPDatabase();
        const request = connection.request();
        const query = `
      SELECT DISTINCT
        d.b_code as buyer_code,
        d.quality as construction,
        d.design as design_name,
        d.colour as color,
        d.fs5 as size
      FROM vopslistdtl d
      WHERE d.bo_id > 1614 
        AND d.b_code IS NOT NULL 
        AND d.b_code != ''
        AND d.b_code != 'EMPL'
        AND d.quality IS NOT NULL
        AND d.design IS NOT NULL
        AND d.colour IS NOT NULL
        AND d.fs5 IS NOT NULL
      ORDER BY d.b_code, d.design, d.colour, d.fs5
    `;
        const result = await request.query(query);
        console.log(`Found ${result.recordset.length} unique article numbers from ERP`);
        return result.recordset.map((record) => ({
            buyerCode: record.buyer_code?.trim() || '',
            construction: record.construction?.trim() || '',
            designName: record.design_name?.trim() || '',
            color: record.color?.trim() || '',
            size: record.size?.trim() || ''
        }));
    }
    catch (error) {
        console.error('Error importing article numbers from ERP:', error);
        throw error;
    }
}
export async function getOPSOrderDetails(boId) {
    try {
        const connection = await initializeERPDatabase();
        const request = connection.request();
        const query = `
      SELECT 
        d.bo_id,
        d.i_on as ops_no,
        d.b_code as buyer_code,
        d.quality,
        d.design,
        d.colour,
        d.fs5 as size,
        d.ORD_QTY as ordered_qty,
        d.ISS_QTY as issued_qty,
        d.BAZAR_QTY as bazar_qty,
        d.SALE_QTY as sale_qty,
        d.Area as item_area,
        d.o_dt as order_date,
        d.s_dt as delivery_date,
        o.b_name as buyer_name,
        o.order_Type,
        o.Incharge
      FROM vopslistdtl d
      INNER JOIN vopslist o ON d.bo_id = o.bo_id
      WHERE d.bo_id = @boId
      ORDER BY d.design, d.colour
    `;
        request.input('boId', sql.Int, parseInt(boId));
        const result = await request.query(query);
        return result.recordset.map((record) => ({
            boId: record.bo_id,
            opsNo: record.ops_no?.trim() || '',
            buyerCode: record.buyer_code?.trim() || '',
            buyerName: record.buyer_name?.trim() || '',
            quality: record.quality?.trim() || '',
            design: record.design?.trim() || '',
            colour: record.colour?.trim() || '',
            size: record.size?.trim() || '',
            orderedQty: parseInt(record.ordered_qty) || 0,
            issuedQty: parseInt(record.issued_qty) || 0,
            bazarQty: parseInt(record.bazar_qty) || 0,
            saleQty: parseInt(record.sale_qty) || 0,
            itemArea: parseFloat(record.item_area) || 0,
            orderDate: record.order_date,
            deliveryDate: record.delivery_date,
            orderType: record.order_Type?.trim() || '',
            incharge: record.Incharge?.trim() || ''
        }));
    }
    catch (error) {
        console.error('Error fetching OPS order details from ERP:', error);
        throw error;
    }
}
// Close connection pool
export async function closeERPDatabase() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('ERP database connection closed');
        }
    }
    catch (error) {
        console.error('Error closing ERP database connection:', error);
    }
}
