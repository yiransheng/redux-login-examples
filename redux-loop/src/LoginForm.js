import React, { Component } from "react";
import { connect } from "react-redux";
import { match } from "single-key";

import { login, logout } from "./ducks/actions";
import LoadingBar from "./LoadingBar";

const enhance = connect(
  state => {
    return match(
      state,
      {
        LoggedIn: ({ user }) => ({ user, pending: false, error: null }),
        LoggedOut: () => ({ pending: false, error: null }),
        Pending: () => ({ pending: true, error: null }),
        LoginError: ({ message }) => ({ pending: false, error: message })
      },
      () => ({ pending: false, error: null })
    );
  },
  { login, logout }
);

export default enhance(
  class LoginForm extends Component {
    static displayName = "LoginForm";

    handleSubmit = e => {
      e.preventDefault();
      const formData = new FormData(e.nativeEvent.target);
      const payload = {
        username: formData.get("username"),
        password: formData.get("password")
      };
      this.props.login(payload);
    };

    handleLogout = () => {
      this.props.logout();
    };

    render() {
      const { pending, error, user } = this.props;
      return (
        <div className="login-form">
          <LoadingBar loading={pending} />
          <form onSubmit={this.handleSubmit} name="login">
            <h2>{user ? `Welcome ${user}` : "Login"}</h2>
            {error && <span className="error">{error}</span>}
            {user
              ? null
              : <div>
                  <div className="form-control">
                    <label htmlFor="username">Username</label>
                    <input
                      disabled={pending}
                      name="username"
                      id="username"
                      type="text"
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="password">Password</label>
                    <input
                      disabled={pending}
                      name="password"
                      id="password"
                      type="password"
                    />
                  </div>
                </div>}
            <div className="form-control rev">
              {user
                ? null
                : <input disabled={pending} id="submit" type="submit" />}
              <input
                onClick={this.handleLogout}
                id="logout"
                type="button"
                value="Logout"
              />
            </div>
          </form>
        </div>
      );
    }
  }
);
