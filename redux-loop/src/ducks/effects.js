import { authorize } from "../api-mocks";
import { LOGIN_SUCCESS, LOGIN_ERROR } from "../constants";

export function loginRequest({ username, password, requestId }) {
  return authorize({ username, password })
    .then(result => {
      return {
        type: LOGIN_SUCCESS,
        payload: { ...result, requestId }
      };
    })
    .catch(({ message }) => {
      return {
        type: LOGIN_ERROR,
        payload: { message, requestId }
      };
    });
}
