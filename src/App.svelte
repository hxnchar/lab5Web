<script>
  import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import http from "./helper/request-helper";
  import { Queries } from "./helper/requests";
  import { debtors, isAuthenticated, token, user } from "./store";
  import { onMount } from "svelte";
  import auth from "./auth-service";
  import { errorMSG } from "./stores.js";
  let errorMessage;
  errorMSG.subscribe(value => {
    errorMessage = value;
  });
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

  function createApolloClient() {
    const wsLink = new WebSocketLink({
      uri: "wss://lab5webbb.herokuapp.com/v1/graphql",
      options: {
        reconnect: true,
      },
    });
    const cache = new InMemoryCache();
    return new ApolloClient({
      link: wsLink,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);

  const AddDebtor = async () => {
    let newDebtorArr = [];
    newDebtorArr = document
      .getElementById("newDebtorInputbox")
      .value.split(" ");
    if (
      newDebtorArr.length != 3 ||
      newDebtorArr[0] == "" ||
      newDebtorArr[1] == ""
    ) {
      errorMSG.update(n => (n = "Введіть ім'я, прізвище та борг"));
      return;
    }
    try {
      await http.startExecuteMyMutation(
        Queries.InsertRecord(newDebtorArr[0], newDebtorArr[1], newDebtorArr[2])
      );
    } catch {
      errorMSG.update(n => (n = "Помилка"));
      return;
    }
    errorMSG.update(n => (n = ""));
    debtors.update(n => [...n, insert_laba5_Debtors.returning[0]]);
  };

  const RemoveDebtors = async () => {
    await http.startExecuteMyMutation(Queries.DeleteNegative());
    debtors.update(n => n.filter(item => item.Debt > 0));
  };
</script>

<main>
  <div>
    {#if $isAuthenticated}
      {#if $debtors.loading}
        <div>loading ...</div>
      {:else}
        <input id="newDebtorInputbox" />
        <button on:click={AddDebtor}>Add debtor😈</button>
        <button on:click={RemoveDebtors}>Delete some debtors =)</button>
        <button on:click={logout}>Log out</button>
        <table border="1">
          <caption>Debtors</caption>
          <tr>
            <th>Surname</th>
            <th>Name</th>
            <th>Debt</th>
          </tr>
          {#each $debtors as debtor}
            <tr>
              <td>{debtor.Surname}</td>
              <td>{debtor.Name}</td>
              <td>{debtor.Debt}</td>
            </tr>
          {/each}
        </table>
        <p>{errorMessage}</p>
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
