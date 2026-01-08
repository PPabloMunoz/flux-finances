import { db } from '@flux/db'
import { type subscriptionStatusEnum, subscriptions } from '@flux/db/schema'
import { eq } from 'drizzle-orm'

type TSubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number]

export async function createSubscription(
  subId: string,
  customerId: string,
  userId: string,
  status: TSubscriptionStatus
) {
  const res = await db
    .insert(subscriptions)
    .values({
      id: subId,
      userId,
      customerId: customerId,
      status: status,
    })
    .returning()
    .then((r) => r[0])

  if (!res)
    throw new Error(
      'Failed to create subscription in database with data :' +
        JSON.stringify({ subId, customerId, userId, status })
    )
}

export async function deleteSubscription(subId: string) {
  const res = await db
    .delete(subscriptions)
    .where(eq(subscriptions.id, subId))
    .returning()
    .then((r) => r[0])

  if (!res) throw new Error(`Failed to delete subscription from database with id: ${subId}`)
}
