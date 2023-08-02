import formSelections from "../lib/formSelections";

export const translateFormSelection = (
  key,
  category,
  suffix = false,
  prefix = false,
  index = null
) => {
  if (!formSelections[category]) {
    return "Invalid category for translateFormSelection:" + category;
  }

  if (key === null || key === "") {
    return "";
  }

  if (!isNaN(parseInt(key))) {
    key = parseInt(key);
  }

  var str;
  const res = formSelections[category].find((item) => item.key === key);
  if (index !== null) {
    str = res
      ? res.value[index]
      : "Unknown KeyValuePair! " + category + " key:" + key;
  } else {
    str = res ? res.value : "Unknown KeyValuePair! " + category + " key:" + key;
  }

  str = suffix ? str + suffix : str;
  return prefix ? prefix + str : str;
};
