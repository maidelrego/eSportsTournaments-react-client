import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../hooks";

export const ResetPassword = () => {
  const { token = null } = useParams();
  const { startResetPassword } = useAuthStore();

  const onPasswordReset = async (data) => {
    await startResetPassword({ token, ...data });
  }

  return (
    <Formik
      initialValues={{
        password: "",
        confirmPassword: "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .max(255)
          .matches(
            /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
            "Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, and one number."
          )
          .required("Password is required"),
        // match password
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required'),
      })}
      onSubmit={async (values) => {
        delete values.submit;
        onPasswordReset(values);
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
              <img src={logo} alt="hyper" height={100} className="mb-6" />
              <div className="text-color text-3xl mb-3">Forgot Password</div>
            </div>

            <form noValidate onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-color font-medium mb-2"
                >
                    New Password
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
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-color font-medium mb-2"
                >
                   Confirm New Password
                </label>
                <InputText
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  className={`w-full mb-3 ${
                    touched.confirmPassword && errors.confirmPassword ? "p-invalid" : ""
                  }`}
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Message
                    severity="error"
                    className="mb-5"
                    text={errors.confirmPassword}
                  />
                )}
              </div>
              <div className="mt-3">
                <Button label="Reset"
                  outlined
                  severity="secondary"
                  className="px-4 py-3 p-button-raised p-button-rounded w-full"
                  icon="pi pi-refresh"
                  iconPos="right"
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </Formik>
  )
}
