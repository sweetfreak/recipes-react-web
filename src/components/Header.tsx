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
      <header className='sticky flex-auto justify-items-center w-full bg-lime-800 text-white top-0 left-0 right-0'>
          <h1 className=" text-3xl p-5">Dinner Tonight?</h1>
          <br/>
          <nav className="flex-auto place-items-center">
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" onClick={() => setActiveSection("search")}>Search Recipes</button>
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" onClick={() => setActiveSection("saved")}>Saved Recipes</button>
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" onClick={() => setActiveSection("myRecipes")}>My Recipes</button>
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" onClick={() => setActiveSection("new")}>New Recipe</button>
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" onClick={() => setActiveSection("chats")}>Chats</button>
              <button className="p-1 pl-2 pr-2 m-5 border-2 hover:font-bold" 
                      onClick={() => openProfile(currentUser?.uid ?? "", currentUserProfile)}
                      >My Profile
              </button>
              <button className=" p-1 pl-2 pr-2 m-5 border-2 hover:font-bold hover:text-red-600" onClick={doSignOut}>SignOut</button>
          </nav>
    </header>
  )
}