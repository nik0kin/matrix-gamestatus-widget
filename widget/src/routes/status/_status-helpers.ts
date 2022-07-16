import type { PlayerSummary } from './_steam-api';
import { PersonaState } from './_steam-api';
// import { Settings } from './settings';

export function getStatus(player: PlayerSummary) {
	if (player.personastate === PersonaState.OFFLINE) return 'Offline';

	switch (player.personastate as PersonaState) {
		case PersonaState.OFFLINE:
			return 'Offline'; // TODO offline since
		case PersonaState.AWAY:
			return `Away`;
		case PersonaState.AWAY_ZZZ:
			return `Away(zzz)`;
		case PersonaState.ONLINE:
			break;
		default:
			return `Unknown(${player.personastate})`;
	}

	if (player.gameid || player.gameextrainfo)
		return 'Playing ' + (player.gameextrainfo || player.gameid);
	return 'Online';
}

export function getSortedList(friends: PlayerSummary[]) {
	return friends.sort((f1, f2) => {
		// TODO alphabetize ties

		if (
			f1.personastate === PersonaState.ONLINE &&
			f1.gameid &&
			f2.personastate === PersonaState.ONLINE &&
			f2.gameid
		) {
			return 0;
		}

		if (
			f1.personastate === PersonaState.ONLINE &&
			f1.gameid &&
			f2.personastate === PersonaState.ONLINE &&
			!f2.gameid
		) {
			return -1;
		}

		if (f1.personastate === PersonaState.ONLINE && f2.personastate !== PersonaState.ONLINE) {
			return -1;
		}

		if (
			f1.personastate === PersonaState.AWAY &&
			(f2.personastate === PersonaState.AWAY_ZZZ || f2.personastate === PersonaState.OFFLINE)
		) {
			return -1;
		}

		if (f1.personastate === PersonaState.AWAY_ZZZ && f2.personastate === PersonaState.OFFLINE) {
			return -1;
		}

		if (f1.personastate === PersonaState.OFFLINE && f2.personastate === PersonaState.OFFLINE) {
			return f2.lastlogoff - f1.lastlogoff;
		}

		return 1;
	});
}

// export function getSteamFriendsStatusString(
//   settings: Required<Settings>,
//   friends: PlayerSummary[]
// ) {
//   const sortedFriends = friends.sort((f1, f2) => {
//     // TODO alphabetize ties

//     if (
//       f1.personastate === PersonaState.ONLINE &&
//       f1.gameid &&
//       f2.personastate === PersonaState.ONLINE &&
//       f2.gameid
//     ) {
//       return 0;
//     }

//     if (
//       f1.personastate === PersonaState.ONLINE &&
//       f1.gameid &&
//       f2.personastate === PersonaState.ONLINE &&
//       !f2.gameid
//     ) {
//       return -1;
//     }

//     if (
//       f1.personastate === PersonaState.ONLINE &&
//       f2.personastate !== PersonaState.ONLINE
//     ) {
//       return -1;
//     }

//     if (
//       f1.personastate === PersonaState.AWAY &&
//       (f2.personastate === PersonaState.AWAY_ZZZ ||
//         f2.personastate === PersonaState.OFFLINE)
//     ) {
//       return -1;
//     }

//     if (
//       f1.personastate === PersonaState.AWAY_ZZZ &&
//       f2.personastate === PersonaState.OFFLINE
//     ) {
//       return -1;
//     }

//     if (
//       f1.personastate === PersonaState.OFFLINE &&
//       f2.personastate === PersonaState.OFFLINE
//     ) {
//       return f2.lastlogoff - f1.lastlogoff;
//     }

//     return 1;
//   });

//   const friendStatus = sortedFriends.map((f) => {
//     return ` - **${f.personaname}** - ${getStatus(f)}`;
//   });

//   return `Steam Status:
// ${friendStatus.join('\n')}`;
// }
