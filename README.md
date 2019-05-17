# @colyseus/social

Node.js Authentication and friend list integration for games.

> This project is not open-source. See [License](#License).

## Features

- Authenticate with Facebook
- Get list of user's friends
- Get list of user's online friends
- Friend requests (send, accept, decline)
- Block user

## Authentication Providers

- Anonymous
- Facebook
- Twitter [?]

## Environment Variables

- `MONGO_URI`: MongoDB connection URI
- `JWT_SECRET`: Secure secret string for authentication.

### For Facebook:

- `FACEBOOK_APP_TOKEN`: Facebook App Token (`"appid|appsecret"`)

### For Twitter:

- `TWITTER_CONSUMER_KEY`: App key
- `TWITTER_CONSUMER_SECRET`: App secret key

### For Push Notifications

- `WEBPUSH_SUBJECT` - mailto: or URL.
- `WEBPUSH_PUBLIC_KEY` - VAPID Public Key
- `WEBPUSH_PRIVATE_KEY` - VAPID Private Key

You can generate VAIPD keys using `npx web-push generate-vapid-keys`

## Integration with your Node.js Web Framework

### Express

```typescript
import express from "express";
import socialRoutes from "@colyseus/social/routes/express"

const app = express();
app.use("/", socialRoutes);

app.listen(8080);
```

## TODO's

- Friend request notification (https://github.com/appfeel/node-pushnotifications)
    - On mobile
    - In the browser

## License

[Fair Source 100](LICENSE). If you reach 100+ users, please pledge an amount
you think its fair to my Patreon page:

<a href="https://patreon.com/endel"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fendel&style=for-the-badge" /></a>
