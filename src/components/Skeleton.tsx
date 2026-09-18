import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('skeleton', className)} />
);

export const MatchCardSkeleton = () => (
  <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 border-l-[3px] border-l-transparent">
    <Skeleton className="w-12 h-8" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="w-24 h-4" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="w-28 h-4" />
      </div>
    </div>
    <div className="flex flex-col gap-2 items-end">
      <Skeleton className="w-6 h-4" />
      <Skeleton className="w-6 h-4" />
    </div>
  </div>
);
