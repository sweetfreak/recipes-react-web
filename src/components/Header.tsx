import { doSignOut } from '../firebase/auth.tsx'
import { useAuth } from '../contexts/authContext/index.tsx'
import { useActiveSection } from '../contexts/ActiveSectionContext.tsx'
import type { UserProfile } from '../types/User'

interface HeaderProps {
  openProfile: (id: string, profile?: UserProfile) => void
  currentUserProfile: UserProfile | undefined
}

export default function Header({ openProfile, currentUserProfile } : HeaderProps) {
  const { setActiveSection } = useActiveSection()
  const {currentUser } = useAuth()

  return (
      <header className='flex flex-row justify-center p-5 text-white'>
          <h1 className=" text-3xl p-5">Dinner Tonight?</h1>
          <br/>
          <nav className="flex justify-center ">
              <button className="pl-2 pr-2 m-5 border-2 ::onhover" onClick={() => setActiveSection("search")}>Search Recipes</button>
              <button className="pl-2 pr-2 m-5 border-2" onClick={() => setActiveSection("saved")}>Saved Recipes</button>
              <button className="pl-2 pr-2 m-5 border-2" onClick={() => setActiveSection("myRecipes")}>My Recipes</button>
              <button className="pl-2 pr-2 m-5 border-2" onClick={() => setActiveSection("new")}>New Recipe</button>
              <button className="pl-2 pr-2 m-5 border-2" onClick={() => setActiveSection("chats")}>Chats</button>
              <button className="pl-2 pr-2 m-5 border-2" 
                      onClick={() => openProfile(currentUser?.uid ?? "", currentUserProfile)}
                      >My Profile
              </button>
              <button className="pl-2 pr-2 m-5 border-2" onClick={doSignOut}>SignOut</button>
          </nav>
    </header>
  )
}