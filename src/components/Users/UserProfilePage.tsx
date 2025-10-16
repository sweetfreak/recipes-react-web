import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/authContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../firebase/firebase"
import { useFavorites } from "../../hooks/useFavorites"

import RecipeCardMini from "../RecipeComponents/MiniRecipeCard"
import type { Recipe } from "../../types/Recipe"
import type { UserProfile } from "../../types/User"

import { useActiveSection } from "../../contexts/ActiveSectionContext"

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
          friendRequestsSent: docSnap.data().friendRequestsSent
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

  return (
    <div className='flex flex-col items-center'>
      <section className="flex" >
        {/* IMAGE */}
        <img className='m-8 max-w-40 h-auto rounded-full' src= "../../src/assets/tempPic.jpg" />
        {/* WELCOME */}
        <div className='place-content-center font-bold text-4xl'>
          {isCurrentUser ? (
          <h2>Welcome, {profile?.displayName ?? "..."}!</h2>
            ) : (
          <h2>Chef {profile?.displayName ?? "..."}</h2>
            )}
        </div>
      </section>
      {!isCurrentUser && <button className="m-8 p-1 rounded text-white bg-blue-500">Add {profile?.displayName} as a friend</button>}
      {isCurrentUser && <button onClick={openEditProfile} className="m-8 p-1 rounded text-white bg-blue-500">Edit Profile</button>}

      <br />
      {/* USER BIO */}
      <article className='m-8 text-xl'>
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


      {/* SAVED RECIPES */}
            <main>
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isCurrentUser ? "My Favorite Recipes" : `${profile.displayName}'s Favorite Recipes`}
        </h1>
        <div className="flex flex-wrap justify-center gap-6">
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