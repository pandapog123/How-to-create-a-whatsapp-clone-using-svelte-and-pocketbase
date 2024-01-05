<script>
  import { page } from "$app/stores";
</script>

<main>
  <section>
    {#key $page.url.pathname}
      <div class="container">
        <slot />
      </div>
    {/key}
  </section>
</main>

<style>
  main {
    background-color: var(--primary-color);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }

  section {
    background-color: var(--secondary-color);
    width: 100%;
    height: 100%;
    display: flex;
  }

  .container {
    display: flex;
    overflow: scroll;
    flex-direction: column;
    justify-content: space-between;
    gap: 4rem;
    padding: 2rem;
    width: 100%;
  }

  @media (min-width: 700px) {
    section {
      width: 80vw;
      max-width: 660px;
      height: 80vh;
      max-height: 660px;
      border-radius: 1rem;
      overflow: hidden;
    }
  }
</style>
