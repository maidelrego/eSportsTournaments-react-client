import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../hooks";
import { Avatar } from "primereact/avatar";
import google from "../../assets/img/google.avif";

export const Register = () => {
  const { startRegister, startRegisterGoogle } = useAuthStore();

  const onRegister = async (data) => {
    await startRegister(data);
  };

  const onGoogleSingIn = async () => {
    await startRegisterGoogle();
  };

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
          <div className="flex align-items-center justify-content-center col md:col-6 md:col-offset-3">
            <div className="surface-card p-4 border-round w-full lg:w-4" style={{ top: "15%", position: "absolute" }}>
              <div className="text-center mb-5">
                <img src={logo} alt="hyper" height={50} className="mb-3" />
                <div className="text-color text-3xl mb-3">Create an account</div>
              </div>

              <div className="w-full surface-card">
                <div className="flex justify-content-center">
                  <Button
                    severity="secondary"
                    outlined
                    className="px-4 py-3 p-button-raised p-button-rounded"
                    onClick={() => onGoogleSingIn()}
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
                    <div className="flex flex-column justify-content-center">
                      <Button
                        label="Register"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        outlined
                        severity="secondary"
                        className="px-4 py-3 p-button-raised p-button-rounded w-full mt-3"
                        type="submit"
                      />
                      <a
                        className="font-bold no-underline text-blue-500 cursor-pointer text-center mt-2"
                        href="/login"
                      >
                        Already have an account? Sign in
                      </a>
                    </div>
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
