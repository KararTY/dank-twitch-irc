import { TwitchBadge } from "../badge";
import { TwitchBadgesList } from "../badges";
import { ParseError } from "./parse-error";

export function parseSingleBadge(badgeSrc: string): TwitchBadge {
  // src format: <badge>/<version>
  // src format for predictions: <badge>/<text with maybe an additional "/" slash or one of those ⸝>

  const [badgeName, ...badgeVersion] = badgeSrc.split("/");

  let badgeVersionReplacedComma;

  // There is a slash.
  if (badgeVersion.length > 0) {
    badgeVersionReplacedComma = badgeVersion.join("/").replace(/⸝/g, ',');
  }

  if (badgeName == null || badgeVersionReplacedComma == null) {
    throw new ParseError(
      `Badge source "${badgeSrc}" did not contain '/' character`
    );
  }

  if (badgeName.length <= 0) {
    throw new ParseError(`Empty badge name on badge "${badgeSrc}"`);
  }

  if (badgeVersionReplacedComma.length <= 0) {
    throw new ParseError(`Empty badge version on badge "${badgeSrc}"`);
  }

  return new TwitchBadge(badgeName, badgeVersionReplacedComma);
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
