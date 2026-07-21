/**
 * Resolution shim for the removed `react-native-material-dropdown` package.
 *
 * The dropdown was replaced by a Paper `Menu` (`src/common/Dropdown.tsx`) in the
 * Phase 4 UI port, so the package is no longer a dependency. The frozen
 * `TimezoneModal.spec.tsx` still contains a `jest.mock('react-native-material-dropdown', …)`
 * (no `virtual: true`), which requires the module id to be *resolvable* even
 * though the spec's own factory supplies the actual mock implementation. This
 * file exists only so Jest's resolver can find the id; it is mapped in via
 * `moduleNameMapper` and its body is never used at runtime (the spec factory
 * wins). Keeping it also avoids re-adding the dead dependency.
 */
export const Dropdown = () => null;
