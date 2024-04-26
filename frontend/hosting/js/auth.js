import { app } from "./firebase.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInUser() {
    signInWithPopup(auth, provider).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(`user failed to log-in with error ${errorCode}: ${errorMessage}.`);
    });
}

export function signOutUser() {
    signOut(auth);
}

export function getCurrentUserId() {
    if (!isUserSignedIn()) {
        return null;
    }
    return auth.currentUser.uid;
}

export function getCurrentUserDisplayName() {
    if (!isUserSignedIn()) {
        return null;
    }
    return auth.currentUser.displayName;
}

export function isUserSignedIn() {
    return auth.currentUser ? true : false
}

export function listenForAuthChanged(callback) {
    onAuthStateChanged(auth, async () => {
        callback()
    })

}
