import { get } from "httpie";

export async function getFacebookUser (accessToken: string) {
    const fields = 'id,name,short_name,friends,email,picture';

    const req = await get(`https://graph.facebook.com/me?fields=${fields}&access_token=${accessToken}`, {
        headers: { 'Accept': 'application/json' }
    });

    // TODO: paginate through user friends

    return req.data;
}