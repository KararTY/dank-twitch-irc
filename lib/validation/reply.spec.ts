import { assertThrowsChain } from "../helpers.spec";
import { validateMessageID } from "./reply";
import { ValidationError } from "./validation-error";

describe("./validation/reply", function () {
  describe("#validateMessageID()", function () {
    it("rejects undefined", function () {
      assertThrowsChain(
        () => validateMessageID(undefined),
        ValidationError,
        "Message ID undefined is invalid/malformed"
      );
    });

    it("rejects null", function () {
      assertThrowsChain(
        () => validateMessageID(null),
        ValidationError,
        "Message ID null is invalid/malformed"
      );
    });

    it("rejects empty strings", function () {
      assertThrowsChain(
        () => validateMessageID(""),
        ValidationError,
        "Message ID empty string is invalid/malformed"
      );
    });

    it("allows dashes", function () {
      validateMessageID("885196de-cb67-427a-baa8-82f9b0fcd05f");
      validateMessageID("8dfe2f75-a6c6-445a-927d-bfe7ad023c9f");
    });
  });
});
