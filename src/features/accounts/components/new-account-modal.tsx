import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
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
import { ACCOUNT_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { newAccountAction } from '../actions'
import { NewAccountSchema } from '../schema'

export const newAccountDialogHandle = BaseUIDialog.createHandle()

interface Props {
  onConfirm?: () => void
}

const PayloadSchema = z.object({
  type: z.enum(ACCOUNT_TYPES),
})

export default function NewAccountModal({ onConfirm }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      type: '',
      name: '',
      balance: '',
    },
    validators: { onSubmit: NewAccountSchema },
    onSubmit: async ({ value }) => {
      if (isLoading) return
      const parsedValue = NewAccountSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await newAccountAction({
        data: {
          ...parsedValue.data,
          balance: parsedValue.data.balance.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Account created successfully')
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        newAccountDialogHandle.close()
        form.reset()
        onConfirm?.()
      }
    },
  })
  return (
    <Dialog handle={newAccountDialogHandle}>
      {({ payload }) => {
        const parsedPayload = PayloadSchema.safeParse(payload)
        if (!parsedPayload.success) return null
        form.setFieldValue('type', parsedPayload.data.type)

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Use the form below to create a new account.</DialogDescription>
            </DialogHeader>
            <form
              className='flex flex-col gap-4'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit(e)
              }}
            >
              <form.Field name='type'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                        Account Type
                      </FieldLabel>
                      <Input
                        className={cn(isLoading && 'cursor-not-allowed opacity-50')}
                        disabled
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Savings, Checking'
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='name'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                        Account Name
                      </FieldLabel>
                      <Input
                        className={cn(isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Checking Account'
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='balance'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                        Initial Balance
                      </FieldLabel>
                      <Input
                        className={cn(isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        min={0}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. 1000'
                        step={0.01}
                        type='number'
                        value={field.state.value}
                      />
                      {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                    </Field>
                  )
                }}
              </form.Field>

              <Button
                className={cn('w-full', isLoading && 'cursor-not-allowed opacity-50')}
                disabled={isLoading}
                type='submit'
              >
                Create Account
              </Button>
            </form>
          </DialogContent>
        )
      }}
    </Dialog>
  )
}
