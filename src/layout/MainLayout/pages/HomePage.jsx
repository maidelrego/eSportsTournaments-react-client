import { Button } from "primereact/button";
import hero from "../../../assets/img/hero2.png";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();


  return (
    <div className="grid grid-nogutter surface-section text-800 mt-8">
      <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center">
        <section>
          <span className="block text-6xl font-bold mb-1 text-secondary">Tourney Forge</span>
          <div className="text-5xl text-primary font-bold mb-3">
            Join, create, and manage exciting tournaments!
          </div>
          <p className="mt-0 mb-4 text-700 line-height-3">
            Elevate your tournaments with Tourney Forge. Whether you&apos;re a gamer,
            sports enthusiast, or event organizer, our platform empowers you to
            craft engaging competitions. Curate memorable events that captivate
            participants and fans alike. Get started today!
          </p>

          <Button
            onClick={() => navigate("/create-tourney")}
            label="Get Started"
            type="button"
            className="mr-3 p-button-raised"
          ></Button>
        </section>
      </div>
      <div className="col-12 md:col-6 overflow-hidden">
        <img
          src={hero}
          alt="hero-1"
          className="w-full h-auto"
          style={{ clipPath: "polygon(8% 0, 100% 0%, 100% 100%, 0 100%)" }}
        />
      </div>
    </div>
  );
};
