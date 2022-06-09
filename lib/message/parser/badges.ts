import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { ParseError } from "./parse-error";

export function parseSingleBadge(badgeSrc: string): TwitchBadge {
  // src format: <badge>/<version>
  // src format for predictions: <badge>/<text with maybe an additional "/" slash or one of those ⸝>

  let badgeName;
  let badgeVersion;

  const firstSeparatorIndex = badgeSrc.indexOf("/");

  if (firstSeparatorIndex === -1) {
    badgeName = badgeSrc;
  } else {
    badgeName = badgeSrc.slice(0, firstSeparatorIndex);
    badgeVersion = badgeSrc.slice(firstSeparatorIndex + 1);
  }

  if (badgeName == null || badgeVersion == null) {
    throw new ParseError(
      `Badge source "${badgeSrc}" did not contain '/' character`
    );
  }

  // This is the predictions badge/badge-info, it should have badgeVersion escaped.
  if (badgeName === "predictions") {
    badgeVersion = badgeVersion.replace(/⸝/g, ",");
  }

  if (badgeName.length <= 0) {
    throw new ParseError(`Empty badge name on badge "${badgeSrc}"`);
  }

  if (badgeVersion.length <= 0) {
    throw new ParseError(`Empty badge version on badge "${badgeSrc}"`);
  }

  return new TwitchBadge(badgeName, badgeVersion);
}

export function parseBadges(badgesSrc: string): TwitchBadgesList {
  // src format: <badge>/<version>,<badge>/<version>,<badge>/<version>

  if (badgesSrc.length <= 0) {
    return new TwitchBadgesList();
  }

  const badges = new TwitchBadgesList();
  for (const badgeSrc of badgesSrc.split(",")) {
    badges.push(parseSingleBadge(badgeSrc));
  }
  return badges;
}
