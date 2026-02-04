import consola from "consola"

import { CopilotClient, getVSCodeVersion } from "~/clients"

import { getClientConfig } from "./client-config"
import { state } from "./state"

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const isNullish = (value: unknown): value is null | undefined =>
  value === null || value === undefined

export async function cacheModels(client?: CopilotClient): Promise<void> {
  const copilotClient =
    client ?? new CopilotClient(state.auth, getClientConfig(state))

  const models = await copilotClient.getModels()
  // eslint-disable-next-line require-atomic-updates
  state.cache.models = models
}

export const cacheVSCodeVersion = async () => {
  const response = await getVSCodeVersion()
  state.cache.vsCodeVersion = response

  consola.info(`Using VSCode version: ${response}`)
}
