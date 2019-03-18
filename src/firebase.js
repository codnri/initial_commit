import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
  apiKey: "AIzaSyD36tETc4um_coIsI4r60QtBUFNEtBGFB0",
  authDomain: "uchi-bodo.firebaseapp.com",
  databaseURL: "https://uchi-bodo.firebaseio.com",
  projectId: "uchi-bodo",
  storageBucket: "uchi-bodo.appspot.com",
  messagingSenderId: "245907725689"
};

firebase.initializeApp(config);

// export default firebase;

//const database = firebase.database();

export default firebase;

//export { firebase as default, database };

// export default (!firebase.apps.length
//   ? firebase.initializeApp(config).firestore()
//   : firebase.app().firestore());
