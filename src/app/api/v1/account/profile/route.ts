import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/account";
export const runtime = "nodejs";
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid JSON"},{status:400}); }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({error:"Name must be 2–100 characters"},{status:400});
  const user = await prisma.user.update({where:{id:session.user.id},data:{name:parsed.data.name},select:{name:true,email:true}});
  return NextResponse.json({user});
}
