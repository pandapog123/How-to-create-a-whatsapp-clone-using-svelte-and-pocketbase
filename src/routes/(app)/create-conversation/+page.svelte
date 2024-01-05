<script context="module" lang="ts">
  type PageEvents = {
    close: undefined;
  };
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import { pb } from "$lib/pocketbase";
  import { createEventDispatcher } from "svelte";
  import IoIosCloseCircle from "svelte-icons/io/IoIosCloseCircle.svelte";
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";
  import IoMdAdd from "svelte-icons/io/IoMdAdd.svelte";
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import { validateUser, type User } from "$lib/types";
  import type { PageData } from "./$types";
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";

  export let data: PageData;
  export let isModal = false;

  const eventDispatcher = createEventDispatcher<PageEvents>();

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

      usersCollection
        .getFullList({
          filter: `name ~ "${searchText}%" && id != "${data.authModel.id}"`,
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
      const result = await fetch("/create-conversation", {
        method: "post",
        body: JSON.stringify({
          selectedUsers,
        }),
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

      return;
    }

    if (isModal) {
      eventDispatcher("close");
    } else {
      goto("/");
    }
  }
</script>

<div class="app-container" class:app-container-full={!isModal}>
  <header>
    <div class="headings">
      <h1>Create a conversation</h1>

      {#if isModal}
        <button
          class="close-button"
          on:click={() => {
            eventDispatcher("close");
          }}
        >
          <IoIosCloseCircle />
        </button>
      {/if}
    </div>

    <nav>
      <input
        type="text"
        bind:value={searchText}
        placeholder="Search by names or e-mail"
      />

      {#if selectedUsers.length > 0}
        <button
          transition:fade={{ duration: 150 }}
          on:click={handleSelectionClick}
        >
          {showSelected ? "Hide" : "Show"} selection
        </button>
      {/if}
    </nav>
  </header>

  <main>
    {#if searchResults.length === 0 && !showSelected}
      <div class="no-user-found">No users found? Search for them!</div>
    {/if}

    {#each showSelected ? selectedUsers : searchResults as user}
      {@const userSelected = selectedUsers.find((item) => item.id === user.id)}

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
  </main>

  <footer>
    <p>
      {selectedUsers.length}
      {selectedUsers.length === 1 ? "person" : "people"} selected
    </p>

    <button
      disabled={selectedUsers.length === 0 || submitting}
      on:click={handleSubmit}
    >
      Continue
    </button>
  </footer>
</div>

<style>
  .app-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .app-container-full {
    height: 100vh;
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--secondary-color);
  }

  .headings {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: start;
  }

  h1 {
    font-size: 32px;
    font-weight: bold;
  }

  .close-button {
    background: transparent;
    padding: 0;
    border: none;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: all 150ms ease-in-out;
    color: var(--primary-text-color);
  }

  .close-button:hover {
    opacity: 0.7;
  }

  .close-button:active {
    opacity: 0.5;
  }

  nav {
    display: flex;
    gap: 8px;
  }

  input {
    outline: none;
    border: none;
    border-radius: 8px;
    background-color: rgb(87, 87, 87);
    flex-grow: 1;
    padding: 12px;
    font-size: 20px;
    color: var(--primary-text-color);
    background-color: var(--tertiary-color);
  }

  main {
    flex-grow: 1;
    overflow-y: scroll;
  }

  .no-user-found {
    height: 100%;
    font-size: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
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

  footer {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--secondary-color);
  }

  p {
    font-size: 20px;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 20px;
    background-color: var(--accent-color);
    color: var(--primary-text-color);
    transition: all 150ms ease-in-out;
  }

  button:hover {
    opacity: 0.8;
  }

  button:disabled:hover {
    opacity: 1;
  }

  button:disabled {
    background-color: var(--tertiary-color);
  }
</style>
