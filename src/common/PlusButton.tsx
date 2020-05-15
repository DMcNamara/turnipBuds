import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

export function PlusButton(props: { onPress: () => void }) {
	return <FAB style={styles.fab} icon="plus" onPress={props.onPress} />;
}

const styles = StyleSheet.create({
	fab: {
		bottom: 0,
		margin: 16,
		position: 'absolute',
		right: 0,
	},
});
