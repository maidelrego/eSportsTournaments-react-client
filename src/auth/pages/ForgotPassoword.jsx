import logo from "../../assets/img/logo.png";
import { Formik } from "formik";
import * as Yup from "yup";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Button } from "primereact/button";
import { useAuthStore } from "../../hooks";

export const ForgotPassoword = () => {
  const { startForgotPassword } = useAuthStore();

  const onPasswordReset = async (data) => {
    await startForgotPassword(data)
  }

  return (
    <Formik
      initialValues={{
        email: "",
        submit: null,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
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
