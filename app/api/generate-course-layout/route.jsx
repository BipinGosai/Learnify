import { coursesTable } from '@/config/schema';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/config/db';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Learnify"
  }
});

const PROMPT = `Generate Learning Course depends on following details. In which Make sure to add Course Name Description, Chapter Name+ Image Prompt (Create a modern, flat-style 2D digital illustration representing user Topic. Include UI/UX elements such as mockup screens, text blocks, icons, buttons, and creative workspace tools. Add symbolic elements related to user Course, like sticky notes, design components, and visual aids. Use a vibrant color palette (blues, purples, oranges) with a clean, professional look. The illustration should feel creative, tech-savvy, and educational, ideal for visualizing concepts in user Course) for Course Banner in 3d format, Topic under each chapters, Duration for each chapters etc, in JSON format only.
Schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": ["string"],
        "imagePrompt": "string"
      }
    ]
  }
}
User Input:`;

export async function POST(req) {
    try {
        const formData = await req.json();
        const user = await currentUser();
        const courseId = formData.courseId;

        // Development mock response
        if (process.env.NODE_ENV === 'development') {
            console.log('Using mock course layout in development mode');
            const mockResponse = {
                course: {
                    name: formData.courseName || "Sample Course",
                    description: "This is a sample course description for development",
                    category: formData.category || "Development",
                    level: formData.level || "beginner",
                    includeVideo: formData.includeVideo || false,
                    noOfChapters: parseInt(formData.noOfChapter) || 3,
                    bannerImagePrompt: `A modern, professional course banner for ${formData.courseName || "this course"}`,
                    chapters: Array(parseInt(formData.noOfChapter) || 3).fill().map((_, i) => ({
                        chapterName: `Chapter ${i + 1}: Introduction to ${formData.courseName || 'the topic'}`,
                        duration: "30 min",
                        topics: [
                            "Getting Started",
                            "Basic Concepts",
                            "Practical Examples"
                        ],
                        imagePrompt: `A modern 3D illustration for ${formData.courseName || 'the course'} chapter ${i + 1}`
                    }))
                }
            };
            
            // Save to database
            await db.insert(coursesTable).values({
                cid: courseId,
                name: mockResponse.course.name,
                description: mockResponse.course.description,
                noOfChapters: mockResponse.course.noOfChapters,
                includeVideo: mockResponse.course.includeVideo,
                level: mockResponse.course.level,
                category: mockResponse.course.category,
                courseJson: mockResponse,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                bannerImageUrl: ''
            });

            return NextResponse.json(mockResponse);
        }

        // Production: Call OpenRouter API
        const response = await openai.chat.completions.create({
            model: "openai/gpt-3.5-turbo", // or "openai/gpt-4" for better quality
            messages: [{
                role: "user",
                content: PROMPT + JSON.stringify(formData)
            }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        const courseData = JSON.parse(content);

        // Save to database
        await db.insert(coursesTable).values({
            cid: courseId,
            name: courseData.course.name,
            description: courseData.course.description,
            noOfChapters: courseData.course.noOfChapters,
            includeVideo: courseData.course.includeVideo,
            level: courseData.course.level,
            category: courseData.course.category,
            courseJson: courseData,
            userEmail: user?.primaryEmailAddress?.emailAddress,
            bannerImageUrl: ''
        });

        return NextResponse.json(courseData);

    } catch (error) {
        console.error('Error in generate-course-layout:', error);
        return NextResponse.json(
            { 
                error: error.message || 'Failed to generate course layout',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}