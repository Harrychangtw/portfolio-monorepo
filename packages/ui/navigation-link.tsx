"use client"

import { useNavigation } from '@portfolio/lib/contexts/navigation-context'
import Link from "next/link"
import { forwardRef, type ComponentProps } from "react"

type NavigationLinkProps = ComponentProps<typeof Link>

const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ onClick, href, ...props }, ref) => {
    const { startNavigation } = useNavigation()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call the original onClick if provided
      onClick?.(e)

      // Don't trigger navigation indicator if the click was prevented
      if (e.defaultPrevented) {
        return
      }

      // Prevent infinite loading when opening in new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }

      // Extract the target path from href
      const targetHref = typeof href === 'string' ? href : href.pathname || ''

      try {
        const currentUrl = new URL(window.location.href)
        const targetUrl = new URL(targetHref, window.location.href)

        // Check if we're navigating to the exact same page (origin + path + search)
        // This handles hash changes and absolute URLs pointing to current page
        const isSamePage =
          targetUrl.origin === currentUrl.origin &&
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search

        if (isSamePage) {
          return
        }
      } catch {
        // If URL parsing fails, proceed normally
      }

      startNavigation()
    }

    return <Link ref={ref} href={href} onClick={handleClick} {...props} />
  }
)

NavigationLink.displayName = "NavigationLink"

export default NavigationLink
