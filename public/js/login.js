/* eslint-disable*/
'use strict';

import axios from 'axios';
import { notify } from './notify';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    notify(err.response.data.message, 'error');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    notify('Error logging out, please try again.', 'error');
  }
};
