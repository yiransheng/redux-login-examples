import * as actionTypes from "../constants";
import { uniqueId } from "lodash";

export function login({ username, password }) {
  return {
    type: actionTypes.LOGIN,
    payload: { username, password, requestId: uniqueId() }
  };
}

export function logout() {
  return { type: actionTypes.LOGOUT };
}
