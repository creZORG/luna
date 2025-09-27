'use client';

import { Suspense } from 'react';
import VerifyForm from './_components/verify-form';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
