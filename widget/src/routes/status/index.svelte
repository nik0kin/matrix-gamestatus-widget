<script lang="ts">
  import type { PlayerSummary } from './_steam-api';
  import { PersonaState } from './_steam-api';
  import { getSortedList, getStatus } from './_status-helpers';

  export let playerSummaries: PlayerSummary[];
  export let error: string | undefined;
</script>

<svelte:head>
  <title>Steam Status'</title>
  <meta name="description" content="A list of friend's steam status" />
</svelte:head>

{#if error}
  <h1> Error </h1>
  <p>{error}</p>
{/if}

{#if !error}
  <div class="steam-status">
    <h1>Steam Status'</h1>

    <ul>
      {#each getSortedList(playerSummaries) as playerSummary}
        <li
          class:away={playerSummary.personastate === PersonaState.AWAY || playerSummary.personastate === PersonaState.AWAY_ZZZ}
          class:offline={playerSummary.personastate === PersonaState.OFFLINE}
        >
          {playerSummary.personaname} - {getStatus(playerSummary)}
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
