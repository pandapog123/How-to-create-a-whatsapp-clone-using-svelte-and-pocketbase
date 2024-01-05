<script lang="ts">
  import { cachedUsers, pb } from "$lib/pocketbase";
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import { type Message, type Conversation, type User } from "$lib/types";
  import { onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";

  export let authModel: User;
  export let conversation: Conversation;

  let scrollView: HTMLElement | undefined;
  let showRemoveButton: string | undefined;

  $: messageGroups =
    conversation &&
    conversation.messages
      .slice()
      .reverse()
      .reduce<Message[][]>((previousValue, currentValue) => {
        if (previousValue.length === 0) {
          return [[currentValue]];
        }

        const currentGroupIndex = previousValue.length - 1;
        const currentMessageIndex = previousValue[currentGroupIndex].length - 1;

        const message = previousValue[currentGroupIndex][currentMessageIndex];

        if (message.user_id === currentValue.user_id) {
          previousValue[currentGroupIndex].push(currentValue);
        } else {
          previousValue.push([currentValue]);
        }

        return previousValue;
      }, []);

  $: if (messageGroups && scrollView) {
    tick().then(() => {
      if (messageGroups && scrollView) {
        scrollView.scrollTo({
          top: scrollView.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }

  onMount(() => {
    if (scrollView) {
      scrollView.scrollTo({ top: scrollView.scrollHeight });
    }
  });
</script>

{#if $pb}
  <section class="messages-container" bind:this={scrollView}>
    {#each messageGroups as messageGroup}
      {@const messageUser = $cachedUsers[messageGroup[0].user_id]}

      <div class="message-group">
        {#if messageGroup[0].user_id !== authModel.id}
          <div class="message-image">
            {#if messageUser && messageUser.photo}
              <img
                src={$pb.files.getUrl(messageUser, messageUser.photo)}
                alt={messageUser.name}
              />
            {:else}
              <div class="icon">
                <FaUserCircle />
              </div>
            {/if}
          </div>
        {/if}

        <div class="user-messages-container">
          {#if messageUser && messageUser?.id !== authModel.id}
            <span class="name">{messageUser?.name ?? "Unknown user"}</span>
          {/if}

          {#each messageGroup as message}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="message-container"
              class:primary={message.user_id === authModel.id}
              on:mouseenter={() => (showRemoveButton = message.id)}
              on:mouseleave={() => (showRemoveButton = undefined)}
            >
              {#if message.user_id === authModel.id && showRemoveButton === message.id}
                <form
                  action="{$page.url.pathname}?/removeMessage"
                  method="POST"
                  transition:fly={{ x: 20, duration: 150 }}
                  use:enhance
                >
                  <input type="hidden" name="message-id" value={message.id} />

                  <button>
                    <IoMdTrash />
                  </button>
                </form>
              {/if}

              <div class="message">
                {#if message.contentType === "image"}
                  <img
                    src={$pb.getFileUrl(conversation, message.content)}
                    alt={message.content}
                  />
                {:else}
                  <span>
                    {message.content}
                  </span>
                {/if}
                <span class="message-date">
                  {new Date(message.created).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {#if conversation.admins.includes(authModel.id) && message.user_id !== authModel.id && showRemoveButton === message.id}
                <form
                  action="{$page.url.pathname}?/removeMessage"
                  method="POST"
                  transition:fly={{ x: -20, duration: 150 }}
                  use:enhance
                >
                  <input type="hidden" name="message-id" value={message.id} />

                  <button>
                    <IoMdTrash />
                  </button>
                </form>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </section>
{/if}

<style>
  .icon {
    color: var(--primary-color);
    width: 2rem;
    height: 2rem;
    border-radius: 100rem;
  }

  .messages-container {
    overflow-y: scroll;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 16px;
  }

  .message-group {
    display: flex;
    gap: 4px;
  }

  .user-messages-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .user-messages-container .name {
    font-size: 12px;
  }

  .message-container {
    width: 100%;
    display: flex;
  }

  .message-container.primary {
    justify-content: end;
  }

  .message-container form {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 8px;
    width: 24px;
  }

  .message-container form button {
    background-color: transparent;
    padding: 0;
    border: none;
    height: 23px;
    padding: 2px;
    border-radius: 100rem;
    color: var(--primary-text-color);
    background-color: var(--delete-color);
  }

  .message {
    padding: 6px;
    border-radius: 4px;
    background-color: var(--tertiary-color);
    display: flex;
    align-items: end;
    gap: 8px;
    max-width: 60%;
  }

  .message img {
    object-fit: cover;
    width: 100%;
  }

  .message :nth-child(1) {
    overflow: hidden;
    white-space: break-word;
    word-break: break-word;
  }

  .message :nth-child(2) {
    white-space: nowrap;
  }

  .primary .message {
    background-color: var(--accent-color);
  }

  .message-image {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    height: min-content;
  }

  .message-image .icon {
    color: var(--primary-text-color);
  }

  .message-image img {
    width: 2rem;
    height: 2rem;
    border-radius: 100rem;
    object-fit: cover;
  }

  .message-date {
    font-size: 11px;
    color: var(--secondary-text-color);
  }
</style>
