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
import { Toaster } from "react-hot-toast";

function App() {
  const { loading } = useSelector((state) => state.ui);

  return (
    <PrimeReactProvider>
      <AppRouter />
      {loading && <AppSpinner loading={loading} />}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
    </PrimeReactProvider>
  );
}

export default App;
