"use client"

import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import Image from 'next/image';
import React from 'react'
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';


function EnrollCourseCard({course,enrollCourse}) {
    const courseJson = course?.courseJson?.course || course;
  const bannerSrc = typeof course?.bannerImageUrl === 'string' ? course.bannerImageUrl.trim() : '';

const CalculatePerProgress = () => {
  const completed = enrollCourse?.completedChapters?.length ?? 0;
  const total = course?.courseContent?.length ?? 1;

  return Math.round((completed / total) * 100);
};
  return (
    <div className='shadow-sm rounded-xl overflow-hidden border border-border bg-background'>
      {bannerSrc ? (
        <Image
          src={bannerSrc}
          alt={courseJson?.name ?? 'Course banner'}
          width={400}
          height={300}
          className='w-full aspect-video rounded-t-xl object-cover'
        />
      ) : (
        <Skeleton className='w-full aspect-video rounded-t-xl' />
      )}
      <div className='p-4 flex flex-col gap-3'>
        <div className='space-y-2'>
          <h2 className='font-bold text-lg leading-tight line-clamp-2'>{courseJson?.name}</h2>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <span>Progress</span>
            <span className='text-primary font-medium'>{CalculatePerProgress()}%</span>
          </div>
          <Progress value={CalculatePerProgress()} />
        </div>

        <Link href={'/workspace/view-course/' + course?.cid}>
          <Button className={'w-full'}>
            <PlayCircle />
            Continue Learning
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default EnrollCourseCard