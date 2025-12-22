import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Label } from '@flux/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@flux/ui/components/ui/select'
import { Calendar01Icon, Dollar01Icon, Globe02Icon, Sun01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function PreferencesSettings() {
  return (
    <div className='space-y-6'>
      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Sun01Icon} />
            Display
          </CardTitle>
          <CardDescription>Customize how your interface looks</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <Label className='text-base' htmlFor='theme'>
                Theme
              </Label>
              <p className='text-muted-foreground text-sm'>Select your preferred color scheme</p>
            </div>
            <Select defaultValue='dark'>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='light'>Light</SelectItem>
                <SelectItem value='dark'>Dark</SelectItem>
                <SelectItem value='system'>System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Globe02Icon} />
            Regional Settings
          </CardTitle>
          <CardDescription>Configure currency, timezone, and date formats</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label className='flex items-center gap-2' htmlFor='currency'>
              <HugeiconsIcon className='size-4' icon={Dollar01Icon} />
              Currency
            </Label>
            <Select defaultValue='usd'>
              <SelectTrigger id='currency'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='usd'>USD - US Dollar ($)</SelectItem>
                <SelectItem value='eur'>EUR - Euro (€)</SelectItem>
                <SelectItem value='gbp'>GBP - British Pound (£)</SelectItem>
                <SelectItem value='jpy'>JPY - Japanese Yen (¥)</SelectItem>
                <SelectItem value='cad'>CAD - Canadian Dollar (C$)</SelectItem>
                <SelectItem value='aud'>AUD - Australian Dollar (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='timezone'>Timezone</Label>
            <Select defaultValue='america/los_angeles'>
              <SelectTrigger id='timezone'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='america/new_york'>Eastern Time (ET)</SelectItem>
                <SelectItem value='america/chicago'>Central Time (CT)</SelectItem>
                <SelectItem value='america/denver'>Mountain Time (MT)</SelectItem>
                <SelectItem value='america/los_angeles'>Pacific Time (PT)</SelectItem>
                <SelectItem value='europe/london'>London (GMT)</SelectItem>
                <SelectItem value='europe/paris'>Paris (CET)</SelectItem>
                <SelectItem value='asia/tokyo'>Tokyo (JST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='flex items-center gap-2' htmlFor='dateFormat'>
              <HugeiconsIcon className='size-4' icon={Calendar01Icon} />
              Date Format
            </Label>
            <Select defaultValue='mdy'>
              <SelectTrigger id='dateFormat'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='mdy'>MM/DD/YYYY (12/31/2024)</SelectItem>
                <SelectItem value='dmy'>DD/MM/YYYY (31/12/2024)</SelectItem>
                <SelectItem value='ymd'>YYYY-MM-DD (2024-12-31)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline'>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Defaults</CardTitle>
          <CardDescription>Set default values for transaction views and filters</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='defaultPeriod'>Default Period</Label>
            <Select defaultValue='month'>
              <SelectTrigger id='defaultPeriod'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='week'>This Week</SelectItem>
                <SelectItem value='month'>This Month</SelectItem>
                <SelectItem value='quarter'>This Quarter</SelectItem>
                <SelectItem value='year'>This Year</SelectItem>
                <SelectItem value='all'>All Time</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-xs'>
              The default time period shown when viewing transactions
            </p>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline'>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
