import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase.js"
import  * as auth from "./auth.js"

const db = getFirestore(app);

export async function getDefaultConfig() {
    try {
        const docRef = doc(db, "/configurations/default");
        const defaultConfig = await getDoc(docRef);
        if (defaultConfig.exists()) {
            return defaultConfig.data();
        }
        else {
            cosole.error("could not find default configuration.")
        }
    } catch (e) {
        console.log(`could not retrieve doc...`);
    }
}

export async function getUserConfig() {
    const userConfigDocRef = `/configurations/${auth.getCurrentUserId()}`;
    try {
        const docRef = doc(db, userConfigDocRef);
        const userConfig = await getDoc(docRef);
        if (userConfig.exists()) {
            return userConfig.data();
        } else {
            config = await getDefaultConfig();
            await setDoc(docRef, config, { merge: true });
            return config.data()
        }
    } catch (e) {
        console.log(`could not retrive user config.. ${e}`);
    }
}

export async function updateUserConfig(config) {
    const userConfigDocRef = `/configurations/${auth.getCurrentUserId()}`;
    try {
        const docRef = doc(db, userConfigDocRef);
        await setDoc(docRef, config, { merge: true });
    } catch (e) {
        console.log(`could not update user config.. ${e}`);
    }
}


