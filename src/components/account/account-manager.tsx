"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

type Address = {id:string;fullName:string;phone:string;line1:string;line2:string|null;city:string;state:string;postalCode:string;country:string};
type AddressForm = Omit<Address,"id"|"country">;
const empty:AddressForm = {fullName:"",phone:"",line1:"",line2:"",city:"",state:"",postalCode:""};
const fields:[keyof AddressForm,string][] = [["fullName","Full name"],["phone","Phone"],["line1","Address line 1"],["line2","Address line 2 (optional)"],["city","City"],["state","State"],["postalCode","PIN code"]];
export function AccountManager({initialName,email,role,initialAddresses,orderCount}:{initialName:string;email:string;role:string;initialAddresses:Address[];orderCount:number}) {
 const router=useRouter();
 const [name,setName]=useState(initialName);
 const [addresses,setAddresses]=useState(initialAddresses);
 const [editing,setEditing]=useState<string|null>(null);
 const [form,setForm]=useState<AddressForm>(empty);
 const [currentPassword,setCurrentPassword]=useState("");
 const [newPassword,setNewPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 async function send(url:string,method:string,data?:unknown){
   const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:data===undefined?undefined:JSON.stringify(data)});
   const result=await res.json();
   if(!res.ok) throw new Error(result.error || "Request failed");
   return result;
 }
 async function perform(action:()=>Promise<void>){setBusy(true);setMessage("");try{await action();}catch(e){setMessage(e instanceof Error?e.message:"Something went wrong");}finally{setBusy(false);}}
 function edit(address?:Address){setEditing(address?.id??"new");setForm(address?{fullName:address.fullName,phone:address.phone,line1:address.line1,line2:address.line2??"",city:address.city,state:address.state,postalCode:address.postalCode}:empty);setMessage("");}
 return <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
   <header><p className="text-xs font-semibold uppercase tracking-widest text-forest">Your reading space</p><h1 className="mt-2 font-heading text-4xl text-forest">My Account</h1><p className="mt-2 text-muted-foreground">Manage your profile, delivery addresses and security.</p></header>
   {message&&<p role="status" className="rounded-lg border bg-white p-4 text-sm">{message}</p>}
   <div className="grid gap-5 sm:grid-cols-3"><Link href="/orders" className="rounded-xl border bg-white p-5"><p className="text-muted-foreground">My orders</p><p className="mt-2 text-3xl font-semibold text-forest">{orderCount}</p><p className="mt-2 text-sm underline">View and track</p></Link><Link href="/wishlist" className="rounded-xl border bg-white p-5"><p className="font-semibold text-forest">Wishlist</p><p className="mt-2 text-sm">View saved books</p></Link>{role==="ADMIN"?<Link href="/admin" className="rounded-xl border bg-white p-5"><p className="font-semibold text-forest">Admin dashboard</p><p className="mt-2 text-sm">Manage store</p></Link>:<Link href="/books" className="rounded-xl border bg-white p-5"><p className="font-semibold text-forest">Browse books</p><p className="mt-2 text-sm">Discover your next read</p></Link>}</div>
   <section className="rounded-xl border bg-white p-6"><h2 className="font-heading text-2xl text-forest">Profile</h2><p className="mt-2 text-sm text-muted-foreground">Email: {email}</p><form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={e=>{e.preventDefault();void perform(async()=>{await send("/api/v1/account/profile","PATCH",{name});setMessage("Profile updated");router.refresh();});}}><label className="flex-1 text-sm">Display name<input className="mt-1 w-full rounded-md border p-3" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={100} required /></label><button disabled={busy} className="rounded-md bg-forest px-5 py-3 text-white disabled:opacity-50">Save name</button></form></section>
   <section className="rounded-xl border bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-heading text-2xl text-forest">Saved addresses</h2><button className="rounded-md bg-forest px-4 py-2 text-sm text-white" onClick={()=>edit()}>Add address</button></div><p className="mt-2 text-sm text-muted-foreground">Select a saved address at checkout. Up to 10 addresses.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{addresses.map(a=><div key={a.id} className="rounded-lg border p-4 text-sm"><p className="font-semibold">{a.fullName}</p><p>{a.line1}{a.line2?`, ${a.line2}`:""}</p><p>{a.city}, {a.state} – {a.postalCode}</p><p>{a.phone}</p><div className="mt-3 flex gap-4"><button className="underline" onClick={()=>edit(a)}>Edit</button><button className="text-red-700 underline" disabled={busy} onClick={()=>{if(!window.confirm("Delete this address?"))return;void perform(async()=>{await send(`/api/v1/account/addresses/${a.id}`,"DELETE");setAddresses(old=>old.filter(x=>x.id!==a.id));setMessage("Address deleted");});}}>Delete</button></div></div>)}</div>{addresses.length===0&&<p className="mt-4 text-sm text-muted-foreground">No saved addresses yet.</p>}
   {editing&&<form className="mt-6 space-y-4 border-t pt-5" onSubmit={e=>{e.preventDefault();void perform(async()=>{const url=editing==="new"?"/api/v1/account/addresses":`/api/v1/account/addresses/${editing}`;await send(url,editing==="new"?"POST":"PATCH",form);const data=await send("/api/v1/account/addresses","GET");setAddresses(data.addresses);setEditing(null);setMessage("Address saved");});}}><h3 className="font-semibold">{editing==="new"?"New address":"Edit address"}</h3><div className="grid gap-3 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className="text-sm">{label}<input className="mt-1 w-full rounded-md border p-3" value={form[key]??""} onChange={e=>setForm(old=>({...old,[key]:e.target.value}))} required={key!=="line2"} maxLength={key==="postalCode"?6:200} /></label>)}</div><div className="flex gap-3"><button disabled={busy} className="rounded-md bg-forest px-5 py-2 text-white disabled:opacity-50">Save address</button><button type="button" className="rounded-md border px-5 py-2" onClick={()=>setEditing(null)}>Cancel</button></div></form>}</section>
   <section className="rounded-xl border bg-white p-6"><h2 className="font-heading text-2xl text-forest">Change password</h2><form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();void perform(async()=>{await send("/api/v1/account/password","PATCH",{currentPassword,newPassword});setCurrentPassword("");setNewPassword("");setMessage("Password changed successfully");});}}><label className="text-sm">Current password<input type="password" autoComplete="current-password" className="mt-1 w-full rounded-md border p-3" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required /></label><label className="text-sm">New password (8+ characters)<input type="password" autoComplete="new-password" minLength={8} className="mt-1 w-full rounded-md border p-3" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required /></label><button disabled={busy} className="rounded-md bg-forest px-5 py-3 text-white disabled:opacity-50 sm:col-span-2 sm:justify-self-start">Update password</button></form></section>
   <div><LogoutButton /></div>
 </div>;
}
