import './App.css'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Auth from './pages/auth'
import LandingPage from './pages/landingPage'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Video from './pages/Video.jsx'

function App() {

  return (
    <>
      <Router>
        <AuthProvider>  
          <Routes>

            <Route path='/' element={<LandingPage/>}/>
            <Route path='/auth' element={<Auth/>}/>
            <Route path='/:url' element={<Video/>}/>

          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
