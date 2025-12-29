"use client";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import React, { useContext } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function ChapterListSidebar({ courseInfo }) {
  const course = courseInfo?.courses;
  const enrollCourse =courseInfo?.enrollCourse;
  const courseContent = courseInfo?.courses?.courseContent;
  const {SelectedChapterIndex,setSelectedChapterIndex}=useContext(SelectedChapterIndexContext)

  if (!courseContent || courseContent.length === 0) {
    return (
      <div className="w-80 bg-secondary h-screen p-5">
        <h2 className="text-xl font-bold my-5">Chapters</h2>
        <p className="text-sm text-muted-foreground">
          No chapters found
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-secondary h-screen p-5">
      <h2 className="text-xl font-bold my-5">Chapters ({courseContent?.length})</h2>

      <Accordion type="single" collapsible>
        {courseContent?.map((chapter, index) => (
          <AccordionItem key={index} value={chapter.courseData.chapterName}
            onClick={()=> setSelectedChapterIndex(index)}>
            <AccordionTrigger className={ 'text-lg font-medium'}>
              {index+1}.{chapter.courseData.chapterName}
            </AccordionTrigger>
            <AccordionContent asChild>
              <div className="">
                {chapter.courseData.topics.map((topic,index)=>(
                  <h2 key={index} className="p-2 bg-white my-1 rounded-lg ">{topic?.topic}</h2>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default ChapterListSidebar;
