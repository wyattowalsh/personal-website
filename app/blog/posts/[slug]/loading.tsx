import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PostLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    </div>
  );
}
