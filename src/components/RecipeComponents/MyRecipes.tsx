import {useState, useEffect, useRef} from "react"
import { useFavorites } from "../../hooks/useFavorites"

import RecipeCardMini from "./MiniRecipeCard"

import type {Recipe} from "../../types/Recipe"
import type { UserProfile } from "../../types/User";

import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";


interface MyRecipeProps {
  openRecipe: (recipe: Recipe) => void
  currentUserProfile: UserProfile | null
  newRecipe?: Recipe
  myRecipes: Recipe[]
  setMyRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}


export default function MyRecipes({openRecipe, currentUserProfile, myRecipes, setMyRecipes} : MyRecipeProps) {
    //const {currentUser} = useAuth()

   
    const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes);

    //maybe pull this out and put it in 
    const hasFetched = useRef(false);

    useEffect(() => {
      if (hasFetched.current) return;
      if (!currentUserProfile?.myRecipes?.length) {
        hasFetched.current = true; // Mark as fetched even if empty
        return;
      }

      async function fetchMyRecipes() {
      
        try {
          const recipePromises: Promise<Recipe | null>[] = (currentUserProfile?.myRecipes ?? []).map(async (id: string) => {
            const recipeRef = doc(db, 'recipes', id)
            const recipeSnap = await getDoc(recipeRef)
            if (!recipeSnap.exists()) return null;
            return { id: recipeSnap.id, ...recipeSnap.data()} as Recipe
          })

          const fetchedRecipes = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]

          setMyRecipes(prev => {
            const existingIds = new Set(prev.map(r => r.id))
            const newRecipes = fetchedRecipes.filter(r => !existingIds.has(r.id))
            return [...prev, ...newRecipes]
          })
          
          hasFetched.current = true
          console.log("fetched")
        } catch (error) {
          console.error("error loading my recipes:", error)
        }
      
      }
      fetchMyRecipes()
      
    }, [currentUserProfile?.uid])

    if (loading) return <div>Loading...</div>

    return (
    <main>
      <h1 className='flex text-2xl place-content-center p-10'>My Recipes</h1>
      {myRecipes.length > 0 ? (
        myRecipes.map((dish: Recipe) => { //, index: number) => {
          return (
            <RecipeCardMini
                key={dish.id}
                recipe={dish}
                isFavorite={favorites.includes(dish.id)}
                toggleFavorite={() => toggleFavorite(dish.id)}
                openRecipe={openRecipe}
            />
          );
        })
      ) : (
        <div></div>
      )}
    </main>
  );
}
