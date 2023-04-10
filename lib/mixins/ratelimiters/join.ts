import Semaphore from "semaphore-async-await";
import { ChatClient } from "../../client/client";
import { applyReplacements } from "../../utils/apply-function-replacements";
import { ClientMixin } from "../base-mixin";

export class JoinRateLimiter implements ClientMixin {
  private readonly client: ChatClient;
  private readonly joinLimitsSemaphore: Semaphore;

  public constructor(client: ChatClient) {
    this.client = client;

    this.joinLimitsSemaphore = new Semaphore(
      this.client.configuration.rateLimits.joinLimits
    );
  }

  public applyToClient(client: ChatClient): void {
    const joinReplacement = async <V, A extends any[]>(
      oldFn: (channelName: string, ...args: A) => Promise<V>,
      channelName: string,
      ...args: A
    ): Promise<V> => {
      const releaseFn = await this.acquire();
      try {
        return await oldFn(channelName, ...args);
      } finally {
        setTimeout(releaseFn, 10 * 1000); // 10 seconds per 20 joined channels.
      }
    };

    const joinAllReplacement = async <A extends any[]>(
      oldFn: (
        channelNames: string[],
        ...args: A
      ) => Promise<Record<string, Error | undefined>>,
      channelNames: string[],
      ...args: A
    ): Promise<Record<string, Error | undefined>> => {
      const promiseResults = [];

      for (
        let i = 0;
        i < channelNames.length;
        i += this.client.configuration.rateLimits.joinLimits
      ) {
        const chunk = channelNames.slice(
          i,
          i + this.client.configuration.rateLimits.joinLimits
        );

        const releaseFns = await Promise.all(
          Array(chunk.length)
            .fill(this.acquire)
            .map((fn) => fn.bind(this)())
        );
        try {
          const promiseRes = await oldFn(chunk, ...args);
          promiseResults.push(promiseRes);
        } finally {
          releaseFns.forEach((releaseFn) => setTimeout(releaseFn, 10 * 1000)); // 10 seconds per 20 joined channels.
        }
      }

      return promiseResults.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    };

    applyReplacements(this, client, {
      join: joinReplacement,
      joinAll: joinAllReplacement,
    });
  }

  private async acquire(): Promise<() => void> {
    const releaseFn = (): void => {
      this.joinLimitsSemaphore.release();
    };

    await this.joinLimitsSemaphore.acquire();
    return releaseFn;
  }
}
