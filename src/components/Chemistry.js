import React, { Component } from "react";
import { connect } from "react-redux";
import { logoutUser } from "../actions";
import { myFirebase, db } from '../firebase/firebase'
import Card from '../Card/Card';
import DrawButton from '../DrawButton/DrawButton';

import data from './chemData.json'

class Chemistry extends Component {
  constructor(props) {
    super(props);

    this.updateCard = this.updateCard.bind(this);
    this.rotateImage = this.rotateImage.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.updateCardInDb = this.updateCardInDb.bind(this);

    this.state = {
      course: 0,
      cards: data,
      editing: false,
      currentCard: {},
      email: '',
      dataList: [],
      loading: false,
      rotate: false,
      index: 0
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
    const currentCards = data;
    this.setState({
      currentCard: currentCards[this.state.index],
    })
  }

  handleLogout = () => {
    const { dispatch } = this.props;
    dispatch(logoutUser());
  };

  componentDidUpdate(_, prevState) {
    if (this.state.course !== prevState.course) {
      this.fetchData()
    }
  }


  fetchData = async () => {
    await db.collection(`terms/chemistry/${this.state.course}`).onSnapshot(
      async (snapshot) => {
        const dataList = await snapshot.docs.map((doc) => {
          const termData = doc.data()
          return termData
        });
        this.setState({ cards: dataList, loading: false })
      })
  }

  setOK = async () => {
    const id = this.state.cards[this.state.index].id
    const subject = 'chemistry'

    try {
      await db.doc(`terms/${subject}/${this.state.course}/${id}`).update(
        {
          failed: 0
        }
      ).catch((err) => console.log('error incrementing failure'))
    } catch (err) {
      console.log('Error', err)
    }
  }

  setFailed = async () => {
    const userUid = 'myFirebase.auth().currentUser.uid'
    const id = this.state.cards[this.state.index].id
    const course = 0
    const subject = 'chemistry'
    try {
      await db.doc(`users/${userUid}/`).set(
        {
          [id]: `terms/${subject}/${course}/${id}`
        }
      ).catch((err) => console.log('11menting failure', err))
    } catch (err) {
      console.log('error', err)
    }
    try {
      await db.doc(`terms/${subject}/${course}/${id}`).update(
        {
          failed: 1
        }
      ).catch((err) => console.log('incrementing failure', err))
    } catch (err) {
      console.log('error', err)
    }
   
  }

  toggleEditing = async () => {
    this.setState({ editing: !this.state.editing, rotate: true })
  }

  updateCardInDb = async (term, explanation) => {
    if (!explanation && !term) {
      return
    }
    const id = this.state.cards[this.state.index].id

    const subject = 'chemistry'
    if (explanation && term) {
      await db.doc(`terms/${subject}/${this.state.course}/${id}`).set(
        {
          term: term,
          explanation: explanation
        },
        { merge: true }
      ).catch((err) => console.log('error update failure'))
    }
    if (explanation && !term) {
      await db.doc(`terms/${subject}/${this.state.course}/${id}`).set(
        {
          explanation: explanation
        },
        { merge: true }
      ).catch((err) => console.log('error update failure'))
    }
    if (!explanation && term) {
      await db.doc(`terms/${subject}/${this.state.course}/${id}`).set(
        {
          term: term,
        },
        { merge: true }
      ).catch((err) => console.log('error update failure'))
    }
  }



  _handleKeyDown = (event) => {
    const UP_KEY = 38
    const ARROW_RIGHT_KEY = 39
    const SHIFT_KEY = 16
    const SLASH_KEY = 191 // EN
    const SLASH_KEY_FIN = 189 // EN

    const ENTER = 13 // EN

    switch (event.keyCode) {
      case UP_KEY:
        this.rotateImage()
        break;
      case ARROW_RIGHT_KEY:
        this.updateCard()
        break;
      case SLASH_KEY:
        this.toggleEditing()
        break;
      case SLASH_KEY_FIN:
        this.toggleEditing()
        break;
      case SHIFT_KEY:
        console.log("setting card failed")
        this.setFailed()

      case ENTER:
        console.log("setting card OK")
        this.setOK()

        break;
      default:
        break;
    }
  }


  getRandomCard(currentCards) {
    var randomIndex = Math.floor(Math.random() * currentCards.length);
    var card = currentCards[randomIndex];
    if (card === this.state.currentCard) {
      this.getRandomCard(currentCards)
    }

    return (card);
  }

  updateCard() {
    if (this.state.index + 1 > this.state.cards.length) {
      alert('All done')
    } else {

      this.setState({

        index: this.state.index + 1,
        rotate: false
      })
    }
  }

  rotateImage() {

    this.setState({
      rotate: !this.state.rotate
    })
  }
  render() {
    const { loading, cards, index } = this.state

    const currentCard = cards[index]
    const { isLoggingOut, logoutError } = this.props;

    return (
      <div>
        {loading ?
          <h1>Ladataan...</h1> :
          <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <h3>{`
              Kortti: ${index}/${cards.length},
              Audio: ${currentCard.audio.exists},
              Osattu: ${Boolean(currentCard.failed)}
              `}</h3>
            </div>
            <div style={{

            }}>
              <div className="cardRow">
                <Card
                  editing={this.state.editing}
                  updateCardInDb={(term, exp) => this.updateCardInDb(term, exp)}
                  toggleEditing={this.toggleEditing}
                  id={currentCard.id}
                  rotate={this.state.rotate}
                  term={currentCard.term}
                  explanation={currentCard.explanation}
                  course={currentCard.course}
                  subject={'chemistry'}
                  myFirebase={myFirebase}
                  photo={currentCard.media}
                  db={null}
                />
              </div>
              <div className="buttonRow">

                <DrawButton drawCard={this.updateCard} rotateImage={this.rotateImage} />
                <p>Ohje: / = editoi,
                  shift = ei onnistunut
                  Ylös = Käännä
                  Oikealle = Uusi kortti</p>
              </div>
            </div>
          </div>
        }
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
export default connect(mapStateToProps)(Chemistry);
