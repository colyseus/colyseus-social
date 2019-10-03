import { createSignal } from "strong-events";
import { ObjectId, IUser, AuthProvider, OAuthProvider } from ".";

export const hooks = {
    /**
     * Triggered before registering or authenticating a user.
     */
    beforeAuthenticate: createSignal<(provider: AuthProvider, $setOnInsert: Partial<IUser>, $set?: Partial<IUser>) => void>(),

    /**
     * Triggered before updating a user.
     */
    beforeUserUpdate: createSignal<(_id: ObjectId, fields: Partial<IUser>) => void>(),

    /**
     * Triggered after user accepts OAuth request
     */
    onOAuth: createSignal<(provider: OAuthProvider, data: any, raw: any) => void>()
}

// /**
//  * Default before update hook: `username` must be unique!
//  */
// hooks.beforeUserUpdate(async (_id, fields) => {
//     console.log("VALIDATE 'username'");
//     if (fields['username']) {
//         const found = await User.findOne({ username: fields['username'] }, { _id: 1 });

//         if (found && found._id !== _id) {
//             throw new Error("username taken");
//         }
//     }
// });