import Link from 'next/link'
import Image from 'next/image'

export default function NavBar({ activePage = 'home' }) {
  const linkCls = (page) =>
    activePage === page
      ? 'text-primary text-sm font-medium leading-normal border-b-2 border-primary pb-1'
      : 'text-muted hover:text-text text-sm font-medium leading-normal transition-colors'

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-4 md:px-10 py-3 bg-surface z-50 relative shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.png" alt="HeatSafe Logo" className="h-10 object-contain mix-blend-multiply" />
        </Link>
      </div>
      <div className="flex flex-1 justify-end items-center gap-8">
        <nav className="hidden md:flex items-center gap-9">
          <Link href="/dashboard" className={linkCls('dashboard')}>Dashboard</Link>
          <Link href="/city" className={linkCls('city')}>Map View</Link>
          <Link href="/enterprise" className={`${linkCls('enterprise')} flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[18px]">domain</span> Enterprise
          </Link>
        </nav>
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-border flex items-center justify-center text-muted">
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  )
}
