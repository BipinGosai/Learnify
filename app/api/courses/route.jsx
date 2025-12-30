import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId"); // string
        const user = await currentUser();

        //  EXPLORE PAGE: show courses from ALL users
        if (courseId === "0") {
            const result = await db
                .select()
                .from(coursesTable)
                .where(
                    sql`${coursesTable.courseContent}::jsonb != '{}'::jsonb`
                )
                .orderBy(desc(coursesTable.id));

            return NextResponse.json(result || []);
        }

        // Protected routes
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        //  Single course
        if (courseId) {
            const result = await db
                .select()
                .from(coursesTable)
                .where(eq(coursesTable.cid, courseId));

            return NextResponse.json(result[0] || null);
        }

        //  User's own courses
        const result = await db
            .select()
            .from(coursesTable)
            .where(
                eq(
                    coursesTable.userEmail,
                    user.primaryEmailAddress?.emailAddress
                )
            )
            .orderBy(desc(coursesTable.id));

        return NextResponse.json(result || []);

    } catch (error) {
        console.error("Error in courses API:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch courses",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
