import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function InstagramRedirect() {
  redirect(siteConfig.social.instagram)
}
