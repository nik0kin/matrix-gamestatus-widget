<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonMatchHistory } from '$lib/common-game-status';

  export let matchHistories: CommonMatchHistory[];
  export let apisUsed: string[];
  export let error: string | undefined;

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

{#if error}
  <h1>Error</h1>
  <p>{error}</p>
{/if}

{#if !error}
  <div class="prose main-div">
    <h1>Match History</h1>

    <button class="btn btn-wide" on:click={() => goto('/status')}> Back </button>

    <ul>
      {#each matchHistories as match}
        <li>
          {match.game} -
          {match.userKey} -
          <small
            >{new Date(match.date).toLocaleString([], {
              year: '2-digit',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}</small
          >
          -
          <small>{match.status}</small>
        </li>
      {/each}
    </ul>
    <br />
    <button class="btn btn-wide" on:click={() => goto('/status')}> Back </button>
    <br />
    {#if apisUsed.includes('riotgames')}
      <p>
        matrix-gamestatus-widget isn't endorsed by Riot Games and doesn't reflect the views or
        opinions of Riot Games or anyone officially involved in producing or managing Riot Games
        properties. Riot Games, and all associated properties are trademarks or registered
        trademarks of Riot Games, Inc.
      </p>
    {/if}
  </div>
{/if}

<style>
  .main-div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 16px;
  }
</style>
