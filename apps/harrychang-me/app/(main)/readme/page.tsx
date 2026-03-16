import { siteConfig } from '@/config/site'
import type { Metadata } from 'next'
import RedirectPage from '@/components/main/redirect-page'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function GitHubReadmeRedirect() {
  return <RedirectPage href={siteConfig.social.readme} label="GitHub" />
}
