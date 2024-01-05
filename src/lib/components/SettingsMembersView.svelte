<script context="module" lang="ts">
  type ComponentEvents = {
    close: undefined;
  };
</script>

<script lang="ts">
  import { cachedUsers, pb } from "$lib/pocketbase";
  import { validateUser, type Conversation, type User } from "$lib/types";
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import IoMdAdd from "svelte-icons/io/IoMdAdd.svelte";
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import { createEventDispatcher } from "svelte";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import { browser } from "$app/environment";
  import { fade } from "svelte/transition";

  export let conversation: Conversation;
  export let authModel: User;

  const dispatchEvent = createEventDispatcher<ComponentEvents>();

  let addingMembers = false;

  let searchText = "";
  let searchResults: User[] = [];
  let selectedUsers: User[] = [];
  let showSelected = false;
  let submitting = false;

  $: if (selectedUsers.length === 0) {
    showSelected = false;
  }

  $: if ($pb && browser) {
    if (searchText === "") {
      searchResults = [];
    } else {
      let localSearchText = searchText;

      const usersCollection = $pb.collection("users");

      const conversationMemberQuery = conversation.members.reduce(
        (previous, current, i) => {
          if (i === 0) {
            return `id != "${current}"`;
          }
          return `${previous} && id != "${current}"`;
        },
        ""
      );

      usersCollection
        .getFullList({
          filter: `name ~ "${searchText}%" && id != "${authModel.id}" && ${conversationMemberQuery}`,
        })
        .then((results) => {
          let validatedResults: User[] = [];

          for (const item of results) {
            if (validateUser(item)) {
              validatedResults.push(item);
            } else {
              return;
            }
          }

          if (searchText === localSearchText) {
            searchResults = validatedResults;
          }
        });
    }
  }

  function handleClickUser(user: User) {
    const userSelected = selectedUsers.includes(user);

    if (selectedUsers.length === 4 && !userSelected) {
      return;
    }

    if (userSelected) {
      selectedUsers = selectedUsers.filter((item) => item.id !== user.id);

      return;
    }

    selectedUsers = [...selectedUsers, user];
  }

  function handleSelectionClick() {
    if (selectedUsers.length === 0) {
      return;
    }

    showSelected = !showSelected;
  }

  async function handleSubmit() {
    if (!(selectedUsers.length > 0 && selectedUsers.length < 5)) {
      return;
    }

    submitting = true;

    try {
      let formData = new FormData();

      formData.append(
        "members",
        JSON.stringify(selectedUsers.map(({ id }) => id))
      );

      const result = await fetch(`${$page.url.pathname}?/addMembers`, {
        method: "post",
        body: formData,
      });

      if (!result.ok) {
        const { message } = await result.json();

        if (typeof message === "string") {
          throw new Error(message);
        } else {
          throw new Error("Unknown error occured when createing conversation");
        }
      }
    } catch (error) {
      submitting = false;

      console.log(error);

      return;
    }

    addingMembers = false;
  }
</script>

