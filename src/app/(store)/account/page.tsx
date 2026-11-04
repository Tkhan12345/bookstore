import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountManager } from "@/components/account/account-manager";
export const dynamic = "force-dynamic";
export default async function AccountPage(){
 const session=await auth();
 if(!session?.user?.id) redirect("/login");
 const [user,addresses,orderCount]=await Promise.all([
  prisma.user.findUnique({where:{id:session.user.id},select:{name:true,email:true,role:true}}),
  prisma.address.findMany({where:{userId:session.user.id},orderBy:{id:"asc"}}),
  prisma.order.count({where:{userId:session.user.id}}),
 ]);
 if(!user) redirect("/login");
 return <AccountManager initialName={user.name??""} email={user.email} role={user.role} initialAddresses={addresses} orderCount={orderCount}/>;
}
