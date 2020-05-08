import { Platform } from 'react-native';

export enum Pattern {
	Unknown = -1,
	Fluctuating = 0,
	LargeSpike,
	Decreasing,
	SmallSpike,
}

export const PatternNames = [
	'Fluctuating',
	'Large Spike',
	'Decreasing',
	'Small Spike',
];

export const keyboardAvoidingViewBehavior =
	Platform.OS === 'ios' ? 'padding' : undefined;
