import { Badge } from '@flux/ui/components/ui/badge'
import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Input } from '@flux/ui/components/ui/input'
import { Label } from '@flux/ui/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@flux/ui/components/ui/native-select'
import {
  Add01Icon,
  Delete03Icon,
  Loading03Icon,
  StructureFolderIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { createCategoryAction, deleteCategoryAction } from '../actions'
import { getCategoriesAction } from '../queries'

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`

export default function CategoriesSettings() {
  const queryClient = useQueryClient()
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor())
  const [newCategoryType, setNewCategoryType] = useState<'inflow' | 'outflow'>('outflow')

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: {} })
      if (!res.ok) {
        throw new Error(res.error)
      }
      return res.data
    },
  })

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await createCategoryAction({
        data: {
          name: newCategoryName,
          color: newCategoryColor,
          type: newCategoryType,
        },
      })
      if (!res.ok) {
        throw new Error(res.error)
      }
      return res.data
    },
    onSuccess: () => {
      toast.success('Category created')
      setNewCategoryName('')
      setNewCategoryColor(getRandomColor())
      setNewCategoryType('outflow')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategoryAction({ data: { id } })
      if (!res.ok) {
        throw new Error(res.error)
      }
    },
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    createCategoryMutation.mutate()
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={StructureFolderIcon} />
            Transaction Categories
          </CardTitle>
          <CardDescription>Manage your transaction categories and their colors</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Add New Category */}
          <div className='space-y-3'>
            <Label htmlFor='newCategory'>Add New Category</Label>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <div className='flex gap-2'>
                <div className='flex items-center gap-2 rounded-md border border-input bg-background px-3'>
                  <input
                    className='h-6 w-6 cursor-pointer border-none bg-transparent p-0'
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    title='Choose category color'
                    type='color'
                    value={newCategoryColor}
                  />
                </div>
                <NativeSelect
                  className='w-full sm:w-[140px]'
                  onChange={(e) => setNewCategoryType(e.target.value as 'inflow' | 'outflow')}
                  value={newCategoryType}
                >
                  <NativeSelectOption value='outflow'>Expense</NativeSelectOption>
                  <NativeSelectOption value='inflow'>Income</NativeSelectOption>
                </NativeSelect>
              </div>
              <Input
                id='newCategory'
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory()
                }}
                placeholder='Enter category name...'
                value={newCategoryName}
              />
              <Button
                className='w-full shrink-0 sm:w-auto'
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                onClick={handleAddCategory}
              >
                {createCategoryMutation.isPending ? (
                  <HugeiconsIcon className='mr-2 size-4 animate-spin' icon={Loading03Icon} />
                ) : (
                  <HugeiconsIcon className='mr-2 size-4' icon={Add01Icon} />
                )}
                Add Category
              </Button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className='space-y-3'>
            <Label>Your Categories</Label>
            <div className='rounded-lg border border-border bg-muted/50 p-4'>
              {isLoading ? (
                <div className='flex justify-center py-4'>
                  <HugeiconsIcon
                    className='size-6 animate-spin text-muted-foreground'
                    icon={Loading03Icon}
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  {categories?.map((category) => (
                    <div
                      className='flex items-center justify-between rounded-md bg-card px-3 py-2.5 transition-colors hover:bg-accent'
                      key={category.id}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className='size-4 rounded-full border border-border shadow-sm'
                          style={{ backgroundColor: category.color ?? '#000000' }}
                        />
                        <span className='font-medium text-sm'>{category.name}</span>
                        <Badge
                          className={
                            category.type === 'inflow'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          }
                          variant='secondary'
                        >
                          {category.type === 'inflow' ? 'Income' : 'Expense'}
                        </Badge>
                      </div>
                      <Button
                        className='h-8 w-8 bg-transparent p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                        disabled={deleteCategoryMutation.isPending}
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        size='sm'
                      >
                        {deleteCategoryMutation.isPending ? (
                          <HugeiconsIcon className='size-4 animate-spin' icon={Loading03Icon} />
                        ) : (
                          <HugeiconsIcon className='size-4' icon={Delete03Icon} />
                        )}
                      </Button>
                    </div>
                  ))}
                  {categories?.length === 0 && (
                    <div className='py-4 text-center text-muted-foreground text-sm'>
                      No categories found. Add one above.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
