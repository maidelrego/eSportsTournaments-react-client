import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../hooks/useAuthStore";

export const Login = () => {
  const { startLogin } = useAuthStore();

  const onLogin = async(data) => {
      await startLogin(data);
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
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex align-items-center justify-content-center px-4 py-8 md:px-6 lg:px-8">
              <div className="surface-card p-4 border-round w-full lg:w-6">
                <div className="text-center mb-5">
                  <img src={logo} alt="hyper" height={50} className="mb-3" />
                  <div className="text-color text-3xl mb-3">Welcome Back</div>
                  <span className="text-600 font-medium line-height-3">
                    Don&apos;t have an account?
                  </span>
                  <a className="font-medium no-underline ml-2 text-blue-500 cursor-pointer">
                    Create today!
                  </a>
                </div>

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
                    <Message severity="error" className="mb-5" text={errors.email} />
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
                    className={`w-full mb-3 ${ touched.password && errors.password ? 'p-invalid' : '' }` }
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {touched.password && errors.password && (
                    <Message severity="error" className="mb-5" text={errors.password} />
                  )}

                  <div className="flex align-items-center justify-content-end mb-6">
                    <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">
                      Forgot your password?
                    </a>
                  </div>

                  <Button
                    label="Sign In"
                    icon="pi pi-user"
                    className="w-full"
                    type="submit"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
};
