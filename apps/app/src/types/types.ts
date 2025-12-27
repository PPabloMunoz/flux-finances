import { accountTypeEnum } from '@flux/db/schema'

export type ServerFnResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; details?: unknown }

export const AccountTypes = accountTypeEnum.enumValues
export type TAccountType = (typeof AccountTypes)[number]
