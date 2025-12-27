import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { Button } from '@flux/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@flux/ui/components/ui/dialog'
import { Field, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { cn } from '@flux/ui/lib/utils'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AccountTypes } from '@/types/types'
import { newAccountAction } from '../actions'
import { NewAccountSchema } from '../schema'

export const newAccountDialogHandle = BaseUIDialog.createHandle()

const PayloadSchema = z.object({
  type: z.enum(AccountTypes),
})

export default function NewAccountModal() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    defaultValues: {
      type: '',
      name: '',
      initialBalance: '',
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
          initialBalance: parsedValue.data.initialBalance.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Account created successfully')
        newAccountDialogHandle.close()
        form.reset()
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
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Account Type</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                        disabled
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Savings, Checking'
                        value={field.state.value}
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='name'>
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Account Name</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Checking Account'
                        value={field.state.value}
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='initialBalance'>
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Initial Balance</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
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
                    </Field>
                  )
                }}
              </form.Field>

              <Button
                className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
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
