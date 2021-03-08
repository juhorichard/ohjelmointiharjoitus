import React, { Component } from "react";


class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      foo: "bar",
      data: {},
    };
  }


  render() {
    console.log('this.props', this.props)
    return (
      <div className="App">
              {/* <Header /> */}
      <button onClick={() => this.props.history.push('/login')}>Login</button>
      </div>
    );
  }
}

export default LandingPage;
