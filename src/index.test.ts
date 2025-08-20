import {
  validateVIN,
  isValidVIN,
  assertVIN,
  computeCheckDigit,
  normalizeVIN
} from "./index.js";

describe("VIN validator", () => {
  // Known good public examples (correct check digits):
  //  - 1HGCM82633A004352 -> check digit "3"
  //  - 1M8GDM9AXKP042788 -> check digit "X"
  //  - JHMCM56557C404453 -> check digit "5"
  const VALID_VINS = [
    { vin: "1HGCM82633A004352", check: "3" },
    { vin: "1M8GDM9AXKP042788", check: "X" },
    { vin: "JHMCM56557C404453", check: "5" }
  ];

  test("accepts valid VINs (length, charset, check digit)", () => {
    for (const { vin, check } of VALID_VINS) {
      const res = validateVIN(vin);
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual([]);
      expect(res.checkDigit).toBe(check);
      expect(res.expectedCheckDigit).toBe(check);
      expect(isValidVIN(vin)).toBe(true);
    }
  });

  test("normalizes spaces, hyphens, and casing", () => {
    const messy = " 1hg-cm82633a004352 ";
    const res = validateVIN(messy);
    expect(res.isValid).toBe(true);
    expect(res.vin).toBe("1HGCM82633A004352");
  });

  test("normalizeVIN function handles various input formats", () => {
    // Test spaces, hyphens, and case normalization
    expect(normalizeVIN(" 1hg-cm82633a004352 ")).toBe("1HGCM82633A004352");
    expect(normalizeVIN("1HG CM8-2633-A004352")).toBe("1HGCM82633A004352");
    expect(normalizeVIN("1hgcm82633a004352")).toBe("1HGCM82633A004352");
    expect(normalizeVIN("  ")).toBe("");
    expect(normalizeVIN("")).toBe("");
    expect(normalizeVIN("ABC-123")).toBe("ABC123");
    expect(normalizeVIN("   abc   def   ")).toBe("ABCDEF");
    expect(normalizeVIN("a-b-c-d-e-f-g")).toBe("ABCDEFG");
  });

  test("rejects invalid length", () => {
    const res = validateVIN("1HGCM82633A00435"); // 16 chars
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain("INVALID_LENGTH");
  });

  test("rejects invalid characters (I, O, Q, punctuation, etc.)", () => {
    // Contains "I" (not allowed)
    const res1 = validateVIN("1HGCM82633A00435I");
    expect(res1.isValid).toBe(false);
    expect(res1.errors).toContain("INVALID_CHARACTERS");

    // Contains "O" (not allowed)
    const res2 = validateVIN("1HGCM82633A0O4352");
    expect(res2.isValid).toBe(false);
    expect(res2.errors).toContain("INVALID_CHARACTERS");

    // Contains "Q" (not allowed)
    const res3 = validateVIN("1HGCM82633A004Q52");
    expect(res3.isValid).toBe(false);
    expect(res3.errors).toContain("INVALID_CHARACTERS");
  });

  test("rejects incorrect check digit", () => {
    const valid = "1HGCM82633A004352";
    const wrongCheck = valid.slice(0, 8) + "0" + valid.slice(9);
    const res = validateVIN(wrongCheck);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain("INVALID_CHECK_DIGIT");

    expect(() => assertVIN(wrongCheck)).toThrow(/INVALID_CHECK_DIGIT/);
  });

  test("computeCheckDigit returns expected values and throws on bad chars", () => {
    for (const { vin, check } of VALID_VINS) {
      expect(computeCheckDigit(vin)).toBe(check);
    }
    expect(() => computeCheckDigit("1HGCM82633A00I352")).toThrow(/Invalid character/i);
  });

  test("assertVIN returns branded string on success", () => {
    const v = assertVIN("1M8GDM9AXKP042788");
    expect(typeof v).toBe("string");
  });
});