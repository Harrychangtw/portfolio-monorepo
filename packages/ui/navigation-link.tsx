"use client"

import { useNavigation } from '@portfolio/lib/contexts/navigation-context'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, type ComponentProps } from "react"

type NavigationLinkProps = ComponentProps<typeof Link>

const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ onClick, href, target, replace, scroll, ...props }, ref) => {
    const { startNavigation } = useNavigation()
    const router = useRouter()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call the original onClick if provided
      onClick?.(e)

      // Don't trigger navigation indicator if the click was prevented
      if (e.defaultPrevented) {
        return
      }

      // Ignore non-primary clicks and modified clicks
      if (e.button !== 0) {
        return
      }

      // Prevent infinite loading when opening in a new tab/window or downloading
      if (target === "_blank" || props.download || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }

      // Extract the target URL from href
      const targetHref = typeof href === 'string'
        ? href
        : `${href.pathname ?? ''}${href.search ?? ''}${href.hash ?? ''}`

      try {
        const currentUrl = new URL(window.location.href)
        const targetUrl = new URL(targetHref, window.location.href)

        // Check if we're navigating to the exact same page (origin + path + search)
        // This still allows same-page hash links to work without triggering the loading state
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

      // Prevent browser scroll restoration for actual route changes only
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }

      e.preventDefault()
      startNavigation()

      // Delay the actual navigation by 250ms to allow the overlay fade-in to complete.
      // This ensures the new page doesn't visually snap underneath a partially transparent overlay.
      setTimeout(() => {
        if (replace) {
          router.replace(targetHref, { scroll: scroll ?? true })
        } else {
          router.push(targetHref, { scroll: scroll ?? true })
        }
      }, 250)
    }

    return <Link ref={ref} href={href} target={target} replace={replace} scroll={scroll} onClick={handleClick} {...props} />
  }
)

NavigationLink.displayName = "NavigationLink"

export default NavigationLink