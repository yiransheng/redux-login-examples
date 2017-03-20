import { take, call, put, cancel, fork } from "redux-saga/effects";
import { authorize } from "../api-mocks";
import { LOGIN, LOGIN_SUCCESS, LOGIN_ERROR, LOGOUT } from "../constants";

function* auth(payload) {
  try {
    const { user, token } = yield call(authorize, payload);
    yield put({ type: LOGIN_SUCCESS, payload: { user, token } });
  } catch (error) {
    yield put({ type: LOGIN_ERROR, payload: error });
  }
}

export default function* loginFlow() {
  while (true) {
    const { payload } = yield take(LOGIN);
    const task = yield fork(auth, payload);
    const action = yield take([LOGOUT, LOGIN_ERROR]);
    if (action.type === LOGOUT) {
      yield cancel(task);
    }
  }
}
