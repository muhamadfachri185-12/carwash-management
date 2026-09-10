import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoute"
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<h1>Carwash Managament</h1>} />
        <Route path='/login' element={<h1>Login</h1>} />
        <Route path='/register' element={<h1>Register</h1>} />

        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<h1>Dasboard</h1>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
