import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/config/db";
import { NextResponse } from "next/server";

function getUserEmailFromClerkUser(user) {
  return user?.primaryEmailAddress?.emailAddress ?? null;
}

// Handle course enrollment
export async function POST(req) {
  const { courseId } = await req.json();
  const user = await currentUser();
  const userEmail = getUserEmailFromClerkUser(user);

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  // Check if course is already enrolled
  const enrollCourses = await db
    .select()
    .from(enrollCourseTable)
    .where(
      and(
        eq(enrollCourseTable.userEmail, userEmail),
        eq(enrollCourseTable.cid, courseId)
      )
    );

  if (enrollCourses?.length === 0) {
    const result = await db
      .insert(enrollCourseTable)
      .values({
        cid: courseId,
        userEmail,
      })
      .returning(enrollCourseTable);

    return NextResponse.json(result);
  }

  return NextResponse.json({ resp: "Course already enrolled" });
}

// Fetch enrolled courses
export async function GET(req) {
  const user = await currentUser();
  const userEmail = getUserEmailFromClerkUser(user);
  const { searchParams } = new URL(req.url);
  const courseId = searchParams?.get("courseId");

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (courseId) {
    const result = await db
      .select()
      .from(coursesTable)
      .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
      .where(
        and(
          eq(enrollCourseTable.userEmail, userEmail),
          eq(enrollCourseTable.cid, courseId)
        )
      )
      .orderBy(desc(enrollCourseTable.id));

    return NextResponse.json(result[0]);
  }

  const result = await db
    .select()
    .from(coursesTable)
    .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
    .where(eq(enrollCourseTable.userEmail, userEmail))
    .orderBy(desc(enrollCourseTable.id));

  return NextResponse.json(result);
}

export  async function PUT(req) {
  const {completedChapter,courseId}=await req.json();
  const user=await currentUser();
  const userEmail = getUserEmailFromClerkUser(user);

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const result=await db.update(enrollCourseTable).set({
    completedChapters:completedChapter
  }).where(and(eq(enrollCourseTable.cid,courseId),
  eq(enrollCourseTable.userEmail,userEmail)))
   .returning(enrollCourseTable)

   return NextResponse.json(result);

}