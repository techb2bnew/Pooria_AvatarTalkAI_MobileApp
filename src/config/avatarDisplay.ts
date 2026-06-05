/**
 * Avatar display mode:
 * - '2d'  → always native 2D (no internet, always works)
 * - '3d'  → WebView 3D only (needs Wi‑Fi + CDN)
 * - 'auto' → try 3D, fall back to 2D if load fails (recommended)
 */
export type AvatarDisplayMode = '2d' | '3d' | 'auto';

/** Change to '2d' if you only want native avatar (no internet for 3D). */
export const AVATAR_DISPLAY_MODE: AvatarDisplayMode = '2d';
