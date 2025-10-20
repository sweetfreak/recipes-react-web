import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase.tsx"

import { useFavorites } from "../../hooks/useFavorites"
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest } from "../../services/friendRequests.ts"

import RecipeCardMini from "../RecipeComponents/MiniRecipeCard"
import type { Recipe } from "../../types/Recipe"
import type { UserProfile } from "../../types/User"


interface UserProfileProps {
  id: string
  currentUserProfile: UserProfile | null
  openRecipe: (recipe: Recipe) => void
  openEditProfile: () => void
}

export default function UserProfilePage({ id, currentUserProfile, openRecipe, openEditProfile }: UserProfileProps) {

  const { currentUser } = useAuth()  
  const isCurrentUser = currentUser?.uid === id
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites(currentUserProfile?.savedRecipes)

  const hasSentFriendRequest = currentUserProfile?.friendRequestsSent?.includes(id)
  const hasReceivedFriendRequest = currentUserProfile?.friendRequestsReceived?.includes(id)
  const isFriend = currentUserProfile?.friends?.includes(id)



  useEffect(() => {
    async function fetchProfile() {
      try {
        if (id === currentUser?.uid && currentUserProfile) {
          setProfile(currentUserProfile)
        } 

        const docRef = doc(db, "users", id)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          console.log("No user found for ID:", id)
          setProfile(null)
          // setIsCurrentUser(false)
          return
        }

        setProfile({
          uid: docSnap.id,
          email: docSnap.data().email,
          displayName: docSnap.data().displayName,
          photoURL: docSnap.data().photoURL,
          bio: docSnap.data().bio,
          favoriteCuisine: docSnap.data().favoriteCuisine,
          savedRecipes: docSnap.data().savedRecipes,
          myRecipes: docSnap.data().myRecipes,
          friends: docSnap.data().friends,
          friendRequestsReceived: docSnap.data().friendRequestsReceived,
          friendRequestsSent: docSnap.data().friendRequestsSent,
          chatGroupIds: docSnap.data().chatGroupIds
        })

      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }
    fetchProfile()
      
    }, [id, currentUser, currentUserProfile, isCurrentUser])

useEffect(() => {
    async function fetchRecipes() {
      if (!profile?.myRecipes?.length) {
        setRecipes([])
        return
      }

      try {
        const recipePromises = profile.savedRecipes.map(async (recipeId: string) => {
          const recipeRef = doc(db, "recipes", recipeId)
          const recipeSnap = await getDoc(recipeRef)
          if (!recipeSnap.exists()) return null
          return { id: recipeSnap.id, ...recipeSnap.data() } as Recipe
        })

        const fetched = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]
        setRecipes(fetched)
      } catch (error) {
        console.error("Error loading recipes:", error)
      }
    }

    fetchRecipes()
  }, [profile?.savedRecipes])

  if (!profile) return <p className="text-center mt-8">Loading profile...</p>
  if (favoritesLoading) return <p className="text-center mt-8">Loading favorites...</p>

  async function handleSendRequest() {
    if (!currentUser) return
    await sendFriendRequest(currentUser.uid, id)
    alert("Friend Request Sent!")
  }

    async function handleAcceptRequest() {
    if (!currentUser) return
    await acceptFriendRequest(currentUser.uid, id)
    alert("Friend Request Accepted!")
  }

    async function handleDeclineRequest() {
    if (!currentUser) return
    await declineFriendRequest(currentUser.uid, id)
    alert("Friend Request Declined!")
  }

  return (
    <div className='flex-col '>
      <section className="flex place-content-center" > 
        <div className="flex flex-col m-8 ">
        {/* IMAGE + BUTTON */}
        <img className='max-w-40 h-auto rounded-full' src= "../../src/assets/tempPic.jpg" />
        {isCurrentUser && <button onClick={openEditProfile} className="p-1 m-4 place-content-center rounded text-white bg-blue-500 hover:font-bold">Edit Profile</button>}
        {!isCurrentUser && (
            <>
              {isFriend ? (
                <button className="m-8 p-1 rounded text-white bg-green-600 cursor-default" disabled>
                  Friends ✓
                </button>
              ) : hasSentFriendRequest ? (
                <button className="m-8 p-1 rounded text-white bg-gray-500 cursor-default" disabled>
                  Request Sent
                </button>
              ) : hasReceivedFriendRequest ? (
                <div className="flex gap-4 m-8">
                  <button onClick={handleAcceptRequest} className="p-1 rounded text-white bg-blue-500 hover:font-bold">
                    Accept
                  </button>
                  <button onClick={handleDeclineRequest} className="p-1 rounded text-white bg-red-500 hover:font-bold">
                    Decline
                  </button>
                </div>
              ) : (
                <button onClick={handleSendRequest} className="m-8 p-1 rounded text-white bg-blue-500">
                  Add {profile?.displayName} as a friend
                </button>
              )}
            </>
          )}
        </div>

        {/* WELCOME */}
        <div className='place-content-center font-bold text-4xl'>
          {isCurrentUser ? (
          <h2>Welcome, {profile?.displayName ?? "..."}!</h2>
            ) : (
          <h2>Chef {profile?.displayName ?? "..."}</h2>
            )}
        </div>
      </section>

      <br />
      <div className="flex place-content-center items-center">
        {/* USER BIO */}
        <article className='m-4 text-xl'>
          <span className='font-bold'>Bio:</span> 
          <br />
          <span>{profile?.bio} </span>       
        </article>

        <br />
        {/* USER Favorites */}
        <article className='m-8 text-xl'>
          <span className='font-bold'>Favorite Cuisine:</span> 
          <br />
          <span>{profile?.favoriteCuisine} </span>       
        </article>
      </div>

      {/* SAVED RECIPES */}
      <main>
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isCurrentUser ? "My Favorite Recipes" : `${profile.displayName}'s Favorite Recipes`}
        </h1>
        <div>
          {recipes.length > 0 ? (
            recipes.map((dish) => (
              <RecipeCardMini
                key={dish.id}
                recipe={dish}
                isFavorite={favorites.includes(dish.id)}
                toggleFavorite={() => toggleFavorite(dish.id)}
                openRecipe={openRecipe}
              />
            ))
          ) : (
            <p>No recipes yet.</p>
          )}
        </div>
      </main>

    </div>
  )
}