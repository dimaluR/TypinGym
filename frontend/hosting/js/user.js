import  * as auth from "./auth.js"
import  * as db from "./db.js"

export async function getDefaultConfig() {
    try {
        return await db.getDocument("configurations", "default");
    } catch (e) {
        console.error(`could not retrieve default configuration`);
    }
}

export async function getUserConfig() {
    const userId = auth.getCurrentUserId();
    let config = null;
    try {
        config = await db.getDocument("configurations", userId)
        if (!userId || !config) {
            config = await getDefaultConfig();
            await db.setDocument("configurations", userId)
        }
        return config
    } catch (e) {
        console.log(`could not retrive user config.. ${e}`);
    }
}

export async function updateUserConfig(config) {
    const userId = auth.getCurrentUserId();
    try {
        await db.setDocument("configurations", userId, config);
    } catch (e) {
        console.log(`could not update user config.. ${e}`);
    }
}


