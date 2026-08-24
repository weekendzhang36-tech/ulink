import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export default function FrontendLayout({ children }: Props) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
