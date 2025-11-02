import { redirect } from 'next/navigation'

export default function EmailRedirect() {
  redirect('mailto:chiwei@harrychang.me')
}
