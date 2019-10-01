import { hooks, authenticate, updateUser, connectDatabase } from "../src";
import assert from "assert";

describe("User: hooks", () => {
    before(async () => {
        // connect to database.
        await connectDatabase();
    });

    afterEach(() => {
        // clear all hooks after testing.
        hooks.beforeAuthenticate.clear();
        hooks.beforeUserUpdate.clear();
    });

    it("should call beforeAuthenticate", async () => {
        let callCount = 1;

        hooks.beforeAuthenticate((provider, $setOnInsert, $set) => {
            assert.equal("email", provider);
        });

        await authenticate({ email: "hello@world.com", password: "12345" });

        assert.equal(1, callCount);
    });

    it("should call beforeUserUpdate", async () => {
        hooks.beforeUserUpdate((_id, fields) => {
            if (fields['username'] === "bad word!") {
                throw new Error("bad words not accepted!");
            }
        });

        const user = await authenticate({ email: "hello@world.com", password: "12345" });

        assert.rejects(async () => {
            await updateUser(user._id, { 'username': "bad word!" });
        }, /not accepted/);
    });

});
