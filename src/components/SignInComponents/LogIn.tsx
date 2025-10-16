//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react'
import { doSignInWithEmailAndPassword } from '../../firebase/auth.tsx'
import { useAuth } from '../../contexts/authContext/index'

export default function LogIn() {
    // const {userLoggedIn} = useAuth()

    // const [email, setEmail] = useState('')
    // const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    //formEvent might not be the right type?
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErrorMessage("")

        const formData = new FormData(event.currentTarget)
        const email = String(formData.get("email"))
        const password = String(formData.get("password"))

        if (!isSigningIn) {
            setIsSigningIn(true)
            try {
                await doSignInWithEmailAndPassword(email, password)
            } catch (error: any) {
                switch (error.code) {
                    case "auth/invalid-email":
                    setErrorMessage("Please enter a valid email address.");
                    break;
                    case "auth/user-disabled":
                    setErrorMessage("This account has been disabled.");
                    break;
                    case "auth/user-not-found":
                    setErrorMessage("No account found with that email.");
                    break;
                    case "auth/wrong-password":
                    setErrorMessage("Incorrect password. Try again.");
                    break;
                    case "auth/missing-password":
                    setErrorMessage("Please enter your password.");
                    break;
                    default:
                    setErrorMessage("An unexpected error occurred. Please try again.");
                }
                console.error("Login failed:", error);
            } finally {
                setIsSigningIn(false);
            }
            
        }

    }


    return (
        <section className="flex-col p-5 border-2">
            <h1>Log In</h1>
            <form onSubmit={handleSubmit} className="" method="POST">
                <label className="p-8" htmlFor="email">Email:
                    <input className="border border-gray-300 bg-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" id="email" type="email" name="email" placeholder="chef@cook.com"/>
                </label>
                <br />
                <label className="" htmlFor="password">Password: 
                    <input className="border border-gray-300 bg-white rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" id="password" type="password" name="password" placeholder="****"/>
                </label>
                <br />

                <button
                disabled={isSigningIn}
                className={`p-2 rounded text-white ${isSigningIn ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                {isSigningIn ? "Signing In..." : "Sign In"}
                </button> 

                {errorMessage && (
                    <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
                )}
            </form>

        </section>
    )
}