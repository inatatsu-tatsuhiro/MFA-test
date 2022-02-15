import "./App.css";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  RecaptchaVerifier,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  PhoneMultiFactorGenerator,
  PhoneAuthProvider,
  multiFactor
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

  useEffect(() => {
    // onAuthStateChanged((authInfo) => {
    //   // eslint-disable-next-line no-extra-boolean-cast
    //   if (!!authInfo) {
    //     console.log('auth', authInfo)
    //   }
    // })
  }, [])

  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null)
  const [email, setEmail] = useState("")
  const [vid, setVid] = useState('')
  const [mfu, setMfu] = useState('')
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState(null)

  useEffect(() => {
    configureCaptcha()
  }, [])

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
    // console.log('sign-up')
    // configureCaptcha()
    // const password = 'Test0000'
    // createUserWithEmailAndPassword(auth, email, password).then((userCredentials) => {
    //   sendEmailVerification(userCredentials.user).then(() => {
    //     console.log('success')
    //   })
    // })
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      // const user = result.user;
      setUser(result.user)
      console.log('token', token)
      console.log('email', result.user.email)
    })
  }

  const twoFactorMethod = () => {
    console.log('2 factor auth')
    const appVerifier = recaptchaVerifier;
    console.log('user', user)
    const mfu = multiFactor(user)
    mfu.getSession().then((mfs) => {
      const phoneNumber = "+819062051676";
      console.log('mfs', mfs)
      const option = {
        phoneNumber: phoneNumber,
        session: mfs
      }
      const pap = new PhoneAuthProvider(auth)
      console.log('pap', pap)
      console.log('ver', appVerifier)
      pap.verifyPhoneNumber(option, appVerifier).then((verificationId) => {
        console.log('verId', verificationId)
        setVid(verificationId)
        setMfu(mfu)
      }).catch((e) => {
        console.log('errr', e)
      })
    }).catch((e) => {
      console.log('err', e)
    })
  }

  const onSubmitOTP = () => {
    const code = otp;
    console.log(code);
    const credential = PhoneAuthProvider.credential(vid, code)
    console.log('credential', credential)
    console.log('user', user)
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
    mfu.enroll(multiFactorAssertion).then(() => {
      console.log('enroll')
    }).catch(() => {
      console.log('error')
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
      <h2>アカウント2段階設定</h2>
      <button onClick={twoFactorMethod}>SETUP</button>
      
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