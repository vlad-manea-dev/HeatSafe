import dynamic from 'next/dynamic'
import Head from 'next/head'

const EnterpriseMapClient = dynamic(() => import('../../components/EnterpriseMapClient'), { ssr: false })

export default function EnterprisePage() {
  return (
    <>
      <Head>
        <title>HeatSafe - Enterprise Planning</title>
      </Head>
      <EnterpriseMapClient />
    </>
  )
}
