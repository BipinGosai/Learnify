import { Button } from "@/components/ui/button";
import { SelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import axios from "axios";
import { CheckCircle, Loader2Icon, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useContext, useState } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";

function ChapterContent({courseInfo, refreshData}){
    const {courseId}=useParams();
   const { course, enrollCourse } = courseInfo || {};
   const courseContent = courseInfo?.courses?.courseContent;
   const {selectedChapterIndex,setSelectedChapterIndex}=useContext(SelectedChapterIndexContext)
    const videoData=courseContent?.[selectedChapterIndex]?.youtubeVideo
    const topics=courseContent?.[selectedChapterIndex]?.courseData?.topics
    let completedChapter=enrollCourse?.completedChapters ?? [];
    const [loading, setLoading]=useState(false);

    const markChapterCompleted = async() =>{
        setLoading(true)     
        completedChapter.push(selectedChapterIndex);
        const result=await axios.put('/api/enroll-course',{
            courseId:courseId,
            completedChapter:completedChapter
            });

            console.log(result);
            refreshData()
            toast.success('Chapter Marked Completed! ')
            setLoading(false);

    }
    const markInCompleteChapter = async() =>{
        setLoading(false);
        const completeChap = completedChapter.filter(item => item != selectedChapterIndex);
        const result=await axios.put('/api/enroll-course',{
            courseId:courseId,
            completedChapter:completeChap
            });

            console.log(result);
            refreshData()
            toast.success('Chapter Marked InCompleted! ')
            setLoading(false);

    }

   return(
        <div className="p-10">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-2xl">{selectedChapterIndex+1}.{courseContent?.[selectedChapterIndex]?.courseData?.chapterName}</h2>
            {!completedChapter?.includes(selectedChapterIndex)?
               <Button onClick={() => markChapterCompleted()}
               disabled={loading}
               >{loading?<Loader2Icon className="animate-spin"/>:
                  <CheckCircle />}
                   Mark as Completed
              </Button>:
              <Button variant="outline" onClick= {markInCompleteChapter}
              disabled={loading}
              >
                {loading?<Loader2Icon className="animate-spin"/>: 
                <X/>} Mark Incomplete
              </Button>
}
            </div>
            <h2 className="my-2 font-bold text-lg">Related Videos</h2>
            <div className='grid grid-cols-2 md:grid-cols-2 '>
                {videoData?.map((video,index)=> index < 2 &&(
                    <div key={index}>
                        <YouTube
                        videoId={video?.videoId}
                        opts={{
                            height:'350',
                            width: '650'
                        }}
                        />
                    </div>                
                ))}
            </div>
            <div>
                {topics?.map((topic,index)=>(
                    <div key={index} className="mt-10 p-5 bg-secondary ronded-2xl">
                         <h2 className="font-bold text-2xl text-primary"> {index+1}.{topic?.topic}</h2>
                         {/* <p>{topic?.content}</p> */}
                         <div dangerouslySetInnerHTML={{__html: topic?.content}}
                         style={{
                            lineHeight: '2.5'
                         }}>
                       
                         </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default ChapterContent