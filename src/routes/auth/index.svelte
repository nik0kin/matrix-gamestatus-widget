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

  let showUnsupportedClientMessage: boolean = false;

  onMount(async () => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const widgetId = urlParams.get('widgetId');

    // if (!widgetId) throw new Error('missing widgetId');

    // const mxwidgets = (window as any).mxwidgets();

    // const [accessToken, matrixServerName] = await startClient(mxwidgets, widgetId);

    if (isDebug) return goto('/status');

    // Show unsupported client message after 15s
    const clearUnsupportedTimeout = setTimeout(() => {
      showUnsupportedClientMessage = true;
    }, 15 * 1000);

    const widgetApi = await (window as any).__getWidgetApi;
    const [accessToken, matrixServerName] = await getOpenIDConnectToken(widgetApi);

    console.log('openIDConnectToken acquired', accessToken, matrixServerName);
    clearTimeout(clearUnsupportedTimeout);
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
  {#if showUnsupportedClientMessage}
    <p>Your matrix client does not support authenticated widgets.</p>
    <p>
      Please use Element-Web or open an issue for your favorite client to add support for <a
        href="https://github.com/matrix-org/matrix-spec-proposals/blob/old_master/proposals/1960-integrations-openid.md"
        target="_blank">MSC1690</a
      >.
    </p>
    <p>
      Give a 👍 on this <a
        href="https://github.com/vector-im/element-android/issues/2115"
        target="_blank">element-android issue</a
      > if it'd help you.
    </p>
  {/if}
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
