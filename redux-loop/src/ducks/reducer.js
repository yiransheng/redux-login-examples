import { loop, Effects } from "redux-loop";
import { unpack } from "single-key";
import { withInitialState, fromStateMachine } from "../utils";

import * as actionTypes from "../constants";
import { loginRequest } from "./effects";

const loginReducer = fromStateMachine({
  LoggedIn: {
    [actionTypes.LOGOUT](state, action) {
      return { LoggedOut: true };
    }
  },
  LoginError: {
    [actionTypes.LOGIN](state, action) {
      return loop(
        { Pending: action.payload.requestId },
        Effects.promise(loginRequest, action.payload)
      );
    }
  },
  LoggedOut: {
    [actionTypes.LOGIN](state, action) {
      return loop(
        { Pending: action.payload.requestId },
        Effects.promise(loginRequest, action.payload)
      );
    }
  },
  Pending: {
    [actionTypes.LOGOUT](state, action) {
      return { LoggedOut: true };
    },
    [actionTypes.LOGIN_SUCCESS](state, action) {
      const [, requestId] = unpack(state);
      if (action.payload.requestId !== requestId) {
        return state;
      }
      const { user, token } = action.payload;
      return {
        LoggedIn: {
          user,
          token
        }
      };
    },
    [actionTypes.LOGIN_ERROR](state, action) {
      const [, requestId] = unpack(state);
      if (action.payload.requestId !== requestId) {
        return state;
      }
      const { message } = action.payload;
      return {
        LoginError: {
          message
        }
      };
    }
  }
});

export default withInitialState({ LoggedOut: true })(loginReducer);
