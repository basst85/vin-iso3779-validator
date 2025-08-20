# vin-iso3779-validator

Tiny, typesafe VIN validator for ISO 3779 (length, charset, check digit).  
No dependencies. ESM. Strict TypeScript.

## Features

- ✅ **Complete ISO 3779 validation**: Length (17 chars), charset, and check digit
- ✅ **Auto-normalization**: Removes spaces/hyphens, converts to uppercase
- ✅ **TypeScript branded types**: Type-safe VIN handling with compile-time guarantees
- ✅ **Multiple validation methods**: Flexible API for different use cases
- ✅ **Zero dependencies**: Lightweight and secure
- ✅ **ESM-first**: Modern JavaScript module support

## VIN Format Rules

- **Length**: Exactly 17 characters
- **Characters**: Uppercase A–Z (excluding I, O, Q) and digits 0–9
- **Check digit**: 9th character; "X" represents value 10
- **Standard**: ISO 3779 (applies to vehicles made since 1981)

## Install
```sh
npm i vin-iso3779-validator
# or
pnpm add vin-iso3779-validator
# or
yarn add vin-iso3779-validator
# or
bun add vin-iso3779-validator
```

## API

### `validateVIN(input: string): ValidationResult`

Comprehensive validation with detailed error information.

```javascript
import { validateVIN } from "vin-iso3779-validator";

const result = validateVIN("1HGCM82633A004352");
console.log(result);
// {
//   isValid: true,
//   vin: "1HGCM82633A004352",
//   errors: [],
//   checkDigit: "3",
//   expectedCheckDigit: "3"
// }

// Invalid VIN example
const invalid = validateVIN("1HGCM82633A004351"); // wrong check digit
console.log(invalid.errors); // ["INVALID_CHECK_DIGIT"]
```

### `isValidVIN(vin: string): vin is VIN`

Type guard for branded VIN type.

```javascript
import { isValidVIN } from "vin-iso3779-validator";

if (isValidVIN("JHMCM56557C404453")) {
  // TypeScript knows this is a valid VIN (branded type)
  console.log("Valid VIN");
}
```

### `assertVIN(input: string): VIN`

Throws error if invalid, returns branded VIN type if valid.

```javascript
import { assertVIN } from "vin-iso3779-validator";

try {
  const vin = assertVIN("1M8GDM9AXKP042788"); // returns branded VIN type
  console.log("Valid VIN:", vin);
} catch (error) {
  console.error("Invalid VIN:", error.message);
}
```

### `computeCheckDigit(vin: string): string`

Calculate the expected check digit for a VIN.

```javascript
import { computeCheckDigit } from "vin-iso3779-validator";

const checkDigit = computeCheckDigit("1HGCM82633A004352"); // "3"
const checkDigitX = computeCheckDigit("1M8GDM9AXKP042788"); // "X"
```

### `normalizeVIN(input: string): string`

Normalize VIN input (remove spaces/hyphens, uppercase).

```javascript
import { normalizeVIN } from "vin-iso3779-validator";

const normalized = normalizeVIN(" 1hg-cm82633a004352 "); // "1HGCM82633A004352"
```

## Error Codes

The `validateVIN` function returns specific error codes:

- `INVALID_LENGTH`: VIN is not exactly 17 characters
- `INVALID_CHARACTERS`: Contains forbidden characters (I, O, Q, or non-alphanumeric)
- `INVALID_CHECK_DIGIT`: Check digit doesn't match calculated value

## Examples

```javascript
import { validateVIN, isValidVIN, assertVIN, computeCheckDigit, normalizeVIN } from "vin-iso3779-validator";

// Basic validation
const result = validateVIN("1HGCM82633A004352");
console.log(result.isValid); // true

// Handle messy input
const messy = validateVIN(" 1hg-cm82633a004352 ");
console.log(messy.isValid); // true (auto-normalized)

// Type-safe validation
if (isValidVIN("JHMCM56557C404453")) {
  // vin is now typed as VIN (branded string)
}

// Exception-based validation
try {
  const vin = assertVIN("1M8GDM9AXKP042788");
  // vin is guaranteed to be valid
} catch (error) {
  // Handle invalid VIN
}

// Check digit calculation
const expected = computeCheckDigit("1HGCM82633A004352"); // "3"

// Manual normalization
const clean = normalizeVIN("JHM CM8-2633-A004352"); // "JHMCM82633A004352"
```

## Testing

Run the test suite:
```sh
npm test
```

Run tests in watch mode:
```sh
npm run test:watch
```

The test suite covers:
- ✅ Valid VIN validation with known test cases
- ✅ Input normalization (spaces, hyphens, case conversion)
- ✅ Invalid length detection
- ✅ Invalid character detection (I, O, Q, and other non-allowed characters)
- ✅ Check digit validation
- ✅ Error handling and branded type assertions
- ✅ Edge cases and boundary conditions

## Requirements

- Node.js >= 18
- TypeScript >= 5.0 (for TypeScript projects)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## Related

- [ISO 3779 Standard](https://www.iso.org/standard/52200.html) - Official VIN specification
- [VIN Check Digit Algorithm](https://en.wikipedia.org/wiki/Vehicle_identification_number#Check_digit_calculation) - Wikipedia explanation

