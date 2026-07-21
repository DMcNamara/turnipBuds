import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Phase 4 scaffold placeholder.
 *
 * This is the app entry slot. The real navigation/provider tree
 * (Redux + Firebase + react-navigation) is ported back into this
 * file in the Phase 4 navigation issue as `src/` modules land.
 */
export default function App() {
	return (
		<View style={styles.container}>
			<Text>Turnip Buds — Expo SDK 57 scaffold</Text>
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#66bb6a',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
