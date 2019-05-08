import mongoose from "mongoose";

import { connect, getOnlineFriends } from "../src";
import User, { IUser } from "../src/models/User";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        await connect();
        mongoose.connection.db.dropDatabase();

        const jake = await User.create({ username: "Jake", displayName: "Jake" });
        const snake = await User.create({ username: "Snake", displayName: "Snake" }).then();

        jake.friendIDs = [snake._id];
        await jake.save();

        snake.friendIDs = [jake._id];
        await snake.save();
    });

    after(async () => {
        mongoose.connection.close();
    });

    it("should create an user", async () => {
        const jake = await User.findOne({ username: "Jake" });
        const friends = await getOnlineFriends(jake);
        console.log(friends);

    });
})