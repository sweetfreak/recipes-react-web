import {useEffect, useState} from 'react'
import ChatBox from './ChatBox.tsx'
import { getAuth } from 'firebase/auth'

import type { UserProfile } from '../../types/User'
import type { Chat } from '../../types/Chat'

import { doc, getDoc, getDocs, addDoc, collection, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase.tsx";
import ChatCard from './ChatCard.tsx'

interface ChatPageProps {
    currentUserProfile: UserProfile | null
}

export default function ChatPage({currentUserProfile} : ChatPageProps) {
const {currentUser} = getAuth()
const [showFriends, setShowFriends] = useState(false)
const [showChat, setShowChat] = useState(false)

const [activeChat, setActiveChat] = useState<Chat | null>(null)

const [friends, setFriends] = useState<(UserProfile[])>([])

    useEffect(() => {
        setShowFriends(true)
    }, [friends])

    useEffect(() => {
        if (!currentUser || !currentUserProfile) return

        async function getFriends() {
            const friendIDs = currentUserProfile?.friends || [];
            if (friendIDs.length === 0) {
                setFriends([])
                return;
            }
        
            try {
                const batches: UserProfile[][] = []
                for (let i = 0; i < friendIDs.length; i += 10) {
                    const batchIDs = friendIDs.slice(i, i + 10);
                    const batchDocs = await Promise.all(
                        batchIDs.map(async (id) => {
                            const docRef = doc(db, 'users', id)
                            const docSnap = await getDoc(docRef)
                            if (!docSnap.exists()) return null
                            return { uid: docSnap.id, ...docSnap.data() } as UserProfile
                        })
                    )
                    batches.push(batchDocs.filter(Boolean) as UserProfile[]);

                }

                const allFriends = batches.flat()
                setFriends(allFriends)

            } catch (error) {
                console.error("error fetching friends:", error)
            }
        
        }
        getFriends()
    }, [currentUserProfile])


    async function getOrCreateChat(currentUid: string, friendUid: string) {
        const chatsRef = collection(db, "chats")
        
        const q = query(chatsRef, where("participants", "array-contains", currentUid))
        const snapshot = await getDocs(q)

        const existingChat = snapshot.docs.find(myDoc => 
            myDoc.data().participants.includes(friendUid)
        )

        let chatDoc

        if (existingChat) {
            chatDoc = existingChat
        } else {

        const newChatRef = await addDoc(chatsRef, {
            participants: [currentUid, friendUid],
            lastMessage: "",
            updatedAt: serverTimestamp()
        })
        chatDoc = await getDoc(newChatRef)
        }
        
        const participantProfiles = await Promise.all(
            chatDoc.data()!.participants.map(async (uid: string) => {
                const userRef = doc(db,'users', uid)
                const userSnap = await getDoc(userRef)
                return userSnap.exists() 
                    ? {uid, displayName: userSnap.data().displayName }
                    : {uid, displayName: "UnknownUser" }
            })
        )

        return {
            id: chatDoc.id,
            participants: chatDoc.data()!.participants,
            participantProfiles,
            lastMessageID: chatDoc.data()!.lastMessageID || "",
            updatedAt: chatDoc.data()!.updatedAt?.toDate?.() || new Date(),
            messages: []
        } as Chat;
    }


    async function handleStartChat(friendId: string) {
        if (!currentUserProfile) return

        const newChat = await getOrCreateChat(currentUserProfile.uid, friendId)
        setActiveChat(newChat)
        setShowChat(true)

    }

    return (
        <>
            <main className="flex justify-space-between p-20"> 
                <div>Friends:
                {  friends?.length > 0 && showFriends ? 
                    <div className='p-5'>
                        
                        {friends.map((friend, index) => {
                        return <div key={index}>{friend.displayName} 
                            <button onClick={() => handleStartChat(friend.uid)}
                                className="m-8 p-1 rounded text-white bg-blue-500">
                                    Start Chat
                            </button>
</div>
                        })}
                    </div>

                    :
                    <div>
                        Time to add some friends!
                    </div>

                    

                }
                </div>
                {showChat ? <div>
                    <ChatBox 
                    chat = {activeChat}
                    currentUserProfile={currentUserProfile!}
                    

                    />
                    
                    <button onClick={() => setShowChat(false)} className="m-8 p-1 rounded text-white bg-blue-500">
                        Close Chat
                    </button>
                    
                    </div>
                : 
                
                    <div className='flex flex-col rounded-3xl gap-2 bg-lime-800 p-4'>
                        <h2 className="text-2xl text-white font-bold">Chat List</h2>
                        <ChatCard
                            friendID= "1122"
                            friendDisplay="MrChef"
                            latestMessage="What's for dinner tonight?"
                            handleStartChat={handleStartChat}
                        />
                        <ChatCard
                            friendID= "1122"
                            friendDisplay="MrChef"
                            latestMessage="What's for dinner tonight?"
                            handleStartChat={handleStartChat}
                        />
                        <ChatCard
                            friendID= "1122"
                            friendDisplay="MrChef"
                            latestMessage="What's for dinner tonight?"
                            handleStartChat={handleStartChat}
                        />
                      
                        
                    </div>
                }
            </main>
        </>
    )
}