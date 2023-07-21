//core
import "primereact/resources/primereact.min.css";
// primeflex
import "primeflex/primeflex.css";
//icons
import "primeicons/primeicons.css";

import "./theme.css";
import { PrimeReactProvider } from "primereact/api";
import { AppRouter } from "./router/AppRouter";

function App() {
  return (
    <PrimeReactProvider>
      <AppRouter />
    </PrimeReactProvider>
  );
}

export default App;
