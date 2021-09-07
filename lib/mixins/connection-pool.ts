import { ChatClient, ConnectionPredicate } from "../client/client";
import { ClientMixin } from "../mixins/base-mixin";
import { SingleConnection } from "../client/connection";
import { applyReplacements } from "../utils/apply-function-replacements";

export interface ConnectionPoolOptions {
  poolSize: number; //how many fast connection to create
}

export class ConnectionPool implements ClientMixin {
  private client: ChatClient;
  private poolSize: number;

  constructor(client: ChatClient, options: ConnectionPoolOptions) {
    this.client = client;
    this.poolSize = options.poolSize;
  }

  public applyToClient(client: ChatClient): void {
    client.connectionPool = this;
    const replacement = (
      oldFn: (predicate: ConnectionPredicate) => SingleConnection,
      predicate: ConnectionPredicate
    ): SingleConnection => {
      this.ensureEnoughConnections();
      return oldFn(predicate);
    };

    applyReplacements(this, client, {
      requireConnection: replacement,
    });
  }

  public ensureEnoughConnections(): void {
    while (this.client.connections.length < this.poolSize) {
      this.client.newConnection();
    }
  }
}
