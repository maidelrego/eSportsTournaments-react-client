import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { doDiscordWebhook } from "../../../services/api";

export const ContactUs = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(false);

  const onChange = () => {
    setCaptcha(true);
  };

  const validate = () => {
    return name.length === 0 || message.length === 0 || !captcha;
  };

  const resetForm = () => {
    setName("");
    setMessage("");
    setCaptcha(false);
  };

  const joinDiscord = () => {
    window.open("https://discord.gg/2H2pJaAw", "_blank");
  };

  const submit = async () => {
    const discordContent = {
      embeds: [
        {
          title: `Message from ${name}`,
          description: message,
          color: 15258703,
        },
      ],
    };

    await doDiscordWebhook(import.meta.env.VITE_DISCORD_WEBHOOK, discordContent)
      .then(() => {
        resetForm();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="grid mt-5">
        <div className="col-12 md:col-6 md:col-offset-3">
          <div className="flex align-items-center justify-content-center">
            <div className="p-4 w-full">
              <div className="surface-0 text-center">
                <div className="text-blue-600 font-bold mb-3">
                  <i className="pi pi-discord"></i>&nbsp;POWERED BY DISCORD
                </div>
                <div className="text-color font-bold text-5xl mb-3">
                  Join our Tourney Forge Community
                </div>
                <div className="text-700 text-2xl mb-5">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Velit numquam eligendi quos.
                </div>
                <Button
                  onClick={() => joinDiscord()}
                  label="Join Now"
                  icon="pi pi-discord"
                  className="font-bold px-4 py-3 p-button-raised p-button-rounded white-space-nowrap"
                />
              </div>

              <div className="mt-7">
                <h1 className="text-color text-center font-bold text-3xl mb-3">
                  Tell us about your ideas or suggestions
                </h1>
              </div>

              <div className="mt-4">
                <InputText
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Name"
                  className="w-full mb-3"
                />
                <InputTextarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message"
                  autoResize
                  className="w-full mb-3"
                />
                <ReCAPTCHA
                  className="mb-3"
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={onChange}
                />
                <Button
                  disabled={validate()}
                  onClick={() => submit()}
                  label="Contact Us"
                  icon="pi pi-envelope"
                  className="w-full px-4 py-3 p-button-raised p-button-rounded "
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
