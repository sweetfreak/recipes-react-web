import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import RecipeCardMini from "./MiniRecipeCard";
import type { Recipe } from "../../types/Recipe";
import { useFavorites } from "../../hooks/useFavorites";

export default function RecipeSearch( {openRecipe} : {openRecipe: (recipe: Recipe) => void}) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const { favorites, toggleFavorite } = useFavorites(); // ✅ Add this
  
  useEffect(() => {
    async function fetchAllRecipes() {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const allFetchedRecipes = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Recipe),
        id: doc.id,
      }));
      setAllRecipes(allFetchedRecipes);
    }
    fetchAllRecipes();
  }, []); // ✅ dependency should be [], not [allRecipes]

  return (
    <main>
      <h1 className="flex text-2xl place-content-center p-10">
        Search All Recipes
      </h1>
      {allRecipes.length > 0 ? (
        allRecipes.map((dish) => (
          <RecipeCardMini
            key={dish.id}
            recipe={dish}
            isFavorite={favorites.includes(dish.id)}
            toggleFavorite={() => toggleFavorite(dish.id)}
            openRecipe={openRecipe}
          />
        ))
      ) : (
        <div>No recipes</div>
      )}
    </main>
  );
}