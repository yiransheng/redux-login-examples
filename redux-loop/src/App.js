import React, { Component } from "react";
import { Provider } from "react-redux";
import LoginForm from "./LoginForm";

class App extends Component {
  render() {
    return (
      <Provider store={this.props.store}>
        <LoginForm />
      </Provider>
    );
  }
}

export default App;
