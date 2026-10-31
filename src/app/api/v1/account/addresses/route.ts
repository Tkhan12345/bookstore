import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations/account";
export const runtime = "nodejs";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  const addresses = await prisma.address.findMany({where:{userId:session.user.id},orderBy:{id:"asc"}});
  return NextResponse.json({addresses});
}
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid JSON"},{status:400}); }
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({error:"Please check all address fields and PIN code"},{status:400});
  const count = await prisma.address.count({where:{userId:session.user.id}});
  if (count >= 10) return NextResponse.json({error:"Maximum 10 addresses allowed"},{status:409});
  const address = await prisma.address.create({data:{...parsed.data,line2:parsed.data.line2 || null,userId:session.user.id}});
  return NextResponse.json({address},{status:201});
}
