import { Express } from 'express';
import rugRoutes from './routes/rugs'; // ✅ FIXED path to rugs.ts inside routes folder
import opsRoutes from './routes/ops';
import ocrRoutes from './routes/ocr';
import buyersRoutes from './routes/buyers';
import articleNumbersRoutes from './routes/article-numbers';
import pdocRoutes from './routes/pdocs';
import quotesRoutes from './routes/quotes';
import qualityRoutes from './routes/quality';
import adminRoutes from './routes/admin';
import auditRoutes from './routes/audits';
import labInspectionRoutes from './routes/labInspections';
import testLabRoutes from './routes/test-lab';
import escalationRoutes from './routes/escalations';


export async function registerRoutes(app: Express, storage: any) {
  app.use('/api/rugs', rugRoutes); // Makes /api/rugs available
  app.use('/api/ops', opsRoutes); // Makes /api/ops available
  app.use('/api/ocr', ocrRoutes); // Makes /api/ocr available
  app.use('/api/buyers', buyersRoutes); // Makes /api/buyers available
  app.use('/api/article-numbers', articleNumbersRoutes); // Makes /api/article-numbers available
  app.use('/api/pdocs', pdocRoutes); // Makes /api/pdocs available
  app.use('/api/quotes', quotesRoutes); // Makes /api/quotes available
  app.use('/api/quality', qualityRoutes); // Makes /api/quality available
  app.use('/api/admin', adminRoutes); // Makes /api/admin available
  app.use('/api/audits', auditRoutes); // Makes /api/audits available
  app.use('/api/lab-inspections', labInspectionRoutes); // Makes /api/lab-inspections available
  app.use('/api/test-lab', testLabRoutes); // Test route for debugging
  app.use('/api/escalations', escalationRoutes); // Makes /api/escalations available

  
  // Sample inspection routes
  const sampleInspectionRoutes = await import('./routes/sampleInspections');
  app.use('/api/sample-inspections', sampleInspectionRoutes.default);
  
  // User permissions routes (commented out due to missing file)
  // const userPermissionRoutes = await import('./routes/userPermissions');
  // app.use('/api/user-permissions', userPermissionRoutes.default);
  
  return app;
}
