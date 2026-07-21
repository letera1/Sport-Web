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

export const StandingsRowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton className="w-6 h-5" />
    <Skeleton className="w-6 h-6 rounded-full" />
    <Skeleton className="w-32 h-4 flex-1" />
    <Skeleton className="w-8 h-4" />
    <Skeleton className="w-8 h-4" />
    <Skeleton className="w-8 h-4" />
    <Skeleton className="w-10 h-4" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="bg-surface rounded-2xl p-6 sm:p-8">
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-center gap-2 w-24">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="w-20 h-4" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="flex flex-col items-center gap-2 w-24">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="flex flex-col gap-4 sm:gap-6">
    <Skeleton className="w-48 h-7" />
    <HeroSkeleton />
    <div className="bg-surface rounded-xl overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
