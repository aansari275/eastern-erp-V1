import { adminDb } from './server/firebase';

// Sample rug data based on the existing uploaded images
const sampleRugs = [
  {
    id: '1752897730251',
    designName: 'Traditional Persian Design',
    articleNumber: 'TPD-001',
    size: '6x9 ft',
    quality: 'Hand-knotted',
    construction: '200 KPSI',
    color: 'Deep Red & Navy',
    weight: '2.5 kg/sqm',
    buyer: 'Heritage Rugs Inc',
    status: 'completed',
    createdAt: new Date('2025-01-18').toISOString(),
    images: {
      rugImage1: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACIQAAIBAwQCAwAAAAAAAAAAAAECAAMRIQQSMRNBUWGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDraUpSClKUApSlAKUpQH/2Q==' // Placeholder small image
    }
  },
  {
    id: '1752899966131',
    designName: 'Modern Geometric Pattern',
    articleNumber: 'MGP-002',
    size: '8x10 ft',
    quality: 'Machine-made',
    construction: '150 KPSI',
    color: 'Blue & White',
    weight: '2.0 kg/sqm',
    buyer: 'Modern Living Co',
    status: 'in_progress',
    createdAt: new Date('2025-01-18').toISOString(),
    images: {
      rugImage1: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACIQAAIBAwQCAwAAAAAAAAAAAAECAAMRIQQSMRNBUWGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDraUpSClKUApSlAKUpQH/2Q==',
      rugImage2: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACIQAAIBAwQCAwAAAAAAAAAAAAECAAMRIQQSMRNBUWGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDraUpSClKUApSlAKUpQH/2Q=='
    }
  },
  {
    id: '1752901115713',
    designName: 'Classic Floral',
    articleNumber: 'CF-003',
    size: '5x7 ft',
    quality: 'Hand-tufted',
    construction: '120 KPSI',
    color: 'Cream & Gold',
    weight: '1.8 kg/sqm',
    buyer: 'Classic Carpets Ltd',
    status: 'sampling',
    createdAt: new Date('2025-01-19').toISOString(),
    images: {
      rugImage1: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECA//EACIQAAIBAwQCAwAAAAAAAAAAAAECAAMRIQQSMRNBUWGB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAXEQEBAQEAAAAAAAAAAAAAAAABAAIR/9oADAMBAAIRAxEAPwDraUpSClKUApSlAKUpQH/2Q=='
    }
  }
];

async function createSampleRugs() {
  console.log('🔄 Creating sample rug data for gallery...');
  
  try {
    // Check if Firebase Admin is available
    if (!adminDb) {
      console.log('❌ Firebase Admin not initialized');
      console.log('📁 Creating sample rugs data locally...');
      
      // Create a simple JSON file with sample data for testing
      const fs = await import('fs');
      fs.writeFileSync('./sample-rugs.json', JSON.stringify(sampleRugs, null, 2));
      console.log('✅ Sample rugs data saved to sample-rugs.json');
      return;
    }
    
    // If Firebase is available, add to Firestore
    for (const rug of sampleRugs) {
      await adminDb.collection('rugs').doc(rug.id).set(rug);
      console.log(`✅ Added rug: ${rug.designName}`);
    }
    
    console.log(`🎉 Successfully created ${sampleRugs.length} sample rugs!`);
    
  } catch (error) {
    console.error('❌ Error creating sample rugs:', error.message);
    
    // Fallback: create local file
    const fs = await import('fs');
    fs.writeFileSync('./sample-rugs.json', JSON.stringify(sampleRugs, null, 2));
    console.log('📁 Created sample-rugs.json as fallback');
  }
}

createSampleRugs();