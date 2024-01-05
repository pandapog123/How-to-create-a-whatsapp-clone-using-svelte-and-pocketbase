<script context="module" lang="ts">
  type ComponentEvents = {
    close: undefined;
  };
</script>

<script lang="ts">
  import { enhance } from "$app/forms";

  import { page } from "$app/stores";

  import type { Conversation, User } from "$lib/types";
  import { createEventDispatcher } from "svelte";

  export let conversation: Conversation;
  export let authModel: User;

  const dispatchEvent = createEventDispatcher<ComponentEvents>();
</script>

<section>
  <div>
    <h1>Choose an image</h1>

    <form
      action="{$page.url.pathname}?/editConversationPhoto"
      method="post"
      enctype="multipart/form-data"
      use:enhance={() => {
        return () => {
          dispatchEvent("close");
        };
      }}
    >
      <input
        type="file"
        name="photo"
        accept="image/jpg image/png image/svg image/gif image/webp"
      />

      <button>Submit</button>
    </form>
  </div>

  <button class="cancel" on:click={() => dispatchEvent("close")}> Back </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 4rem;
    padding: 1rem;
    overflow: scroll;
    height: 100%;
  }

  button {
    padding: 8px;
    border-radius: 8px;
    border: 1px solid var(--tertiary-color);
    background-color: var(--secondary-color);
    color: var(--primary-text-color);
    font-size: 16px;
    width: 100%;
    transition: all 150ms ease-in-out;
  }

  button:hover {
    opacity: 0.8;
  }

  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    width: 100%;
  }

  h1 {
    font-size: 28px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    align-items: center;
  }

  form input {
    font-size: 16px;
  }

  form button {
    background-color: var(--accent-color);
    border: none;
  }
</style>
