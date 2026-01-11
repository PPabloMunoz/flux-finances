import { createServerFn } from '@tanstack/react-start'
import { IS_CLOUD } from '@/lib/constants'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { functionAuthMiddleware } from '@/middleware/auth'

export const getUserSubscriptionStatus = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
    if (!IS_CLOUD) return true

    const userId = context.session?.user.id
    try {
      if (!userId) throw new Error('Unauthorized')
      const sub = await db.query.subscriptions.findFirst({
        where(subscriptions, { eq }) {
          return eq(subscriptions.userId, userId)
        },
      })
      if (!sub) return false
      return sub.status === 'active'
    } catch (err) {
      logger.error(
        { err, operation: 'get_subscription_status' },
        'Failed to fetch user subscription status'
      )
      return false
    }
  })
