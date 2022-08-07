<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonMatchHistory } from '$lib/common-game-status';

  export let matchHistories: CommonMatchHistory[];
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
  <div class="main-div">
    <h1>Match History</h1>

    <button on:click={() => goto('/status')}> Back </button>

    <ul>
      {#each matchHistories as match}
        <li>
          {match.userKey} - {new Date(match.date).toLocaleString()} - <small>{match.status}</small>
        </li>
      {/each}
    </ul>
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
    margin-bottom: 8px;
  }
</style>
