'use client'

import { ReactNode } from 'react'

interface ConsoleLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function ConsoleLayout({ sidebar, children }: ConsoleLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)]">
      {/* Sidebar Area */}
      <aside className="h-full w-[var(--sidebar-width)] flex-shrink-0 border-r border-[var(--border)] bg-[var(--background-sidebar)]">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col h-full relative">
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="mx-auto max-w-full h-full flex flex-col">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
