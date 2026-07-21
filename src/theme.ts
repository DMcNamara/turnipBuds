import { DefaultTheme as PaperDefaultTheme, MD2Colors } from 'react-native-paper';

/**
 * Paper (Material Design 3) theme.
 *
 * NOTE (#107): the previous theme also spread in @react-navigation's
 * `DefaultTheme` and typed `HeaderTheme` / `TabTheme` against
 * `StackNavigationOptions` / `MaterialTopTabBarOptions`. Those packages are not
 * installed until the navigation port (#107), so that portion is stubbed here
 * as plain objects and must be re-typed / re-merged with the navigation theme
 * then. The Paper colours (`primary`/`accent`) are the part consumed by the UI
 * components ported in this issue (LoginScreen, TabTheme, HeaderTheme).
 */
export const Theme = {
	...PaperDefaultTheme,
	colors: {
		...PaperDefaultTheme.colors,
		primary: MD2Colors.green400,
		accent: MD2Colors.redA100,
		// kept for parity with the old merged nav theme (`colors.text`).
		text: PaperDefaultTheme.colors.onSurface,
	},
};

// TODO(#107): restore `StackNavigationOptions` typing once @react-navigation
// is installed.
export const HeaderTheme = {
	headerStyle: {
		backgroundColor: Theme.colors.primary,
	},
	headerTintColor: Theme.colors.text,
};

// TODO(#107): restore `MaterialTopTabBarOptions` typing once @react-navigation
// is installed.
export const TabTheme = {
	indicatorStyle: { backgroundColor: Theme.colors.accent },
};
