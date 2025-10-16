import { useState, useEffect, useMemo } from "react";
import { getAuth, type User } from "firebase/auth";


//Components
import SavedRecipes from "./RecipeComponents/SavedRecipes";
import NewRecipe from "./RecipeComponents/NewRecipe";
import SavedChats from "./ChatComponents/SavedChats";
import Header from "./Header";
import RecipeSearch from "./RecipeComponents/RecipeSearch";
import MyRecipes from "./RecipeComponents/MyRecipes";
import FullRecipe from "./RecipeComponents/FullRecipe";
import UserProfilePage from "./Users/UserProfilePage";
import EditProfile from "./Users/EditProfile";
import EditRecipe from "./RecipeComponents/EditRecipe";

//data/types
import { useActiveSection } from "../contexts/ActiveSectionContext";
import type {Recipe} from "../types/Recipe"
import type { UserProfile }from "../types/User";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";


export default function MainContent() {
  const auth = getAuth();
  const currentUser = auth.currentUser!;
   
  const {activeSection, setActiveSection} = useActiveSection()
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null)

   const[myRecipes, setMyRecipes] = useState<Recipe[]>([])


  
  const memoizedProfile = useMemo(() => currentUserProfile, [currentUserProfile?.uid]);

        const [recipes, setRecipes] = useState<Recipe[]>([]);

        const [latestRecipe, setLatestRecipe] = useState<Recipe | null>(null);

        const handleNewRecipe = (newRecipe: Recipe | null) => {
          if (!newRecipe) return;

          // 1. Prepend to the existing recipes state
          setRecipes(prev => [newRecipe, ...prev]);

          // 2. Update the currentUserProfile to include this new recipe ID
          setCurrentUserProfile(prev => prev ? {
            ...prev,
            myRecipes: [newRecipe.id, ...prev.myRecipes]
          } : prev);

          setLatestRecipe(newRecipe)
          
          console.log(myRecipes)
        };

  useEffect(() => {
    if (!currentUser) return;

    async function fetchCurrentUserProfile() {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          console.log("No profile found for current user");
          return;
        }

        // TypeScript now knows data exists
        const data = docSnap.data() as UserProfile;

        setCurrentUserProfile({
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          bio: data.bio,
          savedRecipes: data.savedRecipes,
          myRecipes: data.myRecipes,
          friends: data.friends,
          friendRequestsSent: data.friendRequestsSent,
          friendRequestsReceived: data.friendRequestsReceived
        });

      } catch (error) {
          console.error("Error fetching current user profile:", error);
      }
    }
    fetchCurrentUserProfile();
  }, [currentUser]);

  
  if (!currentUser) return null;

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe)
    setActiveSection("fullRecipe")
  }

  function openProfile(id: string, profile?: UserProfile) {
    setSelectedProfile(id);
    if (profile) {
      setCurrentUserProfile(profile); // pass the preloaded data
    }
    setActiveSection("profile");
  }

  function openEditProfile(){
    setActiveSection("editProfile")
  }

  function openEditRecipe() {
    setActiveSection("editRecipe")
  }

  return (
    <>
      <Header openProfile={openProfile} currentUserProfile={currentUserProfile ?? undefined}/>

      <main className="bg-lime-100">
        {activeSection === "saved" && <SavedRecipes openRecipe={openRecipe} currentUserProfile={memoizedProfile} />}
        {activeSection === "new" && <NewRecipe currentUserProfile={currentUserProfile} //onRecipeAdded={handleNewRecipe} 
        setMyRecipes={setMyRecipes}
        />}
        {activeSection === "search" && <RecipeSearch openRecipe={openRecipe}
     
        />}
        {activeSection ==="myRecipes" && <MyRecipes openRecipe={openRecipe} currentUserProfile={memoizedProfile} {...(latestRecipe ? { newRecipe: latestRecipe } : {})} myRecipes={myRecipes} setMyRecipes={setMyRecipes} />}
        {activeSection === "chats" && <SavedChats />} 
        {activeSection === "fullRecipe" && selectedRecipe && (<FullRecipe recipe={selectedRecipe} openProfile={openProfile} openEditRecipe={openEditRecipe} /> )}
        {activeSection === "editRecipe" && selectedRecipe && (<EditRecipe currentUserProfile={currentUserProfile} selectedRecipe={selectedRecipe} openRecipe={openRecipe}/> )}
        {activeSection === "profile" && selectedProfile && <UserProfilePage openEditProfile={openEditProfile} id={String(selectedProfile)} openRecipe={openRecipe} currentUserProfile={currentUserProfile}  /> }
        {activeSection === "editProfile"  &&<EditProfile currentUserProfile={currentUserProfile} openProfile={openProfile}  /> }
        {activeSection === "home" && <p className='flex justify-center'>What's on tonight's menu?</p>} 
        

        
      </main>
    </>
  );
}
