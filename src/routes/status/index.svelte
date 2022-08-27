<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonGameStatus } from '$lib/common-game-status';

  export let playerStatus: CommonGameStatus[];
  export let error: string | undefined;

  let loadingNewPage: boolean = false;

  onMount(() => {
    // Refresh the page every 60 seconds
    setTimeout(() => {
      location.reload();
    }, 60 * 1000);
  });
</script>

<svelte:head>
  <title>Steam Status'</title>
  <meta name="description" content="A list of friend's steam status" />
</svelte:head>

{#if error}
  <h1>Error</h1>
  <p>{error}</p>
{/if}

{#if !error}
  <div class="steam-status">
    <h1>Steam Status'</h1>

    <button
      disabled={loadingNewPage}
      on:click={() => {
        loadingNewPage = true;
        goto('/history');
      }}
    >
      {#if !loadingNewPage}
        Match History
      {:else}
        Loading
      {/if}
    </button>

    <ul>
      {#each playerStatus as singlePlayerStatus}
        <li class:away={singlePlayerStatus.away} class:offline={singlePlayerStatus.offline}>
          {singlePlayerStatus.userKey} - {singlePlayerStatus.status}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .steam-status {
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

  li.away {
    opacity: 50%;
  }

  li.offline {
    opacity: 20%;
  }
</style>
