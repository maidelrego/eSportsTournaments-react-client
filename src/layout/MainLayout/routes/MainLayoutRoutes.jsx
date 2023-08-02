import { Navbar } from "../components/NavBar/NavBar";
import { Routes, Route, Navigate } from "react-router-dom";
import { ContactUs, CreateTourney, JoinTourney } from "../pages";
import { MyTourneys } from "../pages";
import { Tournament } from "../pages/Tournament";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const MainLayout = () => {
  return (
    <div className="grid flex justify-content-center">
      <div className="col-12">
        <Navbar />
        <ToastContainer autoClose={3000} />
      </div>
      <div className="col-11 md:col-11 lg:col-11">
        <Routes>
          <Route path="/" element={<Navigate to="create-tourney" />} />
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
