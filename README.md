# @colyseus/social

Node.js Authentication and friend list integration for games.

## Features

- Authenticate with Facebook
- Get list of user's friends
- Get list of user's online friends
- Friend requests (send, accept, decline)
- Block user

## Authentication Providers

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

Fair Source 20. (Free until you reach 20 users)
