<script lang="ts">
  import pkg from 'lodash';
  const { uniqBy } = pkg;
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonMatchHistory } from '$lib/common-game-status';
  import { formatDuration } from '$lib/utils/format-time';
  import type { GetMatchHistoriesResponse } from './_response-types';

  export let matchHistories: GetMatchHistoriesResponse['matchHistories'];
  export let apisUsed: GetMatchHistoriesResponse['apisUsed'];
  export let providerErrors: GetMatchHistoriesResponse['providerErrors'];

  $: combinedMatchHistories =
    // Remove duplicates
    uniqBy(matchHistories, ({ date, game, length }) => date + game + length)
      // Create CombinedMatchHistory
      .map((commonMatchHistory): CombinedMatchHistory => {
        // not efficient but w/e since we aren't dealing with 100s of matches
        const players = matchHistories
          .filter((cmh) => {
            return (
              cmh.date === commonMatchHistory.date &&
              cmh.game === commonMatchHistory.game &&
              cmh.length === commonMatchHistory.length
            );
          })
          .map(({ userKey, status }) => ({ userKey, status }));

        return {
          ...commonMatchHistory,
          players,
        };
      });

  interface CombinedMatchHistory extends CommonMatchHistory {
    players: Array<{ userKey: string; status: string }>;
  }

  onMount(() => {
    // Refresh the page every 5 minutes
    setTimeout(() => {
      location.reload();
    }, 5 * 60 * 1000);
  });

  function formatMatchDate(date: number) {
    return new Date(date).toLocaleString([], {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
</script>

<svelte:head>
  <title>Match History</title>
  <meta name="description" content="A list of friend's LoL match history" />
</svelte:head>

<div class="prose main-div">
  <h1 class="mb-4">Match History</h1>

  <button class="btn btn-wide mb-4" on:click={() => goto('/status')}> Back </button>

  {#each combinedMatchHistories as match}
    <div class="card bg-base-100 shadow-xl mb-2" style="max-width: 100%">
      <div class="p-2">
        <div class="flex items-center space-x-2">
          <div>
            <div class="text-lg font-extrabold">
              {#if match.players.length === 1}
                {match.userKey} -
              {/if}
              {match.game}
            </div>
            <div class="text-base-content/70 text-xs mb-1">
              {formatMatchDate(match.date)} - {formatDuration(match.length)}
            </div>
            <div class="text-base-content/70 text-sm">
              {#if match.players.length === 1}
                {match.status}
              {/if}
              {#if match.players.length > 1}
                {#each match.players as player}
                  <span class="font-extrabold">{player.userKey}</span>&nbsp;
                  {player.status}<br />
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/each}
  <br />
  <button class="btn btn-wide" on:click={() => goto('/status')}> Back </button>
  {#if providerErrors}
    <br />
    <div class="tooltip tooltip-bottom" data-tip={providerErrors.join('\n')}>
      <strong>Match History fetch ERRORS occurred</strong>
    </div>
  {/if}
  <br />
  {#if apisUsed.includes('riotgames')}
    <p>
      matrix-gamestatus-widget isn't endorsed by Riot Games and doesn't reflect the views or
      opinions of Riot Games or anyone officially involved in producing or managing Riot Games
      properties. Riot Games, and all associated properties are trademarks or registered trademarks
      of Riot Games, Inc.
    </p>
  {/if}
</div>

<style>
  .main-div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 30rem;
  }

  @media (min-width: 480px) {
    h1.mb-4 {
      margin-bottom: 2rem;
    }

    button.mb-4 {
      margin-bottom: 2rem;
    }

    .card.mb-2 {
      margin-bottom: 1rem;
    }
  }
</style>
