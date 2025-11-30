"use client"

import { useNavigation } from '@portfolio/lib/contexts/navigation-context'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { forwardRef, type ComponentProps } from "react"

type NavigationLinkProps = ComponentProps<typeof Link>

const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ onClick, href, ...props }, ref) => {
    const { startNavigation } = useNavigation()
    const pathname = usePathname()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Call the original onClick if provided
      onClick?.(e)

      // Don't trigger navigation indicator if the click was prevented
      if (e.defaultPrevented) {
        return
      }

      // Extract the target path from href
      const targetHref = typeof href === 'string' ? href : href.pathname || ''

      // Check if this is actually a navigation to a different page
      // (not just a hash change on the same page)
      const isHashOnSamePage = targetHref.startsWith('/#') && pathname === '/'
      const isSamePage = targetHref === pathname || targetHref === `${pathname}/`

      if (!isHashOnSamePage && !isSamePage) {
        // Start the navigation loading indicator
        startNavigation()
      }
    }

    return <Link ref={ref} href={href} onClick={handleClick} {...props} />
  }
)

NavigationLink.displayName = "NavigationLink"

export default NavigationLink
