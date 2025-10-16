import MainContent from "./components/MainContent"
import SignInOptions from './components/SignInComponents/SignInOptions'
import { useAuth } from './contexts/authContext'
import { ActiveSectionProvider } from "./contexts/ActiveSectionContext"


function App() {

  const {currentUser} = useAuth() 

  return (
    <section className="bg-lime-950">
      <ActiveSectionProvider>
        {currentUser ? <MainContent /> : <SignInOptions />}
      </ActiveSectionProvider>
    </section>
  )
}

export default App
