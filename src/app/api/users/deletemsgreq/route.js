import { dbConnect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Pusher from 'pusher';
import { Notifications } from '@/models/notifications.models';

// Initialize Pusher
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
        let { username } = await request.json()


        let user = await User.findOne({ username })
        let iam = await User.findById(_user._id)
        const findedObjectequest = iam.myrequests.find(req => req.username === username);

        await Notifications.findByIdAndDelete(findedObjectequest.notificationId)



        await User.updateOne({ _id: user._id }, { $pull: { requests: _user._id, notifications: findedObjectequest.notificationId } });

        await User.updateOne({ _id: _user._id }, { $pull: { myrequests: { username: findedObjectequest.username } } });

        await pusher.trigger(`private-${user._id}`, 'msgDelRequest', {
            Id:findedObjectequest.notificationId,
            username: iam.username,
            isDot:user.isNotificationBoxOpen?false:true
        });

        return Response.json({
            success: true,
            message: "done"
        }, { status: 200 });
    } catch (error) {
        console.log("kuch gadbad", error);

        return Response.json({
            success: false,
            message: "problemm"
        }, { status: 500 });
    }
}