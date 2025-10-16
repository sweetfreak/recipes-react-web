import type {Recipe} from "../../types/Recipe"
import {useEffect, useState} from 'react'
import { useAuth } from "../../contexts/authContext";
// import { useActiveSection } from "../contexts/ActiveSectionContext";

interface FullRecipeProps {
  recipe: Recipe;
  openProfile: (id: string) => void;
  openEditRecipe: (id: string) => void
}

export default function FullRecipe({recipe, openProfile, openEditRecipe} : FullRecipeProps) {

    const [isCreator, setIsCreator] = useState(false)
    const {currentUser} = useAuth()

    useEffect(() => {
        if (recipe.createdBy == currentUser?.uid) {
            setIsCreator(true)
        }
    }, [isCreator])




    return (
        <main className="flex p-10">
            <div className="flex p-5">
                <img className="w-full h-fit max-w-80 max-h-80" src='../src/assets/macncheese.png' />  
            </div>
            
            <div>
                <div className=" flex justify-between">
                    <h1 className="text-4xl">{recipe.dishName}</h1>
                    <button onClick={() => openEditRecipe(recipe.id)} className='p-2 rounded text-white bg-blue-500' >Edit Recipe</button>
                </div>
                <p>Chef: {recipe.chef}</p>
                <p>Uploaded by: <button onClick={() => openProfile(recipe.createdBy)} className="hover:font-bold hover:text-blue-800 hover:underline ">{recipe.createdByDisplayName} </button> </p>

                <div className="p-5 bold">
                    <p><span className="font-bold">Servings:</span> {recipe.servings}</p>
                    <p><span className="font-bold">Prep Time:</span> {recipe.prepTime} minutes</p>
                    <p><span className="font-bold">Cook Time:</span> {recipe.cookTime} minutes</p>
                    <p><span className="font-bold">Total Time:</span> {recipe.totalTime} minutes</p>
                </div>

                <div className="p-5">
                    {recipe.description}
                </div>

                <h2 className="text-2xl font-bold">Ingredients</h2>
                <ul>
                    {recipe.ingredients?.map((ingredient: string, index: number) => (
                        <li key={index}>- {ingredient}</li>
                    ))}
                </ul>
            
            <h2 className="text-2xl font-bold">Steps</h2>
                <ol>
                    {recipe.instructions?.map((step: string, index: number) => (
                        <li key={index}>{index + 1}. {step}</li>
                    ))}
                </ol>
            
            </div>
        </main>
    )
}