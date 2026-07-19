import React from 'react';
import { Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { hideToastAction } from '../store/toast/toast.actions';

export const Toast = () => {
	const dispatch = useDispatch();
	const message = useSelector((state: RootState) => state.toast.message);
	const duration = useSelector((state: RootState) => state.toast.duration);
	const visible = useSelector((state: RootState) => state.toast.visible);

	const onDismiss = () => {
		dispatch(hideToastAction());
	};

	return (
		<Snackbar
			visible={visible}
			onDismiss={onDismiss}
			duration={duration}
			action={{
				label: 'OK',
				onPress: onDismiss,
			}}
		>
			{message}
		</Snackbar>
	);
};
