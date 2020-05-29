import Constants from 'expo-constants';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import { AsyncStorage } from 'react-native';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import {
	FirestoreReducer,
	ReactReduxFirebaseProviderProps,
} from 'react-redux-firebase';
import { combineReducers, createStore } from 'redux';
import { createFirestoreInstance, firestoreReducer } from 'redux-firestore';
import { persistReducer, persistStore } from 'redux-persist';
import { authReducer, AuthState } from './auth/auth.reducer';
import {
	friendIndexReducer,
	FriendIndexState,
} from './friends/friend-index.reducer';
import { toastReducer, ToastState } from './toast/toast.reducer';

const {
	FB_API_KEY,
	FB_APP_ID,
	FB_AUTH_DOMAIN,
	FB_DATABASE_URL,
	FB_MEASUREMENT_ID,
	FB_MESSAGING_SENDER_ID,
	FB_PROJECT_ID,
	FB_STORAGE_BUCKET,
} = Constants.manifest.extra;

firebase.initializeApp({
	apiKey: FB_API_KEY,
	authDomain: FB_AUTH_DOMAIN,
	databaseURL: FB_DATABASE_URL,
	projectId: FB_PROJECT_ID,
	storageBucket: FB_STORAGE_BUCKET,
	messagingSenderId: FB_MESSAGING_SENDER_ID,
	appId: FB_APP_ID,
	measurementId: FB_MEASUREMENT_ID,
});

firebase.firestore();
const functions = firebase.functions();

// Cloud Functions
export const Functions = {
	addFriend: functions.httpsCallable('addFriend'),
};

const persistConfig = {
	key: 'root',
	storage: AsyncStorage,
};
export interface RootState {
	firestore: FirestoreReducer.Reducer;
	auth: AuthState;
	friendIndex: FriendIndexState;
	toast: ToastState;
}
const rootReducer = combineReducers<RootState>({
	firestore: firestoreReducer as any,
	auth: authReducer,
	friendIndex: friendIndexReducer,
	toast: toastReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const rrfConfig = {
	useFirestoreForProfile: true,
	userProfile: 'users',
	enableRedirectHandling: false,
	enableLogging: true,
	updateProfileOnLogin: true,
};

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
export const rrfProps: ReactReduxFirebaseProviderProps = {
	firebase,
	config: rrfConfig,
	dispatch: store.dispatch,
	createFirestoreInstance, // <- needed if using firestore
};
