<script lang="ts">
  import type { ActionData } from "./$types";

  export let form: ActionData;
</script>

<section class="content-container">
  <div class="headers">
    <h1>Log in</h1>

    <p class="subtitle">
      Log into your account and start messaging your friends now!
    </p>
  </div>

  <form method="POST">
    <div class="inputs">
      <input
        type="email"
        name="email"
        placeholder="E-mail"
        value={form?.email ?? ""}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form?.password ?? ""}
      />

      {#if form?.error}
        <p class="error">{form.error}</p>
      {/if}
    </div>

    <button type="submit">Log in</button>
  </form>
</section>

<section class="link-container">
  <p>Don't have an account?</p>

  <a href="/signup">Sign up</a>
</section>

<style>
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .headers {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  h1 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 20px;
    color: var(--secondary-text-color);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .error {
    color: var(--delete-color);
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  input {
    border-radius: 8px;
    padding: 8px;
    border: 1px solid transparent;
    font-size: 16px;
    outline: none;
  }

  button {
    border: none;
    background: var(--accent-color);
    border-radius: 8px;
    padding: 8px;
    font-size: 16px;
    color: var(--primary-text-color);
    transition: all 150ms ease-in-out;
  }

  button:hover {
    opacity: 0.8;
  }

  .link-container {
    font-size: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  a {
    color: var(--primary-text-color);
    text-align: center;
    padding: 8px;
    border: 1px solid var(--tertiary-color);
    border-radius: 8px;
    text-decoration: none;
    transition: all 150ms ease-in-out;
  }

  a:hover {
    background-color: var(--tertiary-color);
  }
</style>
