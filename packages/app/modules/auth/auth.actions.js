// @flow

import { push } from 'react-router-redux';

import type { Dispatch } from 'redux';

const baseEndpoint = `${window.location.protocol}//${window.location.host}`;

class HttpError extends Error {
  status: number = 200;

  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const LOGOUT = 'auth/LOGOUT';
export const logout = () => (dispatch: Dispatch<ReduxAction>) => {
  if (window.Raven) {
    window.Raven.setUserContext();
  }

  dispatch(push('/login'));

  return dispatch({
    type: LOGOUT,
  });
};

const fetchWithAuthHeader = (url: string, options: RequestOptions) => fetch(url, {
  ...options,
  headers: {
    authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
  },
});

const receiveTokens = ({ accessToken, refreshToken }) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

type FetchOptions = {
  ...RequestOptions,
  body?: any,
}

export const fetchWithAuth = (url: string, options: FetchOptions = {}) => async (dispatch: Dispatch<ReduxAction>) => {
  const isJsonBody = options.body && !(options.body instanceof window.FormData);
  const formattedOptions = isJsonBody ? { ...options, body: JSON.stringify(options.body) } : options;

  let res;
  try {
    res = await fetchWithAuthHeader(baseEndpoint + url, formattedOptions);
    const refreshToken = localStorage.getItem('refresh_token');
    if (res.status === 401 && refreshToken) {
      const tokenRes = await fetch(`${baseEndpoint}/login`, {
        method: 'POST',
        body: JSON.stringify({ grantType: 'refresh', refreshToken }),
      });
      receiveTokens(await tokenRes.json());
      res = await fetch(baseEndpoint + url, formattedOptions);
    }
  } catch (e) {
    return dispatch(logout());
  }

  const data = await res.json();
  if (res.status > 400) {
    throw new HttpError(res.status, data.message);
  }

  return data;
};

export const RECEIVE_USER_DATA = 'auth/RECEIVE_USER_DATA';
export const receiveUserData = (userData: User) => ({
  type: RECEIVE_USER_DATA,
  payload: userData,
});

export const RECEIVE_USER_DATA_FAILED = 'auth/RECEIVE_USER_DATA_FAILED';
export const receiveUserDataFailed = (shouldClearUser: boolean) => ({
  type: RECEIVE_USER_DATA_FAILED,
  payload: { shouldClearUser },
});


export const fetchUserData = () => async (dispatch: Dispatch<ReduxAction>) => {
  try {
    const userData = await dispatch(fetchWithAuth('/users/me'));
    if (window.gtag) {
      window.gtag('set', { user_id: userData.id });
    }
    dispatch(receiveUserData(userData));
    return userData;
  } catch (e) {
    dispatch(receiveUserDataFailed(!(e instanceof TypeError)));
    throw e;
  }
};

export const login = (username: string, password: string) => async (dispatch: Dispatch<ReduxAction>) => {
  const res = await fetch(`${baseEndpoint}/login`, {
    method: 'POST',
    body: JSON.stringify({
      grantType: 'password',
      username,
      password,
    }),
  });
  receiveTokens(await res.json());

  return dispatch(fetchUserData());
};
