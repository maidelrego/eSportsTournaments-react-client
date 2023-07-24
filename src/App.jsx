//core
import "primereact/resources/primereact.min.css";
// primeflex
import "primeflex/primeflex.css";
//icons
import "primeicons/primeicons.css";

import "./theme.css";
import { PrimeReactProvider } from "primereact/api";
import { AppRouter } from "./router/AppRouter";
import { AppSpinner } from "./ui/components/AppSpinner";
import { useSelector } from "react-redux";

function App() {
  const { loading } = useSelector(state => state.ui)

  return (
    <PrimeReactProvider>
      <AppRouter />
      { loading && <AppSpinner loading={loading} /> }
    </PrimeReactProvider>
  );
}

export default App;
