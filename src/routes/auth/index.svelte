<!-- From a users perspective:
  - it starts up,
  - shows loading indicator,
  - gets an accessToken,
  - then auths,
  - then redirects to status page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getOpenIDConnectToken } from '$lib/matrix-widget-client';
  import type { PostAuthRequest } from './_auth-request-types';

  export let isDebug: boolean;

  onMount(async () => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const widgetId = urlParams.get('widgetId');

    // if (!widgetId) throw new Error('missing widgetId');

    // const mxwidgets = (window as any).mxwidgets();

    // const [accessToken, matrixServerName] = await startClient(mxwidgets, widgetId);

    if (isDebug) return goto('/status');

    const widgetApi = await (window as any).__getWidgetApi;
    const [accessToken, matrixServerName] = await getOpenIDConnectToken(widgetApi);

    console.log('openIDConnectToken acquired', accessToken, matrixServerName);
    const request: PostAuthRequest = {
      accessToken,
      matrixServerName,
    };
    await fetch('/auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    await goto('/status');
  });
</script>

<svelte:head>
  <title>Loading</title>
  <meta name="description" content="Authing with matrix" />
</svelte:head>

<div class="loading prose">
  <h1>Loading</h1>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
