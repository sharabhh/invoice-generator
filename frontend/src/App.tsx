import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from './features/Dashboard/Dashboard'
import ViewInvoice from './features/ViewInvoice/ViewInvoice'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/new-invoice' element={<h1>bye</h1>} />
          <Route path='/invoice/:id' element={<ViewInvoice />} />
          <Route path='*' element={<h1>Not found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
