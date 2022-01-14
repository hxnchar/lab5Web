<script>
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import {
    debtors,
    isAuthenticated,
    token,
    user,
    messageToUser,
    loadersCount,
  } from "./store";
  import { onMount } from "svelte";
  import { BarLoader } from "svelte-loading-spinners";
  import auth from "./auth-service";
  token.subscribe(async tokenValue => {
    if (tokenValue != "") {
      const { laba5_Debtors } = await http.startFetchMyQuery(
        Queries.AllRecords()
      );
      debtors.set(laba5_Debtors);
    }
  });

  $: $messageToUser && setTimeout(() => ($messageToUser = ""), 5000);
  let auth0Client, online;
  let newDeptorInfo = {};

  onMount(async () => {
    auth0Client = await auth.createClient();
    isAuthenticated.set(await auth0Client.isAuthenticated());
    const accessToken = await auth0Client.getIdTokenClaims();
    if (accessToken) {
      token.set(accessToken.__raw);
    }
    user.set(await auth0Client.getUser());
  });

  function login() {
    auth.loginWithPopup(auth0Client);
  }

  function logout() {
    token.set("");
    auth.logout(auth0Client);
  }

  const AddDebtor = async () => {
    const { name, surname, money } = newDeptorInfo;
    if (!name || !surname || !money) {
      $messageToUser = "Surname, name and debt are required!";
      return;
    }
    try {
      const { insert_laba5_Debtors } = await http.startExecuteMyMutation(
        Queries.InsertRecord(
          newDeptorInfo.surname,
          newDeptorInfo.name,
          newDeptorInfo.money
        )
      );
      debtors.update(n => [...n, insert_laba5_Debtors.returning[0]]);
      newDeptorInfo = {};
      $messageToUser = "Added successfully";
    } catch (e) {
      $messageToUser = `Error occurred while inserting: ${e.message}. Check values to be inserted`;
    }
  };

  const DeleteThis = async idToRemove => {
    try {
      await http.startExecuteMyMutation(Queries.DeleteById(idToRemove));
      debtors.update(n => n.filter(item => item.id != idToRemove));
      $messageToUser = "Deleted successfully";
    } catch (e) {
      $messageToUser = `Error occurred: ${e.message}`;
    }
  };
</script>

<svelte:window bind:online />

<main>
  {#if online}
    {#if $isAuthenticated}
      {#if $debtors.loading}
        <div class="overlay">
          <BarLoader size="120" color="white" unit="px" />
          <div class="overlay background" />
        </div>
      {:else if $debtors.error}
        <div class="overlay">
          <h1>Error occurred :(</h1>
          <div class="overlay background" />
        </div>
      {:else if $debtors}
        <header>Debtors list</header>
        <main>
          {#if $debtors.length === 0}
            <h1>No deptors yet :(</h1>
          {:else}
            <table>
              <tr>
                <th>Surname</th>
                <th>Name</th>
                <th>Debt</th>
                <th>Action</th>
              </tr>
              {#each $debtors as debtor (debtor.id)}
                <tr>
                  <td>{debtor.Surname}</td>
                  <td>{debtor.Name}</td>
                  <td>{debtor.Debt}</td>
                  <td
                    ><button on:click={() => DeleteThis(debtor.id)}
                      >Delete</button
                    ></td
                  >
                </tr>
              {/each}
            </table>
          {/if}
          <nav>
            <input bind:value={newDeptorInfo.surname} placeholder="Surname" />
            <input bind:value={newDeptorInfo.name} placeholder="Name" />
            <input bind:value={newDeptorInfo.money} placeholder="Debt" />
          </nav>
          <nav>
            <button on:click={AddDebtor}>Add debtor</button>
            <button on:click={logout}>Log out</button>
          </nav>
        </main>
        <footer>
          <div class="errorLabel">{$messageToUser}</div>
        </footer>
        <div class="overlay" class:visible={!$loadersCount}>
          <BarLoader size="120" color="white" unit="px" />
          <div class="overlay background" />
        </div>
      {/if}
    {:else}
      <div class="overlay">
        <h1>Please login before start</h1>
        <button on:click={login}>Login</button>
        <div class="overlay background" />
      </div>
    {/if}
  {:else}
    <div class="overlay">
      <h1>Waiting the internet connection to be restored</h1>
      <BarLoader size="120" color="white" unit="px" />
      <div class="overlay background" />
    </div>
  {/if}
</main>

<style>
  :global(:root) {
    --dark-gray: #282828;
    --darkest-blue: #0c0032;
    --blue: #190061;
    --lightner-blue: #1c006e;
    --lightnest-blue: #200080;
    --light-font: #f2f2f2;
    --default-animation-time: 0.2s;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }

  * {
    color: var(--light-font);
  }

  header {
    text-align: center;
    font-size: 4em;
    margin-bottom: 15px;
  }

  h1 {
    text-align: center;
  }

  main {
    margin: 0;
    padding: 0;
    min-height: 100%;
    min-width: 650px;
    background-color: var(--darkest-blue);
  }

  table {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
  }

  nav {
    width: 75%;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  input,
  button {
    background-color: var(--blue);
    margin: 15px;
    border: 0;
  }

  button {
    cursor: pointer;
    transition-duration: var(--default-animation-time);
  }

  button:hover {
    background-color: var(--lightner-blue);
    transition-duration: var(--default-animation-time);
  }

  th,
  button,
  input {
    background-color: var(--blue);
    height: clamp(25px, 7vh, 35px);
    width: clamp(200px, 13vw, 400px);
    padding: 0;
  }

  td {
    height: clamp(50px, 15vh, 75px);
    min-width: 200px;
    padding: 0;
  }

  tr:nth-child(odd) td {
    background-color: var(--lightner-blue);
  }

  tr:nth-child(even) td {
    background-color: var(--lightnest-blue);
  }

  tr:hover {
    filter: brightness(110%);
  }

  ::placeholder {
    color: var(--light-font);
  }

  .overlay {
    width: 100vw;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 0;
  }
  .overlay .background {
    width: 100%;
    height: 100%;
    background-color: var(--darkest-blue);
    opacity: 0.5;
    z-index: -1;
  }

  .visible {
    visibility: hidden;
  }

  .errorLabel {
    margin-left: 15%;
  }
</style>
