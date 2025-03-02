import Dexie from 'dexie';

// ✅ Database create karna
const db = new Dexie("ChatDatabase");

// ✅ Version update karke tables define karna
db.version(3).stores({
    messages: "++id, chatId, content, senderId, timestamp", // Messages table
    chats: "chatId, uniqueChatId, isGroup, sync" 
});

export default db;
