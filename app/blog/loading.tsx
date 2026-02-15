import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    </div>
  );
}
