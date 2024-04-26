import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
    apiKey: "AIzaSyDJ8Kx6f_f6uHFwhTRLA3fGKG_QGjN4ESE",
    authDomain: "typingym.com",
    projectId: "typingym-85269",
    storageBucket: "typingym-85269.appspot.com",
    messagingSenderId: "417546758951",
    appId: "1:417546758951:web:3f8a3251556dde83299702",
    measurementId: "G-FNMEX2KZFC",
};

export const app = initializeApp(firebaseConfig);

if (import.meta.env.VITE_ENV === "dev") {
    // allow auth withount app-check in development environment.
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LeGhLopAAAAAE_rEJEOifZRjMAsJN87WY_bh5sb"),
    isTokenAuthRefreshEnabled: true,
});

