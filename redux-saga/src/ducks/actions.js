import * as actionTypes from "../constants";

export function login({ username, password }) {
  return {
    type: actionTypes.LOGIN,
    payload: { username, password }
  };
}

export function logout() {
  return { type: actionTypes.LOGOUT };
}
