import React, { useEffect } from 'react';
import { AuthProvider } from "./contexts/AuthContext";
import Routes from "./Routes";
import  testSupabase  from '../src/lib/supabaseTest';

function App() {

   useEffect(() => {
    testSupabase();
  }, []);

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
