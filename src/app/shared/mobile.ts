/** Windows at most this wide get the phone layout. The same width is in src/_mobile.scss. */
const MOBILE_MAX_WIDTH_PX = 899.98;

const MOBILE_QUERY = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

/** True while the window is phone-sized. */
export const isMobileWidth = (): boolean =>
  typeof matchMedia === 'function' && matchMedia(MOBILE_QUERY).matches;

/** True on a device where the main pointer is a finger and nothing can hover. */
export const isTouchDevice = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(hover: none)').matches;
