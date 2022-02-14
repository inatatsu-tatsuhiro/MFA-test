import "./App.css";
import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signOut,
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  getMultiFactorResolver,
  PhoneMultiFactorGenerator,
  signInWithPhoneNumber
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

  const [mobile, setMobile] = useState("9062051676");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("Test0000");
  const [email, setEmail] = useState("tatsuhiro.9699+99@gmail.com");
  const [vid, setVid] = useState('')
  const [mfu, setMfu] = useState('')
  const [user, setUser] = useState('')
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null)

  const [resolver, setResolver] = useState(null)

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

  const signInMethod = () => {
    configureCaptcha()
    console.log('sign-in')
    console.log('auth', auth)
    signInWithEmailAndPassword(auth, email, password).then((cred) => {
      setUser(cred.user)
    }).catch((e) => {
      const resolver = getMultiFactorResolver(auth, e)
      const appVerifier = recaptchaVerifier;
      setResolver(resolver)

      const phoneOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session,
      };
      const pap = new PhoneAuthProvider(auth)
      console.log(pap.verifyPhoneNumber)
      pap.verifyPhoneNumber(
        phoneOptions,
        appVerifier
      ).then((verificationId) => {
        setVid(verificationId)
        // store verificationID and show UI to let user enter verification code.
      }).catch(e => {
        console.log('e', e)
      })
    })
  }


  const onSubmitOTP = () => {
    const code = otp;
    console.log(code);
    const credential = PhoneAuthProvider.credential(vid, code)
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
    resolver.resolveSignIn(multiFactorAssertion).then(function(userCredential) {
      // User signed in.
      console.log('user', userCredential)
    });
  };
    
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
      <input
        type="password"
        placeholder="PassWord"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signInMethod}>SIGNUP</button>
      <h2>アカウント2段階確認</h2>
      <input
        type="number"
        name="otp"
        placeholder="OTP Number"
        required
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={onSubmitOTP}>OK</button>
      <h2>ログアウト</h2>
      <button onClick={logOut}>Logout</button>
    </div>
  );
}

export default App;