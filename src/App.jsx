import { supabase } from './lib/supabaseClient'
function App() {
  console.log("Supabase Client:", supabase)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600">SwiftCare</h1>
    </div>
  )
}

export default App
