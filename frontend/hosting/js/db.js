import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "./firebase.js";

const db = getFirestore(app);

export async function getDocument(collection, document) {
    let data = {};
    try {
        const docRef = doc(db, `${collection}/${document}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            data = docSnap.data();
        }
    } catch (e) {}
    return data;
}

export async function setDocument(collection, document, data) {
    try {
        const docRef = doc(db, `${collection}/${document}`);
        await setDoc(docRef, data, {merge: true});
    } catch (e) {}
    return data;
}
