import { redirect } from 'next/navigation'

export default function EmailRedirect() {
  redirect('mailto:koding.chang@gmail.com')
}
