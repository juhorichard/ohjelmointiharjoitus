import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import { db } from '../firebase/firebase'

// import data from './data.json'

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cards: [],
      editing: false,
      currentCard: {},
      email: '',
      dataList: [],
      loading: true,
      rotate: false,
      index: 0
    }
  }

  async componentDidMount() {
    // this.fetchData()
  }

  fetchData = async () => {
    const snapshot = await db.doc('terms/themes').get()
    if (snapshot.data()) {
      this.setState({ themes: snapshot.data() })
    }
  }


  render() {

    return (
      <div style={{
        display: 'grid',
        margin: "auto",
        width: "50%",
        border: "3px solid green;",
        padding: "10px",
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <a href="/biologia">
            <button >Biologia</button>
          </a>
          <a href="/kemia">
            <button >Kemia</button>
          </a>
        </div>
        <Button
          variant="contained"
          component="label"
          color="primary"
          style={{
            marginTop: "20px",
          }}
        >Luo kortti</Button>

      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    isLoggingOut: state.auth.isLoggingOut,
    logoutError: state.auth.logoutError,
  };
}
export default connect(mapStateToProps)(Home);
