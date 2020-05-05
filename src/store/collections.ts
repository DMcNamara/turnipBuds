export const FriendsCollection = 'friends';
export interface Friend {
	accepted: boolean;
	email: string;
	friend: User;
	uid: string;
}
export const UsersCollection = 'users';
export interface User {
	avatarUrl: string;
	displayName: string;
	email: string;
	id: string;
}

export const WeeksCollection = 'weeks';
export class WeekPrice {
	constructor(props?: Partial<WeekPrice>) {
		if (props) {
			Object.assign(this, props);
		}
	}

	start: Date | null = null;
	id: string = '';
	islandBuyPrice: number | null = null;
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
}
