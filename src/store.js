import { writable } from "svelte/store";
export const debtors = writable([]);
export const token = writable("");
export const isAuthenticated = writable(false);
export const user = writable({});
export const popupOpen = writable(false);
export const error = writable();
export const errorMessage = writable("");
export const loadersCount = writable(0);
