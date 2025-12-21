import GithubIcon from '@/components/shared/github'
import {
  AnalyticsUpIcon,
  ArrowDownLeft01Icon,
  ArrowRight02Icon,
  CloudServerIcon,
  DashboardSquare02Icon,
  DatabaseIcon,
  Dollar02Icon,
  GitMergeIcon,
  Globe02Icon,
  PackageIcon,
  PieChartIcon,
  ReactIcon,
  SecurityLockIcon,
  ServerStack02Icon,
  ServerStack03Icon,
  ShoppingBasket01Icon,
  Tick01Icon,
  TradeUpIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <nav className='fixed top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20'>
              <HugeiconsIcon className='size-5' icon={Dollar02Icon} />
            </div>
            <span className='font-sans text-lg font-medium tracking-tight text-white'>Flux Finances</span>
          </div>

          <div className='hidden items-center gap-8 text-sm font-normal md:flex'>
            <a className='font-sans transition-colors hover:text-white' href='/#'>
              Features
            </a>
            <a className='font-sans transition-colors hover:text-white' href='/#'>
              Self-Hosted
            </a>
            <a className='font-sans transition-colors hover:text-white' href='/#'>
              Manifesto
            </a>
            <a className='font-sans transition-colors hover:text-white' href='/#'>
              Pricing
            </a>
          </div>

          <div className='flex items-center gap-4'>
            <Link className='hidden font-sans text-sm transition-colors hover:text-white sm:block' to='/auth/login'>
              Sign In
            </Link>
            <Link to='/auth/signup'>
              <button
                className='rounded-full bg-white px-4 py-2 font-sans text-sm font-medium text-black transition-colors hover:bg-neutral-200'
                type='button'
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className='relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32'>
        <div className='grid-bg pointer-events-none absolute inset-0 z-0'></div>

        <div className='relative z-10 mx-auto max-w-7xl px-6 text-center'>
          <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400'>
            <HugeiconsIcon className='size-5' icon={GitMergeIcon} />
            <span className='font-sans'>v2.0 Open Source Release</span>
          </div>

          <h1 className='mb-8 font-sans text-5xl leading-[1.1] font-semibold tracking-tighter text-white md:text-7xl lg:text-8xl'>
            Your finances,
            <br />
            <span className='bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text font-sans font-semibold text-transparent'>
              uncompromised.
            </span>
          </h1>

          <p className='mx-auto mb-12 max-w-2xl font-sans text-lg leading-relaxed font-light text-neutral-400 md:text-xl'>
            The modern operating system for your wealth. Stop wrestling with spreadsheets. Flux offers institutional-grade insights with the freedom
            of open source.
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <button
              className='flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-8 font-sans font-medium text-black transition-all hover:bg-neutral-200 sm:w-auto'
              type='button'
            >
              Start for free
              <HugeiconsIcon className='size-5' icon={ArrowRight02Icon} />
            </button>
            <button
              className='flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 font-sans font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 sm:w-auto'
              type='button'
            >
              <GithubIcon className='size-5' />
              Star on GitHub
            </button>
          </div>
        </div>

        {/* <!-- Dashboard Preview Abstract -->*/}
        <div className='relative mx-auto mt-20 max-w-6xl px-6'>
          <div className='absolute -inset-1 rounded-xl bg-gradient-to-b from-teal-500/20 to-transparent opacity-30 blur-2xl'></div>
          <div className='relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl shadow-black/50'>
            {/* <!-- Browser Bar -->*/}
            <div className='flex h-10 items-center gap-2 border-b border-white/5 bg-neutral-900/50 px-4'>
              <div className='flex gap-2'>
                <div className='h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20'></div>
                <div className='h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20'></div>
                <div className='h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20'></div>
              </div>
              <div className='mx-auto font-mono text-xs text-neutral-500'>flux-finances.com/dashboard</div>
            </div>

            {/* <!-- UI Content -->*/}
            <div className='grid min-h-[500px] grid-cols-12 gap-0'>
              {/* <!-- Sidebar -->*/}
              <div className='col-span-2 hidden flex-col gap-4 border-r border-white/5 p-4 md:flex'>
                <div className='space-y-1'>
                  <div className='flex h-8 w-full items-center gap-2 rounded-md border border-white/5 bg-white/5 px-2 font-sans text-xs text-white'>
                    <HugeiconsIcon className='size-4 text-teal-400' icon={DashboardSquare02Icon} />
                    Dashboard
                  </div>
                  <div className='flex h-8 w-full cursor-default items-center gap-2 rounded-md px-2 font-sans text-xs text-neutral-500 transition-colors hover:bg-white/5'>
                    <HugeiconsIcon className='size-4 text-neutral-500' icon={Wallet01Icon} />
                    Accounts
                  </div>
                  <div className='flex h-8 w-full cursor-default items-center gap-2 rounded-md px-2 font-sans text-xs text-neutral-500 transition-colors hover:bg-white/5'>
                    <HugeiconsIcon className='size-4 text-neutral-500' icon={PieChartIcon} />
                    Allocation
                  </div>
                </div>
              </div>

              {/* <!-- Main Area -->*/}
              <div className='col-span-12 bg-neutral-950/50 p-6 md:col-span-10 md:p-8'>
                <div className='mb-8 flex items-end justify-between'>
                  <div>
                    <div className='mb-1 font-sans text-xs text-neutral-500'>Total Net Worth</div>
                    <div className='font-sans text-3xl font-semibold tracking-tight text-white'>$1,240,592.45</div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 font-sans text-xs text-green-400'>
                      <HugeiconsIcon className='size-4' icon={TradeUpIcon} />
                      +4.2%
                    </div>
                  </div>
                </div>

                {/* <!-- Grid Bento -->*/}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  {/* <!-- Chart Placeholder -->*/}
                  <div className='group relative col-span-2 h-64 overflow-hidden rounded-lg border border-white/5 bg-neutral-900/50 p-6'>
                    <div className='absolute inset-x-0 bottom-0 flex h-40 items-end justify-between gap-2 px-6 opacity-50'>
                      <div className='h-[40%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[60%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[45%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[70%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[55%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[85%] w-full rounded-t-sm bg-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.5)]'></div>
                      <div className='h-[65%] w-full rounded-t-sm bg-teal-500/20'></div>
                      <div className='h-[75%] w-full rounded-t-sm bg-teal-500/20'></div>
                    </div>
                    <div className='relative z-10 font-sans text-xs font-medium text-neutral-500'>Portfolio Performance</div>
                  </div>

                  {/* <!-- List -->*/}
                  <div className='flex h-64 flex-col rounded-lg border border-white/5 bg-neutral-900/50 p-6'>
                    <div className='mb-4 font-sans text-xs font-medium text-neutral-500'>Recent Transactions</div>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/5'>
                            <HugeiconsIcon className='size-4' icon={ShoppingBasket01Icon} />
                          </div>
                          <div className='font-sans text-xs text-neutral-300'>Whole Foods</div>
                        </div>
                        <div className='font-sans text-xs text-white'>-$142.00</div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/5'>
                            <HugeiconsIcon className='size-4 text-neutral-400' icon={ServerStack03Icon} />
                          </div>
                          <div className='font-sans text-xs text-neutral-300'>AWS</div>
                        </div>
                        <div className='font-sans text-xs text-white'>-$34.50</div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/5'>
                            <HugeiconsIcon className='size-4' icon={ArrowDownLeft01Icon} />
                          </div>
                          <div className='font-sans text-xs text-neutral-300'>Dividend</div>
                        </div>
                        <div className='font-sans text-xs text-teal-400'>+$240.00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Trusted By -->*/}
      <section className='border-y border-white/5 bg-neutral-950/50 py-12'>
        <div className='mx-auto max-w-7xl px-6'>
          <p className='mb-8 text-center font-sans text-xs font-medium tracking-widest text-neutral-500 uppercase'>Built with the modern stack</p>
          <div className='flex flex-wrap justify-center gap-12 opacity-40 grayscale transition-all duration-500 hover:grayscale-0'>
            {/* <!-- Mock Logos (Using Text for accuracy/simplicity as requested) -->*/}
            <div className='flex items-center gap-2'>
              <HugeiconsIcon className='size-5 text-white' icon={ReactIcon} />
              <span className='font-sans font-semibold tracking-tight text-white'>React</span>
            </div>
            <div className='flex items-center gap-2'>
              <HugeiconsIcon className='size-5 text-white' icon={DatabaseIcon} />
              <span className='font-sans font-semibold tracking-tight text-white'>Postgres</span>
            </div>
            <div className='flex items-center gap-2'>
              <HugeiconsIcon className='size-5 text-white' icon={PackageIcon} />
              <span className='font-sans font-semibold tracking-tight text-white'>Docker</span>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- The Dual Model Section -->*/}
      <section className='relative py-24 lg:py-32'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-16 text-center'>
            <h2 className='mb-6 font-sans text-3xl font-semibold tracking-tight text-white md:text-5xl'>Choose your deployment</h2>
            <p className='mx-auto max-w-xl font-sans text-neutral-400'>
              Flux gives you the power of choice. Use our managed secure cloud, or host it on your own metal. It's your data.
            </p>
          </div>

          <div className='mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2'>
            {/* <!-- Cloud Option -->*/}
            <div className='group relative rounded-2xl bg-gradient-to-b from-white/10 to-white/0 p-px transition-all duration-500 hover:from-teal-500/50 hover:to-teal-500/10'>
              <div className='relative h-full overflow-hidden rounded-[15px] bg-neutral-900 p-8'>
                <div className='absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl'></div>

                <div className='mb-8 flex items-center justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-neutral-800'>
                    <HugeiconsIcon className='size-7 text-white' icon={CloudServerIcon} />
                  </div>
                  <div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 font-sans text-xs font-medium text-white'>
                    Most Popular
                  </div>
                </div>

                <h3 className='mb-2 font-sans text-2xl font-semibold text-white'>Flux Cloud</h3>
                <p className='mb-8 h-10 font-sans text-sm text-neutral-400'>
                  Instant access, zero maintenance. We handle security, backups, and updates for you.
                </p>

                <ul className='mb-8 space-y-3'>
                  <li className='flex items-center gap-3 font-sans text-sm text-neutral-300'>
                    <HugeiconsIcon className='size-5 text-teal-400' icon={Tick01Icon} />
                    Bank Sync (Plaid/Teller)
                  </li>
                  <li className='flex items-center gap-3 font-sans text-sm text-neutral-300'>
                    <HugeiconsIcon className='size-5 text-teal-400' icon={Tick01Icon} />
                    Automatic Daily Backups
                  </li>
                  <li className='flex items-center gap-3 font-sans text-sm text-neutral-300'>
                    <HugeiconsIcon className='size-5 text-teal-400' icon={Tick01Icon} />
                    Mobile App Access <span className='text-neutral-500'>(Coming Soon)</span>
                  </li>
                </ul>

                <button
                  className='w-full rounded-lg bg-white py-3 font-sans text-sm font-medium text-black transition-colors hover:bg-neutral-200'
                  type='button'
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* <!-- Self Hosted Option -->*/}
            <div className='group relative rounded-2xl bg-gradient-to-b from-white/10 to-white/0 p-px transition-all duration-500 hover:from-purple-500/50 hover:to-purple-500/10'>
              <div className='relative h-full overflow-hidden rounded-[15px] bg-neutral-950 p-8'>
                {/* <!-- Terminal aesthetic decoration -->*/}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className='relative z-10 mb-8 flex items-center justify-between'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-neutral-900'>
                    <HugeiconsIcon className='size-7 text-white' icon={ServerStack02Icon} />
                  </div>
                  <div className='rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 font-sans text-xs font-medium text-purple-300'>
                    For Developers
                  </div>
                </div>

                <h3 className='relative z-10 mb-2 font-sans text-2xl font-semibold text-white'>Self-Hosted</h3>
                <p className='relative z-10 mb-8 h-10 font-sans text-sm text-neutral-400'>
                  Total control. Run Flux on your home server, VPS, or Raspberry Pi via Docker.
                </p>

                {/* <!-- Terminal Code Block -->*/}
                <div className='relative z-10 mb-8 rounded-lg border border-white/10 bg-black p-4 font-mono text-xs shadow-lg'>
                  <div className='mb-3 flex gap-1.5 opacity-50'>
                    <div className='h-2.5 w-2.5 rounded-full bg-red-500'></div>
                    <div className='h-2.5 w-2.5 rounded-full bg-yellow-500'></div>
                    <div className='h-2.5 w-2.5 rounded-full bg-green-500'></div>
                  </div>
                  <div className='font-sans text-neutral-400'>
                    <p>
                      <span className='font-sans text-purple-400'>~</span> git clone https://github.com/ppablomunoz/flux-finances.git
                    </p>
                    <p>
                      <span className='font-sans text-purple-400'>~</span> cd flux-finances
                    </p>
                    <span className='font-sans text-purple-400'>~</span> docker compose up -d
                    <span className='mt-2 block font-sans text-teal-400'>✓ Flux is running on localhost:3000</span>
                  </div>
                </div>

                <button
                  className='relative z-10 w-full rounded-lg border border-white/10 bg-white/5 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10'
                  type='button'
                >
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- Features Grid -->*/}
      <section className='border-t border-white/5 bg-neutral-900/20 py-24'>
        <div className='mx-auto max-w-7xl px-6'>
          <h2 className='mb-16 text-center font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl'>
            Everything you need tocompound your wealth.
          </h2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* <!-- Feature 1 -->*/}
            <div className='group rounded-2xl border border-white/5 bg-neutral-950 p-8 transition-colors hover:border-teal-500/30'>
              <div className='mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-neutral-900 transition-transform group-hover:scale-110'>
                <HugeiconsIcon className='size-5 text-teal-400' icon={Globe02Icon} />
              </div>
              <h3 className='mb-3 font-sans text-lg font-medium text-white'>Multi-currency</h3>
              <p className='font-sans text-sm leading-relaxed text-neutral-400'>
                Hold assets in USD, EUR, BTC, or ETH. Flux normalizes everything to your base currency in real-time.
              </p>
            </div>

            {/* <!-- Feature 2 -->*/}
            <div className='group rounded-2xl border border-white/5 bg-neutral-950 p-8 transition-colors hover:border-teal-500/30'>
              <div className='mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-neutral-900 transition-transform group-hover:scale-110'>
                <HugeiconsIcon className='size-5 text-teal-400' icon={AnalyticsUpIcon} />
              </div>
              <h3 className='mb-3 font-sans text-lg font-medium text-white'>Scenario Planning</h3>
              <p className='font-sans text-sm leading-relaxed text-neutral-400'>
                "What if I buy a house?" Simulate major financial decisions and see the impact on your net worth over time.
              </p>
            </div>

            {/* <!-- Feature 3 -->*/}
            <div className='group rounded-2xl border border-white/5 bg-neutral-950 p-8 transition-colors hover:border-teal-500/30'>
              <div className='mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-neutral-900 transition-transform group-hover:scale-110'>
                <HugeiconsIcon className='size-5 text-teal-400' icon={SecurityLockIcon} />
              </div>
              <h3 className='mb-3 font-sans text-lg font-medium text-white'>Privacy First</h3>
              <p className='font-sans text-sm leading-relaxed text-neutral-400'>
                Your data is encrypted at rest. We don't sell your data. We don't show ads. You are the customer, not the product.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- CTA -->*/}
      <section className='relative overflow-hidden py-24'>
        <div className='radial-gradient absolute inset-0 bg-teal-900/10'></div>
        <div className='relative z-10 mx-auto max-w-4xl px-6 text-center'>
          <h2 className='mb-8 font-sans text-4xl font-semibold tracking-tighter text-white md:text-5xl'>Ready to take control?</h2>
          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <button
              className='h-12 w-full rounded-full bg-white px-8 font-sans font-medium text-black transition-colors hover:bg-neutral-200 sm:w-auto'
              type='button'
            >
              Get Started Now
            </button>
            <button
              className='h-12 w-full rounded-full border border-white/10 bg-transparent px-8 font-sans font-medium text-white transition-colors hover:bg-white/5 sm:w-auto'
              type='button'
            >
              Read the Docs
            </button>
          </div>
        </div>
      </section>

      {/* <!-- Footer -->*/}
      <footer className='border-t border-white/5 bg-neutral-950 py-16'>
        <div className='mx-auto max-w-7xl px-6'>
          <div className='mb-16 grid grid-cols-2 gap-10 md:grid-cols-4'>
            <div className='col-span-2 md:col-span-1'>
              <div className='mb-6 flex items-center gap-2'>
                <div className='flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-teal-500 to-cyan-600'>
                  <HugeiconsIcon className='size-4.5' icon={Dollar02Icon} />
                </div>
                <span className='font-sans font-medium tracking-tight text-white'>Flux Finances</span>
              </div>
              <p className='font-sans text-xs leading-relaxed text-neutral-500'>Open source personal finance for those who want more control.</p>
            </div>

            <div>
              <h4 className='mb-4 font-sans text-sm font-medium text-white'>Product</h4>
              <ul className='space-y-3 text-sm text-neutral-500'>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Features
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Pricing
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-sans text-sm font-medium text-white'>Developers</h4>
              <ul className='space-y-3 text-sm text-neutral-500'>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Documentation
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    GitHub
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    API Reference
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='mb-4 font-sans text-sm font-medium text-white'>Company</h4>
              <ul className='space-y-3 text-sm text-neutral-500'>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    About
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Blog
                  </a>
                </li>
                <li>
                  <a className='font-sans transition-colors hover:text-white' href='/#'>
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='flex flex-col items-center justify-between border-t border-white/5 pt-8 text-xs text-neutral-600 md:flex-row'>
            <p className='font-sans'>© 2026 Flux Finances. All rights reserved.</p>
            <div className='mt-4 flex gap-6 md:mt-0'>
              <a className='font-sans hover:text-neutral-400' href='/#'>
                Privacy Policy
              </a>
              <a className='font-sans hover:text-neutral-400' href='/#'>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
