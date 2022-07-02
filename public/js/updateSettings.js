/* eslint-disable*/
'use strict';

import axios from 'axios';
import { notify } from './notify';

//type is 'password' or 'data'
export const updateUserData = async (data, type) => {
  try {
    const endpoint = type === 'password' ? 'updatePassword' : 'updateMe';
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/v1/users/${endpoint}`,
      data,
    });
    console.log(res);
    if (res.data.status === 'success') {
      notify(`Your ${type} was updated`, 'success');
      //   setTimeout(() => location.reload(true), 2000);
    }
  } catch (err) {
    notify(err.response.data.message, 'error');
  }
};
