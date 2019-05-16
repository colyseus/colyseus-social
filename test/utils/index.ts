import { get } from "httpie";
import User, { IUser } from "../../src/models/User";
import { authenticate, ObjectId } from "../../src";
import FriendRequest from "../../src/models/FriendRequest";

const FB_TEST_APP_ID = '353169041992501';
const FB_TEST_APP_TOKEN = '353169041992501|8d17708d062493030db44dd687b73e97';

export async function login(user: IUser) {
    return await user.save();
}

export async function clearTestUsers() {
    return await User.deleteMany({});
}

export async function clearFriendRequests() {
    return await FriendRequest.deleteMany({});
}

let cachedAccessTokens: string[];
export async function getTestUsersAccessTokens() {
    if (!cachedAccessTokens) {
        const res = (await get(`https://graph.facebook.com/v3.3/${FB_TEST_APP_ID}/accounts/test-users?access_token=${FB_TEST_APP_TOKEN}`, {
            headers: { 'Accept': 'application/json' }
        }));

        const response = res.data;

        if (response.error) {
            throw new Error(response.error.message);
        }

        cachedAccessTokens = response.data.map(entry => entry.access_token);
    }

    return cachedAccessTokens;
}

let cachedTestUsers: IUser[];
export async function createFacebookTestUsers () {
    if (!cachedTestUsers) {
        const accessTokens = await getTestUsersAccessTokens();
        cachedTestUsers = await Promise.all(accessTokens.map((accessToken) => {
            return authenticate({ accessToken });
        }));
    }

    return cachedTestUsers;
}

export function includes(arr: ObjectId[], targetId: ObjectId) {
    return arr.filter((id: ObjectId) => id.toString() === targetId.toString()).length > 0;
}
