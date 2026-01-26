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
import { deleteBudgetAction } from '../actions'
import { editBudgetDialogHandle } from './update-budget-modal'

export const deleteBudgetModalHandler = BaseUIAlertDialog.createHandle()

const PayloadSchema = z.object({
  id: z.ulid(),
})

export default function DeleteBudgetModal() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (data: { id: string }) => {
      setIsLoading(true)
      const res = await deleteBudgetAction({ data: { id: data.id } })
      setIsLoading(false)

      if (!res.ok) {
        throw new Error('Failed to delete budget')
      }
      return res
    },
    onSuccess: () => {
      toast.success('Budget deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      deleteBudgetModalHandler.close()
      editBudgetDialogHandle.close()
    },
    onError: () => {
      toast.error('Failed to delete budget')
    },
  })

  return (
    <AlertDialog handle={deleteBudgetModalHandler}>
      {({ payload }) => {
        const parsedPayload = PayloadSchema.safeParse(payload)
        if (!parsedPayload.success) return null

        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this budget?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the budget and you will
                need to create a new one if you want to track spending for this category again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isLoading}
                onClick={() => mutate({ id: parsedPayload.data.id })}
                variant='destructive'
              >
                Delete Budget
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )
      }}
    </AlertDialog>
  )
}
