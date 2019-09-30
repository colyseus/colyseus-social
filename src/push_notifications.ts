import fs from "fs";

import PushNotifications from 'node-pushnotifications';
import { ContentEncoding } from 'web-push';

import WebPushSubscription from './models/WebPushSubscription';

// web-push-demo: https://github.com/master-atul/web-push-demo
// comprehensive web-push guide: https://pusher.com/tutorials/push-notifications-node-service-workers

const settings = {
    // Google Cloud Messasing
    gcm: {
        id: null,
        phonegap: false, // phonegap compatibility mode, see below (defaults to false)
        // ...
    },

    // Apple Push Notification
    apn: {
        token: {
            key: './certs/key.p8', // optionally: fs.readFileSync('./certs/key.p8')
            keyId: 'ABCD',
            teamId: 'EFGH',
        },
        production: false // true for APN production environment, false for APN sandbox environment,
        // ...
    },

    // Web Push Notifications
    web: {
        vapidDetails: {
            subject: process.env.WEBPUSH_SUBJECT, // '< \'mailto\' Address or URL >'
            publicKey: process.env.WEBPUSH_PUBLIC_KEY, // '< URL Safe Base64 Encoded Public Key >'
            privateKey: process.env.WEBPUSH_PRIVATE_KEY, // '< URL Safe Base64 Encoded Private Key >'
        },
        gcmAPIKey: 'gcmkey',
        TTL: 2419200,
        contentEncoding: 'aes128gcm' as ContentEncoding,
        headers: {}
    },

    isAlwaysUseFCM: false, // true all messages will be sent through node-gcm (which actually uses FCM)

    // Amazon Device Messaging
    // adm: {
    //     client_id: null,
    //     client_secret: null,
    //     // ...
    // },
    // Windows Push Notification
    // wns: {
    //     client_id: null,
    //     client_secret: null,
    //     notificationMethod: 'sendTileSquareBlock',
    //     // ...
    // },
};


const push = new PushNotifications(settings);

export async function sendNotification(
    data: PushNotifications.Data,
    registrationIds?: PushNotifications.RegistrationId | PushNotifications.RegistrationId[]
) {
    if (!registrationIds) {
        registrationIds = await WebPushSubscription.find({});
    }

    const results = await push.send(registrationIds, data);

    let success: number = 0;
    let failure: number = 0;

    for (let i=0; i<results.length; i++) {
        success += results[i].success;
        failure += results[i].failure;

        if (results[i].method === "webPush" && results[i].failure > 0) {
            const keysFailed = results[i].message.
                filter(message => message.error).
                map(message => {
                    console.error("PUSH ERROR: " + message.error);
                    return (message.regId as any).keys.p256dh
                });

            await WebPushSubscription.deleteMany({
                'keys.p256dh': { $in: keysFailed }
            });
        }
    }

    return { success, failure };

    // const data = {
    //     title: 'New push notification', // REQUIRED for Android
    //     topic: 'topic', // REQUIRED for iOS (apn and gcm)
    //     /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
    //      * When using certificate-based authentication, the topic is usually your app's bundle ID.
    //      * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
    //      */
    //     body: 'Powered by AppFeel',
    //     custom: {
    //         sender: 'AppFeel',
    //     },
    //     priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
    //     collapseKey: '', // gcm for android, used as collapseId in apn
    //     contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
    //     delayWhileIdle: true, // gcm for android
    //     restrictedPackageName: '', // gcm for android
    //     dryRun: false, // gcm for android
    //     icon: '', // gcm for android
    //     tag: '', // gcm for android
    //     color: '', // gcm for android
    //     clickAction: '', // gcm for android. In ios, category will be used if not supplied
    //     locKey: '', // gcm, apn
    //     locArgs: '', // gcm, apn
    //     titleLocKey: '', // gcm, apn
    //     titleLocArgs: '', // gcm, apn
    //     retries: 1, // gcm, apn
    //     encoding: '', // apn
    //     badge: 2, // gcm for ios, apn
    //     sound: 'ping.aiff', // gcm, apn
    //     alert: { // apn, will take precedence over title and body
    //         title: 'title',
    //         body: 'body'
    //         // details: https://github.com/node-apn/node-apn/blob/master/doc/notification.markdown#convenience-setters
    //     },
    //     /*
    //      * A string is also accepted as a payload for alert
    //      * Your notification won't appear on ios if alert is empty object
    //      * If alert is an empty string the regular 'title' and 'body' will show in Notification
    //      */
    //     // alert: '',
    //     launchImage: '', // apn and gcm for ios
    //     action: '', // apn and gcm for ios
    //     category: '', // apn and gcm for ios
    //     // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
    //     // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
    //     urlArgs: '', // apn and gcm for ios
    //     truncateAtWordEnd: true, // apn and gcm for ios
    //     mutableContent: 0, // apn
    //     threadId: '', // apn
    //     expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
    //     timeToLive: 28 * 86400, // if both expiry and timeToLive are given, expiry will take precedency
    //     headers: [], // wns
    //     launch: '', // wns
    //     duration: '', // wns
    //     consolidationKey: 'my notification', // ADM
    // };

}

export const ServiceWorkerScript = fs.readFileSync(__dirname + "/webpush_register.js").toString();