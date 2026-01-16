'use client';

import { use, useEffect } from 'react';
import { CheckDetail } from '@/app/components/checks/CheckDetail';
import { useRouter } from 'next/navigation';

export default function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const checkId = parseInt(id);
  
  useEffect(() => {
    if (isNaN(checkId)) {
      router.push('/checks');
    }
  }, [checkId, router]);
  
  if (isNaN(checkId)) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🦖</div>
        <div className="text-xl font-bold text-gray-700">ID de check inválido</div>
      </div>
    );
  }

  return (
    <CheckDetail 
      checkId={checkId}
      setCurrentPage={(page) => {
        if (page === 'checks') {
          router.push('/checks');
        }
      }}
    />
  );
}

