import { ValidationResult } from "@/types/validation";

const PERSIST_HINT =
  "The Postman API can only read **initial values**, not current (local) values. In Postman, paste your value into the **Initial value** column (or click the **Persist All** button), then try again.";

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
