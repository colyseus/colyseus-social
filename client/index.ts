/**
 * Browser / React Native
 */

import { get } from "httpie";

interface ConfigOptions {
    endpoint: string;
    token: string;
}

const config: Partial<ConfigOptions> = {};

export function configure(options: ConfigOptions) {
    for (let k in options) {
        config[k] = options[k];
    }
}

export async function facebookAuth (accessToken: string) {
    const response = await get(`${config.endpoint}/facebook?accessToken=${accessToken}`, {
        headers: { 'Accept': 'application/json' }
    });

    const token = response.data.token;
    config.token = token;

    // TODO: cache token on localStorage

    return response.data;
}

export async function getFriends() {
    return (await get(`${config.endpoint}/friends`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data
}

export async function getOnlineFriends() {
    return (await get(`${config.endpoint}/online_friends`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data
}

export async function sendFriendRequest(friendId: string) {
    return (await get(`${config.endpoint}/friend_request?userId=${friendId}`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data
}

export async function logout() {
    return (await get(`${config.endpoint}/logout`, {
        headers: { 'Accept': 'application/json' , 'Authorization': 'Bearer ' + config.token }
    })).data
}