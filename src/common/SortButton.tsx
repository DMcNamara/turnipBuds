import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';

export interface SortOption {
	title: string;
	key: string;
}
interface Props {
	sorts: SortOption[];
	action: (sortBy: string, order: 1 | -1) => AnyAction;
}
export function SortButton(props: Props) {
	const [visible, setVisibility] = useState(false);
	const dispatch = useDispatch();

	const onHide = () => setVisibility(false);
	const onShow = () => setVisibility(true);

	const onSort = (key: string) => dispatch(props.action(key, 1));
	return (
		<Menu
			visible={visible}
			onDismiss={onHide}
			anchor={<IconButton icon="sort" onPress={onShow} />}
		>
			{props.sorts.map((sort) => (
				<Menu.Item
					key={sort.key}
					onPress={() => onSort(sort.key)}
					title={sort.title}
				/>
			))}
		</Menu>
	);
}
