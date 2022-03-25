/**
 * ======= BASE API module ========
 * Do not write any code to this file
 *
 * Use for calling api
 *
 */
// const axios = require('axios');
// if (!window.axios) {
//   window.axios = {};
//   console.error('Axios was not loaded');
// }
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; // fix bug: unable to verify the first certificate at TLSSocket.onConnectSecure

import axios from 'axios';

/**
 * Wrapper function to call api for this app
 *
 * @param opt Axios request config
 * @returns {*} {
        isApiServiceError: true if there was exception from API request,
        error: false or Error message string,
        code: Error code from GlobalConst,
        data: Optional data, if error then data is null, else data is api response data,
      }
 */
async function req (opt) {
  // https://github.com/axios/axios#request-config
  const deFaultOpt = {
    // 4 needed info
    method: 'GET',
    url: null,
    // data: {}, // Do not include it by default, will fail on react-native for ios, but still work in android
    params: {
      // locale: 'vi', // Already in device info
    },

    timeout: 20000,

    // very stable info
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // async: true,
    // crossDomain: true,
    // validateStatus: (status) => {
    //   // cast all request status as true
    //   console.log('{validateStatus} status: ', status);
    //   return true;
    // },
  };

  const o = Object.assign({}, deFaultOpt, opt);


  // axios.interceptors.request.use(function (config) {
  //   // Do something before request is sent
  //   if (config.url.endsWith('/stock/detail')) {
  //     console.log('{interceptors} config: ', config);
  //   }
  //   return config;
  // }, function (error) {
  //   // Do something with request error
  //   return Promise.reject(error);
  // });


  return axios(o)
    .then(res => {
      if (res.data.status === 500) {
        // Catch all api exception on server
        return {
          isApiServiceError: true,
          code: 'api_' + res.data.status,
          message: res.data.message, // use message instead of error
        };
      }
      else {
        return res;
      }
    })
    .catch(e => {
      /**
       * handle all API base error here, can not request to server due to something
       */

      /**
       * Handle response error
       * Axios will consider non-200 status is exception, then api response is inside e.response
       */
      if (typeof e.response !== 'undefined') {
        return {
          code: 'NOT-HTTP-200',
          data: e.response
        }
      }

      /**
       * Handle request error
       * All error before axios do request
       */

      let code = 'api_error';
      let msg = 'Network error';
      switch (e.name) {
        case 'TypeError':
          code = 'req_data_error';
          msg = 'Có lỗi xử lý dữ liệu gửi';
          break;
      }

      return {
        isApiServiceError: true,
        code: code,
        message: msg, // use message instead of error
      };
    })
}

export default {
  req,
}

// module.exports = {
//   req,
// };
