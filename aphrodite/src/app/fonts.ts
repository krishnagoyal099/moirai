import localFont from 'next/font/local'

export const dxStirus = localFont({
  src: [
    {
      path: './fonts/DxSitrus-Expanded.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/DxSitrus-ExpandedItalic.otf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-stirus',
  display: 'swap',
})

export const harmond = localFont({
  src: [
    {
      path: './fonts/Harmond-ExtraBoldExpanded.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Harmond-SemiBoldCondensed.otf',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-harmond',
  display: 'swap',
})