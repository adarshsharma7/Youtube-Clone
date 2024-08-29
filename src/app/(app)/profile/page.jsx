"use client"
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/context'
import { RxDotsVertical } from "react-icons/rx";
import { useDebounceCallback } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
function Page() {

    const { state, dispatch } = useUser()
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [usernameMessage, setUsernameMessage] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const popupRef = useRef(null);
    const dialogContentRef = useRef(null);
    const { data: session } = useSession()
    const _user = session?.user

    let router = useRouter()
    const debounced = useDebounceCallback(setUsername, 300);



    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target) && (!dialogContentRef.current || !dialogContentRef.current.contains(event.target))) {
            setIsPopupVisible(false);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClickOutside, true);
        return () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
    }, []);

    useEffect(() => {
        const fetchProfileDetails = async () => {
            try {
                let response = await axios.get("/api/users/profile")

                if (response.data.message == "No Liked Videos") {
                    dispatch({ type: "SET_LIKED_ERROR", payload: response.data.message })
                } else if (response.data.message == "No Watched Videos") {
                    dispatch({ type: "SET_WATCHHISTORY_ERROR", payload: response.data.message })
                } else {
                    dispatch({ type: "SET_UPLOADEDVIDEOS_ERROR", payload: response.data.message })
                }



                dispatch({ type: "FETCHED_PROFILE", payload: response.data.data })
            } catch (error) {

            }
        }
        fetchProfileDetails()
    }, [])


    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (username) {
                setIsCheckingUsername(true);
                setUsernameMessage(''); // Reset message
                try {
                    const response = await axios.get(
                        `/api/users/check-username?username=${username}`
                    );
                    setUsernameMessage(response.data.message);
                } catch (error) {
                    const axiosError = error;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? 'Error checking username'
                    );
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        };
        checkUsernameUnique();
    }, [username]);



    const handleSubmit = async (e) => {
        setIsSubmitting(true)
        e.preventDefault();
        let formData = new FormData()
        formData.append('username', username);
        formData.append('fullName', fullName);
        formData.append('avatar', avatar);
        try {
            let response = await axios.post("/api/users/editprofile", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            if (response.data.success) {
                dispatch({
                    type: "UPDATED_PROFILE",
                    payload: {
                        username: response.data.updatedUser.username,
                        fullName: response.data.updatedUser.fullName,
                        avatar: response.data.updatedUser.avatar,
                    },
                });
                toast({
                    title: 'Success',
                    description: response.data.message,
                })
                setIsPopupVisible(false)

            } else {
                toast({
                    title: 'false',
                    description: response.data.message,
                });
            }

        } catch (error) {
            console.error('Error during updating profile', error);
        } finally {
            setIsSubmitting(false)
        }
    };



    return (
        <div className="h-full w-full flex flex-col p-4 bg-gray-100 md:pb-16">
            {/* Profile Header */}
            <div className="flex items-center gap-4 my-4 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden flex justify-center items-center bg-gray-300">
                    <img src={state.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">{state.profile.fullName}</h1>
                    <div className="flex gap-2 text-gray-600">
                        <p>@{state.profile.username}</p>
                        <span className="mx-1">•</span>
                        <p>{state.profile.subscribers} Subscribers</p>
                    </div>
                </div>
                <div onClick={() => setIsPopupVisible(!isPopupVisible)} className='absolute top-0 right-1 text-lg cursor-pointer'>
                    <RxDotsVertical />
                </div>
                {isPopupVisible && (
                    <div ref={popupRef} style={{
                        position: 'absolute',
                        top: '120%',
                        right: '0',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                    }}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Edit Profile</Button>
                            </DialogTrigger>
                            <DialogContent ref={dialogContentRef} className="sm:max-w-[425px]">
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>Edit profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your profile here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="name" className="text-right">
                                                fullName
                                            </Label>
                                            <Input
                                                id="name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="username" className="text-right">
                                                Username
                                            </Label>
                                            <Input
                                                id="username"
                                                value={username}
                                                onChange={(e) => debounced(e.target.value)}
                                                className="col-span-3"
                                            />
                                            {isCheckingUsername && <Loader2 className="animate-spin text-blue-500" />}
                                            {!isCheckingUsername && usernameMessage && (
                                                <p
                                                    className={`text-sm ${usernameMessage === 'Username is available'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}
                                                >
                                                    {usernameMessage}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="avatar" className="text-right">
                                                Avatar
                                            </Label>
                                            <Input
                                                id="avatar"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setAvatar(e.target.files[0])}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                            disabled={isSubmitting || usernameMessage === 'Username not available'}>
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Please wait
                                                </>
                                            ) : (
                                                'Update'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <button onClick={() => signOut()} style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                        }}>
                            Sign Out
                        </button>
                    </div>
                )}


            </div>

            {/* Uploaded Videos Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Your Uploaded Videos</h2>
                        <p className="text-gray-600">{state.profile.uploadedVideos?.length}</p>
                    </div>
                    <button onClick={() => router.push('/uploaded-videos')} className="text-blue-600 hover:underline">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {state.profile.uploadedVideos?.slice(0, 2).map((video, index) => (
                        <div key={index} className="w-48 h-28 rounded-lg overflow-hidden bg-gray-300">
                            <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Liked Videos Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Liked Videos</h2>
                        <p className="text-gray-600">{state.profile.liked?.length}</p>
                    </div>
                    <button onClick={() => router.push('/liked-videos')} className="text-blue-600 hover:underline">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {state.profile.liked?.slice(0, 2).map((video, index) => (
                        <div key={index} className="w-48 h-28 rounded-lg overflow-hidden bg-gray-300">
                            <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Watched Videos Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Watch History</h2>
                        <p className="text-gray-600">{state.profile.watchHistory?.length}</p>
                    </div>
                    <button onClick={() => router.push('/watch-history')} className="text-blue-600 hover:underline">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {state.profile.watchHistory?.slice(0, 2).map((video, index) => (
                        <div key={index} className="w-48 h-28 rounded-lg overflow-hidden bg-gray-300">
                            <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>


            {/* Watch Later Videos Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Watch Later</h2>
                        <p className="text-gray-600">{state.profile.watchLater?.length}</p>
                    </div>
                    <button onClick={() => router.push('/watch-later')} className="text-blue-600 hover:underline">View All</button>
                </div>
                <div className="flex gap-4 overflow-x-auto">
                    {state.profile.watchLater?.slice(0, 2).map((video, index) => (
                        <div key={index} className="w-48 h-28 rounded-lg overflow-hidden bg-gray-300">
                            <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        </div >

    )
}

export default Page