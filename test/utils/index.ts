import fs from "fs";
import request from "phin";
import User, { IUser } from "../../src/models/User";
import { facebookAuth } from "../../src";

const FB_TEST_APP_ID = '353169041992501';
const FB_TEST_APP_TOKEN = '353169041992501|8d17708d062493030db44dd687b73e97';

export async function login(user: IUser) {
    user.online = true;
    return await user.save();
}

export async function resetTestUsers() {
    return await User.deleteMany({});
}

export async function createFBTestUser() {
}

export async function getTestUsersAccessTokens() {
    const response: any = (await request({
        url: `https://graph.facebook.com/v3.3/${FB_TEST_APP_ID}/accounts/test-users?access_token=${FB_TEST_APP_TOKEN}`,
        parse: 'json'
    })).body;

    return response.data.map(entry => entry.access_token);
}

export async function createFacebookTestUsers () {
    const testAccessTokens = await getTestUsersAccessTokens();

    await Promise.all(testAccessTokens.map((accessToken) => {
        return facebookAuth(accessToken);
    }));
}
