import { DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import type { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import type { StackNavigationOptions } from '@react-navigation/stack';
import { DefaultTheme as PaperDefaultTheme, MD2Colors } from 'react-native-paper';

/**
 * Paper (Material Design 3) theme — passed to `PaperProvider`.
 *
 * The Paper colours (`primary`/`accent`) are what the UI components consume
 * (LoginScreen, HeaderTheme, TabTheme). `text` is kept for parity with the old
 * merged nav theme that exposed `colors.text`.
 */
export const Theme = {
	...PaperDefaultTheme,
	colors: {
		...PaperDefaultTheme.colors,
		primary: MD2Colors.green400,
		accent: MD2Colors.redA100,
		text: PaperDefaultTheme.colors.onSurface,
	},
};

/**
 * react-navigation 7 theme — passed to `NavigationContainer`.
 *
 * v7's theme shape (`{ dark, colors: { primary, background, card, text,
 * border, notification }, fonts }`) is distinct from Paper's, so it can no
 * longer just be spread together with the Paper theme the way the SDK 37 app
 * did. We start from react-navigation's own `DefaultTheme` (which carries the
 * required `fonts` block) and override only the colours we brand.
 */
export const NavigationTheme: typeof NavDefaultTheme = {
	...NavDefaultTheme,
	colors: {
		...NavDefaultTheme.colors,
		primary: Theme.colors.primary,
		text: Theme.colors.text,
	},
};

export const HeaderTheme: StackNavigationOptions = {
	headerStyle: {
		backgroundColor: Theme.colors.primary,
	},
	headerTintColor: Theme.colors.text,
};

/**
 * Material top-tab styling. In react-navigation v5 this was passed to the
 * navigator's removed `tabBarOptions` prop as `{ indicatorStyle }`; in v6/v7 it
 * lives in `screenOptions` as `tabBarIndicatorStyle`.
 */
export const TabTheme: MaterialTopTabNavigationOptions = {
	tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent },
};
