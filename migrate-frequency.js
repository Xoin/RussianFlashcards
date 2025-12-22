// Migration script to load frequency data into database
const Database = require('./database');
const path = require('path');

async function migrateFrequencyData() {
  console.log('Starting frequency data migration...');
  
  const db = new Database();
  await db.init();
  
  // Load frequency data from CSV
  const csvPath = path.join(__dirname, 'data', 'frequency-list-1000.csv');
  await db.loadFrequencyData(csvPath);
  
  console.log('Frequency data migration completed!');
  console.log(`Total frequency words: ${db.data.frequencyWords.length}`);
  
  // Show distribution by CEFR level
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  console.log('\nDistribution by CEFR level:');
  for (const level of levels) {
    const words = await db.getWordsByLevel(level);
    console.log(`${level}: ${words.length} words`);
  }
  
  await db.close();
}

migrateFrequencyData().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
