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
import { deleteTransactionAction } from '../actions'
import { updateTransactionModalHandle } from './update-transaction-modal'

export const deleteTransactionModalHandler = BaseUIAlertDialog.createHandle()

const PayloadSchema = z.object({
  id: z.ulid(),
})

export default function DeleteTransactionModal() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (data: { id: string }) => {
      setIsLoading(true)
      const res = await deleteTransactionAction({ data: { id: data.id } })
      setIsLoading(false)

      if (!res.ok) {
        throw new Error('Failed to delete transaction')
      }
    },
    onSuccess: () => {
      toast.success('Transaction deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      deleteTransactionModalHandler.close()
      updateTransactionModalHandle.close()
    },
  })

  return (
    <AlertDialog handle={deleteTransactionModalHandler}>
      {({ payload }) => {
        const parsedPayload = PayloadSchema.safeParse(payload)
        if (!parsedPayload.success) return null

        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this transaction?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                onClick={() => mutate({ id: parsedPayload.data.id })}
                variant='destructive'
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )
      }}
    </AlertDialog>
  )
}
