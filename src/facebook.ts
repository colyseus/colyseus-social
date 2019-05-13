import request from "phin";

export async function getFacebookUser (accessToken: string) {
    const fields = 'id,name,short_name,friends,email,picture';

    const req = await request({
        url: `https://graph.facebook.com/me?fields=${fields}&access_token=${accessToken}`,
        parse: 'json'
    });

    // TODO: paginate through user friends

    return req.body;
}