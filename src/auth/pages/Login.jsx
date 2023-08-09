import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { Avatar } from "primereact/avatar";
import google from "../../assets/img/google.avif";

export const Login = () => {
  const { startLogin, startLoginGoogle } = useAuthStore();
  const navigate = useNavigate();

  const onLogin = async (data) => {
    await startLogin(data);
  };

  const onGoogleSingIn = async (event) => {
    event.preventDefault();
    await startLoginGoogle();
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <>
      <Formik
        initialValues={{
          email: "",
          password: "",
          submit: null,
        }}
        validationSchema={Yup.object().shape({
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
          onLogin(values);
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
                <div className="text-color text-3xl mb-3">Welcome Back</div>
                <span className="text-600 font-medium line-height-3">
                  Don&apos;t have an account?
                </span>
                <a
                  onClick={() => navigateToRegister()}
                  className="font-bold no-underline ml-2 text-blue-500 cursor-pointer"
                >
                  Create today!
                </a>
              </div>

              <div className="flex justify-content-center">
                <Button
                  severity="secondary"
                  outlined
                  className="px-4 py-3 p-button-raised p-button-rounded"
                  onClick={onGoogleSingIn}
                >
                  <Avatar
                    className="mr-3"
                    image={google}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <span>Continue in With Google</span>
                </Button>
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
                    htmlFor="email"
                    className="block text-color font-medium mb-2"
                  >
                    Email
                  </label>
                  <InputText
                    id="email"
                    type="text"
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

                  <div className="flex align-items-center justify-content-end mb-3">
                    <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
                      Forgot your password?
                    </a>
                  </div>

                  <Button
                    label="Login"
                    outlined
                    severity="secondary"
                    className="px-4 py-3 p-button-raised p-button-rounded w-full"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    type="submit"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </Formik>
    </>
  );
};
