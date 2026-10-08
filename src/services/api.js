import axios from "axios";

const axiosInstance = axios.create();

function timeoutWatcher(promise, options = {}) {
  const ms = options.ms || 90000;
  const msg = options.msg || "The API request has timed out.";
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(msg));
    }, ms);
  });
  return Promise.race([promise, timeout]);
}

function doDiscordWebhook (url, data) {
  const apicall = axiosInstance.post(url, data);
  return timeoutWatcher(apicall)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err.response;
    });
}

export { doDiscordWebhook };
