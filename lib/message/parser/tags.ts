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

    let valueSrc;
    const indexOfFirstSeparator = tagSrc.indexOf("=");
    if (indexOfFirstSeparator !== -1) {
      valueSrc = tagSrc.slice(indexOfFirstSeparator + 1);
    }

    tags[key.toLowerCase()] = decodeValue(valueSrc);
  }

  return tags;
}
