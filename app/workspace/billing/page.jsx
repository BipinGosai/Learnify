import React from 'react'
import BillingPricingTable from './_components/BillingPricingTable'

function page() {
  return (
    <div>
         <h2 className='text-3xl pb-5 font-bold'>Select Plan</h2>
         <BillingPricingTable />
    </div>
  )
}

export default page