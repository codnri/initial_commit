import React from "react";
import mime from "mime-types";
import uuid from "uuid";
import firebase from "../firebase";

class App extends React.Component {
  state = {
    file: null,
    uploadState: "",
    uploadTask: null,
    percentUploaded: 0,
    downloadUrl: "",
    errors: [],
    imageFiles: []
  };
  constructor(props) {
    super(props);
  }

  deleteFile = e => {
    let result = window.confirm("Want to delete?");
    if (result) {
      console.log(e.target.parentNode.id);
      const id = e.target.parentNode.id;
      this.removeFileFromStorage(id);
      // this.removeFileInfoFromDB(id);
    }
  };

  removeFileFromStorage = id => {
    firebase
      .storage()
      .ref()
      .child(`test/${id}.jpg`)
      .delete()
      .then(() => {
        this.removeFileInfoFromDB(id);
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err),
          uploadState: "error",
          uploadTask: null
        });
      });
  };
  removeFileInfoFromDB = id => {
    firebase
      .database()
      .ref(`imageFiles/${id}`)
      .remove()
      .then(() => {
        this.loadImageFiles();
      });
  };

  addFile = e => {
    const file = e.target.files[0]; //not e.target.value

    if (file) {
      this.setState({ file });
    }
  };

  sendFile = e => {
    const { file } = this.state;
    console.log(uuid());
    console.log("----file");
    console.log(mime.lookup(file.name));
    if (file !== null && this.isValidImageFile(file.name)) {
      console.log("----upload");
      const metadata = { contentType: mime.lookup(file.name) };

      this.uploadFile(file, metadata);
    }
  };

  isValidImageFile = filename =>
    ["image/jpeg", "image/png"].includes(mime.lookup(filename));

  uploadFile = (file, metadata) => {
    const ref = firebase.database().ref("imageFiles");

    const fileId = uuid();
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: firebase
          .storage()
          .ref()
          .child(`test/${fileId}.jpg`)
          .put(file, metadata)
      }, //↓callback after setState
      () => {
        this.state.uploadTask.on(
          "state_changed", //Completion observer, called on successful completion
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.saveFileInfoToDB(downloadUrl, fileId);
                this.setState({ downloadUrl });
              })
              .then(() => {
                this.loadImageFiles();
                this.setState({ file: null });
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  saveFileInfoToDB = (fileUrl, id) => {
    const fileInfo = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      imageUrl: fileUrl
    };
    firebase
      .database()
      .ref("imageFiles")
      .child(id)
      //.push()
      .set(fileInfo)
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      });
  };

  loadImageFiles = () => {
    return firebase
      .database()
      .ref("imageFiles")
      .once("value")
      .then(snapshot => {
        // console.log("snapshot", snapshot);

        const imageFiles = [];
        snapshot.forEach(childSnapshot => {
          console.log("childSnapshot");
          console.log(childSnapshot.val());
          imageFiles.push({
            ...childSnapshot.val(),
            id: childSnapshot.key
          });
          // console.log("startSetStocks events:", events);
        });
        this.setState({ imageFiles });
      });
  };

  componentDidMount() {
    this.loadImageFiles();
  }
  render() {
    const { file, percentUploaded, downloadUrl, imageFiles } = this.state;
    console.log(imageFiles);
    return (
      <div className="App">
        <h1>File Uploader</h1>

        <input
          type="file"
          onChange={this.addFile}
          name="file"
          label="File types: jpg, png"
        />
        <button onClick={this.sendFile}>Upload</button>
        {file && <h2>{percentUploaded}%</h2>}
        <hr />
        {imageFiles.map(imageFile => (
          <div id={imageFile.id}>
            <div>
              <img src={imageFile.imageUrl} alt="" key={imageFile.id} />
            </div>
            <button onClick={this.deleteFile}>del</button>
          </div>
        ))}
      </div>
    );
  }
}

export default App;
