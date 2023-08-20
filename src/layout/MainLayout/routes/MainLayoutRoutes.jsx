import { Navbar } from "../components/NavBar/NavBar";
import { Routes, Route } from "react-router-dom";
import { ContactUs, CreateTourney, JoinTourney } from "../pages";
import { MyTourneys } from "../pages";
import { Tournament } from "../pages/Tournament";
import { HomePage } from "../pages/HomePage";
import { useAuthStore } from "../../../hooks";
import { useEffect } from "react";

export const MainLayout = () => {
  const { startConnectToGeneral } = useAuthStore();

  useEffect(() => {
    startConnectToGeneral()
  }, []);

  return (
    <div className="grid flex justify-content-center">
      <div className="col-12">
        <Navbar />
      </div>
      <div className="col-11 md:col-11 lg:col-11">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="create-tourney" element={<CreateTourney />} />
          <Route path="join-tourney" element={<JoinTourney />} />
          <Route path="my-tourneys" element={<MyTourneys />} />
          <Route path="contact-us" element={<ContactUs />} />
          <Route path="/my-tourneys/:id" element={<Tournament />} />
        </Routes>
      </div>
    </div>
  );
};
