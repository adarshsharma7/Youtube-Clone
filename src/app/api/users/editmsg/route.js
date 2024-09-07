import { dbConnect } from '@/dbConfig/dbConfig';
import Chat from '@/models/chat.models';
import User from '@/models/userModel';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Pusher from 'pusher';

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

export async function POST(request) {
    const session = await getServerSession(authOptions);
    const _user = session?.user;
    if (!_user || !session) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 400 });
    }

    try {
        await dbConnect();
        const { chatId,msgId,msgContent } = await request.json();

  // Trigger the Pusher event for real-time updates
  await pusher.trigger(`private-${_user._id}`, 'messagesEdit', {msgId,msgContent});

        const recipient = await User.findById(chatId);
        const sender = await User.findById(_user._id);

        let chat = await Chat.findOne({
            participants: { $all: [sender._id, recipient._id] }
        });
       

        if (!chat) {
            return Response.json({
                success: true,
                message: "no message found for wdit message"
            }, { status: 400 });
        }
      
        const updatedMessages = chat.messages.map((message) => {
            if(message._id.toString()==msgId.toString()){
                return {
                    ...message,
                    content: msgContent,
                    edited:true,
                    timestamp:new Date()
                };
            }
            return message
        
        });
       
        // Update chat with the modified messages
        chat.messages = updatedMessages;
        await chat.save()

    

        return Response.json({
            success: true,
            message: "Message sent successfully",
        }, { status: 200 });
    } catch (error) {
        console.error("Error sending message:", error);

        return Response.json({
            success: false,
            message: "Problem sending message"
        }, { status: 500 });
    }
}
