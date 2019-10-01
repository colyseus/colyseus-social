import { get } from "httpie";

export async function facebook (grant: any) {
    const fields = 'id,name,short_name,friends,email,picture';

    const response = (await get(`https://graph.facebook.com/me?fields=${fields}&access_token=${grant.access_token}`, {
        headers: { 'Accept': 'application/json' }
    })).data;

    const data: any = {};
    data.id = response.id;
    data.avatarUrl = response.picture.data.url;
    data.username = `${response.short_name}${response.id}`;

    if (response.name) data.displayName = response.name;
    if (response.email) data.email = response.email;
    if (response.friends) {
        data.friendIds = response.friends.data.map(friend => friend.id);
    }

    return data;
}

export async function google () {
    // access_token: "ya29.Il-UB7IqSllFAfZ4yOmWG00ky9yTble8SlCND4-gyt_KTm8KWZzZ2NvQnN8W1DPbacnJZz8qTqUBjOcpg6Sr7eZD62--Nt1a8ZLhWZ_EfQnJMnba610ooBVmPIkdMwWyOg"
    // expires_in: 3600
    // id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhjNThlMTM4NjE0YmQ1ODc0MjE3MmJkNTA4MGQxOTdkMmIyZGQyZjMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNDAyNzIwOTQxMDM0LTM3NDh0N3FyYjloZGRqaXYwZjU1cmFldGNqZGFtZ25jLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNDAyNzIwOTQxMDM0LTM3NDh0N3FyYjloZGRqaXYwZjU1cmFldGNqZGFtZ25jLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyMTQ1NjExOTM3MDQ0MDU5MjMxIiwiYXRfaGFzaCI6IjJvQ05FNXdiUmVjZlkyMDNwOHRlekEiLCJub25jZSI6IjJkNzg1ZDg5YzFiYmIxNjQ0MDI1IiwiaWF0IjoxNTY5OTAxMTY5LCJleHAiOjE1Njk5MDQ3Njl9.HqipFr0CiL3pLP8BrBY0MZXVPqofv-UP4JpkQIqvGChiBXSx81ufm7QUyirNS0n1yg1r9Iy8loPK0RLzTV_HVzVb9Qd1OgBczRiHwEn4jq21rihkroeOmiIvJWUt_5CNo39WesqK_kDcmlCvcVXHxpou371heBjsdsI_XFrijfJXxdJ3bA_MFon1p8nzqj_KYWGTNSW5dDm26AZb1uPtUYVo1uh1tXi84YdyFq5xNv682nmhiXN6IlaqPmzTsOKIsup5yzNZ86xqTEyKso3xTdRlOTGxy7TX9JjwN9ceFF3ho64Aa-choD-U_LyZ6ec0Hm2WXJ8-ZGny0qI8VabILA"
    // refresh_token: "1/euuoqpnYxfSGntK5iBxcqPwsN-0Y3V_9Ld83UxRCXVw"
    // scope: "openid"
    // token_type: "Bearer"
}