import { assert } from "chai";
import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { parseTwitchMessage } from "../parser/twitch-message";
import { parseActionAndMessage, PrivmsgMessage } from "./privmsg";

describe("./message/twitch-types/privmsg", function () {
  describe("#parseActionAndMessage()", function () {
    it("should return non-actions unmodified", function () {
      assert.deepStrictEqual(parseActionAndMessage("HeyGuys"), {
        isAction: false,
        message: "HeyGuys",
      });

      assert.deepStrictEqual(parseActionAndMessage("\u0001ACTION HeyGuys"), {
        isAction: false,
        message: "\u0001ACTION HeyGuys",
      });

      assert.deepStrictEqual(parseActionAndMessage("HeyGuys\u0001"), {
        isAction: false,
        message: "HeyGuys\u0001",
      });

      // missing space
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTIONHeyGuys\u0001"),
        {
          isAction: false,
          message: "\u0001ACTIONHeyGuys\u0001",
        }
      );
    });

    it("should remove action prefix and suffix on valid actions", function () {
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTION HeyGuys\u0001"),
        {
          isAction: true,
          message: "HeyGuys",
        }
      );

      // nested
      assert.deepStrictEqual(
        parseActionAndMessage("\u0001ACTION \u0001ACTION HeyGuys\u0001\u0001"),
        {
          isAction: true,
          message: "\u0001ACTION HeyGuys\u0001",
        }
      );
    });
  });

  describe("PrivmsgMessage", function () {
    it("should be able to parse a real PRIVMSG message", function () {
      const msgText =
        "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;" +
        "mod=0;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;turbo=0;" +
        "user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.instanceOf(msg, PrivmsgMessage);

      assert.strictEqual(msg.channelName, "randers");

      assert.strictEqual(msg.messageText, "test");
      assert.isFalse(msg.isAction);

      assert.strictEqual(msg.senderUsername, "randers");

      assert.strictEqual(msg.senderUserID, "40286300");

      assert.deepStrictEqual(
        msg.badgeInfo,
        new TwitchBadgesList(new TwitchBadge("subscriber", "5"))
      );
      assert.strictEqual(msg.badgeInfoRaw, "subscriber/5");

      assert.deepStrictEqual(
        msg.badges,
        new TwitchBadgesList(
          new TwitchBadge("broadcaster", "1"),
          new TwitchBadge("subscriber", "0")
        )
      );
      assert.strictEqual(msg.badgesRaw, "broadcaster/1,subscriber/0");

      assert.isUndefined(msg.bits);
      assert.isUndefined(msg.bitsRaw);

      assert.isUndefined(msg.replyParentDisplayName);
      assert.isUndefined(msg.replyParentMessageBody);
      assert.isUndefined(msg.replyParentMessageID);
      assert.isUndefined(msg.replyParentUserID);
      assert.isUndefined(msg.replyParentUserLogin);

      assert.deepStrictEqual(msg.color, { r: 0x19, g: 0xe6, b: 0xe6 });
      assert.strictEqual(msg.colorRaw, "#19E6E6");

      assert.strictEqual(msg.displayName, "randers");

      assert.deepStrictEqual(msg.emotes, []);
      assert.strictEqual(msg.emotesRaw, "");

      assert.strictEqual(msg.messageID, "7eb848c9-1060-4e5e-9f4c-612877982e79");

      assert.isFalse(msg.isMod);
      assert.strictEqual(msg.isModRaw, "0");

      assert.strictEqual(msg.channelID, "40286300");

      assert.strictEqual(msg.serverTimestamp.getTime(), 1563096499780);
      assert.strictEqual(msg.serverTimestampRaw, "1563096499780");

      assert.deepStrictEqual(msg.extractUserState(), {
        badgeInfo: new TwitchBadgesList(new TwitchBadge("subscriber", "5")),
        badgeInfoRaw: "subscriber/5",
        badges: new TwitchBadgesList(
          new TwitchBadge("broadcaster", "1"),
          new TwitchBadge("subscriber", "0")
        ),
        badgesRaw: "broadcaster/1,subscriber/0",
        color: { r: 0x19, g: 0xe6, b: 0xe6 },
        colorRaw: "#19E6E6",
        displayName: "randers",
        isMod: false,
        isModRaw: "0",
      });

      assert.isFalse(msg.isCheer());
    });

    it("should be able to parse a reply PRIVMSG message", function () {
      const msgText =
        "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;mod=0;" +
        "reply-parent-display-name=OtherUser;reply-parent-msg-body=Test:\\sAbc;reply-parent-msg-id=abcd;" +
        "reply-parent-user-id=123;reply-parent-user-login=otheruser;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;" +
        "turbo=0;user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.instanceOf(msg, PrivmsgMessage);

      assert.isTrue(msg.isReply());

      assert.strictEqual(msg.replyParentDisplayName, "OtherUser");
      assert.strictEqual(msg.replyParentMessageBody, "Test: Abc");
      assert.strictEqual(msg.replyParentMessageID, "abcd");
      assert.strictEqual(msg.replyParentUserID, "123");
      assert.strictEqual(msg.replyParentUserLogin, "otheruser");
    });

    it("trims spaces at the end of display names", function () {
      const msgText =
        "@badge-info=subscriber/5;badges=broadcaster/1,subscriber/0;" +
        "color=#19E6E6;display-name=randers\\s;emotes=;flags=;id=7eb848c9-1060-4e5e-9f4c-612877982e79;" +
        "mod=0;room-id=40286300;subscriber=1;tmi-sent-ts=1563096499780;turbo=0;" +
        "user-id=40286300;user-type= :randers!randers@randers.tmi.twitch.tv PRIVMSG #randers :test";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.strictEqual(msg.displayName, "randers");
      assert.strictEqual(msg.extractUserState().displayName, "randers");
    });

    it('should be able to parse a reply PRIVMSG message that has the reply message body "foo=bar"', function () {
      const msgText =
        "@badge-info=;badges=;client-nonce=094fcf39e387204709c4cacb85d264e5;color=;display-name=survivedby_bot;emotes=;" +
        "first-msg=0;flags=;id=48dc5388-0dcd-4f56-8772-370397320186;mod=0;reply-parent-display-name=SomeUser;" +
        "reply-parent-msg-body=foo=bar;reply-parent-msg-id=725d8358-d934-42c7-a606-a0b3ed82a642;reply-parent-user-id=441347665;" +
        "reply-parent-user-login=someuser;reply-thread-parent-display-name=SomeUser;reply-thread-parent-msg-id=72" +
        "5d8358-d934-42c7-a606-a0b3ed82a642;reply-thread-parent-user-id=441347665;reply-thread-parent-user-login=someuser;" +
        "returning-chatter=0;room-id=11148817;subscriber=0;tmi-sent-ts=1699992432701;turbo=0;user-id=405330073;" +
        "user-type= :survivedby_bot!survivedby_bot@survivedby_bot.tmi.twitch.tv PRIVMSG #pajlada :@SomeUser -tags";

      const msg: PrivmsgMessage = parseTwitchMessage(msgText) as PrivmsgMessage;

      assert.instanceOf(msg, PrivmsgMessage);

      assert.isTrue(msg.isReply());

      assert.strictEqual(msg.replyParentDisplayName, "SomeUser");
      assert.strictEqual(msg.replyParentMessageBody, "foo=bar");
      assert.strictEqual(
        msg.replyParentMessageID,
        "725d8358-d934-42c7-a606-a0b3ed82a642"
      );
      assert.strictEqual(msg.replyParentUserID, "441347665");
      assert.strictEqual(msg.replyParentUserLogin, "someuser");
    });
  });
});
