import Link from 'next/link'
import Image from 'next/image'

export default function NavBar({ activePage = 'home', mode = 'user' }) {
  const linkCls = (page) =>
    activePage === page
      ? 'text-primary text-sm font-bold leading-normal border-b-2 border-primary pb-1'
      : 'text-muted hover:text-text text-sm font-medium leading-normal transition-colors'

  const enterpriseCls = (page) =>
    activePage === page
      ? 'text-enterprise-blue text-sm font-bold leading-normal border-b-2 border-enterprise-blue pb-1'
      : 'text-muted hover:text-enterprise-blue text-sm font-medium leading-normal transition-colors'

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-4 md:px-10 py-3 bg-white z-50 relative shadow-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className={`size-6 ${mode === 'enterprise' ? 'text-enterprise-blue' : 'text-primary'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {mode === 'enterprise' ? 'domain' : 'thermostat'}
            </span>
          </div>
          <h2 className="text-text text-xl font-bold leading-tight tracking-[-0.015em] font-display">
            HeatSafe
            {mode === 'enterprise' && (
              <span className="text-enterprise-blue text-sm font-body font-medium ml-2">Enterprise</span>
            )}
          </h2>
        </Link>
      </div>
      <div className="flex flex-1 justify-end items-center gap-8">
        <nav className="hidden md:flex items-center gap-9">
          <Link href="/dashboard" className={linkCls('dashboard')}>Dashboard</Link>
          <Link href="/city" className={linkCls('city')}>Map View</Link>
          {mode === 'enterprise' && (
            <Link href="/enterprise" className={`${enterpriseCls('enterprise')} flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[18px]">domain</span> Enterprise
            </Link>
          )}
        </nav>
        <div className="bg-[#f8f6f6] border border-border aspect-square rounded-full size-10 flex items-center justify-center text-muted">
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  )
}

