import { DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { Colors, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';

export const Theme = {
	...NavDefaultTheme,
	...PaperDefaultTheme,
	colors: {
		...NavDefaultTheme.colors,
		...PaperDefaultTheme.colors,
		primary: Colors.green400,
		accent: Colors.purple200,
	},
};

export const HeaderTheme: StackNavigationOptions = {
	headerStyle: {
		backgroundColor: Theme.colors.primary,
	},
	headerTintColor: Theme.colors.text,
};
