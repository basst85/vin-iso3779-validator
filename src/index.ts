/**
 * ISO 3779 VIN validation (length, charset, check digit).
 * No dependencies. ESM. Strict TypeScript.
 */

export const VIN_LENGTH = 17 as const;

/** VIN letters allowed (no I, O, Q). Uppercased during validation. */
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Position weights (1..17). Check digit position (9) weight is 0. */
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2] as const;

/** ISO 3779 transliteration table (digits map to themselves). */
const MAP: Record<string, number> = {
  // digits
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  // letters
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9
};

/** Discriminated error codes so callers can react precisely. */
export type VinErrorCode = "INVALID_LENGTH" | "INVALID_CHARACTERS" | "INVALID_CHECK_DIGIT";

/** Opaque branded VIN type for extra type-safety. */
export type VIN = string & { readonly __brand: "VIN" };

/** Result of validateVIN. */
export interface ValidationResult {
  isValid: boolean;
  /** Original input, normalized (trimmed, hyphens/spaces removed, uppercased). */
  vin: string;
  /** Collected error codes (empty when valid). */
  errors: VinErrorCode[];
  /** The actual 9th character in the VIN. */
  checkDigit: string;
  /** The computed check digit as per ISO 3779. */
  expectedCheckDigit: string;
}

/**
 * Normalize common user input: trim, remove spaces and hyphens, uppercase.
 * Does not attempt to correct invalid characters.
 */
export function normalizeVIN(input: string): string {
  return input.replace(/[\s-]+/g, "").trim().toUpperCase();
}

/** Compute the ISO 3779 check digit (returns "0".."9" or "X"). */
export function computeCheckDigit(vin: string): string {
  const v = vin.toUpperCase();
  let sum = 0;
  for (let i = 0; i < VIN_LENGTH; i++) {
    const ch = v[i];
    const val = MAP[ch];
    if (val === undefined) {
      // invalid chars (including I, O, Q) will be undefined
      throw new Error(`Invalid character '${ch}' at position ${i + 1}`);
    }
    sum += val * WEIGHTS[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

/**
 * Validate a VIN end-to-end. Provides granular errors and the expected check digit.
 */
export function validateVIN(input: string): ValidationResult {
  const vin = normalizeVIN(input);
  const errors: VinErrorCode[] = [];

  if (vin.length !== VIN_LENGTH) errors.push("INVALID_LENGTH");
  if (!VIN_REGEX.test(vin)) errors.push("INVALID_CHARACTERS");

  // If basic structure fails, we can still try computing an expected digit for UX.
  let expected = "N/A";
  try {
    if (vin.length === VIN_LENGTH) {
      expected = computeCheckDigit(vin);
      const actual = vin[8]; // 9th char (0-based index 8)
      if (VIN_REGEX.test(vin) && actual !== expected) {
        errors.push("INVALID_CHECK_DIGIT");
      }
    }
  } catch {
    // ignore here; structural errors already captured
  }

  return {
    isValid: errors.length === 0,
    vin,
    errors,
    checkDigit: vin[8] ?? "",
    expectedCheckDigit: expected
  };
}

/**
 * Narrowing type guard. On success, `vin` becomes the branded VIN type.
 */
export function isValidVIN(vin: string): vin is VIN {
  return validateVIN(vin).isValid;
}

/**
 * Throws an Error if invalid; returns a branded VIN otherwise.
 * Useful for APIs that prefer exceptions over result objects.
 */
export function assertVIN(input: string): VIN {
  const res = validateVIN(input);
  if (!res.isValid) {
    const detail = res.errors.join(", ");
    throw new Error(`Invalid VIN: ${detail} (expected check digit: ${res.expectedCheckDigit})`);
  }
  return res.vin as VIN;
}