import { PlayerSummary, PersonaState } from './steam-api';
import { Settings } from './settings';

function getStatus(player: PlayerSummary) {
  if (player.personastate === PersonaState.OFFLINE) return 'Offline';
  if (player.gameid || player.gameextrainfo)
    return 'Playing ' + (player.gameextrainfo || player.gameid);
  return 'Online';
}

export function getSteamFriendsStatusString(
  settings: Required<Settings>,
  friends: PlayerSummary[]
) {
  const friendStatus = friends.map((f) => {
    return ` - **${f.personaname}** - ${getStatus(f)}`;
  });

  return `Steam Status:
${friendStatus.join('\n')}`;
}
