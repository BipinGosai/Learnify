import { db } from "@/config/db";
import { coursesTable, usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId')

    if (courseId) {
        const result = await db.select().from(coursesTable)
        .where(eq(coursesTable.cid, courseId));
        console.log(result);
        // Convert BigInt to string for JSON serialization
        const serializedResult = result[0] ? {
            ...result[0],
            id: result[0].id.toString()
        } : null;
        return NextResponse.json(serializedResult);
    } else {
        const result = await db.select().from(coursesTable);
        return NextResponse.json(result.map(r => ({
            ...r,
            id: r.id.toString()
        })));
    }
}
