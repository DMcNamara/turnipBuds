import { Pattern } from '../constants';
import { getMinMax } from './weeks/week-price.repository';

export const FriendsCollection = 'friends';
export interface Friend {
	accepted: boolean;
	email: string;
	friend: User;
	uid: string;
}

/** Copied from StalkMarket package */
export type PriceAnalysis = {
	patternIdx: number;
	patternName: string;
	matches: number[][][];
	probability: number;
	probabilityPerMatch: number;
}[];

export const UsersCollection = 'users';
export interface User {
	avatarUrl: string;
	displayName: string;
	email: string;
	id: string;
	price: {
		weekId: string;
		start: string;
		likeliestPattern: Omit<PriceAnalysis[0], 'matches'> & {
			matches: string;
		};
		mostRecent?: number;
		/** when the most recent value occurred, eg: monAM */
		mostRecentTime?: string;
	};
	pro?: boolean;
	timezone?: string;
}

export const WeeksCollection = 'weeks';
export const FriendsWeekCollection = `Friend${WeeksCollection}`;
export class WeekPrice {
	constructor(props?: Partial<WeekPrice>) {
		if (props) {
			Object.assign(this, props);

			// firestore doesn't save nested arrays, so the matches are stored as a string
			if (props.predictions) {
				this.predictions = props.predictions.map((p) => ({
					...p,
					matches:
						typeof p.matches === 'string'
							? JSON.parse(p.matches)
							: p.matches,
				}));
			}
		}
	}

	id: string = '';
	start: string | null = null;
	islandBuyPrice: number | null = null;
	previousPattern: Pattern | null = null;
	monAM: number | null = null;
	monPM: number | null = null;
	tueAM: number | null = null;
	tuePM: number | null = null;
	wedAM: number | null = null;
	wedPM: number | null = null;
	thuAM: number | null = null;
	thuPM: number | null = null;
	friAM: number | null = null;
	friPM: number | null = null;
	satAM: number | null = null;
	satPM: number | null = null;

	predictions: PriceAnalysis = [];
	/** This week's 100% likely pattern */
	pattern: Pattern | null = null;

	getMinMax() {
		return this.predictions
			.filter((p) => p.patternIdx >= 0)
			.map((p) => getMinMax(p));
	}
}
