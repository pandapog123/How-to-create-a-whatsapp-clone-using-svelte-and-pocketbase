<script lang="ts">
  import { goto, preloadData, pushState } from "$app/navigation";
  import { page } from "$app/stores";
  import { fade } from "svelte/transition";
  import CreateConversationPage from "../create-conversation/+page.svelte";
  import type { PageData } from "./$types";
  import UserNavBar from "$lib/components/UserNavBar.svelte";
  import ConversationsNavBar from "$lib/components/ConversationsNavBar.svelte";
  import { userStore } from "$lib/pocketbase";

  export let data: PageData;

  let pageState: {
    [name: string]: any;
  };
  let showUserNavBar = false;

  $: pageState = $page.state;

  async function openCreateConversation(
    event: MouseEvent & {
      currentTarget: EventTarget & HTMLAnchorElement;
    }
  ) {
    if (event.metaKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const { href } = event.currentTarget;

    const result = await preloadData(href);

    if (result.type === "loaded" && result.status === 200) {
      pushState(href, {
        showCreateConversation: true,
        createConversationData: result.data,
      });
    } else {
      goto(href);
    }
  }
</script>

<svelte:document
  on:keydown={(event) => {
    if (pageState.showCreateConversation) {
      if (event.key === "Escape") {
        event.preventDefault();
        history.back();
      }
    }
  }}
/>

<main>
  {#if showUserNavBar}
    <UserNavBar
      authModel={$userStore ?? data.authModel}
      on:close={() => (showUserNavBar = false)}
    />
  {/if}

  <ConversationsNavBar
    authModel={$userStore ?? data.authModel}
    on:openCreateConversation={({ detail }) => openCreateConversation(detail)}
    on:openUserNav={() => (showUserNavBar = true)}
  />

  {#key $page.url.pathname}
    <section
      class="hide"
      class:show={$page.url.pathname !== "/"}
      in:fade={{ duration: 150 }}
    >
      <slot />
    </section>
  {/key}
</main>

{#if pageState.showCreateConversation}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <section
    class="modal"
    on:click={() => {
      history.back();
    }}
    transition:fade={{ duration: 100 }}
  >
    <div class="modal-content" on:click|stopPropagation>
      <CreateConversationPage
        data={pageState.createConversationData}
        isModal={true}
        on:close={() => {
          history.back();
        }}
      />
    </div>
  </section>
{/if}

<style>
  main {
    height: 100vh;
  }

  .hide {
    display: none;
  }

  .show {
    display: block;
  }

  .modal {
    background-color: rgba(0, 0, 0, 0.4);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
  }

  .modal-content {
    width: 100vw;
    height: 100vh;
    background-color: var(--primary-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    overflow: hidden;
  }

  @media (min-width: 700px) {
    main {
      display: grid;
      grid-template-columns: clamp(20rem, 40vw, 25rem) auto;
    }

    .hide {
      display: block;
    }

    .modal-content {
      width: 80vw;
      max-width: 660px;
      height: 80vh;
      max-height: 660px;
      border-radius: 1rem;
    }
  }
</style>
