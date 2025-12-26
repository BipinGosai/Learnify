import { db } from "@/config/db";
import { eq } from "drizzle-orm";
import OpenAI from 'openai';
import { NextResponse } from "next/server";
import { coursesTable } from "@/config/schema";

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Your site URL
    "X-Title": "Learnify" // Your app name
  }
});

const PROMPT = `Depends on Chapter name and Topic. Generate content for each topic in HTML and give the response in JSON format.
Schema:
{
  "chapterName": "<>",
  "topics": 
    {
      "topic": "<>",
      "content": "<>"
    }
}
:User Input:`;

export async function POST(req) {
    const { courseJson, courseTitle, courseId } = await req.json();

    // Development mock response
    if (process.env.NODE_ENV === 'development') {
        console.log('Using mock course content in development mode');
        const mockChapters = courseJson?.chapters?.map(chapter => ({
            chapterName: chapter.chapterName,
            topics: chapter.topics.map(topic => ({
                topic,
                content: `<p>This is mock content for <strong>${topic}</strong> in development mode.</p>`
            })),
            youtubeVideos: [
                { videoId: 'dQw4w9WgXcQ', title: 'Sample Video 1' },
                { videoId: 'dQw4w9WgXcQ', title: 'Sample Video 2' }
            ]
        }));

        await db.update(coursesTable)
            .set({ courseContent: mockChapters })
            .where(eq(coursesTable.cid, courseId));

        return NextResponse.json({
            success: true,
            courseName: courseTitle,
            courseContent: mockChapters
        });
    }

    try {
        const results = await Promise.all(
            courseJson?.chapters?.map(async (chapter) => {
                try {
                    // Generate content using OpenRouter
                    const response = await openai.chat.completions.create({
                        model: "openai/gpt-3.5-turbo", // or any model from OpenRouter
                        messages: [{
                            role: "user",
                            content: PROMPT + JSON.stringify(chapter)
                        }],
                        response_format: { type: "json_object" }
                    });

                    const content = response.choices[0]?.message?.content;
                    const chapterData = JSON.parse(content);

                    // Get YouTube videos
                    const youtubeData = await GetYoutubeVideo(chapter?.chapterName);

                    return {
                        youtubeVideo: youtubeData,
                        courseData: chapterData
                    };
                } catch (error) {
                    console.error(`Error processing chapter ${chapter.chapterName}:`, error);
                    throw error;
                }
            })
        );

        // Save to database
        await db.update(coursesTable)
            .set({ courseContent: results })
            .where(eq(coursesTable.cid, courseId));

        return NextResponse.json({
            success: true,
            courseName: courseTitle,
            CourseContent: results
        });

    } catch (error) {
        console.error('Error in generate-course-content:', error);
        return NextResponse.json(
            { 
                success: false,
                error: error.message || 'Failed to generate course content'
            },
            { status: 500 }
        );
    }
}

// Your existing GetYoutubeVideo function remains the same
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const GetYoutubeVideo = async (topic) => {
    const params = {
        part: 'snippet',
        q: topic,
        maxResults: 4,
        type: 'video',
        key: process.env.YOUTUBE_API_KEY
    };
    const resp = await axios.get(YOUTUBE_BASE_URL, { params });
    return resp.data.items.map(item => ({
        videoId: item.id?.videoId,
        title: item?.snippet?.title
    }));
};