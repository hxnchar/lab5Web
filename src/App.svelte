<script>
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import {
    debtors,
    isAuthenticated,
    token,
    user,
    errorMSG,
    loadersCount,
  } from "./store";
  import { onMount } from "svelte";
  import { Jumper } from "svelte-loading-spinners";
  import auth from "./auth-service";
  let errorMessage, countLoaders, addDebtorDisabled, removeDebtorDisabled;
  errorMSG.subscribe(value => {
    errorMessage = value;
  });
  loadersCount.subscribe(value => {
    countLoaders = value;
  });
  const newDeptorInfo = {};
  token.subscribe(async tokenValue => {
    if (tokenValue != "") {
      const { laba5_Debtors } = await http.startFetchMyQuery(
        Queries.AllRecords()
      );
      debtors.set(laba5_Debtors);
    }
  });

  let auth0Client;

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
    addDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    const { name, surname, money } = newDeptorInfo;
    if (!name || !surname || !money) {
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      errorMSG.set("Surname, name and debt are required!");
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
    } catch {
      errorMSG.set("Error occurred");
      addDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      return;
    }
    addDebtorDisabled = false;
    loadersCount.update(n => n - 1);
    errorMSG.set("");
  };

  const RemoveDebtors = async () => {
    removeDebtorDisabled = true;
    loadersCount.update(n => n + 1);
    try {
      await http.startExecuteMyMutation(Queries.DeleteNegative());
    } catch {
      errorMSG.set("Error occurred");
      removeDebtorDisabled = false;
      loadersCount.update(n => n - 1);
      return;
    }
    errorMSG.set("");
    removeDebtorDisabled = false;
    loadersCount.update(n => n - 1);
    debtors.update(n => n.filter(item => item.Debt > 0));
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      {#if $debtors.loading}
        <div>loading ...</div>
        <Jumper size="60" color="#FF3E00" unit="px" />
      {:else if $debtors.error}
        <div>Error!</div>
      {:else if $debtors}
        <input bind:value={newDeptorInfo.surname} placeholder="Surname" />
        <input bind:value={newDeptorInfo.name} placeholder="Name" />
        <input bind:value={newDeptorInfo.money} placeholder="Debt" />
        <button on:click={AddDebtor} disabled={addDebtorDisabled}
          >Add debtor😈</button
        >
        <button on:click={RemoveDebtors} disabled={removeDebtorDisabled}
          >Delete some debtors =)</button
        >
        <button on:click={logout}>Log out</button>
        <table border="1">
          <caption>Debtors</caption>
          <tr>
            <th>Surname</th>
            <th>Name</th>
            <th>Debt</th>
          </tr>
          {#each $debtors as debtor (debtor.id)}
            <tr>
              <td>{debtor.Surname}</td>
              <td>{debtor.Name}</td>
              <td>{debtor.Debt}</td>
            </tr>
          {/each}
        </table>
        <p>{errorMessage}</p>
        <div style="visibility:{countLoaders > 0 ? 'visible' : 'hidden'}">
          <Jumper size="60" color="#FF3E00" unit="px" />
        </div>
      {/if}
    {:else}
      <button on:click={login}>Login</button>
    {/if}
  </div>
</main>

<style>
  main {
    padding: 0;
    margin: 0;
  }
</style>
