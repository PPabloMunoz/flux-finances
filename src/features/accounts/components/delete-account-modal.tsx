import { AlertDialog as BaseUIAlertDialog } from '@base-ui/react/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteAccountAction } from '../actions'
import { editAccountDialogHandle } from './update-account-modal'

export const deleteAccountModalHandler = BaseUIAlertDialog.createHandle()

const PayloadSchema = z.object({
  id: z.ulid(),
  type: z.string(),
})

export default function DeleteAccountModal() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (data: { id: string; type: string }) => {
      setIsLoading(true)
      const res = await deleteAccountAction({ data: { id: data.id } })
      setIsLoading(false)

      if (!res.ok) {
        throw new Error('Failed to delete account')
      }
      return data.type
    },
    onSuccess: (type) => {
      toast.success('Account deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['accounts', type] })
      queryClient.invalidateQueries({ queryKey: ['networth'] })
      deleteAccountModalHandler.close()
      editAccountDialogHandle.close()
    },
  })

  return (
    <AlertDialog handle={deleteAccountModalHandler}>
      {({ payload }) => {
        const parsedPayload = PayloadSchema.safeParse(payload)
        if (!parsedPayload.success) return null

        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                onClick={() => mutate({ id: parsedPayload.data.id, type: parsedPayload.data.type })}
                variant='destructive'
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )
      }}
    </AlertDialog>
  )
}
