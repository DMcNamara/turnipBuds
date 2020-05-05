import { get, some } from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Title } from 'react-native-paper';
import { isEmpty, isLoaded } from 'react-redux-firebase';
import { branch, renderComponent } from 'recompose';

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
	console.log('message: ', message);
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			<Title>{message}</Title>
		</View>
	);
}

// HOC that shows a component while condition is true
export function renderWhile(
	condition: (props: any) => boolean,
	component: any
) {
	return branch(condition, renderComponent(component));
}

// HOC that shows loading spinner component while list of propNames are loading
export function spinnerWhileLoading(propNames: string[]) {
	return renderWhile(
		(props: any) => some(propNames, (name) => !isLoaded(get(props, name))),
		CenteredActivityIndicator
	);
}

// HOC that shows a component while any of a list of props isEmpty
export function renderIfEmpty(propNames: string[], message: string) {
	return renderWhile(
		// Any of the listed prop name correspond to empty props (supporting dot path names)
		(props) =>
			some(propNames, (name) => {
				const propValue = get(props, name);
				return isLoaded(propValue) && isEmpty(propValue);
			}),
		() => <EmptyMessage message={message} />
	);
}
