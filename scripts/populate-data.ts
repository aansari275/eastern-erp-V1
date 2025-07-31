import { db } from '../server/db';
import { users, buyers, type InsertUser, type InsertBuyer } from '../shared/schema';

// User data from the first file
const userData = [
  { email: 'abdulansari@easternmills.com', firstName: 'Abdul Rahim', lastName: 'Ansari', department: 'Admin', mobile: '8756266111' },
  { email: 'documents@easternmills.com', firstName: 'Abdul', lastName: 'Quadir', department: 'Merchandising', mobile: '' },
  { email: 'abdullah@easternmills.com', firstName: 'Abdullah', lastName: 'Ansari', department: 'Merchandising', mobile: '' },
  { email: 'merchant2@easternmills.com', firstName: 'Abhinav', lastName: 'Sharma', department: 'Merchandising', mobile: '' },
  { email: 'qa.bhadohi@easternmills.com', firstName: 'Aditya', lastName: 'Singh', department: 'Merchandising', mobile: '' },
  { email: 'merchant6@easternmills.com', firstName: 'Anas', lastName: 'Mahboob', department: 'Merchandising', mobile: '' },
  { email: 'erp@easternmills.com', firstName: 'Arsh', lastName: 'Ansari', department: 'Merchandising', mobile: '' },
  { email: 'merchant4@easternmills.com', firstName: 'Ashfer', lastName: 'Ali', department: 'Merchandising', mobile: '' },
  { email: 'quality.manager@easternmills.com', firstName: 'Ashutosh', lastName: 'Yadav', department: 'Merchandising', mobile: '' },
  { email: 'erp.empl@easternmills.com', firstName: 'Azad', lastName: 'Yadav', department: 'ERP', mobile: '' },
  { email: 'accounts@easternmills.com', firstName: 'Chandra', lastName: 'Shekher', department: 'Accounts', mobile: '' },
  { email: 'corporate@easternmills.com', firstName: 'Corporate', lastName: 'Eastern', department: 'Management', mobile: '' },
  { email: 'media@easternmills.com', firstName: 'Eastern', lastName: 'Mills', department: 'Management', mobile: '' },
  { email: 'qc.empl@easternmills.com', firstName: 'EMPL', lastName: 'Quality', department: 'Quality', mobile: '' },
  { email: 'faizan@easternmills.com', firstName: 'Faizan', lastName: 'Rashid', department: 'Accounts', mobile: '' },
  { email: 'designing1@easternmills.com', firstName: 'Firoz', lastName: 'Alam', department: 'Designing', mobile: '' },
  { email: 'hr.bhadohi@easternmills.com', firstName: 'Firoz', lastName: 'Ahmad', department: 'HR', mobile: '' },
  { email: 'merchandiser.bhadohi@easternmills.com', firstName: 'Haider', lastName: 'A', department: 'Merchandising', mobile: '' },
  { email: 'ibrahim@easternmills.com', firstName: 'Ibrahim', lastName: 'Ansari', department: 'Management', mobile: '' },
  { email: 'merchant5@easternmills.com', firstName: 'Israr', lastName: 'Ansari', department: 'Merchandising', mobile: '' },
  { email: 'logistics.manager@easternmills.com', firstName: 'Kamla', lastName: 'Shankar', department: 'Production', mobile: '' },
  { email: 'sampling.bhadohi@easternmills.com', firstName: 'Mahmood', lastName: 'Alam', department: 'Designing', mobile: '' },
  { email: 'logistics@easternmills.com', firstName: 'Mohd.', lastName: 'Anas', department: 'Logistics', mobile: '' },
  { email: 'merchant9@easternmills.com', firstName: 'Muhammad', lastName: 'Altaf', department: 'Merchandising', mobile: '' },
  { email: 'Merch.manager@easternmills.com', firstName: 'Niraj', lastName: 'Srivastava', department: 'Merchandising', mobile: '' },
  { email: 'studio@easternmills.com', firstName: 'Prem', lastName: '.', department: 'Studio', mobile: '' },
  { email: 'qualityteam@easternmills.com', firstName: 'Quality', lastName: 'Team', department: 'Quality', mobile: '' },
  { email: 'quality@easternmills.com', firstName: 'Quality', lastName: 'Eastern', department: 'Quality', mobile: '' },
  { email: 'rahul.kumar@easternmills.com', firstName: 'Rahul', lastName: 'Kumar', department: 'Maintenance', mobile: '' },
  { email: 'pd@easternmills.com', firstName: 'Rinku', lastName: 'PD', department: 'Sampling', mobile: '' },
  { email: 'merchandiser3@easternmills.com', firstName: 'Ritik', lastName: 'Shukla', department: 'Merchandising', mobile: '' },
  { email: 'merchant10@easternmills.com', firstName: 'Rugberry', lastName: 'New', department: 'Rugberry', mobile: '' },
  { email: 'rugberry@easternmills.com', firstName: 'Rugberry', lastName: '.', department: 'Rugberry', mobile: '' },
  { email: 'e3@easternmills.com', firstName: 'Sahil', lastName: 'Ansari', department: 'Production', mobile: '' },
  { email: 'operations@easternmills.com', firstName: 'Sanjay', lastName: 'Srivastava', department: 'Production', mobile: '' },
  { email: 'final.inspection@easternmills.com', firstName: 'Shadab', lastName: 'Ahmed', department: 'Quality', mobile: '' },
  { email: 'shagun@easternmills.com', firstName: 'Shagun', lastName: 'Gupta', department: 'Merchandising', mobile: '' },
  { email: 'materials@easternmills.com', firstName: 'Shahnawaz', lastName: '.', department: 'Production', mobile: '' },
  { email: 'merchant1@easternmills.com', firstName: 'Sumant', lastName: 'Kumar', department: 'Merchandising', mobile: '' },
  { email: 'supply@easternmills.com', firstName: 'Supply', lastName: '.', department: 'Production', mobile: '' },
  { email: 'hr@easternmills.com', firstName: 'Suraj', lastName: 'Bind', department: 'HR', mobile: '' },
  { email: 'accounts1@easternmills.com', firstName: 'Vasif', lastName: 'Ansari', department: 'Accounts', mobile: '' },
  { email: 'zafaransari@easternmills.com', firstName: 'Zafar I', lastName: 'Ansari', department: 'Management', mobile: '' },
  { email: 'zahid@easternmills.com', firstName: 'Zahid', lastName: 'Ansari', department: 'Merchandising', mobile: '' },
  { email: 'zakir@easternmills.com', firstName: 'Zakir', lastName: 'H', department: 'Production', mobile: '' },
];

