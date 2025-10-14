'use client'

import Image from 'next/image'

export default function StudyProfile({ id }: { id: string }) {
  return (
    <article>
      <Image src="/images/study.png" alt="study" width={100} height={100} />
      <section>
        <p>StudyProfile {id}</p>
      </section>
      <section>
        <p>종로구</p>
      </section>
      <section>
        <p>5 / 10</p>
      </section>
    </article>
  )
}
