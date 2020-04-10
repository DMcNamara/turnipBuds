import firebase from 'firebase/app';
import 'firebase/firestore';
import {
	FB_API_KEY,
	FB_APP_ID,
	FB_AUTH_DOMAIN,
	FB_DATABASE_URL,
	FB_MEASUREMENT_ID,
	FB_MESSAGING_SENDER_ID,
	FB_PROJECT_ID,
	FB_STORAGE_BUCKET,
} from 'react-native-dotenv';
import { combineReducers, createStore } from 'redux';
import { firestoreReducer } from 'redux-firestore';

console.log('here');
console.log(firebase);
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

const rootReducer = combineReducers({
	firestore: firestoreReducer,
});

const initialState = {};
export const store = createStore(rootReducer, initialState);
