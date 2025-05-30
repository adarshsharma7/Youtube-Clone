"use client"
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import LoginRequired from "@/components/loginRequired"
import { useSession } from 'next-auth/react';

function Page() {
    const [subscriptionsUser, setSubscriptionsUser] = useState([]);
    const [subscriptionsVideos, setSubscriptionsVideos] = useState([]);
    const [videosFetchingMessage, setVideosFetchingMessage] = useState("");

    const { data: session } = useSession()
    const _user = session?.user
    let router = useRouter()


    // Function to shuffle the array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                let response = await axios.get("/api/videos/subscriptionsallvideos");
                if (response.data && response.data.data) {
                    setSubscriptionsUser(response.data.data);
                    console.log(response.data.data);


                    let videos = [];
                    response.data.data.map((user) => user.subscriptions.map((user) => user.uploadedVideos.map((user) => videos.push(user))))

                    setSubscriptionsVideos(shuffleArray(videos));
                } else {
                    setVideosFetchingMessage("No data found");
                }
            } catch (error) {
                console.error("Error fetching subscriptions videos:", error);
                setVideosFetchingMessage("Failed to load videos");
            }
        }

        fetchSubscriptions();

    }, []);

     if (!_user) return <LoginRequired featureName="subscriptions" />;

    return (
        <div className='h-screen w-full flex flex-col p-4 bg-gray-100'>

            {/* Top Section: Subscribed Users */}
            <div className='flex gap-6 w-full h-[120px] overflow-x-auto border-b-2 border-gray-300 pb-4'>
                {subscriptionsUser.length > 0 ? (
                    subscriptionsUser.map((user) =>
                        user.subscriptions.length === 0 ? (
                            <h1 key={user.id}>No Subscription</h1>
                        ) : (
                            user.subscriptions.map((subscription, index) => (
                                <div
                                    onClick={() => router.push(`/subscriptionprofile/${subscription.username}`)}
                                    key={index}
                                    className='cursor-pointer flex flex-col items-center'
                                >
                                    <div className='w-12 h-12 rounded-full border-2 border-red-600 overflow-hidden flex justify-center items-center'>
                                        {subscription.avatar ? (
                                            <img src={subscription.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Skeleton className="w-full h-full bg-slate-400" />
                                        )}
                                    </div>
                                    <div className='text-center text-sm mt-1'>
                                        {subscription.username ? (
                                            <p className='text-gray-700 text-ellipsis overflow-hidden whitespace-nowrap'>{subscription.username}</p>
                                        ) : (
                                            <Skeleton className="w-20 h-4 bg-slate-300" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )
                    )
                ) : (
                    <div className='cursor-pointer flex flex-col items-center'>
                        <div className='w-12 h-12 rounded-full border-2 overflow-hidden flex justify-center items-center'>
                            <Skeleton className="w-full h-full bg-slate-400" />
                        </div>
                        <Skeleton className="w-20 h-4 mt-1 bg-slate-300" />
                    </div>
                )}

            </div>

            {/* Bottom Section: Videos from Subscriptions */}
            <div className='gap-4 mt-4 h-full overflow-y-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-8'>
                <h1 className='md:flex md:justify-center md:items-center text-xl font-semibold text-gray-800 mb-4'>
                    All Videos from your Subscriptions
                </h1>

                {videosFetchingMessage ? (
                    <div className="w-full h-full text-red-700 flex justify-center items-center">
                        <h1>{videosFetchingMessage}</h1>
                    </div>
                ) : subscriptionsVideos.length > 0 ? subscriptionsVideos.map((video, index) => (
                    <div
                        key={index}
                        onClick={() => router.push(`/videoplay/${video._id}`)}
                        className='cursor-pointer h-[260px] bg-white shadow-lg border border-gray-300 rounded-lg flex flex-col gap-2 p-2 hover:shadow-xl transition-shadow duration-200'
                    >
                        <div className='thumbnailBox rounded-2xl w-full overflow-hidden h-[75%]'>
                            {video.thumbnail ? (
                                <img src={video.thumbnail} alt="thumbnail" className='w-full h-full object-cover' />
                            ) : (
                                <Skeleton className="w-full h-full" />
                            )}
                        </div>
                        <div className='userDetailsBox flex gap-2 items-center'>
                            <div className='w-8 h-8 rounded-full overflow-hidden'>
                                {video.owner[0].avatar ? (
                                    <img src={video.owner[0].avatar} alt="dp" className='w-full h-full object-cover' />
                                ) : (
                                    <Skeleton className="w-full h-full" />
                                )}
                            </div>
                            {video.title ? (
                                <div className='text-gray-900 font-semibold'>{video.title}</div>
                            ) : (
                                <Skeleton className="w-32 h-4" />
                            )}
                        </div>
                        <div className='text-gray-500 text-sm'>
                            {video.owner[0].username ? (
                                <p>{video.owner[0].username}</p>
                            ) : (
                                <Skeleton className="w-24 h-4" />
                            )}
                        </div>
                        <div className='flex gap-4 text-gray-500 text-xs'>
                            {video.views ? (
                                <div>{video.views} views</div>
                            ) : (
                                <Skeleton className="w-12 h-4" />
                            )}
                            {video.createdAt ? (
                                <div>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</div>
                            ) : (
                                <Skeleton className="w-24 h-4" />
                            )}
                        </div>
                    </div>
                )) : (
                    Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className='cursor-pointer h-[260px] bg-white shadow-lg border border-gray-300 rounded-lg flex flex-col gap-2 p-2'>
                            <Skeleton className="bg-slate-400 rounded-2xl w-full h-[75%]" />
                            <Skeleton className="bg-slate-300 w-32 h-4 mt-2" />
                            <Skeleton className="bg-slate-300 w-24 h-4 mt-1" />
                            <Skeleton className="bg-slate-300 w-24 h-4 mt-1" />

                        </div>
                    ))
                )}
            </div>
        </div>
    )

}

export default Page;
