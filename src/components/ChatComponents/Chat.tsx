import type {Chat} from "../../types/Chat"
import {useAuth} from "../../contexts/authContext/index"


export default function Chat(props: Chat) {

const {currentUser} = useAuth()

function getCurrentUserInfo() {
    if (!currentUser) return

    
}

return (
    <div className="flex border-5">
        {/* load the last 30 messages */}
        {/*  */}
        ChatGoes here
    </div>

)
}