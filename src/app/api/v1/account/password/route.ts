import { NextResponse } from "next/server";
import { readJsonWithLimit, RequestBodyError } from "@/lib/security/read-json";
import { hash, verify } from "argon2";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { passwordSchema } from "@/lib/validations/account";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  try {
    const result = await checkRateLimit({
      scope: "password-change",
      identifier: session.user.id,
      limit: 5,
      windowSeconds: 900,
    });

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many password-change attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }
  } catch (error) {
    console.error("Password-change rate limiter unavailable:", error);
    return NextResponse.json(
      { error: "Password changes temporarily unavailable." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await readJsonWithLimit(request);
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    throw error;
  }
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({error:"Enter your current password and a different new password of at least 8 characters"},{status:400});
  const user = await prisma.user.findUnique({where:{id:session.user.id},select:{passwordHash:true}});
  if (!user?.passwordHash || !(await verify(user.passwordHash,parsed.data.currentPassword)))
    return NextResponse.json({error:"Current password is incorrect"},{status:400});
  const passwordHash = await hash(parsed.data.newPassword);
  const updated = await prisma.user.updateMany({where:{id:session.user.id,passwordHash:user.passwordHash},data:{passwordHash,sessionVersion:{increment:1}}});
  if (updated.count !== 1) return NextResponse.json({error:"Password changed elsewhere; please retry"},{status:409});
  return NextResponse.json({success:true});
}
