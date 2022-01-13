import { token, loadersCount } from "../store";
import { get } from "svelte/store";
import stylelintConfigSvelteRoboleary from "stylelint-config-svelte-roboleary";

class RequestHelper {
  API_URL = api_url_env;
  async fetchGraphQL(operationsDoc, operationName, variables) {
    return fetch(this.API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: {
        Authorization: `Bearer ${get(token)}`,
      },
    }).then(result => {
      return result.json();
    });
  }

  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    loadersCount.update(n => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);
    if (errors) {
      throw new Error(errors[0].message || "Unknown error");
    }
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    loadersCount.update(n => n + 1);
    const { errors, data } = await this.executeMyMutation(operationsDoc);
    if (errors) {
      throw new Error(errors[0].message || "Unknown error");
    }
    return data;
  }
}
export default new RequestHelper();
