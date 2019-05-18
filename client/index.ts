/**
 * Browser / React Native
 */

import { get, post, put, del } from "httpie";

interface ConfigOptions {
    endpoint: string;
    token: string;
}

const config: Partial<ConfigOptions> = {};

function checkToken() {
    if (!config.token) {
        throw new Error("missing token. need to login first.");
    }
}

export function configure(options: ConfigOptions) {
    for (let k in options) {
        config[k] = options[k];
    }
}

export async function login (options: {
    accessToken?: string,
    deviceId?: string,
    platform?: string,
    email?: string,
    password?: string,
}) {
    const queryParams: string[] = [];
    for (const name in options) {
        queryParams.push(`${name}=${options[name]}`);
    }

    if (config.token) {
        queryParams.push(`token=${config.token}`);
    }

    const response = await post(`${config.endpoint}/login?${queryParams.join("&")}`, {
        headers: { 'Accept': 'application/json' }
    });

    const token = response.data.token;
    config.token = token;

    // TODO: cache token on localStorage

    return response.data;
}

export async function getFriends() {
    checkToken();
    return (await get(`${config.endpoint}/friends`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data;
}

export async function getOnlineFriends() {
    checkToken();
    return (await get(`${config.endpoint}/online_friends`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data;
}

export async function getFriendRequests(friendId: string) {
    checkToken();
    return (await get(`${config.endpoint}/friend_requests`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function sendFriendRequest(friendId: string) {
    checkToken();
    return (await post(`${config.endpoint}/friend_requests?userId=${friendId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function acceptFriendRequest(friendId: string) {
    checkToken();
    return (await put(`${config.endpoint}/friend_requests?userId=${friendId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function declineFriendRequest(friendId: string) {
    checkToken();
    return (await del(`${config.endpoint}/friend_requests?userId=${friendId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function blockUser(friendId: string) {
    checkToken();
    return (await post(`${config.endpoint}/block?userId=${friendId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function unblockUser(friendId: string) {
    checkToken();
    return (await put(`${config.endpoint}/block?userId=${friendId}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + config.token
        }
    })).data;
}

export async function logout() {
    config.token = undefined;
}