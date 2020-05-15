import { DispatchProp } from 'react-redux';
import { Functions } from '../../store';
import { toastAction } from '../../store/toast/toast.actions';

export function addFriend(
	email: string,
	existingEmails: string[],
	dispatch: DispatchProp['dispatch']
) {
	if (existingEmails.includes(email)) {
		dispatch(toastAction("You've already added this friend"));
		return;
	}

	Functions.addFriend({ email })
		.then(() => dispatch(toastAction('Friend Added')))
		.catch((err) => dispatch(toastAction(err.message)));
}
