<script context="module" lang="ts">
  export type ComponentEvents = {
    close: null;
  };
</script>

<script lang="ts">
  import type { Conversation, User } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import MdGroup from "svelte-icons/md/MdGroup.svelte";
  import IoIosCloseCircle from "svelte-icons/io/IoIosCloseCircle.svelte";
  import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";
  import { cachedUsers, pb } from "$lib/pocketbase";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import SettingsMembersView from "./SettingsMembersView.svelte";
  import SettingsPhotoChangeView from "./SettingsPhotoChangeView.svelte";

  export let conversation: Conversation;
  export let authModel: User;

  let editingMembers = false;
  let editingPhoto = false;

  const dispatchEvent = createEventDispatcher<ComponentEvents>();
</script>

{#if $pb}
  {@const canLeaveConversation = !(
    conversation.admins.includes(authModel.id) && conversation.admins.length < 2
  )}
  {@const canDeleteConversation = conversation.admins.includes(authModel.id)}

  <header>
    <h1>Conversation settings</h1>

    <button class="close-button" on:click={() => dispatchEvent("close")}>
      <IoIosCloseCircle />
    </button>
  </header>

  {#if editingMembers}
    <SettingsMembersView
      {authModel}
      {conversation}
      on:close={() => (editingMembers = false)}
    />
  {:else if editingPhoto}
    <SettingsPhotoChangeView
      {authModel}
      {conversation}
      on:close={() => (editingPhoto = false)}
    />
  {:else}
    <div class="conversation-actions">
      <section class="conversation-information">
        <div class="conversation-image-container">
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
          {#if conversation.admins.includes(authModel.id)}
            <button class="edit-button" on:click={() => (editingPhoto = true)}>
              <IoMdCreate />
            </button>
          {/if}
        </div>

        {#if conversation.admins.includes(authModel.id)}
          <form
            action="{$page.url.pathname}/?/editConversationName"
            method="POST"
            use:enhance
          >
            <input type="text" name="name" value={conversation.name} />
            <button>Change name</button>
          </form>
        {:else}
          <span class="conversation-name">{conversation.name}</span>
        {/if}

        <div class="conversation-members">
          <span>
            {conversation.members.reduce((previous, current, i) => {
              let userFound = $cachedUsers[current]?.name;

              if (!userFound && authModel.id === current) {
                userFound = "You";
              }

              if (!userFound) {
                return previous;
              }

              if (i === 0) {
                return userFound;
              } else {
                return `${previous}, ${userFound}`;
              }
            }, "")}
          </span>

          {#if conversation.admins.includes(authModel.id)}
            <button on:click={() => (editingMembers = true)}>
              Edit members
            </button>
          {/if}
        </div>
      </section>

      <section class="danger-zone">
        <span>Danger Zone</span>

        <section class="danger-zone-content">
          {#if canLeaveConversation}
            <form
              action="{$page.url.pathname}?/leaveConversation"
              method="POST"
            >
              <button> Leave conversation </button>
            </form>
          {/if}

          {#if canDeleteConversation}
            <form
              action="{$page.url.pathname}?/deleteConversation"
              method="POST"
            >
              <button> Delete conversation </button>
            </form>
          {/if}
        </section>
      </section>
    </div>
  {/if}
{/if}

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--secondary-color);
    padding: 1rem;
  }

  .close-button {
    background-color: transparent;
    color: var(--primary-text-color);
    border: none;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 100rem;
    transition: all 150ms ease-in-out;
  }

  .close-button:hover {
    opacity: 0.8;
  }

  .conversation-actions {
    height: 100%;
    overflow-y: scroll;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .conversation-information {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .conversation-image-container {
    position: relative;
  }

  .conversation-image-container .edit-button {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 40px;
    height: 40px;
    padding: 8px;
    border: none;
    border-radius: 100rem;
    background-color: var(--secondary-color);
    color: var(--primary-text-color);
    transition: all 150ms ease-in-out;
  }

  .conversation-image-container .edit-button:hover {
    background-color: var(--tertiary-color);
  }

  .conversation-image {
    width: 10rem;
    height: 10rem;
    overflow: hidden;
    background-color: var(--primary-text-color);
    border-radius: 100rem;
  }

  .conversation-image img {
    border-radius: 100rem;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .conversation-image .icon {
    overflow: hidden;
    padding: 1.5rem;
    color: var(--primary-color);
  }

  .conversation-name {
    font-size: 24px;
  }

  .conversation-members {
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .conversation-members button {
    background-color: transparent;
    color: var(--accent-color);
    font-size: 16px;
    border: 1px solid var(--tertiary-color);
    border-radius: 4px;
    transition: all 150ms ease-in-out;
    padding: 4px 12px;
    width: fit-content;
  }

  .conversation-members button:hover {
    background-color: var(--secondary-color);
  }

  .danger-zone {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    font-size: 20px;
  }

  .danger-zone-content {
    padding: 1rem;
    border: 1px solid var(--delete-color);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .danger-zone button {
    padding: 8px;
    font-size: 16px;
    border: 1px solid var(--tertiary-color);
    border-radius: 8px;
    background-color: var(--secondary-color);
    color: var(--delete-color);
    transition: all 150ms ease-in-out;
    width: 100%;
  }

  .danger-zone button:hover {
    background-color: var(--delete-color);
    color: var(--primary-text-color);
    border-color: transparent;
  }
</style>
