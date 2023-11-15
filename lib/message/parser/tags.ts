import { IRCMessageTags } from "../irc/tags";

const decodeMap: Record<string, string> = {
  "\\\\": "\\",
  "\\:": ";",
  "\\s": " ",
  "\\n": "\n",
  "\\r": "\r",
  "\\": "", // remove invalid backslashes
};

const decodeLookupRegex = /\\\\|\\:|\\s|\\n|\\r|\\/g;

// if value is undefined (no = in tagSrc) then value becomes null
export function decodeValue(value: string | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.replace(decodeLookupRegex, (m) => decodeMap[m] || "");
}

export function parseTags(tagsSrc: string | undefined): IRCMessageTags {
  const tags: IRCMessageTags = {};

  if (tagsSrc == null) {
    return tags;
  }

  for (const tagSrc of tagsSrc.split(";")) {
    const key = tagSrc.split("=").shift() as string;

    const keyValueDelimiter: number = tagSrc.indexOf("=");

    tags[tagSrc.slice(0, keyValueDelimiter)] =
      keyValueDelimiter === -1
        ? null
        : decodeValue(tagSrc.slice(keyValueDelimiter + 1));
  }

  return tags;
}
