import Dexie from 'dexie';

// ✅ Database create karo
const db = new Dexie("ChatDatabase");

// ✅ Version update karke dono tables add karo
db.version(2).stores({
    messages: "++id, chatId, content, senderId, timestamp", // Messages store
    chats: "chatId, uniqueChatId, isGroup" // Chat metadata store
});

export default db;
