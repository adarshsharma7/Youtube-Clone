import React, { useState, useEffect, useRef } from 'react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { chatMessageSchema } from "@/Schemas/sendChatmessagesSchema";
import { Button } from './ui/button';
import { Input } from './ui/input';
import Image from 'next/image';
import Pusher from 'pusher-js';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { IoClose } from "react-icons/io5";
import { TiTick, TiTickOutline } from 'react-icons/ti';
import { RxDotsVertical } from "react-icons/rx";
import db from "@/dbConfig/indexedDb";



function ChatOpen({ avatar, username, chatId, status, setIsChatOpen, setChats, setChatFrndIds }) {




    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    // const [onlineUsers, setOnlineUsers] = useState({});
    const [userStatus, setUserStatus] = useState('');
    const [isChatVisible, setIsChatVisible] = useState(true);
    const [userTyping, setUserTyping] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isTypingSent, setIsTypingSent] = useState(null);
    const [removeFrndPopup, setRemoveFrndPopup] = useState(false);
    const [updateMsgPopup, setUpdateMsgPopup] = useState(false);
    const [uniqueIndexforUpdateMsgPopup, setUniqueIndexforUpdateMsgPopup] = useState('');
    const [isMsgEditableId, setIsMsgEditableId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [removeFrndLoading, setRemoveFrndLoading] = useState(false);
    const [uniqueChatId, setUniqueChatId] = useState('');
    const [inChat, setInChat] = useState(false);
    const [isGroup, setIsGroup] = useState(true);
    const [replyMsg, setReplyMsg] = useState({ msgId: '', content: '' });
    const [highlightedReplyId, setHighlightedReplyId] = useState(null);

    // let debounceTyping=useDebounceCallback(setUserTyping,2000)

    const { data: session } = useSession();
    const user = session?.user;

    const form = useForm({
        resolver: zodResolver(chatMessageSchema),
        defaultValues: {
            chatMessage: ""
        }
    });

    const removeFrndPopupRef = useRef(null)
    const chatContainerRef = useRef(null);
    const updateMsgref = useRef(null);
    const replyMsgRef = useRef(null);

    // Scroll to the bottom when the chat opens or when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        console.log("messege update aur initiall time pr  messages ye hai bhai ",messages);
    }, [messages]);


    const handleClickOutside = (event) => {
        if (
            (removeFrndPopupRef.current && !removeFrndPopupRef.current.contains(event.target)) || (updateMsgref.current && !updateMsgref.current.contains(event.target))
        ) {
            setUpdateMsgPopup(false)
            setRemoveFrndPopup(false);

        }
        if ((replyMsgRef.current && !replyMsgRef.current.contains(event.target))) {
            setReplyMsg({
                msgId: '',
                content: ''
            })
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);


    useEffect(() => {

        const updateMsgStatus = async () => {
            try {
                await axios.post("/api/users/updatemsgstatus", { chatId });
            } catch (error) {
                console.error('Error updating message status', error);
            }
        };
        if (!isGroup) {
            updateMsgStatus();

        }

    }, []);


    useEffect(() => {
        setUserStatus(status)
    }, [])

    useEffect(() => {

        const sendTypingStatus = async (isTyping) => {
            try {
                await axios.post('/api/users/isusertyping', { chatId, isTyping });
            } catch (error) {
                console.error('Error sending typing status', error);
            }
        };

        if (userTyping === '' && isTypingSent !== false && !isGroup) {
            sendTypingStatus(false);
            setIsTypingSent(false);

        } else if (userTyping !== '' && isTypingSent !== true && !isGroup) {

            sendTypingStatus(true);

            setIsTypingSent(true)
        }

    }, [userTyping]);



    const fetchChatHistory = async () => {
        try {
            setHistoryLoading(true);
    
<<<<<<< HEAD
            // **Step 1: Pehle Metadata aur Messages Parallel Fetch Karna**
            let chatMetadataPromise = db.chats.get(chatId);
            let cachedMessagesPromise = db.messages.where("chatId").equals(chatId).toArray();
    
            const [chatMetadata, cachedMessages] = await Promise.all([chatMetadataPromise, cachedMessagesPromise]);
    
            // **Step 2: Sync Check Pehle Karna (Faster Decision Making)**
            if (chatMetadata?.sync === false || !chatMetadata) {
                console.log("Fetching from API due to sync OFF");
    
                // **Step 3: API Call Parallelly Start Karo**
                let apiResponsePromise = axios.get('/api/users/getchathistory', { params: { chatId } });
    
                // **Step 4: Agar IndexedDB me kuch hai, toh pehle woh Show Karna**
                if (cachedMessages.length > 0) {
                    setMessages(cachedMessages);
                    setUniqueChatId(chatMetadata?.uniqueChatId || "");
                    setIsGroup(chatMetadata?.isGroup || false);
                }
    
                // **Step 5: Ab API Response Wait Karna**
                const response = await apiResponsePromise;
    
                if (!response.data.success) {
                    setError(response.data.message);
                    return;
                }
    
                const { chatHistory, uniqueChatId, isGroup } = response.data;
    
                // **Step 6: API Data ko IndexedDB me Async Store Karna**
                db.transaction("rw", db.messages, db.chats, async () => {
                    await db.messages.bulkPut(chatHistory.map(msg => ({
                        id: msg._id,
                        chatId: chatId,
                        ...msg
                    })));
                    await db.chats.put({ chatId, uniqueChatId: uniqueChatId.toString(), isGroup, sync: true });
                }).catch(console.error);
    
                setMessages(chatHistory);
                setUniqueChatId(uniqueChatId.toString());
                setIsGroup(isGroup);
    
            } else {
                console.log("Fetching from IndexedDB (sync ON)");
    
                if (cachedMessages.length > 0) {
                    setMessages(cachedMessages);
                    setUniqueChatId(chatMetadata.uniqueChatId);
                    setIsGroup(chatMetadata.isGroup);
                } else {
                    setError("No messages found in IndexedDB");
                }
            }
    
=======
            // Pehle IndexedDB me cache check karo
            const cachedMessages = await db.messages.where("chatId").equals(chatId).toArray();
      
            if (cachedMessages.length > 0) {
                console.log("Loaded from IndexedDB");
                 setMessages(cachedMessages);
                 setUniqueChatId(cachedMessages.uniqueChatId);
                 setIsGroup(cachedMessages.isGroup);
                setHistoryLoading(false);
                 return;
            }
    
            // Agar cache me nahi mila, toh API call karo
            const response = await axios.get('/api/users/getchathistory', { params: { chatId } });
    
            if (response.data.success) {
               
                setMessages(response.data.chatHistory);
                  setUniqueChatId(response.data.uniqueChatId.toString())
                    // console.log("is group", response.data.isGroup);

                    setIsGroup(response.data.isGroup)
    
                // **IndexedDB me cache store karo**
                await db.messages.bulkPut(response.data.chatHistory.map(msg => ({
                    id: msg._id,  
                    chatId: chatId,
                    uniqueChatId: response.data.uniqueChatId.toString(),
                    isGroup: response.data.isGroup,
                    ...msg  // Sare fields automatically add ho jayenge
                })));
                
            } else {
                setError(response.data.message);
            }
>>>>>>> parent of c7b12a8 (Update IndexedDB schema to include chat metadata store and increment version)
        } catch (error) {
            setError('Error fetching chat history');
        } finally {
            setHistoryLoading(false);
        }
    };
    
    
    useEffect(() => {
        if (!chatId) return;
        fetchChatHistory();
    }, [chatId]);



    useEffect(() => {
        if (uniqueChatId == '' || !chatId || !user) return
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint: '/api/pusher/auth',
        });

        // // Subscribe to the global presence channel for overall online status
        // const globalPresenceChannel = pusher.subscribe('presence-online-users');
        // globalPresenceChannel.bind('pusher:subscription_succeeded', (members) => {
        //     const onlineUsers = members.members;
        //     setOnlineUsers(onlineUsers);
        // });

        // globalPresenceChannel.bind('pusher:member_added', (member) => {
        //     setOnlineUsers((prevUsers) => ({ ...prevUsers, [member.id]: member.info }));
        // });

        // globalPresenceChannel.bind('pusher:member_removed', (member) => {
        //     setOnlineUsers((prevUsers) => {
        //         const updatedUsers = { ...prevUsers };
        //         delete updatedUsers[member.id];
        //         return updatedUsers;
        //     });
        // });

        // Subscribe to the private channel to receive messages
        const msgChannel = pusher.subscribe(`private-${uniqueChatId}`);
        msgChannel.bind('newmsg', async function (data) {
            const { msgId, message, msgSenderId, username, videodata, replyMsg } = data;
        
            if (msgSenderId !== user._id) {
                const newMessage = {
                    _id: msgId,
                    chatId: chatId,
                    edited: false,
                    sender: { _id: chatId, username }, // Yahi exact same structure hona chaiye
                    repliedContent: replyMsg,
                    content: message,
                    videodata,
                    timestamp: new Date(),
                  };
        
                // **UI me add karo**
                setMessages((prevMessages) => [...prevMessages, newMessage]);
        
                // **IndexedDB me bhi save karo**
                await db.messages.put(newMessage);
            }
        });
        
        const statusChannel = pusher.subscribe(`private-${uniqueChatId}`);
        // console.log("frontend pr unique id :",uniqueChatId);
        const statusUpdateChannel = pusher.subscribe(`private-${chatId}`);
        statusUpdateChannel.bind('userStatusUpdate', function (data) {
            setUserStatus(data.status)
            if (data.status == 'online') {
                setIsChatVisible(true)
            } else {
                setIsChatVisible(false)
            }
        })
        statusUpdateChannel.bind('inChatUpdate', function (data) {

            if (data.isMyChatOpen == chatId) {
                setInChat(true)
            } else {
                setInChat(false)
            }

        })
        statusChannel.bind('isUserTyping', function (data) {
            if (data.userTypingId !== user._id) {
                setIsTyping(data.isTyping)
            }


        })

        statusChannel.bind('msgstatusUpdate', async function (data) {
            setMessages(data.updatedMessages);
        
            // IndexedDB me status update karo
            for (const updatedMsg of data.updatedMessages) {
                await db.messages.update(updatedMsg._id, { msgStatus: updatedMsg.msgStatus });
            }
        });
        
        statusChannel.bind('messagesDelete', async function (data) {
            const { msgId } = data;
        
            setMessages((prev) => prev.filter((prevObj) => prevObj._id !== msgId));
        
            // IndexedDB se bhi delete karo
            await db.messages.delete(msgId);
        });
        
        statusChannel.bind('messagesEdit', async function (data) {
               // console.log("m edit msg k andr huuu");
            const { msgId, msgContent } = data;
         
            
           
            // console.log("ye hai bhai msgId jo backend se aayi hai ab m match kraunga" ,msgId );
            // console.log("aur edit k baad m ye content kr dunga " ,msgContent );
            // console.log("abhi ye hai bhai messages edit se pahle ", messages);
            setMessages((prev) =>
                prev.map((prevObj) =>
                    prevObj._id === msgId
                        ? { ...prevObj, content: msgContent, edited: true, timestamp: new Date() }
                        : prevObj
                )
            );
        
            // IndexedDB me bhi update karo
            await db.messages.update(msgId, { content: msgContent, edited: true, timestamp: new Date() });
        
            console.log("ab ye hi bhai messages edit k baad to ", messages);
        });
        // Cleanup function to unsubscribe from Pusher channels
        return () => {
            // globalPresenceChannel.unbind_all();
            // globalPresenceChannel.unsubscribe();
            statusChannel.unsubscribe();
            statusChannel.unbind_all();
            msgChannel.unbind_all();
            msgChannel.unsubscribe();
            statusUpdateChannel.unbind_all();
            statusUpdateChannel.unsubscribe();
        };

    }, [chatId, uniqueChatId, user]);


    // const isInChat = onlineUsers[chatId] !== undefined;
    const sendMessage = async (data) => {
        const tempMsgId = Date.now();  // Temporary ID
    
        try {
            // Optimistic UI Update
            const tempMessage = {
                id: tempMsgId,
                chatId: chatId,
                sender: { _id: user._id }, 
                _id: tempMsgId,  
                videoData: undefined, 
                msgStatus: isChatVisible && inChat ? 'read' : isChatVisible ? 'delivered' : 'sent',
                repliedContent: { msgId: replyMsg.msgId, content: replyMsg.content },  
                content: userTyping,
                timestamp: new Date(),
            };
    
            setMessages((prevMessages) => [...prevMessages, tempMessage]);
            setUserTyping('');
    
            // IndexedDB me save karo (optimistic update)
            await db.messages.put(tempMessage);
    
            // API Call
            let response = await axios.post("/api/users/sendmessages", { 
                message: data.chatMessage, 
                replyMsg,
                chatId, 
                msgStatus: tempMessage.msgStatus
            });
    
            // Message ka actual ID update karo IndexedDB me
            await db.messages.update(tempMsgId, { id: response.data.msgId, _id: response.data.msgId });
    
            // UI me update karo
            setMessages((prevMessages) =>
                prevMessages.map(msg =>
                    msg.id === tempMsgId ? { ...msg, id: response.data.msgId, _id: response.data.msgId } : msg
                )
            );
    
            // Reply message reset karna
            setReplyMsg({
                msgId: '',
                content: ''
            });
    
        } catch (error) {
            console.error("Error sending message:", error);
    
            // Agar fail ho jaye, toh optimistic message remove karna
            setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== tempMsgId));
            await db.messages.delete(tempMsgId);
        }
    };
    
    

    const removeFrnd = async (deleteGroup) => {
        try {

            let response = await axios.post("/api/users/deletefrnd", { chatId, deleteGroup })
            if (!isGroup) {
                setChatFrndIds((prev) => prev.filter((prevVal) => prevVal !== chatId))
            }
            let updatedChat = [...response.data.chatData, ...response.data.groupData]
            console.log("updatedChat", updatedChat);

            setChats(updatedChat)
            setIsChatOpen(false)

        } catch (error) {
            console.log("kuch galt hua remove friend karte time", error);

        }
    }

    const deleteMsgForBoth = async (msgId) => {
        setMessages((prev) => prev.filter((prevObj) => prevObj._id !== msgId));
        setUpdateMsgPopup(false);
    
        // IndexedDB se bhi delete karo
        await db.messages.delete(msgId);
    
        // Server request
        await axios.post("/api/users/deletemsg", { chatId, msgId });
    };
    
    const deleteMsgForMe = async (msgId) => {
        setMessages((prev) =>
            prev.map((prevObj) =>
                prevObj._id === msgId ? { ...prevObj, delForMe: true } : prevObj
            )
        );
        setUpdateMsgPopup(false);
    
        // IndexedDB me bhi update karna (sirf delForMe flag change karna)
        await db.messages.update(msgId, { delForMe: true });
    
        // Server request
        await axios.post("/api/users/deletemsgforme", { chatId, msgId });
    };
    
    const editMsg = async (data) => {
        setMessages((prev) =>
            prev.map((prevObj) =>
                prevObj._id === isMsgEditableId
                    ? { ...prevObj, content: userTyping, edited: true, timestamp: new Date() }
                    : prevObj
            )
        );
    
        // IndexedDB me bhi update karna
        await db.messages.update(isMsgEditableId, {
            content: userTyping,
            edited: true,
            timestamp: new Date(),
        });
    
        setUserTyping('');
        setEditedContent('');
        setIsMsgEditableId(null);
    
        // Server request
        await axios.post("/api/users/editmsg", { chatId, msgId: isMsgEditableId, msgContent: data.chatMessage });
    };
    


    const handleReplyMsgClick = (replyId) => {


        const clickedReply = messages.find(reply => reply._id === replyId);

        if (clickedReply && clickedReply.repliedContent.msgId !== '') {
            const firstReplyIndex = messages.findIndex(reply => reply._id === clickedReply.repliedContent.msgId);

            setHighlightedReplyId(`reply-${firstReplyIndex}`);
            console.log("firstReplyIndex", firstReplyIndex);
            // Scroll to the comment
            document.getElementById(`reply-${firstReplyIndex}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            // Remove the highlight after 3 seconds
            setTimeout(() => setHighlightedReplyId(null), 2000);
        }
    };
    return (
        <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100 shadow-lg rounded-lg">
            {/* Header */}
            <div className="h-[60px] bg-gray-800 flex justify-between items-center px-4 relative">

                <div className="flex items-center space-x-3 ">
                    <div className='flex items-center justify-center overflow-hidden h-10 w-10 rounded-full relative'>
                        {/* User Avatar (dp) */}
                        <Image
                            src={avatar}
                            alt="dp"
                            fill
                            sizes="40px"
                            className="rounded-full"
                            style={{ objectFit: 'cover' }}
                        />

                    </div>

                    <div className="text-lg font-semibold">{username}</div>
                    {!isGroup && (
                        <div className={`ml-2 text-sm ${isChatVisible && inChat ? 'text-green-400' : userStatus === 'online' ? 'text-blue-400' : 'text-gray-500'}`}>
                            {isTyping && isChatVisible ? 'Typing...' : isChatVisible && inChat ? 'In chat' : userStatus}
                        </div>
                    )}


                </div>
                <div className='flex gap-2 items-center'>
                    <IoClose onClick={() => setIsChatOpen(false)} className="md:hidden cursor-pointer text-2xl text-gray-400 hover:text-white transition" />
                    <div className='cursor-pointer' onClick={() => setRemoveFrndPopup(!removeFrndPopup)}><RxDotsVertical /></div>
                </div>
                {removeFrndPopup && (
                    <div className='flex flex-col justify-center items-center text-black' ref={removeFrndPopupRef} style={{
                        position: 'absolute',
                        top: '70%',
                        right: '2%',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                    }}>
                        {removeFrndLoading ? (
                            <Button
                                disabled
                                className="bg-gray-400 text-white hover:bg-gray-500 px-4 py-2 rounded-lg"
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Wait...
                            </Button>
                        ) : (
                            <Button variant="outline"
                                onClick={() => {
                                    setRemoveFrndLoading(true)
                                    removeFrnd(isGroup && user.username === username ? true : false)
                                }}
                                disabled={removeFrndLoading}
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg"
                            >

                                {isGroup && user.username == username ? "Delete Group" : isGroup ? "Remove from this group" : "Remove Friend"}
                            </Button>
                        )}



                    </div>
                )}

            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-800">
                {historyLoading ? (
                    <div className="flex justify-center items-center">
                        <Loader2 className="animate-spin text-blue-400" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400">{error}</div>
                ) : (
                    messages.map((msg, index) => (
                        <div id={`reply-${index}`} key={index} className={`${msg.sender?._id === user._id && msg.delForMe ? "hidden" : ''} flex flex-col mb-2   ${highlightedReplyId === `reply-${index}` ? 'bg-yellow-200' : ''}`}>

                            <div

                                className={`relative flex ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}
                            >

                                <div className={`flex flex-col border-2 border-slate-500 rounded-lg max-w-[50%]`}>
                                    {
                                        msg.repliedContent?.content && (
                                            <div onClick={() => handleReplyMsgClick(msg._id)} className='cursor-pointer text-sm text-ellipsis break-words'>
                                                <p>{msg.repliedContent.content}</p>
                                            </div>
                                        )
                                    }
                                    {msg.videoData?.title !== null && msg.videoData?.title !== undefined && (
                                        <div className='flex flex-col rounded-lg overflow-hidden shadow-lg'>
                                            {/* Video Thumbnail */}
                                            <div className='w-full h-[215px] bg-gray-200 relative'>
                                                <Image
                                                    src={msg.videoData.thumbnail}
                                                    alt="thumbnail"
                                                    fill
                                                    className="rounded-t-lg"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>

                                            {/* User Info and Video Title */}
                                            <div className='flex flex-col p-3 bg-white'>
                                                <div className='flex gap-2 items-center'>
                                                    <div className='flex items-center justify-center overflow-hidden h-10 w-10 rounded-full relative'>
                                                        {/* User Avatar (dp) */}
                                                        <Image
                                                            src={msg.videoData.avatar}
                                                            alt="dp"
                                                            fill
                                                            sizes="40px"
                                                            className="rounded-full"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    {/* User's Name */}
                                                    <p className='font-medium text-gray-800'>{msg.videoData.ownerUsername}</p>
                                                </div>

                                                {/* Video Title */}
                                                <h1 className='text-lg font-semibold text-gray-900'>{msg.videoData.title}</h1>
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`relative p-3 rounded-lg shadow-lg ${msg.sender?._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100 '}`}

                                    >
                                     
                                            <div className='cursor-pointer absolute right-0' onClick={() => {
                                                setUniqueIndexforUpdateMsgPopup(index)
                                                setUpdateMsgPopup(!updateMsgPopup)
                                            }
                                            }><RxDotsVertical /></div>
                                      
                                        {updateMsgPopup && index == uniqueIndexforUpdateMsgPopup && (
                                            <div className='flex flex-col justify-center items-center text-black' ref={updateMsgref} style={{
                                                position: 'absolute',
                                                top: '25%',
                                                right: '2%',
                                                backgroundColor: 'white',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px',
                                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                                                zIndex: 1000,
                                            }}>
                                                {/* <Button variant="outline" onClick={() => deleteMsgForMe()}>
                                                Delete for you
                                            </Button> */}

                                                <Button variant="outline" onClick={() => {
                                                    setReplyMsg({
                                                        msgId: msg._id,
                                                        content: msg.content
                                                    })
                                                }}>
                                                    Reply
                                                </Button>
                                                {msg.sender._id === user._id  && (<>
                                                    <Button variant="outline" onClick={() => {
                                                        setUpdateMsgPopup(false)
                                                        setUserTyping(msg.content)
                                                        setEditedContent(msg.content)
                                                        setIsMsgEditableId(msg._id)
                                                    }}>
                                                        Edit Message
                                                    </Button>

                                                    <Button variant="outline" onClick={() => deleteMsgForBoth(msg._id)}>
                                                        Delete for both
                                                    </Button>

                                                    <Button variant="outline" onClick={() => deleteMsgForMe(msg._id)}>
                                                        Delete for Me
                                                    </Button>
                                                </>

                                                )

                                                }



                                            </div>
                                        )}

                                        {msg.videoData?.title !== null && msg.videoData?.title !== undefined ? (
                                            <a className='break-words text-base mr-3' href={msg.content}>{msg.content}</a>
                                        ) : (
                                            <p className='break-words text-base mr-3'>{msg.content}</p>
                                        )}


                                        <div className="flex items-center justify-end mt-1">
                                            <span className="text-xs text-gray-400 mr-2">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </span>
                                            {msg.sender._id === user._id && (
                                                <span className="flex items-center">

                                                    {msg.msgStatus === 'sent' && (
                                                        <span className="text-slate-400">
                                                            <TiTickOutline size={16} />
                                                        </span>
                                                    )}
                                                    {msg.msgStatus === 'delivered' && (
                                                        <span className="text-slate-400">
                                                            <TiTickOutline size={16} />
                                                            <TiTickOutline size={16} />
                                                        </span>
                                                    )}
                                                    {msg.msgStatus === 'read' && (
                                                        <span className="text-green-500">
                                                            <TiTick size={16} />
                                                            <TiTick size={16} />
                                                        </span>
                                                    )}
                                                </span>
                                            )}


                                        </div>
                                        {username == msg.sender.username && isGroup && (
                                            <p className={`absolute text-green-500 top-1 right-2 text-[9px]`}>Ad</p>
                                        )}
                                    </div>
                                </div>



                            </div>
                            <div className='flex gap-1 w-full'>
                                {isGroup && (
                                    <div hidden={msg.sender._id === user._id}>
                                        <p className={`text-slate-500 text-sm`}>@{msg.sender.username}</p>
                                    </div>
                                )}

                                <div className=' w-full' hidden={!msg.edited}>
                                    <p className={`text-slate-500 text-sm ${msg.sender._id === user._id ? 'float-right' : ''}`}>edited</p>
                                </div>

                            </div>


                        </div>

                    ))
                )}

            </div>


            {/* Input */}
            <div ref={replyMsgRef} className="p-3 md:mb-24 bg-gray-800 border-t border-gray-700">

                {replyMsg.msgId &&
                    <div className='break-words text-ellipsis text-sm bg-gray-500'>
                        <p>{replyMsg.content}</p>
                    </div>
                }

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(async (data) => {

                        if (isMsgEditableId) {
                            await editMsg(data);
                        } else {
                            await sendMessage(data);
                        }
                        form.reset();//Reset the full Form input field after submitting
                        // form.setValue("comment", ""); // Reset the indivisual input field after submitting
                    })} className="flex space-x-2">
                        <FormField
                            control={form.control}
                            name="chatMessage"
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="w-full px-4 py-2 rounded-full bg-gray-700 border border-gray-600 focus:ring focus:ring-blue-400 text-gray-100"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setUserTyping(e.target.value)
                                                }}
                                                value={userTyping}
                                            />
                                            {isMsgEditableId && (
                                                <p onClick={() => {
                                                    setIsMsgEditableId(null)
                                                    setUserTyping('')
                                                    field.onChange('');
                                                }} className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white px-2 py-1 rounded">
                                                    <IoClose />
                                                </p>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full shadow-lg"
                            disabled={editedContent == userTyping}
                        >

                            {editedContent ? 'Edit' : 'send'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default ChatOpen;
