import * as AppleAuthentication from 'expo-apple-authentication';
import * as Localization from 'expo-localization';
import { omit } from 'lodash';
import { DispatchProp } from 'react-redux';
import { constants, useFirebase } from 'react-redux-firebase';
import * as Sentry from 'sentry-expo';
import { User } from '../collections';
import { toastAction } from '../toast/toast.actions';
import { setCurrentUserAction } from './auth.actions';

export async function handlePostLogin(
	dispatch: DispatchProp['dispatch'],
	firebase: ReturnType<typeof useFirebase>,
	userData: firebase.auth.UserCredential,
	credential?: AppleAuthentication.AppleAuthenticationCredential
) {
	if (userData && userData.user) {
		const uid = userData.user.uid;

		let { user, updateUser } = await getAndUpdateFirebaseUser(
			dispatch,
			userData.user,
			credential
		);

		await firebase
			.firestore()
			.collection('users')
			.doc(uid)
			.get()
			.then((profileSnap) => {
				const profile = profileSnap.data() as User | undefined;
				if (!profile || !profile.timezone) {
					user.timezone = Localization.timezone;
					updateUser = true;
				}
				if (user && (!profile || updateUser)) {
					return profileSnap.ref
						.set(user, { merge: true })
						.then(() => user);
				} else {
					return user;
				}
			})
			.then((user) => {
				dispatch(setCurrentUserAction(uid));
				Sentry.configureScope((scope) => {
					scope.setUser({
						email: user.email as string,
						id: uid,
					});
				});
			});
	}
}

function buildUser(
	firebaseUser: firebase.User,
	credential?: AppleAuthentication.AppleAuthenticationCredential
) {
	let updateUser = false;
	let user = omit(
		firebaseUser.toJSON(),
		constants.defaultConfig.keysToRemoveFromAuth
	) as any;

	// if Firebase returns a weird apple email but login has a real one, use that
	if (
		credential &&
		credential.email &&
		!credential.email.includes('privaterelay.appleid.com') &&
		user.email?.includes('privaterelay.appleid.com')
	) {
		updateUser = true;
		user.email = credential.email;
	}

	if (
		credential &&
		credential.fullName &&
		(!user.displayName ||
			user.displayName.includes('privaterelay.appleid.com'))
	) {
		updateUser = true;
		const { fullName } = credential;
		user.displayName = `${fullName.givenName} ${fullName.familyName}`;
	}

	return { user, updateUser };
}

/**
 * Builds the user attrs to update, and updates the FireBase Auth user if needed
 */
async function getAndUpdateFirebaseUser(
	dispatch: DispatchProp['dispatch'],
	firebaseUser: firebase.User,
	credential?: AppleAuthentication.AppleAuthenticationCredential
) {
	const { user, updateUser } = buildUser(firebaseUser, credential);

	if (updateUser && user.email && user.email !== firebaseUser.email) {
		try {
			await firebaseUser?.updateEmail(user.email);
		} catch (e) {
			if (e.code === 'auth/email-already-in-use') {
				dispatch(
					toastAction(
						`We tried to update your email, but it's already in use. This could be caused by mixing sign in methods or Apple relay emails. You can view your current email in Settings, but if your data looks right you can ignore this!`,
						99999999999999
					)
				);
			} else {
				dispatch(toastAction(e.message));
			}
		}
	}

	if (
		updateUser &&
		user.displayName &&
		user.displayName !== firebaseUser.displayName
	) {
		await firebaseUser.updateProfile({ displayName: user.displayName });
	}

	return { user, updateUser };
}
