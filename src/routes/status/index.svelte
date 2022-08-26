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
  <div class="prose steam-status">
    <h1>Steam Status'</h1>

    <button
      class="btn btn-wide mb-6"
      class:loading={loadingNewPage}
      disabled={loadingNewPage}
      on:click={() => {
        loadingNewPage = true;
        goto('/history');
      }}
    >
      Match History
    </button>

    <div>
      {#each playerStatus as singlePlayerStatus}
        <div
          class="card w-96 max-w-full bg-base-100 shadow-xl mb-4"
          style="max-width: 100vw"
          class:opacity-50={singlePlayerStatus.away}
          class:opacity-20={singlePlayerStatus.offline}
        >
          <div class="p-2">
            <div class="flex items-center space-x-2">
              <div
                class="avatar not-prose"
                class:online={!singlePlayerStatus.away && !singlePlayerStatus.offline}
                class:offline={singlePlayerStatus.away || singlePlayerStatus.offline}
              >
                <div class="mask mask-squircle bg-base-content h-16 w-16 bg-opacity-10 p-px">
                  {#if singlePlayerStatus.avatarUrl}
                    <img
                      src={singlePlayerStatus.avatarUrl}
                      alt="{singlePlayerStatus.userKey} Steam Avatar"
                      class="mask mask-squircle"
                    />
                  {/if}
                </div>
              </div>
              <div>
                <div class="text-lg font-extrabold">{singlePlayerStatus.userKey}</div>
                <div class="text-base-content/70 text-sm">{singlePlayerStatus.status}</div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .steam-status {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
