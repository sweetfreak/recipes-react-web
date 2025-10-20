import type { Chat } from "../../types/Chat"
import type { UserProfile } from "../../types/User"



interface ChatCardProps {
    friendID: string
    friendDisplay: string
    latestMessage: string
    handleStartChat: (id: string) => void
}

export default function ChatCard({friendID, friendDisplay, latestMessage, handleStartChat} : ChatCardProps) {

    return (
          <div>
            <button onClick={() => handleStartChat(friendID)} className="flex-col w-80 h-20 border-2 border-stone-600 bg-gray-400 rounded-3xl">
                <h3 className="font-bold">{friendDisplay}:</h3>
                <h4>{latestMessage}</h4>
            </button>
          </div>
          

    )
}