<script lang="ts" context="module">
  type ComponentEvents = {
    openUserNav: null;
    openCreateConversation: MouseEvent & {
      currentTarget: EventTarget & HTMLAnchorElement;
    };
  };
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import { conversationsStore, pb } from "$lib/pocketbase";
  import type { User } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";
  import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";
  import MdGroup from "svelte-icons/md/MdGroup.svelte";

  export let authModel: User;

  const dispatchEvent = createEventDispatcher<ComponentEvents>();
</script>

{#if $pb}
  <nav class="hide" class:show={$page.url.pathname === "/"}>
    <header>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="user-information"
        on:click={() => dispatchEvent("openUserNav")}
      >
        <div class="user-image">
          {#if authModel.photo && authModel.photo.length > 0 && $pb}
            <img
              src={$pb.files.getUrl(authModel, authModel.photo)}
              alt={authModel.name}
            />
          {:else}
            <FaUserCircle />
          {/if}
        </div>

        <span class="user-name">{authModel.name}</span>
        <span class="user-email">{authModel.email}</span>
      </div>

      <a
        href="/create-conversation"
        on:click={(event) => dispatchEvent("openCreateConversation", event)}
        class="create-conversation"
      >
        <IoMdCreate />
      </a>
    </header>

    <section class="conversations-view">
      {#if $conversationsStore && $conversationsStore.length > 0}
        {@const sortedConversations = [...$conversationsStore].sort((a, b) => {
          return (
            new Date(b.messages[0]?.created ?? b.created).getTime() -
            new Date(a.messages[0]?.created ?? a.created).getTime()
          );
        })}
        {#each sortedConversations as conversation}
          {@const createdDate =
            conversation.messages.length > 0
              ? new Date(conversation.messages[0].created)
              : new Date(conversation.created)}

          <a class="conversation-link" href="/{conversation.id}">
            <div class="conversation-information">
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

              <div class="conversation-text-information">
                <div class="conversation-title">
                  <span>
                    {conversation.name}
                  </span>

                  <span>
                    {#if createdDate.toLocaleDateString() === new Date().toLocaleDateString()}
                      {createdDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    {:else}
                      {createdDate.toLocaleDateString()}
                    {/if}
                  </span>
                </div>

                <span class="conversation-message">
                  {#if conversation.messages.length > 0}
                    {#if conversation.messages[0].contentType === "message"}
                      {conversation.messages[0].content}
                    {:else}
                      One image
                    {/if}
                  {:else}
                    No message
                  {/if}
                </span>
              </div>
            </div>
          </a>

          <hr />
        {/each}
      {:else}
        <div class="no-conversations">
          <span>No conversations... yet!</span>
        </div>
      {/if}
    </section>
  </nav>
{/if}

<style>
  nav {
    height: 100vh;
    overflow: scroll;
    display: flex;
    flex-flow: column;
  }

  .hide {
    display: none;
  }

  .show {
    display: block;
  }

  header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--secondary-color);
  }

  .user-information {
    display: grid;
    grid-template-columns: repeat(3, auto);
    grid-template-rows: repeat(2, auto);
    column-gap: 0.5rem;
  }

  .user-name {
    font-size: 20px;
    font-weight: bold;
  }

  .user-email {
    font-size: 18px;
    color: var(--secondary-text-color);
  }

  .user-image {
    width: 3rem;
    height: 3rem;
    grid-column: span 2;
    grid-row: span 2;
  }

  .user-image img {
    width: 3rem;
    height: 3rem;
    border-radius: 100rem;
    object-fit: cover;
  }

  .create-conversation {
    color: var(--primary-text-color);
    background-color: var(--accent-color);
    transition: all 150ms ease-in-out;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.5rem;
    border-radius: 100rem;
  }

  .create-conversation:hover {
    opacity: 0.8;
  }

  .no-conversations {
    flex-grow: 1;
    padding-bottom: 5rem;
    display: grid;
    place-items: center;
    font-size: 20px;
  }

  .conversation-link {
    text-decoration: none;
    color: var(--primary-text-color);
  }

  .conversation-information {
    padding: 1rem;
    display: flex;
    gap: 0.5rem;
    transition: all 150ms ease-in-out;
  }

  .conversation-information:hover {
    background-color: var(--secondary-color);
  }

  .conversation-text-information {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    overflow: hidden;
    flex-grow: 1;
  }

  .conversation-title {
    font-size: 16px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .conversation-title :nth-child(1) {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .conversation-title span {
    white-space: nowrap;
  }

  .conversation-message {
    font-size: 16px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .icon {
    color: var(--primary-color);
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

  hr {
    border: 1px solid var(--tertiary-color);
  }

  @media (min-width: 700px) {
    nav {
      border-right: 2px solid var(--tertiary-color);
    }

    .hide {
      display: block;
    }
  }
</style>
