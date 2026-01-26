import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { Delete03Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategoriesAction } from '@/features/settings'
import { cn } from '@/lib/utils'
import { updateBudgetAction } from '../actions'
import { EditBudgetSchema, type TBudgetWithSpending } from '../schema'
import { deleteBudgetModalHandler } from './delete-budget-modal'

export const editBudgetDialogHandle = BaseUIDialog.createHandle()

export default function UpdateBudgetModal() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', { type: 'outflow' }],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: { type: 'outflow' } })
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const form = useForm({
    defaultValues: {
      id: '',
      categoryId: '',
      amount: '',
    },
    validators: { onSubmit: EditBudgetSchema },
    onSubmit: async ({ value }) => {
      if (isLoading) return
      const parsedValue = EditBudgetSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await updateBudgetAction({
        data: {
          id: parsedValue.data.id,
          categoryId: parsedValue.data.categoryId,
          amount: parsedValue.data.amount.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Budget updated successfully')
        queryClient.invalidateQueries({ queryKey: ['budgets'] })
        editBudgetDialogHandle.close()
        form.reset()
      }
    },
  })

  return (
    <Dialog handle={editBudgetDialogHandle}>
      {({ payload }) => {
        const budgetPayload = payload as TBudgetWithSpending
        if (!budgetPayload?.id) return null

        form.setFieldValue('id', budgetPayload.id)
        form.setFieldValue('categoryId', budgetPayload.categoryId)
        form.setFieldValue('amount', Number(budgetPayload.amount).toString())

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Budget</DialogTitle>
              <DialogDescription>
                Make changes to your budget below and click "Update Budget" to save.
              </DialogDescription>
            </DialogHeader>
            <form
              className='flex flex-col gap-4'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit(e)
              }}
            >
              <form.Field name='categoryId'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  const currentCategory = categories?.find((cat) => cat.id === field.state.value)
                  return (
                    <Field>
                      <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                        Category
                      </FieldLabel>
                      <Select
                        aria-invalid={isInvalid}
                        disabled={isLoading}
                        id={field.name}
                        onValueChange={(value) => field.handleChange(value ?? '')}
                        value={field.state.value}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(categoryId: string) => {
                              if (!categoryId) return 'No Category'
                              return (
                                <span className='flex items-center gap-2'>
                                  <div
                                    className='flex size-2.5 items-center justify-center rounded-full border border-background shadow-sm'
                                    style={{
                                      backgroundColor: currentCategory?.color ?? '#000000',
                                    }}
                                  />
                                  {currentCategory ? currentCategory.name : 'No Category'}
                                </span>
                              )
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className='overflow-y-auto'>
                          <SelectItem value=''>No Category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className='flex items-center gap-2'>
                                <div
                                  className='flex size-2.5 items-center justify-center rounded-full border border-background shadow-sm'
                                  style={{ backgroundColor: category.color ?? '#000000' }}
                                />
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='amount'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                        Budget Amount
                      </FieldLabel>
                      <Input
                        className={cn(isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        min={0.01}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. 500.00'
                        step={0.01}
                        type='number'
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <div className='mt-4 flex items-center gap-2'>
                <Button
                  className={cn('flex-1', isLoading && 'cursor-not-allowed opacity-50')}
                  disabled={isLoading}
                  type='submit'
                >
                  <HugeiconsIcon icon={FloppyDiskIcon} />
                  Update Budget
                </Button>
                <AlertDialogTrigger
                  handle={deleteBudgetModalHandler}
                  payload={{ id: budgetPayload.id }}
                  render={
                    <Button variant='destructive'>
                      <HugeiconsIcon icon={Delete03Icon} />
                    </Button>
                  }
                />
              </div>
            </form>
          </DialogContent>
        )
      }}
    </Dialog>
  )
}
