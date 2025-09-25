import localFont from 'next/font/local'

export const pretendard = localFont({
  variable: '--pretendard',
  src: './PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
})

const fonts = {
  pretendard,
}

export default fonts
