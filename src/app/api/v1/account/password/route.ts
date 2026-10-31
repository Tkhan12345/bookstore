import { NextResponse } from "next/server";
import { hash, verify } from "argon2";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/validations/account";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid JSON"},{status:400}); }
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({error:"Enter your current password and a different new password of at least 8 characters"},{status:400});
  const user = await prisma.user.findUnique({where:{id:session.user.id},select:{passwordHash:true}});
  if (!user?.passwordHash || !(await verify(user.passwordHash,parsed.data.currentPassword)))
    return NextResponse.json({error:"Current password is incorrect"},{status:400});
  const passwordHash = await hash(parsed.data.newPassword);
  const updated = await prisma.user.updateMany({where:{id:session.user.id,passwordHash:user.passwordHash},data:{passwordHash}});
  if (updated.count !== 1) return NextResponse.json({error:"Password changed elsewhere; please retry"},{status:409});
  return NextResponse.json({success:true});
}
