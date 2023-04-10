export interface RateLimits {
  highPrivmsgLimits: number;
  lowPrivmsgLimits: number;

  // whispersPerSecond: number;
  // whispersPerMinute: number;
  // whisperTargetsPerDay: number;

  privmsgInMs: number;

  joinLimits: number;
}

export type PresetKeys = "default" | "knownBot" | "verifiedBot";

export const rateLimitPresets: Record<PresetKeys, RateLimits> = {
  default: {
    highPrivmsgLimits: 100,
    lowPrivmsgLimits: 20,

    // whispersPerSecond: 3,
    // whispersPerMinute: 100,
    // whisperTargetsPerDay: 40

    privmsgInMs: 35 * 1000,

    joinLimits: 20,
  },
  knownBot: {
    highPrivmsgLimits: 100,
    lowPrivmsgLimits: 50,

    // whispersPerSecond: 10,
    // whispersPerMinute: 200,
    // whisperTargetsPerDay: 500

    privmsgInMs: 35 * 1000,

    joinLimits: 20,
  },
  verifiedBot: {
    highPrivmsgLimits: 7500,
    lowPrivmsgLimits: 7500,

    // whispersPerSecond: 20,
    // whispersPerMinute: 1200,
    // whisperTargetsPerDay: 100000

    privmsgInMs: 35 * 1000,

    joinLimits: 2000,
  },
};
