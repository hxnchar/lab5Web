import { token, loadersCount, messageToUser } from "../store";
import { get } from "svelte/store";

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
    try {
      const { errors, data } = await this.fetchMyQuery(operationsDoc);
      if (errors) {
        throw new Error(errors[0].message || "Unknown error");
      }
      return data;
    } catch (e) {
      $messageToUser = `Error occurred: ${e.message}`;
    } finally {
      loadersCount.update(n => n - 1);
    }
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    loadersCount.update(n => n + 1);
    try {
      const { errors, data } = await this.executeMyMutation(operationsDoc);
      if (errors) {
        throw new Error(errors[0].message || "Unknown error");
      }
      return data;
    } catch (e) {
      $messageToUser = `Error occurred: ${e.message}`;
    } finally {
      loadersCount.update(n => n - 1);
    }
  }
}
export default new RequestHelper();
