import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from './features/Dashboard/Dashboard'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/a' element={<h1>bye</h1>} />
          <Route path='*' element={<h1>Not found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