// Buyer data from the second file
const buyerData = [
  { buyerName: 'ARSIN RIG', buyerCode: 'A-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'ATELIER TORTIL', buyerCode: 'A-02', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'AM PM', buyerCode: 'A-03', merchantEmail: 'anas.mahboob@easternmills.com' },
  { buyerName: 'ABC ITALIA', buyerCode: 'A-05', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'ADORA', buyerCode: 'A-06', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'BENUTA', buyerCode: 'B-02', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'COURISTAN', buyerCode: 'C-01', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'CC MILANO', buyerCode: 'C-02', merchantEmail: 'anas.mahboob@easternmills.com' },
  { buyerName: 'CLASSIC COLLECTION', buyerCode: 'C-03', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'DESIGNER GUILD', buyerCode: 'D-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'DESIGNER RUGS', buyerCode: 'D-02', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'EDITION 1.6.9', buyerCode: 'E-01', merchantEmail: 'altaf@easternmills.com' },
  { buyerName: 'FERM LIVING', buyerCode: 'F-01', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'FAYETTE STUDIO', buyerCode: 'F-02', merchantEmail: 'altaf@easternmills.com' },
  { buyerName: 'GRAN LIVING', buyerCode: 'G-01', merchantEmail: 'altaf@easternmills.com' },
  { buyerName: 'HAY', buyerCode: 'H-01', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'ILVA', buyerCode: 'I-01', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'JOHN LEWIS', buyerCode: 'J-01', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'JACARANDA', buyerCode: 'J-02', merchantEmail: 'aquib@easternmills.com' },
  { buyerName: 'JAIPUR LIVING', buyerCode: 'J-03', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'KAPETTO', buyerCode: 'K-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'KAWAMOTO', buyerCode: 'K-02', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'LULU & GEORGIA', buyerCode: 'L-01', merchantEmail: 'altaf@easternmills.com' },
  { buyerName: 'LOLOI', buyerCode: 'L-02', merchantEmail: 'anas.mahboob@easternmills.com' },
  { buyerName: 'LA-REDOUT', buyerCode: 'L-03', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'LIEWOOD', buyerCode: 'L-04', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'MENU AS', buyerCode: 'M-01', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'MUUTO', buyerCode: 'M-02', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'MOHAWK HOME', buyerCode: 'M-03', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'MIO', buyerCode: 'M-04', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'MARINA RETAIL HOME', buyerCode: 'M-05', merchantEmail: 'anas.mahboob@easternmills.com' },
  { buyerName: 'MARC PHILIPS LA', buyerCode: 'M-06', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'MARC PHILIPS NY', buyerCode: 'M-07', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'MAHARAM', buyerCode: 'M-08', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'MANZIL RUGS', buyerCode: 'M-09', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'MOMINI', buyerCode: 'M-10', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'MEHARBAN RUGS', buyerCode: 'M-11', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'MARTIN PATRIC', buyerCode: 'M-12', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'NOURISON', buyerCode: 'N-01', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'NORDIC KNOTS', buyerCode: 'N-02', merchantEmail: 'aiyaz@easternmills.com' },
  { buyerName: 'NINE UNITED', buyerCode: 'N-03', merchantEmail: 'abhinav@easternmills.com' },
  { buyerName: 'PETER PAGE', buyerCode: 'P-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'POSL POTTEN', buyerCode: 'P-02', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'RH', buyerCode: 'R-01', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'RUSTA', buyerCode: 'R-02', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'SOK', buyerCode: 'S-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'STANTON', buyerCode: 'S-02', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'SOHO HOME', buyerCode: 'S-03', merchantEmail: 'aquib@easternmills.com' },
  { buyerName: 'STARK', buyerCode: 'S-04', merchantEmail: 'anas.mahboob@easternmills.com' },
  { buyerName: 'SHIRR RUGS', buyerCode: 'S-05', merchantEmail: 'altaf@easternmills.com' },
  { buyerName: 'SOSTRENE GRENES', buyerCode: 'S-06', merchantEmail: 'ashfer@easternmills.com' },
  { buyerName: 'Son Tapis', buyerCode: 'S-07', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'THE RUG COLLECTION', buyerCode: 'T-01', merchantEmail: 'aquib@easternmills.com' },
  { buyerName: 'THE RUG ESTABLISHMENT', buyerCode: 'T-02', merchantEmail: 'zahid@easternmills.com' },
  { buyerName: 'VERY COOK', buyerCode: 'V-01', merchantEmail: 'israr@easternmills.com' },
  { buyerName: 'ZARA', buyerCode: 'Z-01', merchantEmail: 'abhinav@easternmills.com' },
];

// Helper function to determine user role based on department
function determineUserRole(department: string): string {
  const dept = department.toLowerCase();
  if (dept === 'admin' || dept === 'management') {
    return 'admin';
  } else if (dept === 'merchandising') {
    return 'merchandising_user';
  } else if (dept === 'designing' || dept === 'sampling') {
    return 'sampling_user';
  } else {
    return 'user';
  }
}

// Helper function to determine user department
function determineUserDepartment(department: string): string {
  const dept = department.toLowerCase();
  if (dept === 'merchandising') {
    return 'merchandising';
  } else if (dept === 'designing' || dept === 'sampling') {
    return 'sampling';
  } else if (dept === 'admin' || dept === 'management') {
    return 'admin';
  } else {
    return 'other';
  }
}

// Helper function to find merchant name from email
function findMerchantName(email: string): string {
  const user = userData.find(u => u.email === email);
  return user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown Merchant';
}

async function populateUsers() {
  console.log('Populating users...');
  
  const usersToInsert: InsertUser[] = userData.map(user => ({
    username: user.email.split('@')[0], // Use email prefix as username
    password: 'defaultPassword123', // You should update this with proper hashing
    email: user.email,
    role: determineUserRole(user.department),
    department: determineUserDepartment(user.department),
    permissions: [], // Will be set based on role
    isActive: true
  }));

  try {
    // Insert users in batches to avoid conflicts
    for (const user of usersToInsert) {
      try {
        await db.insert(users).values(user).onConflictDoNothing();
      } catch (error) {
        console.log(`Skipping existing user: ${user.username}`);
      }
    }
    console.log(`Successfully populated ${usersToInsert.length} users`);
  } catch (error) {
    console.error('Error populating users:', error);
  }
}

async function populateBuyers() {
  console.log('Populating buyers...');
  
  const buyersToInsert: InsertBuyer[] = buyerData.map(buyer => ({
    buyerName: buyer.buyerName,
    buyerCode: buyer.buyerCode,
    merchantName: findMerchantName(buyer.merchantEmail),
    merchantEmail: buyer.merchantEmail,
    contractFiles: null,
    isActive: true
  }));

  try {
    // Insert buyers in batches to avoid conflicts
    for (const buyer of buyersToInsert) {
      try {
        await db.insert(buyers).values(buyer).onConflictDoNothing();
      } catch (error) {
        console.log(`Skipping existing buyer: ${buyer.buyerCode}`);
      }
    }
    console.log(`Successfully populated ${buyersToInsert.length} buyers`);
  } catch (error) {
    console.error('Error populating buyers:', error);
  }
}

async function main() {
  console.log('Starting data population...');
  
  await populateUsers();
  await populateBuyers();
  
  console.log('Data population completed!');
  process.exit(0);
}

main().catch(console.error);