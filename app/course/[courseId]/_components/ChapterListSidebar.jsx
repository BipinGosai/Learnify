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
  let completedChapter= enrollCourse?.completedChapters ?? [];

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
    <div className="w-160 bg-secondary h-screen p-10">
      <h2 className="text-2xl font-bold my-5">Chapters ({courseContent?.length})</h2>

      <Accordion type="single" collapsible >
        {courseContent?.map((chapter, index) => (
          <AccordionItem key={index} value={chapter.courseData.chapterName}
            onClick={()=> setSelectedChapterIndex(index)}>
            <AccordionTrigger className={ `text-lg font-medium px-5
              ${completedChapter.includes(index) ?'bg-purple-100 text-purple-800':'' } `}>
              {index+1}.{chapter.courseData.chapterName}
            </AccordionTrigger>
            <AccordionContent asChild>
              <div className="">
                {(Array.isArray(chapter.courseData.topics) ? chapter.courseData.topics : [chapter.courseData.topics]).map((topic,index_)=>(
                  <h2 key={index_}
                   className={`p-2 bg-white my-1 rounded-lg
                     ${completedChapter.includes(index) ?'bg-purple-200 text-purple-800': 'bg-white' }`}>
                      {completedChapter.includes(index)}{topic?.topic}</h2>
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
