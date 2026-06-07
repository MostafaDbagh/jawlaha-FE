// Phone-number formatting for the jawlahapp backend.
//
// Syrian mobile numbers are stored in the 10-digit leading-0 form ('0XXXXXXXXX')
// under country code +963, and the backend's phone parser matches on the LAST 10
// digits (slice(-10)). So the international string sent to the API must keep the
// leading 0: `+963` + `0XXXXXXXXX`. The phone-field validator yields the 9-digit
// national part with the leading 0 stripped, so it has to be re-inserted here —
// otherwise `+963` + `9XXXXXXXX` parses to a different number and login silently
// misses the account (or auto-creates a throwaway one). Syria-only app, so the
// dial code is always +963.
export function toApiPhone(dialCode: string, rawNumber: string): string {
  const national = String(rawNumber ?? '').trim().replace(/^0+/, '');
  return `+${dialCode}0${national}`;
}
