import mongoose from "mongoose";

import { createConnection, getOnlineFriends } from "../src";
import User, { IUser } from "../src/models/User";

describe("User", () => {
    before(async () => {
        // connect & clear database.
        const conn = await createConnection();
        // conn.db.dropDatabase();

        console.log("Creating Jake");

        await User.create({ username: "Jake", displayName: "Jake" });

        // await User.create({ username: "Jake", displayName: "Jake" }).then(() => {
        //     console.log("CREATED")
        // }).catch((e) => {
        //     console.log("ERROR", e)
        // });

        // const jake = await User.create({ username: "Jake", displayName: "Jake" });

        // console.log("Creating Snake");
        // const snake = await User.create({ username: "Snake", displayName: "Jake" }).then();

        // jake.friends = [snake._id];
        // await jake.save();

        // snake.friends = [jake._id];
        // await snake.save();
    });

    after(async () => {
        mongoose.connection.close();
    });

    it("should create an user", async () => {
        const jake = await User.findOne({name: "Jake"});
        console.log(getOnlineFriends(jake));
        
    });
})