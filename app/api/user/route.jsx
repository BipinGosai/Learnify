import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req){
    try {
        const body = await req.json().catch(() => ({}));
        const email = body?.email;
        const nameFromBody = body?.name;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'email is required' }, { status: 400 });
        }

        const name = (typeof nameFromBody === 'string' && nameFromBody.trim().length > 0)
            ? nameFromBody.trim()
            : email.split('@')[0];

        // if user already exists
        const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (existingUsers?.length > 0) {
            return NextResponse.json(existingUsers[0]);
        }

        // insert new user (race-safe)
        try {
            const inserted = await db
                .insert(usersTable)
                .values({ name, email })
                .returning();

            return NextResponse.json(inserted?.[0] ?? { name, email });
        } catch (insertError) {
            // If another request inserted the same email concurrently
            const code = insertError?.code ?? insertError?.cause?.code;
            if (code === '23505') {
                const afterInsertUsers = await db
                    .select()
                    .from(usersTable)
                    .where(eq(usersTable.email, email));

                return NextResponse.json(afterInsertUsers?.[0] ?? { name, email });
            }
            throw insertError;
        }
    } catch (error) {
        console.error('/api/user POST failed:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: error?.message },
            { status: 500 }
        );
    }
}
