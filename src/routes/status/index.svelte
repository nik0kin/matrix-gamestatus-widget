<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { CommonGameStatus } from '$lib/common-game-status';

  export let playerStatus: CommonGameStatus[];
  export let providerErrors: string[];

  let loadingNewPage: boolean = false;

  onMount(() => {
    // Refresh the page every 60 seconds
    setTimeout(() => {
      if (loadingNewPage) return;

      location.reload();
    }, 60 * 1000);
  });
</script>

<svelte:head>
  <title>Steam Status'</title>
  <meta name="description" content="A list of friend's steam status" />
</svelte:head>

<div class="prose steam-status">
  <h1 class="mb-4">Steam Status'</h1>

  <button
    class="btn btn-wide mb-4"
    class:loading={loadingNewPage}
    disabled={loadingNewPage}
    on:click={() => {
      loadingNewPage = true;
      goto('/history');
    }}
  >
    Match History
  </button>

  {#each playerStatus as singlePlayerStatus}
    <div
      class="card w-96 bg-base-100 shadow-xl mb-2"
      style="max-width: 100%"
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
            <div class="mask mask-squircle bg-base-content h-12 w-12 bg-opacity-10 p-px">
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
  <br />
  {#if providerErrors && providerErrors.length}
    <br />
    <div class="tooltip tooltip-bottom" data-tip={providerErrors.join('\n')}>
      <strong>Status fetch ERRORS occurred</strong>
    </div>
  {/if}
</div>

<style>
  .steam-status {
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

    .avatar .h-12.w-12 {
      width: 4rem;
      height: 4rem;
    }
  }
</style>
