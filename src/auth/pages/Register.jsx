import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../hooks";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";

export const Register = () => {
  const { startRegister } = useAuthStore();
  const [profile, setProfile] = useState(null);

  const onRegister = async (data) => {
    await startRegister(data);
  };

  const updateProfile = (data) => {
    console.log("DATAAa", data);
    setProfile(data.access_token);
  };

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => updateProfile(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (profile) {
      // TODO: MOVE THIS CALL TO THE AUTH STORE
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${profile}`,
          {
            headers: {
              Authorization: `Bearer ${profile}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          console.log("RES", res);
        })
        .catch((err) => console.log(err));
    }
  }, [profile]);

  return (
    <>
      <Formik
        initialValues={{
          fullName: "",
          email: "",
          password: "",
          submit: null,
        }}
        validationSchema={Yup.object().shape({
          fullName: Yup.string().max(20).required("Full name is required"),
          email: Yup.string()
            .email("Must be a valid email")
            .max(255)
            .required("Email is required"),
          // /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
          password: Yup.string()
            .max(255)
            .matches(
              /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
              "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, and one number."
            )
            .required("Password is required"),
        })}
        onSubmit={async (values) => {
          delete values.submit;
          onRegister(values);
        }}
      >
        {({
          errors,
          handleBlur,
          handleChange,
          handleSubmit,
          touched,
          values,
        }) => (
          <div className="flex align-items-center justify-content-center px-4 py-8 md:px-6 lg:px-8">
            <div className="surface-card p-4 border-round w-full lg:w-6">
              <div className="text-center mb-5">
                <img src={logo} alt="hyper" height={50} className="mb-3" />
                <div className="text-color text-3xl mb-3">Welcome</div>
              </div>

              <div className="w-full surface-card">
                <div className="flex justify-content-center">
                  <Button
                    label="Sign up with Google"
                    icon="pi pi-google"
                    severity="danger"
                    className="px-4 py-3 p-button-raised p-button-rounded"
                    onClick={() => login()}
                  />
                </div>
                <div
                  className="p-divider p-component p-divider-horizontal p-divider-solid p-divider-center my-4"
                  role="separator"
                >
                  <div className="p-divider-content">
                    <span className="text-600 font-normal text-sm">OR</span>
                  </div>
                </div>
                <form noValidate onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="fullname"
                      className="block text-color font-medium mb-2"
                    >
                      Fullname
                    </label>
                    <InputText
                      id="fullname"
                      type="text"
                      name="fullName"
                      placeholder="Fullname"
                      className="w-full mb-3"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.fullName && errors.fullName && (
                      <Message
                        severity="error"
                        className="mb-5"
                        text={errors.fullName}
                      />
                    )}

                    <label
                      htmlFor="email"
                      className="block text-color font-medium mb-2"
                    >
                      Email
                    </label>
                    <InputText
                      id="email"
                      type="text"
                      name="email"
                      placeholder="Email address"
                      className="w-full mb-3"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.email && errors.email && (
                      <Message
                        severity="error"
                        className="mb-5"
                        text={errors.email}
                      />
                    )}

                    <label
                      htmlFor="password"
                      className="block text-color font-medium mb-2"
                    >
                      Password
                    </label>
                    <InputText
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      className={`w-full mb-3 ${
                        touched.password && errors.password ? "p-invalid" : ""
                      }`}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.password && errors.password && (
                      <Message
                        severity="error"
                        className="mb-5"
                        text={errors.password}
                      />
                    )}

                    <div className="flex align-items-center justify-content-end mb-6">
                      <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
                        Forgot your password?
                      </a>
                    </div>
                    <Button
                      label="Sign In"
                      icon="pi pi-user"
                      className="px-4 py-3 p-button-raised p-button-rounded w-full"
                      type="submit"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
};
