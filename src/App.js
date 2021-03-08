import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { connect } from "react-redux";

import Biology from "./components/Biology";
import Chemistry from "./components/Chemistry";


import Home from "./components/Home";
import CreateCard from "./components/CreateCard";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

  }

  render() {
    const { isAuthenticated, isVerifying } = this.props;
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/luo-kortti"
            component={CreateCard}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
          />
          <Route
            exact
            path="/biologia"
            component={Biology}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
          />
          <Route
            exact
            path="/kemia"
            component={Chemistry}
            isAuthenticated={isAuthenticated}
            isVerifying={isVerifying}
          />
          <Route exact path="/" component={Home} />
          <Route
            render={() => {
              return <p> Sivua ei löydy</p>;
            }}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    isVerifying: state.auth.isVerifying,
  };
}
export default connect(mapStateToProps)(App);
