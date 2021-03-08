import React from 'react';
import './Card.css';
import MicRecorder from 'mic-recorder-to-mp3';
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import Button from "@material-ui/core/Button";


const Mp3Recorder = new MicRecorder({ bitRate: 128 });


class Card extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRecording: false,
            blobURL: '',
            isBlocked: false,
            audioDetails: {
                url: null,
                blob: null,
                chunks: null,
                photoUrl: "",
                duration: {
                    h: null,
                    m: null,
                    s: null,
                }
            },
            edit: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeExplantion = this.handleChangeExplantion.bind(this);
        this.setAudioPath = this.setAudioPath.bind(this)
        this.setPhotoPath = this.setPhotoPath.bind(this)
        this.getImage = this.getImage.bind(this)
    }

    componentDidMount() {
        navigator.getUserMedia({ audio: true },
            () => {
                this.setState({ isBlocked: false });
            },
            () => {
                this.setState({ isBlocked: true })
            },
        );
        this.getImage()
    }
    componentDidUpdate(prevProps) {

        if (this.props.term !== prevProps.term) {
            this.getImage()

            this.setState({ term: this.props.term })
        }
    }

    getImage() {

        if (this.props.photo.picture) {
            this.props.myFirebase
                .storage()
                .ref(this.props.photo.picture)
                .getDownloadURL()
                .then((url) => {
                    this.setState({ photoUrl: url });
                })
                .catch((err) =>
                    console.log('eer', err)
                );
        } else {
            this.setState({ photoUrl: "" });
        }


    }
    handleAudioStop(data) {
        console.log(data)
        this.setState({ audioDetails: data });
    }

    handleAudioUpload(file) {
        console.log(file);
    }

    handleAudioStop(data) {
        this.setState({ audioDetails: data });
    }

    handleRest() {
        const reset = {
            url: null,
            blob: null,
            chunks: null,
            duration: {
                h: null,
                m: null,
                s: null,
            }
        }
        this.setState({ audioDetails: reset });
    }
    handleChange(event) {
        console.log('event', event.target.value)
        this.setState({ term: event.target.value });
    }
    handleChangeExplantion(event) {
        console.log('event', event.target.value)
        this.setState({ explanation: event.target.value });
    }
    start = () => {
        if (this.state.isBlocked) {
            console.log('Permission Denied');
        } else {
            Mp3Recorder
                .start()
                .then(() => {
                    this.setState({ isRecording: true });
                }).catch((e) => console.error(e));
        }
    };
    setPhotoPath = async (path) => {
        await this.props.db.doc(`terms/${this.props.subject}/${this.props.course}/${this.props.id}`).set(
            {
                media: {
                    picture: path,
                },
            },
            { merge: true }
        ).catch((err) => console.log('error update failure'))
    }
    setAudioPath = async (path) => {
        console.log('setting audio', `terms/${this.props.subject}/${this.props.course}/${this.props.id}`)
        await this.props.db.doc(`terms/${this.props.subject}/${this.props.course}/${this.props.id}`).set(
            {
                audio: {
                    exists: true,
                    filename: path
                },
            },
            { merge: true }
        ).catch((err) => console.log('error update failure'))
    }
    stop = () => {
        Mp3Recorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
                const url = URL.createObjectURL(blob)
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = `${this.props.id}.wav`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.setState({ blobURL: url, isRecording: false });

                const photoUrl = `/audio/${this.props.subject}/${this.props.course}/${this.props.id}.wav`;
                const ref = this.props.myFirebase.storage().ref(photoUrl);
                this.setAudioPath(photoUrl)
                ref
                    .put(blob)
                    .then(() => {
                        console.log('File saved')
                    })
                    .catch((err) => console.log("err", err));
            }).catch((e) => console.log(e));
    };

    handleCapture = async ({ target }) => {
        const photoUrl = `/images/${this.props.subject}/${this.props.course}/${this.props.id}.jpg`;
        const ref = this.props.myFirebase.storage().ref(photoUrl);
        ref
            .put(target.files[0])
            .then(() => {
                this.setPhotoPath(photoUrl)
            })
            .catch((err) => console.log("err", err));
    };

    render() {
        return (
            <div className="card-container">
                <div className="card" style={{ transform: this.props.rotate ? 'rotateY(180deg)' : "" }}>
                    <div className="front">
                        {this.state.photoUrl && <img style={{
                            width: "55%",
                            height: "auto"
                        }} src={this.state.photoUrl} alt={'tile.title'} />}

                        <div style={this.state.photoUrl ? { paddingTop: "1%" } : { paddingTop: "40%" }} className="eng">{this.props.term}</div>
                    </div>
                    <div className="front back">
                        <button style={{ marginTop: 10 }} onClick={() => this.props.toggleEditing()}>Editoi</button>

                        {this.props.editing ?
                            <div style={{ display: 'grid', padding: 10, }}>
                                <input value={this.state.term} onChange={this.handleChange} />
                                <textarea name="Text1" cols="40" rows="5" onChange={this.handleChangeExplantion} defaultValue={this.props.explanation} />
                            </div> : <div className="han">{this.props.explanation}</div>}
                        {this.props.editing &&
                            <div >
                                <button style={{ marginTop: 10 }} onClick={() => this.props.updateCardInDb(this.state.term, this.state.explanation)}>Lähetä</button>
                                <div style={{ display: 'grid' }}>

                                    <Button
                                        variant="contained"
                                        component="label"
                                        color="primary"
                                        style={{
                                            marginTop: "20px",
                                        }}
                                        onClick={this.start} disabled={this.state.isRecording}
                                    >

                                        Äänitä
                                        </Button>

                                    <Button
                                        variant="contained"
                                        component="label"
                                        color="primary"
                                        style={{
                                            marginTop: "20px",
                                        }}
                                        onClick={this.stop} disabled={!this.state.isRecording}
                                    >

                                        Seis
                                        </Button>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        color="primary"
                                        style={{
                                            marginTop: "20px",
                                        }}
                                    >
                                        <PhotoCamera
                                            fontSize="large"
                                            style={{ color: "white", marginRight: 5 }}
                                            color="white"
                                        />

                                        <p className="whiteText">Lisää kuva</p>
                                        <input
                                            onChange={this.handleCapture}
                                            type="file"
                                            style={{ display: "none" }}
                                        />
                                    </Button>

                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}


export default Card