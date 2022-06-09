import { assert } from "chai";
import * as sinon from "sinon";
import { ClientError, ConnectionError, MessageError } from "../client/errors";
import { assertErrorChain, fakeConnection } from "../helpers.spec";
import { announce, AnnouncementError } from "./announce";

describe("./operations/announce", function () {
  describe("AnnouncementError", function () {
    it("should not be instanceof ConnectionError", function () {
      assert.notInstanceOf(
        new AnnouncementError("notkarar", "test"),
        ConnectionError
      );
    });
    it("should not be instanceof ClientError", function () {
      assert.notInstanceOf(
        new AnnouncementError("notkarar", "test"),
        ClientError
      );
    });
  });

  describe("#announce()", function () {
    it("should send the correct wire command", async function () {
      sinon.useFakeTimers();
      const { client, data } = fakeConnection();

      announce(client, "notkarar", "test");

      assert.deepStrictEqual(data, ["PRIVMSG #notkarar :/announce test\r\n"]);
    });

    it('should resolve on incoming msg_id="announcement"', async function () {
      const { client, clientError, emitAndEnd } = fakeConnection();

      const promise = announce(client, "notkarar", "test");

      const userstateResponse =
        "@badge-info=;badges=broadcaster/1,glitchcon2020/1;color=#666666;display-name=NotKarar;emotes=;flags=;id=9cfac0bf-94f6-4ed8-9fca-56cef9c2edc8;login=notkarar;mod=0;" +
        "msg-id=announcement;room-id=89954186;subscriber=0;system-msg=;tmi-sent-ts=1651320921207;user-id=89954186;user-type= :tmi.twitch.tv USERNOTICE #notkarar :test";
      emitAndEnd(userstateResponse);

      const response = await promise;

      assert.strictEqual(response.rawSource, userstateResponse);

      await clientError;
    });

    it("should reject on incoming no_permission", async function () {
      const { client, emitAndEnd, clientError } = fakeConnection();

      const promise = announce(client, "notkarar", "test");

      const response =
        "@msg-id=no_permission :tmi.twitch.tv NOTICE #notkarar " +
        ":You don't have permission to perform that action.";
      emitAndEnd(response);

      await assertErrorChain(
        [promise, clientError],
        AnnouncementError,
        "Failed to announce [#notkarar]: test: Bad response message: " +
          response,
        MessageError,
        "Bad response message: " + response
      );
    });
  });
});
