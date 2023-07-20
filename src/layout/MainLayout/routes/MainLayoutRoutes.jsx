import { Navbar } from "../components/NavBar/NavBar";
import { Routes, Route, Navigate } from "react-router-dom";
import { CreateTourney } from "../pages";

export const MainLayout = () => {
  return (
    <div className="grid flex justify-content-center">
      <div className="col-12">
        <Navbar />
      </div>
      <div className="col-11 md:col-11 lg:col-11">
        <Routes>
          <Route path="/" element={<Navigate to="create-tourney" />} />
          <Route path="create-tourney" element={<CreateTourney />} />
        </Routes>
      </div>
    </div>
  );
};
