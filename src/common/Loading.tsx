import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Title } from 'react-native-paper';

export function CenteredActivityIndicator() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
			}}
		>
			<ActivityIndicator size="large" />
		</View>
	);
}

function EmptyMessage({ message }: { message: string }) {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Title>{message}</Title>
		</View>
	);
}

// Shows a loading spinner while `loading` is true, otherwise renders children.
export function SpinnerWhileLoading({
	loading,
	children,
}: {
	loading: boolean;
	children: ReactNode;
}) {
	if (loading) {
		return <CenteredActivityIndicator />;
	}
	return <>{children}</>;
}

// Shows an empty-state message while `empty` is true, otherwise renders children.
export function EmptyState({
	empty,
	message,
	children,
}: {
	empty: boolean;
	message: string;
	children: ReactNode;
}) {
	if (empty) {
		return <EmptyMessage message={message} />;
	}
	return <>{children}</>;
}
