import Dexie from 'dexie';

// Database create karo
const db = new Dexie("ChatDatabase");

// Chat messages ke liye ek store define karo
db.version(1).stores({
    messages: "++id, chatId, content, senderId, timestamp" // id auto-increment hoga
});

export default db;
