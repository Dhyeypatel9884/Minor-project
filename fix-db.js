require('dotenv').config();
const mongoose = require('mongoose');

// We connect directly using the URL from env
async function fixIndex() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const conversations = db.collection('conversations');
    await conversations.dropIndex('customId_1');
    console.log('Dropped customId_1 index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index customId_1 does not exist, everything is fine!');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    process.exit(0);
  }
}

fixIndex();
