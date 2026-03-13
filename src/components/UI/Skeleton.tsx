interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-800 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 mb-2 border border-slate-700">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-2 w-16 rounded-full" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-4" />
      <div className="flex gap-1 mb-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex justify-between mt-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
