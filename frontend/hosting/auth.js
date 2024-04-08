import { GoogleAuthProvider, getAuth, getRedirectResult, initializeAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect } from "firebase/auth";
function authUser(app) {
    const auth = getAuth(app);

    const provider = new GoogleAuthProvider();
    console.log(`auth provider ${provider}`);
    console.log(`current user: ${auth.currentUser}`);
    signInWithPopup(auth, provider)
        .then((result) => {
            const credentials = GoogleAuthProvider.credentialFromResult(result);
            const token = credentials.accessToken;
            const user = result.user;
            console.log(`user: ${user.displayName} signed in successfully`);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credentials = GoogleAuthProvider.credentialFromError(error);
            console.log(`user: ${email} failed to log-in with error ${errorCode}: ${errorMessage}.`);
        });
}

export {authUser}
