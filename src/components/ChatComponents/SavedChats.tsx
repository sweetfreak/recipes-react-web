import {useState} from 'react'
import Chat from './Chat'
import type { serverTimestamp } from 'firebase/firestore'

export default function SavedChats() {

const [showChat, setShowChat] = useState(false)

const friendList: Object[] = []


function getFriends() {
    console.log(friendList)
}




    return (
        <>
            <main className="flex flex-row"> 
            <div className='p-5'>
            {  friendList.length > 0 ? 
                <div>
                    Friends go here
                    {/* {friendList.map((friend) => {
                        friend.Name ==
                    })} */}
                </div>

                :
                <div>
                    Time to add some friends!
                </div>

                

            }
            </div>
                <div className='p-5'>
                    <Chat
                        id="1234"
                        participants={["5678", "1357"]}
                        lastMessageID="2468"
                        updatedAt={new Date()}
                        messages={[
                            {
                            id: "1",
                            senderId: "5678",
                            text: "Hello!",
                            createdAt: new Date(),
                            },
                        ]}
                    />
                </div>
            </main>
        </>
    )
}