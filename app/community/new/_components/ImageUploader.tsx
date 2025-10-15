import type { PropsWithChildren } from 'react'

export default function ImageUploader({ children }: PropsWithChildren) {
  return (
    <section>
      {/* ...업로더 UI... */}
      {children} {/* 실제 JSX만 렌더됨 */}
    </section>
  )
}
