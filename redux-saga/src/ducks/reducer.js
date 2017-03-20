import { withInitialState, fromStateMachine } from "../utils";

import * as actionTypes from "../constants";

const loginReducer = fromStateMachine({
  LoggedIn: {
    [actionTypes.LOGOUT](state, action) {
      return { LoggedOut: true };
    }
  },
  LoginError: {
    [actionTypes.LOGIN](state, action) {
      return { Pending: true };
    }
  },
  LoggedOut: {
    [actionTypes.LOGIN](state, action) {
      return { Pending: true };
    }
  },
  Pending: {
    [actionTypes.LOGOUT](state, action) {
      return { LoggedOut: true };
    },
    [actionTypes.LOGIN_SUCCESS](state, action) {
      const { user, token } = action.payload;
      return {
        LoggedIn: {
          user,
          token
        }
      };
    },
    [actionTypes.LOGIN_ERROR](state, action) {
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
