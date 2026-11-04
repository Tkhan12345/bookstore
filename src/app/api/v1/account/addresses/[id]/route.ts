import { parseJsonRequest } from "@/lib/security/parse-json";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validations/account";
export const runtime = "nodejs";
type Context = {params:Promise<{id:string}>};
export async function PATCH(request:Request,{params}:Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  const {id} = await params;
  let body:unknown;
  try {
    const result = await parseJsonRequest(request);
    if (!result.ok) return result.response;
    body = result.body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({error:"Please check the address fields"},{status:400});
  const result = await prisma.address.updateMany({where:{id,userId:session.user.id},data:{...parsed.data,line2:parsed.data.line2 || null}});
  if (result.count !== 1) return NextResponse.json({error:"Address not found"},{status:404});
  return NextResponse.json({success:true});
}
export async function DELETE(_request:Request,{params}:Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({error:"Sign in required"},{status:401});
  const {id} = await params;
  const result = await prisma.address.deleteMany({where:{id,userId:session.user.id}});
  if (result.count !== 1) return NextResponse.json({error:"Address not found"},{status:404});
  return NextResponse.json({success:true});
}
