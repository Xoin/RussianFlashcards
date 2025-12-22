// Migration script to import initial sentences and definitions
const Database = require('./database');
const { wordDefinitions, exampleSentences } = require('./initial-content');

async function migrate() {
  console.log('Starting migration...');
  const db = new Database();
  
  try {
    await db.init();
    console.log('Database initialized');
    
    // Check if data already exists
    const existingDefinitions = await db.getAllDefinitions();
    const existingSentences = await db.getAllSentences();
    
    if (existingDefinitions.length > 0 || existingSentences.length > 0) {
      console.log(`Found existing data: ${existingDefinitions.length} definitions, ${existingSentences.length} sentences`);
      console.log('Skipping migration to avoid duplicates. Delete flashcards.json to start fresh.');
      return;
    }
    
    // Import definitions
    console.log(`Importing ${wordDefinitions.length} word definitions...`);
    await db.importDefinitions(wordDefinitions);
    console.log('Definitions imported successfully');
    
    // Import sentences
    console.log(`Importing ${exampleSentences.length} example sentences...`);
    await db.importSentences(exampleSentences);
    console.log('Sentences imported successfully');
    
    console.log('\nMigration completed successfully!');
    console.log(`Total: ${wordDefinitions.length} definitions, ${exampleSentences.length} sentences`);
    
    await db.close();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

// Run migration
migrate();
