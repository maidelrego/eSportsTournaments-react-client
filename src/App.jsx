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
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { loading } = useSelector(state => state.ui)

  return (
    <PrimeReactProvider>
      <AppRouter />
      { loading && <AppSpinner loading={loading} /> }
      <ToastContainer autoClose={3000} />
    </PrimeReactProvider>
  );
}

export default App;
