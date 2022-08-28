<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonMatchHistory } from '$lib/common-game-status';
  import { formatDuration } from '$lib/utils/format-time';

  export let matchHistories: CommonMatchHistory[];
  export let apisUsed: string[];

  onMount(() => {
    // Refresh the page every 10 minutes
    setTimeout(() => {
      location.reload();
    }, 10 * 60 * 1000);
  });
</script>

<svelte:head>
  <title>Match History</title>
  <meta name="description" content="A list of friend's LoL match history" />
</svelte:head>

<div class="prose main-div">
  <h1 class="mb-4">Match History</h1>

  <button class="btn btn-wide mb-4" on:click={() => goto('/status')}> Back </button>

  {#each matchHistories as match}
    <div class="card w-96 bg-base-100 shadow-xl mb-2" style="max-width: 100%">
      <div class="p-2">
        <div class="flex items-center space-x-2">
          <div>
            <div class="text-lg font-extrabold">{match.userKey} - {match.game}</div>
            <div class="text-base-content/70 text-xs mb-1">
              {new Date(match.date).toLocaleString([], {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })} - {formatDuration(match.length)}
            </div>
            <div class="text-base-content/70 text-sm">{match.status}</div>
          </div>
        </div>
      </div>
    </div>
  {/each}
  <br />
  <button class="btn btn-wide" on:click={() => goto('/status')}> Back </button>
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
