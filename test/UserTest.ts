import mongoose from "mongoose";

import { connect, getOnlineFriends } from "../src";
import User, { IUser } from "../src/models/User";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        const conn = await connect();
        // conn.db.dropDatabase();

        const jake = await User.create({ username: "Jake", displayName: "Jake" });
        const snake = await User.create({ username: "Snake", displayName: "Jake" }).then();

        jake.friends = [snake._id];
        await jake.save();

        snake.friends = [jake._id];
        await snake.save();
    });

    after(async () => {
        mongoose.connection.close();
    });

    it("should create an user", async () => {
        const jake = await User.findOne({ username: "Jake" });
        console.log(getOnlineFriends(jake));

    });
})