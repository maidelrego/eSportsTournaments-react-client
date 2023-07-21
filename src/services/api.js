import axios from "axios";

const axiosInstance = axios.create();
// const baseURL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_PROD_URL : process.env.REACT_APP_DEV_URL;
const baseURL = "http://localhost:3000/";
const apiServer = baseURL + "api/v1/";

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

function addAuthHeader(opts = {}) {

  const token = localStorage.getItem("token");

  if (!opts.headers) {
    opts.headers = {};
  }

  opts.headers["Access-Control-Allow-Origin"] = "*";

  if (token) {
    opts.headers.Authorization = `Bearer ${token}`;
  } else {
    opts.headers.Authorization = null;
  }
  return opts;
}

function doAPIGet(path, params, timeout = null) {
  if (path[0] === "/") {
    path = path.slice(1);
  }
  var url = apiServer + path;
  if (params && typeof params === "object" && params !== {}) {
    var urlparams = "";
    for (var key in params) {
      if (urlparams !== "") {
        urlparams += "&";
      }
      urlparams += key + "=" + encodeURIComponent(JSON.stringify(params[key]));
    }
    url += "?" + urlparams; // + '?token=' + this.token
  }

  const apicall = axiosInstance.get(url, addAuthHeader({ clear: false }));
  const timeoutOpts = {};

  if (timeout) {
    timeoutOpts.ms = timeout;
  }

  const req = timeoutWatcher(apicall, timeoutOpts)
    .then((res) => {
      console.debug("DATA BACK", res);
      return res.data;
    })
    .catch((err) => {
      return err.response.data;
    });
  return req;
}
function doAPIPost(path, params) {
  var url = apiServer + path;
  const apicall = axiosInstance.post(
    url,
    params,
    addAuthHeader({ clear: false })
  );
  return timeoutWatcher(apicall)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return err.response.data;
    });
}
function doAPIPut(path, params) {
  // params.token = this.token
  var url = apiServer + path;
  const apicall = axiosInstance.put(
    url,
    params,
    addAuthHeader({ clear: false })
  );
  return timeoutWatcher(apicall)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err.response.data;
    });
}
function doAPIDelete(path) {
  var url = apiServer + path;
  const apicall = axiosInstance.delete(url, addAuthHeader({ clear: false }));
  return timeoutWatcher(apicall)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err.response.data;
    });
}

export { doAPIGet, doAPIPost, doAPIDelete, doAPIPut };
