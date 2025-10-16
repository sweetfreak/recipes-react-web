import { useState } from "react"

import LogIn from "./LogIn"
import CreateAccount from "./CreateAccount"


export default function SignInOptions() {
    const [showLogInNotCreate, setShowLogInNotCreate] = useState(true)

function toggleScreens() {
        setShowLogInNotCreate(prev => !prev)
    }


return (
  <>
    {showLogInNotCreate ? (
      <>
        <LogIn />
        <button onClick={toggleScreens}>or Create an Account</button>
      </>
    ) : (
      <>
        <CreateAccount />
        <button onClick={toggleScreens}>or Log In</button>
      </>
    )}
  </>
);

}