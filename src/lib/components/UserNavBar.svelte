<script context="module" lang="ts">
  type ComponentEvents = {
    close: null;
  };
</script>

<script lang="ts">
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";
  import IoIosCloseCircle from "svelte-icons/io/IoIosCloseCircle.svelte";
  import { page } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { pb } from "$lib/pocketbase";
  import type { User } from "$lib/types";
  import { enhance } from "$app/forms";

  const dispatchEvent = createEventDispatcher<ComponentEvents>();

  export let authModel: User;

  let editingProfile = false;
</script>

<nav
  transition:fly={{ x: "-100%", duration: 200, opacity: 0.5 }}
  class:hide={$page.url.pathname !== "/"}
>
  <header>
    <h1>Account information</h1>

    <button class="close-user-nav" on:click={() => dispatchEvent("close")}>
      <div class="icon">
        <IoIosCloseCircle />
      </div>
    </button>
  </header>

  <section class="user-nav-container">
    {#if editingProfile}
      <form
        action="/?/updateUserInformation"
        method="post"
        class="profile-form"
        enctype="multipart/form-data"
        use:enhance={() => {
          return () => {
            editingProfile = false;
          };
        }}
      >
        <div class="input-container">
          <span>Name</span>

          <input type="text" name="name" value={authModel.name} />
        </div>

        <div class="input-container">
          <span>Profile image</span>

          <input
            type="file"
            name="photo"
            accept="image/jpg image/png image/svg image/gif image/webp"
          />
        </div>

        <button type="submit" class="update-profile">Update profile</button>
      </form>

      <button on:click={() => (editingProfile = false)}>Cancel</button>
    {:else}
      <div class="personal-information">
        <div class="image">
          {#if authModel.photo && authModel.photo.length > 0 && $pb}
            <img
              src={$pb.files.getUrl(authModel, authModel.photo)}
              alt={authModel.name}
            />
          {:else}
            <FaUserCircle />
          {/if}
        </div>

        <span class="name">{authModel.name}</span>
        <span class="email">{authModel.email}</span>
      </div>

      <div class="account-actions">
        <button on:click={() => (editingProfile = true)}>Edit profile</button>

        <form action="/signout" method="post">
          <button type="submit" class="log-out"> Log out </button>
        </form>
      </div>
    {/if}
  </section>
</nav>

<style>
  .hide {
    display: none;
  }

  nav {
    display: flex;
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: var(--primary-color);
    flex-flow: column;
    border: none;
  }

  header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--secondary-color);
  }

  .close-user-nav {
    background: transparent;
    padding: 0;
    border: none;
  }

  .close-user-nav:hover {
    opacity: 0.8;
  }

  .close-user-nav .icon {
    color: var(--primary-text-color);
  }

  .user-nav-container {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
    height: 100%;
    overflow: scroll;
  }

  .user-nav-container button {
    padding: 8px;
    background-color: var(--tertiary-color);
    border: none;
    font-size: 1rem;
    color: white;
    border-radius: 8px;
    width: 100%;
    transition: all 150ms ease-in-out;
    transition-delay: 0ms;
  }

  .user-nav-container button:hover {
    opacity: 0.8;
  }

  button.log-out {
    background-color: var(--delete-color);
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .profile-form button {
    background-color: var(--accent-color);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 18px;
  }

  input {
    padding: 8px;
    border: none;
    outline: none;
    font-size: 14px;
    border-radius: 8px;
  }

  .personal-information {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4px;
  }

  .personal-information .image {
    width: 10rem;
    height: 10rem;
    border-radius: 100rem;
    overflow: hidden;
  }

  .personal-information img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .personal-information .name {
    font-size: 24px;
  }
  .personal-information .email {
    font-size: 20px;
    color: var(--secondary-text-color);
  }

  .account-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .icon {
    color: var(--primary-color);
    width: 2rem;
    height: 2rem;
    border-radius: 100rem;
  }

  @media (min-width: 700px) {
    .hide {
      display: flex;
    }

    nav {
      width: clamp(20rem, 40vw, 25rem);
      border-right: 2px solid var(--tertiary-color);
    }
  }
</style>
