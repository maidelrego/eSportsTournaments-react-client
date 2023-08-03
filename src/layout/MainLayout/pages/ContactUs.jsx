import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

export const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState(false);

  const onChange = (value) => {
    console.log("Captcha value:", value);
    setCaptcha(true);
  }

  const validate = () => {
    return name.length === 0 || email.length === 0 || message.length === 0 || !captcha;
  }

  return (
    <>
      <div className="grid mt-5">
        <div className="col-12 md:col-6 md:col-offset-3">
          <div className="flex align-items-center justify-content-center">
            <div className="p-4 w-full">
              <div className="surface-0 text-center">
                <div className="text-blue-600 font-bold mb-3"><i className="pi pi-discord"></i>&nbsp;POWERED BY DISCORD</div>
                <div className="text-color font-bold text-5xl mb-3">Join our Tourney Forge Community</div>
                <div className="text-700 text-2xl mb-5">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit numquam eligendi quos.</div>
                <Button label="Join Now" icon="pi pi-discord" className="font-bold px-4 py-3 p-button-raised p-button-rounded white-space-nowrap" />
              </div>

              <div className='mt-8'>
                <InputText value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" className="w-full mb-3" />
                <InputText value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Email" className="w-full mb-3" />
                <InputTextarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Message' autoResize className="w-full mb-3"/>
                <ReCAPTCHA
                  className='mb-3'
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={onChange}
                />
                <Button disabled={validate()} label="Contact Us" icon="pi pi-envelope" className="w-full px-4 py-3 p-button-raised p-button-rounded " />
              </div>
            </div>
          </div>
    
        </div>
      </div>
    </>
  )
}
