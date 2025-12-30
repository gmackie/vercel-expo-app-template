// Store types
export type { UIState, UIStore } from "./stores/ui";
export type { PreferencesState, PreferencesStore } from "./stores/preferences";

// Store creators (for custom implementations)
export { createUIStore } from "./stores/ui";
export { createPreferencesStore } from "./stores/preferences";
