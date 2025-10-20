
import type {Recipe} from "../../types/Recipe"


interface RecipeCardMiniProps {
  recipe: Recipe;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  openRecipe: (recipe: Recipe) => void
}


export default function RecipeCardMini({ recipe, isFavorite, toggleFavorite, openRecipe }: RecipeCardMiniProps) {

    return (
        <main onClick={() => openRecipe(recipe)} className="flex w-120 h-auto bg-lime-100 rounded-lg p-4 border-8 border-lime-700">
            <div className="flex p-5">
                <img className="w-full h-48 object-cover rounded-t-lg" src="../../src/assets/macncheese.png" />  
            </div>
            
            <div>
                <h1  className="text-4xl">{recipe.dishName}</h1>
                <p>Chef: {recipe.chef}</p>
                <p>Source: {recipe.source} </p>

                <div className="p-5">
                    <p>{recipe.description}</p>
                    <p>Serves {recipe.servings}</p>
                    <div className="p-5 text-xs">
                        {recipe.dietaryRestrictions && 
                            Object.entries(recipe.dietaryRestrictions)
                            .filter(([_, value]) => value) // only true restrictions
                            .map(([key]) => (
                                <p key={key}>{key.replace(/([A-Z])/g, " $1").trim()}</p>
                            ))
                         }
                    </div>

                </div>
            
            </div>
            <div onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                    }}
            >
                <button onClick={() => toggleFavorite(recipe.id)}>{isFavorite ? "[♥️]" : "[♡]" }</button>
            </div>
        </main>
    )
}