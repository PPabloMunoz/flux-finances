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
import { cn } from '@flux/ui/lib/utils'
import {
  Add01Icon,
  ArrowRight01Icon,
  MultiplicationSignIcon,
  StructureFolderIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

const initialCategories = [
  {
    id: 1,
    name: 'Income',
    type: 'income',
    subcategories: ['Salary', 'Freelance', 'Investments', 'Other'],
  },
  {
    id: 2,
    name: 'Food & Dining',
    type: 'expense',
    subcategories: ['Restaurants', 'Groceries', 'Coffee Shops'],
  },
  {
    id: 3,
    name: 'Transportation',
    type: 'expense',
    subcategories: ['Gas', 'Public Transit', 'Parking', 'Ride Share'],
  },
  {
    id: 4,
    name: 'Shopping',
    type: 'expense',
    subcategories: ['Clothing', 'Electronics', 'Home Goods'],
  },
  {
    id: 5,
    name: 'Bills & Utilities',
    type: 'expense',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone'],
  },
]

export default function CategoriesSettings() {
  const [categories, setCategories] = useState(initialCategories)
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={StructureFolderIcon} />
            Transaction Categories
          </CardTitle>
          <CardDescription>
            Organize your transactions with categories and subcategories
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Add New Category */}
          <div className='space-y-3'>
            <Label htmlFor='newCategory'>Add New Category</Label>
            <div className='flex gap-2'>
              <Input id='newCategory' placeholder='Enter category name...' />
              <Button className='shrink-0'>
                <HugeiconsIcon className='mr-2 size-4' icon={Add01Icon} />
                Add Category
              </Button>
            </div>
          </div>

          {/* Existing Categories */}
          <div className='space-y-3'>
            <Label>Your Categories</Label>
            <div className='rounded-lg border border-border bg-muted/50 p-4'>
              <div className='space-y-2'>
                {categories.map((category) => (
                  <div className='space-y-1' key={category.id}>
                    {/* Main Category */}
                    <div className='flex items-center justify-between rounded-md bg-card px-3 py-2.5 transition-colors hover:bg-accent'>
                      <div className='flex items-center gap-3'>
                        <Button
                          className='h-6 w-6 p-0'
                          onClick={() => toggleCategory(category.id)}
                          size='sm'
                          variant='ghost'
                        >
                          <HugeiconsIcon
                            className={cn(
                              'size-4 transition-transform',
                              expandedCategories.includes(category.id) && 'rotate-90'
                            )}
                            icon={ArrowRight01Icon}
                          />
                        </Button>
                        <span className='font-medium text-sm'>{category.name}</span>
                        <Badge
                          className={
                            category.type === 'income'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          }
                          variant='secondary'
                        >
                          {category.type}
                        </Badge>
                      </div>
                      <Button
                        className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                        size='sm'
                        variant='ghost'
                      >
                        <HugeiconsIcon className='size-4' icon={Add01Icon} />
                      </Button>
                    </div>

                    {/* Subcategories */}
                    {expandedCategories.includes(category.id) && (
                      <div className='ml-9 space-y-1 border-border border-l-2 pl-4'>
                        {category.subcategories.map((sub) => (
                          <div
                            className='flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm transition-colors hover:bg-accent'
                            key={sub}
                          >
                            <span className='text-muted-foreground'>{sub}</span>
                            <Button
                              className='h-6 w-6 p-0 text-muted-foreground hover:text-destructive'
                              size='sm'
                              variant='ghost'
                            >
                              <HugeiconsIcon className='size-3' icon={MultiplicationSignIcon} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          className='h-8 w-full text-muted-foreground text-xs'
                          size='sm'
                          variant='ghost'
                        >
                          <HugeiconsIcon className='mr-1 size-3' icon={Add01Icon} />
                          Add Subcategory
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className='text-muted-foreground text-xs'>
              Categories help you track spending patterns. Click on a category to view and manage
              subcategories.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Category Spending</CardTitle>
          <CardDescription>Your top spending categories this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-sm'>Food & Dining</span>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-32 overflow-hidden rounded-full bg-muted'>
                  <div className='h-full w-3/4 bg-primary' />
                </div>
                <Badge className='min-w-20 justify-center font-mono' variant='secondary'>
                  $1,245
                </Badge>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-sm'>Transportation</span>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-32 overflow-hidden rounded-full bg-muted'>
                  <div className='h-full w-1/2 bg-primary' />
                </div>
                <Badge className='min-w-20 justify-center font-mono' variant='secondary'>
                  $680
                </Badge>
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='font-medium text-sm'>Shopping</span>
              <div className='flex items-center gap-3'>
                <div className='h-2 w-32 overflow-hidden rounded-full bg-muted'>
                  <div className='h-full w-1/3 bg-primary' />
                </div>
                <Badge className='min-w-20 justify-center font-mono' variant='secondary'>
                  $425
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
