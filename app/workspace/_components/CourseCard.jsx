import React from 'react'
import Image from 'next/image'
import { PlayCircle, Book, Settings, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';
import axios from 'axios';

function CourseCard({ course }) {
  const courseJson = course?.courseJson.course;
  const bannerSrc = typeof course?.bannerImageUrl === 'string' ? course.bannerImageUrl.trim() : '';
  const [loading, setLoading] = useState(false);
  const onEnrollCourse = async () => {
    try {
      setLoading(true);
      const result = await axios.post('/api/enroll-course', {
        courseId: course?.cid
      });
      console.log(result.data);
      if(result.data.resp){
        toast.warning('Already Enrolled');
        setLoading(false);
        return;
      }
      toast.success("Course Enrolled Successfully");
      setLoading(false);
    }
    catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }
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
        <div className='space-y-1'>
          <h2 className='font-bold text-lg leading-tight line-clamp-2'>{courseJson?.name}</h2>
          <p className='text-muted-foreground text-sm leading-relaxed line-clamp-3'>
            {courseJson?.description}
          </p>
        </div>

        <div className='flex items-center justify-between gap-3 pt-1'>
          <h2 className='flex items-center text-sm gap-2 text-muted-foreground'>
            <Book className='text-primary h-5 w-5' />
            {courseJson?.noOfChapters} Chapters
          </h2>
          {course?.courseContent?.length ? (
            <Button size={'sm'} onClick={onEnrollCourse} disabled={loading} className='shrink-0'>
              {loading ? <LoaderCircle className='animate-spin' /> : <PlayCircle />}
              Enroll Course
            </Button>
          ) : (
            <Link href={'/workspace/edit-course/' + course?.cid}>
              <Button size={'sm'} variant='outline' className='shrink-0'>
                <Settings />
                Generate Course
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
export default CourseCard;