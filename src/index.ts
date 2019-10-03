import mongoose from "mongoose";
export { mongoose };

export const debug = require('debug')('@colyseus/social');

export type ObjectId = string | mongoose.Schema.Types.ObjectId;

// grant providers: https://github.com/simov/grant/blob/master/config/oauth.json
export type OAuthProvider = '23andme' | '500px' | 'acton' | 'acuityscheduling' | 'aha' | 'amazon' | 'angellist' | 'arcgis' | 'asana' | 'assembla' | 'atlassian' | 'auth0' | 'authentiq' | 'aweber' | 'axosoft' | 'baidu' | 'basecamp' | 'battlenet' | 'beatport' | 'bitbucket' | 'bitly' | 'box' | 'buffer' | 'campaignmonitor' | 'cheddar' | 'clio' | 'coinbase' | 'concur' | 'constantcontact' | 'coursera' | 'dailymotion' | 'deezer' | 'delivery' | 'deputy' | 'deviantart' | 'digitalocean' | 'discogs' | 'discord' | 'disqus' | 'docusign' | 'dribbble' | 'dropbox' | 'ebay' | 'echosign' | 'ecwid' | 'edmodo' | 'egnyte' | 'etsy' | 'eventbrite' | 'evernote' | 'eyeem' | 'facebook' | 'familysearch' | 'feedly' | 'fitbit' | 'fitbit2' | 'flattr' | 'flickr' | 'flowdock' | 'formstack' | 'foursquare' | 'freeagent' | 'freelancer' | 'freshbooks' | 'geeklist' | 'genius' | 'getbase' | 'getpocket' | 'gitbook' | 'github' | 'gitlab' | 'gitter' | 'goodreads' | 'google' | 'groove' | 'gumroad' | 'harvest' | 'hellosign' | 'heroku' | 'homeaway' | 'hootsuite' | 'ibm' | 'iconfinder' | 'idme' | 'idonethis' | 'imgur' | 'infusionsoft' | 'instagram' | 'intuit' | 'jamendo' | 'jumplead' | 'kakao' | 'linkedin' | 'linkedin2' | 'live' | 'lyft' | 'mailchimp' | 'mailup' | 'mailxpert' | 'mapmyfitness' | 'mastodon' | 'medium' | 'meetup' | 'mention' | 'microsoft' | 'mixcloud' | 'mixer' | 'moxtra' | 'myob' | 'naver' | 'nest' | 'nokotime' | 'nylas' | 'okta' | 'onelogin' | 'openstreetmap' | 'optimizely' | 'patreon' | 'paypal' | 'phantauth' | 'pinterest' | 'plurk' | 'podio' | 'producthunt' | 'projectplace' | 'projectplace2' | 'pushbullet' | 'qq' | 'ravelry' | 'redbooth' | 'reddit' | 'runkeeper' | 'salesforce' | 'shoeboxed' | 'shopify' | 'skyrock' | 'slack' | 'slice' | 'smartsheet' | 'smugmug' | 'snapchat' | 'socialpilot' | 'socrata' | 'soundcloud' | 'spotify' | 'square' | 'stackexchange' | 'stocktwits' | 'stormz' | 'strava' | 'stripe' | 'surveygizmo' | 'surveymonkey' | 'thingiverse' | 'ticketbud' | 'timelyapp' | 'todoist' | 'trakt' | 'traxo' | 'trello' | 'tripit' | 'tumblr' | 'twitch' | 'twitter' | 'typeform' | 'uber' | 'underarmour' | 'unsplash' | 'upwork' | 'uservoice' | 'vend' | 'venmo' | 'verticalresponse' | 'viadeo' | 'vimeo' | 'visualstudio' | 'vk' | 'wechat' | 'weekdone' | 'weibo' | 'withings' | 'wordpress' | 'wrike' | 'xero' | 'xing' | 'yahoo' | 'yammer' | 'yandex' | 'zendesk' | 'zoom';
export type AuthProvider = 'email' | 'anonymous' | OAuthProvider;

export { connectDatabase } from "./database";

export { User, IUser } from "./models/User";
export { FriendRequest, IFriendRequest } from "./models/FriendRequest";

export {
    pingUser,
    authenticate,
    updateUser,
    assignDeviceToUser,
    getOnlineUserCount,
    sendFriendRequest,
    consumeFriendRequest,
    blockUser,
    unblockUser,
    getFriendRequests,
    getFriendRequestsProfile,
    getFriends,
    getOnlineFriends
} from "./user";

export { verifyToken } from "./auth";
export { hooks } from "./hooks";