import {useState} from 'react'
import { db} from "../../firebase/firebase.tsx"
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import {useAuth } from "../../contexts/authContext/index"
import type { UserProfile } from '../../types/User'
 import type {Recipe} from "../../types/Recipe"

interface NewRecipeProps {
    currentUserProfile: UserProfile | null
    //onRecipeAdded: (recipe: Recipe | null) => void
    setMyRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>
}

export default function NewRecipe({currentUserProfile, setMyRecipes}: NewRecipeProps) {

    const {currentUser} = useAuth()

    const[ingredients, setIngredients] = useState<string[]>([])
    const[instructions, setInstructions] = useState<string[]>([])

    const[submittedRecipe, setSubmittedRecipe] = useState(false)

    //const[showMissingInfo, setShowMissingInfo] = useState(false) 
    

    function addIngredient() {
        setIngredients([...ingredients, ''])
        console.log(ingredients)
    }

    function handleIngredientChange(index: number, value: string) {
        const newIngredients = [...ingredients]
        newIngredients[index] = value
        setIngredients(newIngredients)
    }

    function addInstruction() {
        setInstructions([...instructions, ''])
    }

    function handleInstructionChange(index: number, value: string) {
        const newInstructions = [...instructions]
        newInstructions[index] = value
        setInstructions(newInstructions)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()


        if (!currentUser) return;
        console.log(currentUser.displayName)

        const formData = new FormData(event.currentTarget)

        const newRecipe = {
            //try not to bypass typechecking!! 
        dishName: formData.get("dishName")?.toString() ?? "",
        source: formData.get("source")?.toString() ?? "",
        chef: formData.get("chef")?.toString() ?? "",
        cuisine: formData.get("cuisine")?.toString() ?? "",
        description: formData.get("description")?.toString() ?? "",
        prepTime: formData.get("preptime")?.toString() ?? "",
        cookTime: formData.get("cooktime")?.toString() ?? "",
        additionalTime: formData.get("additionaltime")?.toString() ?? "",
        totalTime: formData.get("totaltime") ?.toString() ?? "",
        servings: formData.get("servings")?.toString() ?? "",
        imageURL: "",
        ingredients,
        instructions,
        notes: formData.get("notes")?.toString() ?? "",
        dietaryRestrictions: {
            vegetarian: formData.get("vegetarian") === "on",
            vegan: formData.get("vegan") === "on",
            dairyFree: formData.get("dairy-free") === "on",
            containsNuts: formData.get("contains-nuts") === "on",
            glutenFree: formData.get("gluten-free") === "on",
            kosher: formData.get("kosher") === "on",
            halal: formData.get("halal") === "on",
        },
        createdBy: currentUserProfile?.uid ?? currentUser.uid,
        createdByDisplayName: currentUserProfile?.displayName ?? currentUser.displayName ?? "",
        createdAt: Date(),
        updatedAt: Date(),
        public: true,
        likes: 0,
        likedBy: []
        }
        // console.log("Submitting recipe:", newRecipe);
        
        try { 
            const recipeRef = await addDoc(collection(db, "recipes"), {
                ...newRecipe
            })
            await updateDoc(recipeRef, { id:recipeRef.id})
            const newRecipeWithId: Recipe = { ...newRecipe, id: recipeRef.id };

            const userRef = doc(db, "users", currentUser.uid)
            
            await updateDoc(userRef, {
                myRecipes: arrayUnion(recipeRef.id)
            })
            
            //onRecipeAdded(newRecipeWithId);
            setMyRecipes(prev => [...prev, newRecipeWithId]);
            
            setIngredients([])
            setInstructions([])
            setSubmittedRecipe(true)

        } catch (error) {
            console.error("error adding recipe: ", error)
        }        
    }

    function resetNewRecipe() {
        setSubmittedRecipe(prev => !prev)
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
        if (event.key === "Enter" && (event.currentTarget as HTMLElement).tagName !== 'TEXTAREA') {
            event.preventDefault()
        }
    }


   async function submitExtractionURL(event: React.FormEvent<HTMLFormElement>){  
        event.preventDefault()
        if (!currentUser) return;


        const formData = new FormData(event.currentTarget)
        const recipeSourceURL = formData.get("sourceURL")?.toString() ?? ""
        console.log(recipeSourceURL)
       
        if (!recipeSourceURL) {
            alert('Please enter a recipe URL');
            return;
          }
        // TODO: Implement recipe scraping functionality
        


    }

    return (
        <>
        { submittedRecipe ? 
        <div>
        <div>Recipe Submitted!</div>  
        <button onClick={resetNewRecipe}>Make a New Recipe</button>
        </div>
        :
        <section className='p-10' >
            <h1 className="text-2xl font-bold" >Add a new Recipe!</h1>
            <br/>   
            <form onSubmit={submitExtractionURL} className="font-bold" method="POST">
                <div>
                    <p className='font-bold'>Quick Extract</p>
                <label>Copy and paste a recipe URL here:
                    <input id="sourceURL" name='sourceURL' type="url" required />
                </label>
                 {/* <p className='text-red' >{showMissingInfo ? "Some information may be missing" : ""}</p> */}

                <br/>
                <button 
                    className='p-2 rounded text-white bg-blue-500 bg-blue-600' 
                    type='submit'>
                        Get Recipe Info
                </button>
                </div>
            </form>
            <br />

            <hr />

            <br />
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="font-bold" method="POST">
            <h2>Or manually enter a recipe:</h2>
                <div className="p-3">
                    <label> Dish Name:
                        <input id="dishName" type="text" name="dishName" required />
                    </label>
                    <br />
                </div>

                <div className="p-3">
                    <label> Source:
                    <input id="source" type="text" name="source"  />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Chef's Name:
                    <input id="chef" type="text" name="chef" />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Cuisine
                    <input id="cuisine" type="text" name="cuisine" />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Description:
                    <input id="description" type="text" name="description"  />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Prep Time:
                    <input id="preptime" type="number" name="preptime"  />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Cook Time:
                    <input id="cooktime" type="number" name="cooktime" />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Additional Time:
                    <input id="additionaltime" type="number" name="additionaltime" />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Total Time:
                    <input id="totaltime" type="number" name="totaltime"  />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Servings:
                    <input id="servings" type="text" name="servings" />servings
                </label>
                <br />
                </div>
                <div>
                    <h3>Ingredients</h3>
                    <ul>
                    {ingredients.map((ingredient, i) => (
                        <li key={i}>
                        <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => handleIngredientChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                e.preventDefault()
                                addIngredient()
                                }
                            }}
                            placeholder={`Ingredient ${i + 1}`}
                        />
                        </li>
                    ))}
                    </ul>
                    <button type="button" onClick={addIngredient}>
                    + Add another ingredient
                    </button>
                </div>

                <br />

                <div>
                    <h3>Instructions</h3>
                    
                    <ol>
                    {instructions.map((step, i) => (
                        <li key={i}>
                        <input
                            type="text"
                            value={step}
                            onChange={(e) => handleInstructionChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                e.preventDefault()
                                addInstruction()
                                }
                            }}
                            placeholder={`Step ${i + 1}`}
                        />
                        </li>
                    ))}
                    </ol>

                    <button type="button" onClick={addInstruction}>
                    + Add another step
                    </button>

                </div>
                <br />

                <div className="p-3">
                    <label> Additional Notes:
                    <input id="notes" type="text" name="notes"  />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Image:
                    <input id="dishName" type="text" name="dishName"  />
                </label>

                            </div>

                <br />
                <div className="flex-row">
                Dietary Notes:
                    <div className="flex-row pl-10">
                        <p>Vegetarian <input id="vegetarian" type="checkbox" name="vegetarian" /> </p>
                        <p>Vegan <input id="vegan" type="checkbox" name="vegan" /> </p>
                        <p>Dairy-free <input id="diary-free" type="checkbox" name="diary-free" /> </p>
                        <p>Contains Nuts <input id="contains-nuts" type="checkbox" name="contains-nuts" /> </p>
                        <p>Gluten-free <input id="gluten-free" type="checkbox" name="gluten-free" /> </p>
                        <p>Kosher <input id="kosher" type="checkbox" name="kosher" /> </p>
                        <p>Halal <input id="halal" type="checkbox" name="halal" /> </p>
                    </div>
                </div>
                <br /> 

                <button className='p-2 rounded text-white bg-blue-500' type="submit">Submit</button>
                {/* <p className='text-red' >{showMissingInfo ? "Some information may be missing" : ""}</p> */}
            </form>
        </section>}
        </>
    )
}