import Dexie from 'dexie';

<<<<<<< HEAD
// ✅ Database create karna
const db = new Dexie("ChatDatabase");

// ✅ Version update karke tables define karna
db.version(3).stores({
    messages: "++id, chatId, content, senderId, timestamp", // Messages table
    chats: "chatId, uniqueChatId, isGroup, sync" 
=======
// Database create karo
const db = new Dexie("ChatDatabase");

// Chat messages ke liye ek store define karo
db.version(1).stores({
    messages: "++id, chatId, content, senderId, timestamp" // id auto-increment hoga
>>>>>>> parent of c7b12a8 (Update IndexedDB schema to include chat metadata store and increment version)
});

export default db;
