import type { ClientConfig } from "~/clients"

import type { AppState } from "./state"

export const getClientConfig = (appState: AppState): ClientConfig => ({
  accountType: appState.config.accountType,
  vsCodeVersion: appState.cache.vsCodeVersion,
})
