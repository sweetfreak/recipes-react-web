import {useAuth} from "../../contexts/authContext/index"
import {useState, useEffect} from 'react'
import { doc, getDoc, getDocs, addDoc, collection, query, where, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase.tsx";
import type {UserProfile} from '../../types/User.tsx'
import type {Recipe} from '../../types/Recipe.tsx'
import type {Chat, Message} from '../../types/Chat.tsx'


interface ChatProps {
    // id: string;
    // participants: string[];
    // updatedAt: Date
    // lastMessageID: string;

    chat: Chat | null
    currentUserProfile: UserProfile

}


export default function Chat({ chat, currentUserProfile } : ChatProps) {

const {currentUser} = useAuth()

const [newMessage, setNewMessage] = useState("")
const [messages, setMessages] = useState<Message[]>([])


const friendName = chat!.participantProfiles?.find(p => p.uid !== currentUser?.uid)?.displayName;

useEffect(() => {
  if (!chat) return;

  const messagesRef = collection(db, "chats", chat.id, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const chatMessages: Message[] = snapshot.docs.map((thisDoc) => ({
      id: thisDoc.id,
      ...(thisDoc.data() as Omit<Message, "id">),
    }));
    setMessages(chatMessages);
  });

  return () => unsubscribe();
}, [chat!.id]);


async function handleSubmit(event: React.FormEvent<HTMLFormElement> ) {
    event.preventDefault()
    if (!newMessage.trim() || !currentUser) return


    try {
        const messagesRef = collection(db, 'chats', chat!.id, 'messages')
        await addDoc(messagesRef, {
            text: newMessage,
            senderId: currentUser.uid,
            createdAt: serverTimestamp()
        })
        setNewMessage('')
    } catch (error) {
        console.error("Error sending message: ", error)
    }
}

// return (
//     <div className="flex border-5 ">
//         {/* load the last 30 messages */}
//             {participants}
//         <form className=" " onSubmit={handleSubmit} >
//             <input 
//             className="" 
//             placeholder="Write here" 
//             type="text" 
//             onChange={(e) => setNewMessage(e.currentTarget.value)}
//             />
//             <button className="" type="submit">Send</button>
//         </form>
//     </div>

// )

  return (
    <div className="flex flex-col border p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded ${
              msg.senderId === currentUser?.uid
                ? "bg-blue-200 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
           <span className="font-bold"> 
              {msg.senderId == currentUserProfile.uid ? currentUserProfile.displayName : friendName }:  
            </span> 
           {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex mt-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.currentTarget.value)}
          placeholder="Write here..."
          className="flex-1 border rounded-l px-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-3 rounded-r">
          Send
        </button>
      </form>
    </div>
  );

}