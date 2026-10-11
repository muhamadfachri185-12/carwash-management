import { RouterProvider } from "react-router-dom"
import { useEffect } from "react"

import router from "./routes/routes"
import socket from "@/lib/socket"
import { useAuth } from "./context/AuthContext"

function App() {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log("Socket effect:", {
      loading,
      user,
    })

    if (loading) {
      return
    }

    if (!user) {
      return
    }

    console.log("Connecting socket for user:", user.id)

    socket.connect()

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
      console.log("Joining customer room:", user.id)

      socket.emit("join:customer", user.id)
    })

    socket.on("order:status-updated", (data) => {
      console.log("Order status updated:", data)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    return () => {
      socket.off("connect")
      socket.off("order:status-updated")
      socket.off("disconnect")
      socket.disconnect()
    }
  }, [user, loading])

  return <RouterProvider router={router} />
}

export default App
