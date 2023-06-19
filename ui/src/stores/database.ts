import type mongoose from "mongoose";
import { writable } from "svelte/store";

export const client = writable<typeof mongoose | null>(null);
export const runningSetup = writable(false);
