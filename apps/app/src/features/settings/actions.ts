import { auth } from '@flux/auth/server'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { ServerFnResult } from '@/types/types'

const UpdateHouseholdInputValidator = z.object({
  id: z.ulid(),
  newName: z.string().min(2, 'Household name must be at least 2 characters long'),
})

export const updateHouseholdAction = createServerFn({ method: 'POST' })
  .inputValidator(UpdateHouseholdInputValidator)
  .handler(async ({ data }) => {
    try {
      const session = await auth.api.getSession()
      if (!session) throw new Error('Unauthorized')

      console.log(session.user)
      console.log('Updating household with data:', data)

      // const newHousehold = await db.update(household).set({}).where(eq(household.id, data.id))

      return { ok: true, data: null } satisfies ServerFnResult<null>
    } catch (err) {
      console.error('Error updating household:', err)
      return { ok: false, error: 'Failed to update household' } satisfies ServerFnResult<never>
    }
  })
