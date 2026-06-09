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
  open: (initial: LatLng | null) => void;
  setResult: (r: LatLng) => void;
  clearResult: () => void;
}

export const useLocationPicker = create<LocationPickerState>((set) => ({
  initial: null,
  result: null,
  open: (initial) => set({ initial, result: null }),
  setResult: (result) => set({ result }),
  clearResult: () => set({ result: null }),
}));
