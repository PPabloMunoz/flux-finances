import { db } from '@flux/db'
import { createServerFn } from '@tanstack/react-start'
import { functionAuthMiddleware } from '@/middleware/auth'

export const getUserSubscriptionStatus = createServerFn({ method: 'GET' })
  .middleware([functionAuthMiddleware])
  .handler(async ({ context }) => {
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
      console.error('Error fetching user subscription status:', err)
      return false
    }
  })
