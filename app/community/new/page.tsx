import ImageUploader from '@/app/community/new/_components/ImageUploader'
import CommunityCreate from '@/app/community/new/_components/CommunityCreate'

export default function NewCommunity({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <h1 className="sr-only">새 커뮤니티 생성</h1>

      <ImageUploader>{children}</ImageUploader>
      <CommunityCreate>{children}</CommunityCreate>
    </main>
  )
}
