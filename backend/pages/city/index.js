import dynamic from 'next/dynamic'
import Head from 'next/head'

const CityMapClient = dynamic(() => import('../../components/CityMapClient'), { ssr: false })

export default function CityPage() {
  return (
    <>
      <Head>
        <title>HeatSafe - City Map View</title>
      </Head>
      <CityMapClient />
    </>
  )
}
