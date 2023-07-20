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
        };
      }
      console.log(item);
      return item;
    });
    setForm(newForm);
  };

  const handleSwitch = (event, index) => {
    const { name, checked } = event.target;
    
    // before setting new value to form, check if it's a win
    // if it is, set all other wins to false
    
    const winner = form.find((item) => item.win === true);

    if (winner && name === "win" && checked === true) {
      const newForm = form.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [name]: checked,
          };
        }
        return {
          ...item,
          win: false,
        };
      });
      setForm(newForm);
      return;
    }

    const newForm = form.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [name]: checked,
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
    handleSwitch,
    handleFiles,
    handleAutoComplete
  };
};
