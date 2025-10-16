import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import RecipeCardMini from "./MiniRecipeCard";
import type { Recipe } from "../../types/Recipe";
import type { UserProfile } from "../../types/User";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../contexts/authContext";

interface SavedRecipeProps {
  openRecipe: (recipe: Recipe) => void
  currentUserProfile: UserProfile | null
}

export default function MyRecipes({openRecipe, currentUserProfile} : SavedRecipeProps) {
  //const { currentUser } = useAuth();
  const { favorites, toggleFavorite, loading } = useFavorites(currentUserProfile?.savedRecipes);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!currentUserProfile?.myRecipes?.length) {
      setSavedRecipes([]);
      return;
    }
    if (savedRecipes.length > 0) return;

    async function fetchMyRecipes() {
       try {
        const recipePromises: Promise<Recipe | null>[] = (currentUserProfile?.savedRecipes ?? []).map(async (id: string) => {
        const recipeRef = doc(db, 'recipes', id)
        const recipeSnap = await getDoc(recipeRef)
        if (!recipeSnap.exists()) return null;
        return { id: recipeSnap.id, ...recipeSnap.data()} as Recipe
      })
        const recipes = (await Promise.all(recipePromises)).filter(Boolean) as Recipe[]
        setSavedRecipes(recipes)
      } catch (error) {
        console.error("error loading my recipes:", error)
      }
    }
    fetchMyRecipes()
  }, [currentUserProfile])
  //   const fetchSavedRecipes = async () => {
  //     const querySnapshot = await getDocs(collection(db, "recipes"));
  //     const allRecipes = querySnapshot.docs.map((doc) => ({
  //       ...(doc.data() as Recipe),
  //       id: doc.id,
  //     }));
  //     const userFavorites = allRecipes.filter((recipe) =>
  //       favorites.includes(recipe.id)
  //     );
  //     setSavedRecipes(userFavorites);
  //   };

  //   fetchSavedRecipes();
  // }, [currentUser, favorites]);

  if (loading) return <div></div>;

  return (
    <main>
      <h1 className="flex text-2xl place-content-center p-10">
        Saved Recipes
      </h1>
      {savedRecipes.length > 0 ? (
        savedRecipes.map((dish) => (
          <RecipeCardMini
            key={dish.id}
            recipe={dish}
            isFavorite={favorites.includes(dish.id)}
            toggleFavorite={() => toggleFavorite(dish.id)}
            openRecipe={openRecipe}
          />
        ))
      ) : (
        <div>No saved recipes yet</div>
      )}
    </main>
  );
}