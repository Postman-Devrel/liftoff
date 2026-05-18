import { ValidationResult } from "@/types/validation";

const PERSIST_HINT =
  "The Postman API can only read **shared values**. In your Postman environment editor, make sure the value appears in the **Shared value** column (not just the local **Value** column), then try again.";

export function resolveEnvVar(
  values: { key: string; value: string; current_value?: string }[],
  varName: string,
  missingMessage?: string
): string | ValidationResult {
  const entry = values.find(
    (v) => v.key.toLowerCase() === varName.toLowerCase()
  );
  if (!entry) {
    return {
      success: false,
      message:
        missingMessage ||
        `No \`${varName}\` variable found in your environment.`,
      pointsAwarded: 0,
    };
  }
  if (!entry.value) {
    return {
      success: false,
      message: `Your \`${varName}\` variable exists but its initial value is empty. ${PERSIST_HINT}`,
      pointsAwarded: 0,
    };
  }
  return entry.value;
}
