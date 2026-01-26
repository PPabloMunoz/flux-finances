import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { AddIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm, useStore } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { getAllAccountsAction } from '@/features/accounts'
import { getCategoriesAction, type TCategory } from '@/features/settings'
import {
  ACCOUNT_TYPES_ICONS,
  TRANSACTIONS_ICONS,
  TRANSACTIONS_TYPE_LABELS,
  TRANSACTIONS_TYPES,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { newTransactionAction } from '../actions'
import { NewTransactionSchema } from '../schema'

export const newTransactionModalHandle = BaseUIDialog.createHandle()

interface Props {
  onConfirm?: () => void
}

export default function NewTransactionModal({ onConfirm }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesToShow, setCategoriesToShow] = useState<TCategory[]>([])
  const queryClient = useQueryClient()

  const { data: accounts = [], isPending: accountsPending } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await getAllAccountsAction()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
  })

  const { data: categories, isPending: categoriesPending } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: {} })
      if (!res.ok) {
        throw new Error(res.error)
      }
      return res.data
    },
  })

  const isDisabled = accountsPending || categoriesPending || isLoading

  const form = useForm({
    defaultValues: {
      title: '',
      accountId: '',
      categoryId: '' as string | null,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: TRANSACTIONS_TYPES[1] as string, // Default to 'expense'
      description: '',
    },
    validators: { onSubmit: NewTransactionSchema },
    onSubmit: async ({ value }) => {
      if (isDisabled) return
      const parsedValue = NewTransactionSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await newTransactionAction({
        data: {
          ...parsedValue.data,
          amount: parsedValue.data.amount.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Transaction created successfully!')
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        newTransactionModalHandle.close()
        form.reset()
        onConfirm?.()
      }
    },
  })
  const transactionType = useStore(form.store, (state) => state.values.type)

  useEffect(() => {
    if (!categories) return
    setCategoriesToShow(
      categories.filter((category) =>
        transactionType === 'inflow' ? category.type === 'inflow' : category.type === 'outflow'
      )
    )
    form.setFieldValue('categoryId', '')
  }, [transactionType, categories, form])

  return (
    <Dialog handle={newTransactionModalHandle}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction to keep track of your income and expenses.
          </DialogDescription>
        </DialogHeader>

        <form
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit(e)
          }}
        >
          <form.Field name='title'>
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field>
                  <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                    Transaction Name
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    disabled={isDisabled}
                    id={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g. Grocery Shopping'
                    spellCheck={false}
                    value={field.state.value || ''}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.Field name='amount'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                      Amount
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      min='0'
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='e.g. 50.00'
                      spellCheck={false}
                      step='0.01'
                      type='number'
                      value={field.state.value || ''}
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='date'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                      Date
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type='date'
                      value={field.state.value || ''}
                    />
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.Field name='accountId'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                const selectedAccount = accounts.find((acc) => acc.id === field.state.value)
                return (
                  <Field className='relative'>
                    <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                      Account
                    </FieldLabel>
                    <Select
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      value={field.state.value}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(accountId: string) => {
                            if (!accountId) return 'Select an account'
                            return (
                              <span className='flex items-center gap-2'>
                                <div
                                  className={cn(
                                    'flex size-4.5 items-center justify-center rounded-sm transition-colors',
                                    selectedAccount?.type === 'cash' &&
                                      'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                    selectedAccount?.type === 'investment' &&
                                      'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                                    selectedAccount?.type === 'liability' &&
                                      'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                                    selectedAccount?.type === 'other_asset' &&
                                      'bg-muted text-muted-foreground'
                                  )}
                                >
                                  <HugeiconsIcon
                                    className='size-3'
                                    icon={
                                      selectedAccount
                                        ? ACCOUNT_TYPES_ICONS[selectedAccount.type]
                                        : AddIcon
                                    }
                                  />
                                </div>
                                {selectedAccount ? selectedAccount.name : 'Select an account'}
                              </span>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className='overflow-y-auto'>
                        <SelectItem disabled value=''>
                          Select an account
                        </SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div
                              className={cn(
                                'flex size-5 items-center justify-center rounded-sm transition-colors',
                                account.type === 'cash' &&
                                  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                                account.type === 'investment' &&
                                  'bg-teal-500/10 text-teal-600 dark:text-teal-400',
                                account.type === 'liability' &&
                                  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                                account.type === 'other_asset' && 'bg-muted text-muted-foreground'
                              )}
                            >
                              <HugeiconsIcon
                                className='size-3'
                                icon={ACCOUNT_TYPES_ICONS[account.type]}
                              />
                            </div>
                            <span>{account.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='type'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                      Transaction Type
                    </FieldLabel>
                    <Select
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      value={field.state.value}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(type: (typeof TRANSACTIONS_TYPES)[number]) => {
                            if (!type) return 'Select a transaction type'
                            return (
                              <span>
                                <HugeiconsIcon
                                  className={cn(
                                    'mr-2 inline-block size-4',
                                    type === 'inflow'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  )}
                                  icon={TRANSACTIONS_ICONS[type]}
                                />
                                {TRANSACTIONS_TYPE_LABELS[type]}
                              </span>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTIONS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div
                              className={cn(
                                'flex size-5 items-center justify-center rounded-sm transition-colors',
                                type === 'inflow' &&
                                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                                type === 'outflow' &&
                                  'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              )}
                            >
                              <HugeiconsIcon className='size-3' icon={TRANSACTIONS_ICONS[type]} />
                            </div>
                            <span>{TRANSACTIONS_TYPE_LABELS[type]}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                )
              }}
            </form.Field>
          </div>

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
                    disabled={isDisabled}
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
                      {categoriesToShow.map((category) => (
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

          <form.Field name='description'>
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field>
                  <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    aria-invalid={isInvalid}
                    disabled={isDisabled}
                    id={field.name}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='Add any additional details about the transaction'
                    spellCheck={false}
                    value={field.state.value || ''}
                  />
                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              )
            }}
          </form.Field>

          <Button className='w-full' disabled={isLoading} type='submit'>
            <HugeiconsIcon icon={AddIcon} />
            {isLoading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
