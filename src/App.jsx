//theme
import "primereact/resources/themes/mdc-light-indigo/theme.css";     
//core
import "primereact/resources/primereact.min.css";
// primeflex
import "primeflex/primeflex.css";        
//icons
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "./auth/context/AuthProvider"
import { AppRouter } from "./router/AppRouter"


function App() {
  return (
    <PrimeReactProvider>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
    </PrimeReactProvider>
  );
}

export default App;