{#if $pb}
  {#if addingMembers}
    <nav>
      <input type="text" bind:value={searchText} />

      {#if selectedUsers.length > 0}
        <button
          class="user-button"
          transition:fade={{ duration: 150 }}
          on:click={handleSelectionClick}
        >
          {showSelected ? "Hide" : "Show"} selection
        </button>
      {/if}
    </nav>

    <section class="users">
      {#if searchResults.length === 0 && !showSelected}
        <div class="no-user-found">No users found? Search for them!</div>
      {/if}

      {#each showSelected ? selectedUsers : searchResults as user}
        {@const userSelected = selectedUsers.find(
          (item) => item.id === user.id
        )}

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="list-item"
          class:selected={userSelected}
          transition:fade={{ duration: 150 }}
          on:click={() => handleClickUser(user)}
        >
          <div class="user-information">
            <div class="user-image">
              {#if user.photo && user.photo.length > 0 && $pb}
                <img src={$pb.files.getUrl(user, user.photo)} alt={user.name} />
              {:else}
                <FaUserCircle />
              {/if}
            </div>

            <div class="user-name">{user.name}</div>
            <div class="user-email">{user.email}</div>
          </div>

          <button
            class="user-button"
            class:remove={userSelected}
            on:click|stopPropagation={() => handleClickUser(user)}
          >
            <div class="icon">
              {#if userSelected}
                <IoMdClose />
              {:else}
                <IoMdAdd />
              {/if}
            </div>

            <p>{userSelected ? "Remove" : "Add"}</p>
          </button>
        </div>

        <hr />
      {/each}
    </section>

    <div class="actions">
      <button
        class="add"
        disabled={submitting || selectedUsers.length === 0}
        on:click={handleSubmit}
      >
        Add {selectedUsers.length} members
      </button>

      <button
        class="cancel"
        disabled={submitting}
        on:click={() => (addingMembers = false)}
      >
        Cancel
      </button>
    </div>
  {:else}
    <section class="editing-members">
      <div class="members">
        {#each conversation.members.filter((member) => member !== authModel.id) as userID}
          {@const user = $cachedUsers[userID]}

          {#if user}
            <div class="member-container">
              <div class="member">
                <div class="photo">
                  {#if user.photo}
                    <img src={$pb.getFileUrl(user, user.photo)} alt="" />
                  {:else}
                    <FaUserCircle />
                  {/if}
                </div>

                <div class="member-information">
                  <span class="name">{user.name}</span>
                  <span class="email">{user.email}</span>
                </div>
              </div>

              <form
                action="{$page.url.pathname}?/removeMember"
                method="POST"
                use:enhance
              >
                <input type="hidden" name="user-id" value={user.id} />

                <button class="remove-member">
                  <IoMdTrash />
                </button>
              </form>
            </div>

            <hr />
          {/if}
        {/each}
      </div>

      <div class="actions">
        <button class="add" on:click={() => (addingMembers = true)}>
          Add
        </button>

        <button class="cancel" on:click={() => dispatchEvent("close")}>
          Back
        </button>
      </div>
    </section>
  {/if}
{/if}

<style>
  nav {
    background-color: var(--secondary-color);
    padding: 0 1rem 8px 1rem;
    display: flex;
    gap: 8px;
  }

  nav input {
    width: 100%;
    padding: 1rem;
    font-size: 16px;
    outline: none;
    border-radius: 8px;
    border: none;
    background-color: var(--tertiary-color);
    color: var(--primary-text-color);
  }

  .users {
    overflow: scroll;
  }

  .editing-members {
    overflow: scroll;
    display: flex;
    flex-direction: column;
  }

  .member-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 16px;
  }

  .remove-member {
    background-color: transparent;
    border: 2px solid var(--secondary-color);
    color: var(--delete-color);
    width: 3rem;
    height: 3rem;
    padding: 6px;
    border-radius: 100rem;
    transition: all 150ms ease-in-out;
  }

  .remove-member:hover {
    background-color: var(--secondary-color);
  }

  .member {
    padding: 1rem;
    display: flex;
    gap: 1rem;
    transition: all 150ms ease-in-out;
  }

  .photo {
    width: 3rem;
    height: 3rem;
    overflow: hidden;
    border-radius: 100rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .member-information {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
  }

  .name {
    font-size: 20px;
  }

  .email {
    color: var(--secondary-text-color);
  }

  hr {
    border: 2px solid var(--tertiary-color);
  }

  .actions {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .actions button {
    padding: 8px;
    font-size: 18px;
    border: 1px solid var(--tertiary-color);
    border-radius: 8px;
    transition: all 150ms ease-in-out;
  }

  .cancel {
    color: var(--primary-text-color);
    background-color: transparent;
  }

  .cancel:hover {
    background-color: var(--secondary-color);
  }

  .add {
    background-color: transparent;
    color: var(--accent-color);
  }

  .add:hover {
    color: var(--primary-text-color);
    background-color: var(--accent-color);
    border-color: transparent;
  }

  .add:disabled {
    background-color: transparent;
    color: var(--secondary-text-color);
  }

  .add:disabled:hover {
    border: 1px solid var(--tertiary-color);
    background-color: transparent;
  }

  .no-user-found {
    height: 100%;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-top: 0.5rem;
    margin-bottom: 2rem;
  }

  .list-item {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    transition: all 150ms ease-in-out;
  }

  .list-item:hover {
    background-color: var(--tertiary-color);
  }

  .list-item.selected {
    background-color: var(--tertiary-color);
  }

  .list-item button {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 100px;
    padding-left: 0.75rem;
  }

  button.remove {
    background-color: var(--delete-color);
  }

  .icon {
    display: flex;
    align-items: center;
    width: 22px;
    padding: 0;
  }

  .user-image {
    width: 3.5rem;
    height: 3.5rem;
    grid-column: span 2;
    grid-row: span 2;
  }

  .user-image img {
    width: 100%;
    height: 100%;
    border-radius: 100rem;
    object-fit: cover;
  }

  .user-information {
    display: grid;
    grid-template-rows: repeat(2, auto);
    grid-template-columns: repeat(3, auto);
    column-gap: 1rem;
    height: 3.5rem;
  }

  .user-name {
    font-size: 24px;
    font-weight: bold;
  }

  .user-email {
    font-size: 18px;
    color: var(--secondary-text-color);
  }

  hr {
    border: 1px solid var(--tertiary-color);
  }

  p {
    font-size: 20px;
  }

  .user-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 20px;
    background-color: var(--accent-color);
    color: var(--primary-text-color);
    transition: all 150ms ease-in-out;
  }

  .user-button:hover {
    opacity: 0.8;
  }

  .user-button:disabled:hover {
    opacity: 1;
  }

  .user-button:disabled {
    background-color: var(--tertiary-color);
  }
</style>
