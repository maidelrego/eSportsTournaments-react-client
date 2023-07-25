import { useState } from "react";

export const useForm = (initialForm = []) => {
  const [form, setForm] = useState(initialForm);

  const handleFiles = (event) => {
    setForm({
      ...form,
      image: event,
    });
  };

  const handleAutoComplete = (event, index) => {
    const { name, value } = event.target;

    const newForm = form.map((item, i) => {

      if (i === index) {
        return {
          ...item,
          [name]: value,
        };
      }
      return item;
    });
    setForm(newForm);
  };
  
     
  const onResetForm = () => {
    setForm(initialForm);
  }
  
  const handleChange = (event, index) => {
    const { name, value } = event.target;

    if (index === undefined) {
      setForm({
        ...form,
        [name]: value,
      });
      return;
    }
 
    const newForm = form.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [name]: value.name ? value.name : value,
          logoUrl: value.logo ? value.logo : null,
        };
      }
      return item;
    });
    setForm(newForm);
  };

  return {
    form,
    setForm,
    handleChange,
    handleFiles,
    handleAutoComplete,
    onResetForm
  };
};
