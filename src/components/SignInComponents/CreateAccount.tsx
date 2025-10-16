//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react'
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth'


export default function CreateAccount() {

    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = String(formData.get("email"))
        const password = String(formData.get("password"))
        const displayName = String(formData.get("displayName"))
        if (!isRegistering) {
            setIsRegistering(true)
            
            try {
                await doCreateUserWithEmailAndPassword(email, password, displayName)
            } catch (error: any) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        setErrorMessage("An account already exists with that email.");
                        break;
                    case "auth/weak-password":
                        setErrorMessage("Password should be at least 6 characters.");
                        break;
                    case "auth/invalid-email":
                        setErrorMessage("Invalid email format.");
                        break;
                    default:
                        setErrorMessage("Failed to create account. Please try again.");
                }
                console.error("create account failed:", error)
            } finally {
                setIsRegistering(false)
            }
        }

    }


    return (
        <section className="flex-col p-5 border-2">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="" method="POST">
                <label className="p-8" htmlFor="text">Name:
                    <input className="border border-gray-300 bg-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" id="displayName" type="text" name="displayName" placeholder="BigChef1122"/>
                </label>
                <br />

                <label className="p-8" htmlFor="email">Email:
                    <input className="border border-gray-300 bg-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" id="email" type="email" name="email" placeholder="BigChef@dinnerTonight.com"/>
                </label>
                <br />
                <label className="" htmlFor="password">Password: 
                    <input className="border border-gray-300 bg-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" id="password" type="password" name="password" placeholder="****"/>
                </label>
                <br />

                <button
                    disabled={isRegistering}
                    className={`p-2 rounded text-white ${isRegistering ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                    >
                    {isRegistering ? "Creating Account..." : "Create Account"}
                </button> 

                {errorMessage && (
                    <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
                )}
            </form>

        </section>
    )
}