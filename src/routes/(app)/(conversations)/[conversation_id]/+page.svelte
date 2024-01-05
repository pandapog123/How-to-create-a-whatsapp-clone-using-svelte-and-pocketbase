<script lang="ts">
  import { page } from "$app/stores";
  import { conversationsStore, pb } from "$lib/pocketbase";
  import MdGroup from "svelte-icons/md/MdGroup.svelte";
  import MdArrowBack from "svelte-icons/md/MdArrowBack.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import { type Conversation } from "$lib/types";
  import type { ActionData, PageData } from "./$types";
  import { browser } from "$app/environment";
  import MessagesContainer from "$lib/components/MessagesContainer.svelte";
  import MessageInputContainer from "$lib/components/MessageInputContainer.svelte";
  import { fade } from "svelte/transition";
  import ConversationSettings from "$lib/components/ConversationSettings.svelte";

  export let data: PageData;
  export let form: ActionData;

  let showConversationSettings = false;
  let conversation: Conversation | undefined;

  $: if ($conversationsStore) {
    const conversationFound = $conversationsStore.find(
      (item) => item.id === $page.params.conversation_id
    );

    conversation = conversationFound;
  }
</script>

<svelte:head>
  {#if browser}
    {#if conversation}
      <title>
        {conversation.name}
      </title>
    {:else}
      <title>No conversation found</title>
    {/if}
  {:else}
    <title>Loading conversation</title>
  {/if}
</svelte:head>

<svelte:document
  on:keydown={(event) => {
    if (showConversationSettings) {
      if (event.key === "Escape") {
        event.preventDefault();
        showConversationSettings = false;
      }
    }
  }}
/>

{#if conversation && $pb}
  <div class="conversation-container">
    <header>
      <section class="conversation-information">
        <a href="/" class="back-link">
          <div class="icon">
            <MdArrowBack />
          </div>
        </a>

        <div class="conversation-image">
          {#if conversation.photo && conversation.photo.length > 0}
            <img
              src={$pb.getFileUrl(conversation, conversation.photo)}
              alt={conversation.name}
            />
          {:else}
            <div class="icon">
              <MdGroup />
            </div>
          {/if}
        </div>

        <h1>{conversation.name}</h1>
      </section>

      <nav>
        <button
          class="settings"
          on:click={() => (showConversationSettings = true)}
        >
          <div class="icon">
            <IoMdSettings />
          </div>
        </button>
      </nav>
    </header>

    <MessagesContainer authModel={data.authModel} {conversation} />

    <MessageInputContainer />
  </div>

  {#if showConversationSettings}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="conversation-settings"
      transition:fade={{ duration: 100 }}
      on:click={() => (showConversationSettings = false)}
    >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="conversation-settings-content" on:click|stopPropagation>
        <ConversationSettings
          {conversation}
          authModel={data.authModel}
          on:close={() => (showConversationSettings = false)}
        />
      </div>
    </div>
  {/if}
{:else}
  <section class="no-conversation-found">
    <span>No conversation found</span>

    <a href="/">Home</a>
  </section>
{/if}

<style>
  .conversation-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
  }

  /* #region Conversation information */
  header {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--secondary-color);
  }

  .conversation-information {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .back-link {
    display: block;
  }

  .back-link:hover {
    opacity: 0.8;
  }

  .back-link .icon {
    color: var(--primary-text-color);
  }

  h1 {
    font-size: 20px;
  }

  .icon {
    color: var(--primary-color);
    width: 2rem;
    height: 2rem;
    border-radius: 100rem;
  }

  .conversation-image {
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    border-radius: 100rem;
    background-color: var(--primary-text-color);
  }

  .conversation-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .conversation-image .icon {
    padding: 8px;
  }

  .settings {
    background-color: transparent;
    padding: 8px;
    border: none;
    border-radius: 100rem;
    transition: all 150ms ease-in-out;
  }

  .settings:hover {
    background-color: var(--tertiary-color);
  }

  .settings .icon {
    color: var(--primary-text-color);
  }
  /* #endregion */

  .no-conversation-found {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .no-conversation-found span {
    font-size: 24px;
  }

  .no-conversation-found a {
    display: block;
  }

  /* #region Conversation settings */
  .conversation-settings {
    background-color: rgba(0, 0, 0, 0.4);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
  }

  .conversation-settings-content {
    width: 100vw;
    height: 100vh;
    background-color: var(--primary-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* #endregion */

  @media (min-width: 700px) {
    .back-link {
      display: none;
    }

    .no-conversation-found {
      height: 100%;
    }

    .no-conversation-found a {
      display: none;
    }

    .conversation-settings-content {
      width: 80vw;
      max-width: 660px;
      height: 80vh;
      max-height: 660px;
      border-radius: 1rem;
    }
  }
</style>
