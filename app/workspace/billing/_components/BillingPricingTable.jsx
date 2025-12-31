'use client';

import React from 'react';
import { PricingTable } from '@clerk/nextjs';

export default function BillingPricingTable() {
  try {
    return <PricingTable />;
  } catch (e) {
    return (
      <div className='rounded-xl border p-4'>
        <p className='font-medium'>Billing is not enabled in Clerk.</p>
        <p className='text-sm text-muted-foreground mt-1'>
          Enable Billing in your Clerk Dashboard to use the pricing table.
        </p>
      </div>
    );
  }
}
