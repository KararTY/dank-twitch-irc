import { reasonForValue } from "../utils/reason-for-value";
import { ValidationError } from "./validation-error";

const messageIDRegex = /^[\w-]+$/;

export function validateMessageID(input?: string | null): void {
  if (input == null || !messageIDRegex.test(input)) {
    throw new ValidationError(
      `Message ID ${reasonForValue(input)} is invalid/malformed`
    );
  }
}
