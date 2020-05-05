import React from 'react';
import { Snackbar } from 'react-native-paper';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { hideToastAction } from '../store/toast/toast.actions';

class Component extends React.PureComponent<PropsFromRedux> {
	onDismiss = () => {
		this.props.dispatch(hideToastAction());
	};

	render() {
		return (
			<Snackbar
				visible={this.props.visible}
				onDismiss={this.onDismiss}
				duration={this.props.duration}
				action={{
					label: 'OK',
					onPress: this.onDismiss,
				}}
			>
				{this.props.message}
			</Snackbar>
		);
	}
}

/**
 * CONNECT
 */
const connector = connect((state: RootState) => ({
	message: state.toast.message,
	duration: state.toast.duration,
	visible: state.toast.visible,
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const Toast = connector(Component);
