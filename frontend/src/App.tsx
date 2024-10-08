import './App.css'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from './features/Dashboard/Dashboard'
import ViewInvoice from './features/ViewInvoice/ViewInvoice'
import CreateInvoice from './features/CreateInvoice/CreateInvoice'
import EditInvoice from './features/EditInvoice/EditInvoice'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/new-invoice' element={<CreateInvoice />} />
          <Route path='/invoice/:id' element={<ViewInvoice />} />
          <Route path='/edit-invoice/:id' element={<EditInvoice />} />
          <Route path='*' element={<h1>Not found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
