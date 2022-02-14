import "./App.css";
import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  RecaptchaVerifier,
  signOut,
  sendEmailVerification,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
initializeApp(firebaseConfig);

const auth = getAuth();


function App() {

  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null)
  const [email, setEmail] = useState("")

  const configureCaptcha = () => {
    const rec = new RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // onSignInSubmit();
          console.log("Recaptca varified", response);
        },
      },
      auth
    );
    setRecaptchaVerifier(rec)
  };

  const signUpMethod = () => {
    console.log('sign-up')
    configureCaptcha()
    const password = 'Test0000'
    createUserWithEmailAndPassword(auth, email, password).then((userCredentials) => {
      sendEmailVerification(userCredentials.user).then(() => {
        console.log('success')
      })
    })
  }

  const twoFactorMethod = () => {
    const provider = new OAuthProvider('microsoft.com');
    signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = OAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;

    console.log('token', token)
    console.log('email', user.email)

  })
  }

  const logOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("success");
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  };


  return (
    <div className="App">
      <div id="sign-in-button"></div>
      <h2>アカウント作成</h2>
      <input
        type="email"
        placeholder="Email"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={signUpMethod}>SIGNUP</button>
      <h2>Microsoft連携</h2>
      <button onClick={twoFactorMethod}>SETUP</button>

      <h2>ログアウト</h2>
      <button onClick={logOut}>Logout</button>
    </div>
  );
}

export default App;