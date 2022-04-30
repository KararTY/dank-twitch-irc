import { UsernoticeMessage } from "../message/twitch-types/usernotice";
import { awaitResponse } from "../await/await-response";
import { matchingNotice } from "../await/conditions";
import { SingleConnection } from "../client/connection";
import { MessageError } from "../client/errors";
import { sendPrivmsg } from "./privmsg";

export class AnnouncementError extends MessageError {
  public channelName: string;
  public failedMessage: string;

  public constructor(
    channelName: string,
    failedMessage: string,
    message?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.channelName = channelName;
    this.failedMessage = failedMessage;
  }
}

const failureNoticeIDs = ["no_permission", "usage_announce"];

export async function announce(
  conn: SingleConnection,
  channelName: string,
  messageText: string
): Promise<UsernoticeMessage> {
  const cmd = `/announce ${messageText}`;

  await sendPrivmsg(conn, channelName, cmd);

  return (await awaitResponse(conn, {
    success: (msg) =>
      msg instanceof UsernoticeMessage &&
      msg.channelName === channelName &&
      msg.isAnnouncement(),
    failure: matchingNotice(channelName, failureNoticeIDs),
    errorType: (msg, cause) =>
      new AnnouncementError(channelName, messageText, msg, cause),
    errorMessage: `Failed to announce [#${channelName}]: ${messageText}`,
  })) as UsernoticeMessage;
}
