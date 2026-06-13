// Transient channel between the address form and the map picker screen.
//
// We can't reuse navArgs for this round-trip: add-address.tsx reads isEdit /
// addressId from navArgs, so having the picker overwrite navArgs would break the
// edit path (onSave would create a new address instead of updating). This tiny
// store carries the picker's input (`initial` center) and its output (`result`)
// in isolation.
import { create } from 'zustand';
import type { LatLng } from '@/lib/cities';

interface LocationPickerState {
  /** Where the picker should open (last pin, or the selected city's center). */
  initial: LatLng | null;
  /** The pin the user confirmed; consumed once by the opener, then cleared. */
  result: LatLng | null;
  /** Route the picker returns to on confirm/back (defaults to /add-address). */
  returnTo: string | null;
  /** Opaque tag the opener uses to know WHICH pin came back (e.g. a stop id or
   *  'destination' in the Box flow where several pins share one picker). */
  target: string | null;
  open: (initial: LatLng | null, opts?: { returnTo?: string; target?: string }) => void;
  setResult: (r: LatLng) => void;
  clearResult: () => void;
}

export const useLocationPicker = create<LocationPickerState>((set) => ({
  initial: null,
  result: null,
  returnTo: null,
  target: null,
  open: (initial, opts) =>
    set({ initial, result: null, returnTo: opts?.returnTo ?? null, target: opts?.target ?? null }),
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));
