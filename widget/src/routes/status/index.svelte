<script lang="ts">
  import type { PlayerSummary } from './_steam-api';
  import { getSortedList, getStatus } from './_status-helpers';

  export let playerSummaries: PlayerSummary[];
</script>

<svelte:head>
  <title>Steam Status'</title>
  <meta name="description" content="A todo list app" />
</svelte:head>

<div class="steam-status">
  <h1>Steam Status'</h1>

  <ul>
    {#each getSortedList(playerSummaries) as playerSummary}
      <li>{playerSummary.personaname} - {getStatus(playerSummary)}</li>
    {/each}
  </ul>
</div>

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
</style>
