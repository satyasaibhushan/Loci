/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

interface RouterValue {
  pathname: string
  navigate: (to: string, options?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterValue | undefined>(undefined)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<RouterValue>(() => ({
    pathname,
    navigate: (to, options) => {
      if (to === window.location.pathname) return
      window.history[options?.replace ? 'replaceState' : 'pushState']({}, '', to)
      setPathname(to)
    },
  }), [pathname])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouter(): RouterValue {
  const value = useContext(RouterContext)
  if (!value) throw new Error('Router components must be used inside RouterProvider')
  return value
}

export function useNavigate() {
  return useRouter().navigate
}

export function useLocation() {
  return { pathname: useRouter().pathname }
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> { to: string }

export function Link({ to, onClick, ...props }: LinkProps) {
  const { navigate } = useRouter()
  const follow = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a {...props} href={to} onClick={follow} />
}

export function NavLink({ to, className = '', ...props }: LinkProps) {
  const { pathname } = useRouter()
  const active = pathname === to || (to !== '/map' && pathname.startsWith(`${to}/`))
  return <Link {...props} to={to} className={`${className} ${active ? 'active' : ''}`.trim()} aria-current={active ? 'page' : undefined} />
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const { navigate } = useRouter()
  useEffect(() => navigate(to, { replace }), [navigate, replace, to])
  return null
}
