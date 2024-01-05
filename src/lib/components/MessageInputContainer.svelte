<script lang="ts">
  import { page } from "$app/stores";
  import { conversationsStore } from "$lib/pocketbase";
  import IoMdAdd from "svelte-icons/io/IoMdAdd.svelte";
  import IoIosSend from "svelte-icons/io/IoIosSend.svelte";
  import { type Conversation } from "$lib/types";
  import { enhance } from "$app/forms";
  import { fly } from "svelte/transition";

  let messageInput = "";
  let conversation: Conversation | undefined;
  let imageSendOpen = false;
  let submittingImage = false;
  $: if ($conversationsStore) {
    const conversationFound = $conversationsStore.find(
      (item) => item.id === $page.params.conversation_id
    );

    conversation = conversationFound;
  }
</script>

<section class="message-input-container">
  <div class="image-send-container">
    {#if submittingImage || imageSendOpen}
      <form
        class="image-send"
        method="POST"
        action="{$page.url.pathname}?/sendImage"
        enctype="multipart/form-data"
        use:enhance={() => {
          submittingImage = true;

          return () => {
            submittingImage = false;
            imageSendOpen = false;
          };
        }}
        transition:fly={{ y: 20, duration: 150 }}
      >
        <p>Choose a file</p>

        <input
          type="file"
          name="photo"
          accept="image/jpg image/png image/svg image/gif image/webp"
        />

        <button disabled={submittingImage}>Submit</button>
      </form>
    {/if}

    <button
      class="add-button"
      on:click={() => (imageSendOpen = !imageSendOpen)}
    >
      <div class="icon" class:open={imageSendOpen}>
        <IoMdAdd />
      </div>
    </button>
  </div>

  <form
    class="message-form"
    method="POST"
    action="{$page.url.pathname}?/sendMessage"
    use:enhance={() => {
      return () => {
        messageInput = "";
      };
    }}
  >
    <input
      type="text"
      name="message"
      class="message-input"
      placeholder="Type a message"
      bind:value={messageInput}
    />

    <button disabled={messageInput === ""}>
      <IoIosSend />
    </button>
  </form>
</section>

<style>
  .icon {
    color: var(--primary-color);
    width: 2rem;
    height: 2rem;
    border-radius: 100rem;
  }

  .message-input-container {
    display: flex;
    gap: 1rem;
    padding: 8px 16px;
    background-color: var(--secondary-color);
  }

  .message-input-container .icon {
    color: var(--primary-text-color);
  }

  .image-send-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .image-send {
    position: absolute;
    background-color: var(--tertiary-color);
    bottom: 4rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 8px;
  }

  .image-send p {
    font-size: 20px;
  }

  .image-send button {
    padding: 8px;
    border: none;
    background-color: var(--accent-color);
    font-size: 16px;
    color: var(--primary-text-color);
    border-radius: 8px;
    transition: all 150ms ease-in-out;
  }

  .image-send button:hover {
    opacity: 0.8;
  }

  .add-button {
    margin: 0;
    padding: 0;
    background-color: transparent;
    border: none;
  }

  .add-button:hover {
    opacity: 0.8;
  }

  .add-button .icon {
    transition: all 150ms ease-in-out;
  }

  .open {
    transform: rotate(135deg);
  }

  .message-form {
    flex-grow: 1;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .message-form button {
    background-color: var(--accent-color);
    border: none;
    border-radius: 100rem;
    margin: 0;
    padding: 0;
    transition: all 150ms ease-in-out;
    color: var(--primary-text-color);
    width: 2.5rem;
    height: 2.5rem;
    padding: 8px;
    transition: all 150ms ease-in-out;
  }

  .message-form button:hover {
    opacity: 0.8;
  }

  .message-form button:disabled {
    background-color: var(--secondary-text-color);
  }

  .message-input {
    flex-grow: 1;
    outline: none;
    font-size: 18px;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background-color: var(--tertiary-color);
    color: var(--primary-text-color);
  }
</style>
