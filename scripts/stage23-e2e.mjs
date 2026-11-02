import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const db = new PrismaClient();
const base = 'http://127.0.0.1:3100';
const suffix = randomUUID().slice(0, 8);
const customerEmail = `stage23-customer-${suffix}@example.test`;
const adminEmail = `stage23-admin-${suffix}@example.test`;
const password = 'Stage23-Test-Password-!234';
let count = 0;
const pass = (name) => { count++; console.log(`PASS ${count}: ${name}`); };

function cookieClient() {
  const jar = new Map();
  return async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (jar.size) headers.set('cookie', [...jar].map(([k,v]) => `${k}=${v}`).join('; '));
    const res = await fetch(base + path, { ...options, headers, redirect: 'manual' });
    const setCookies = res.headers.getSetCookie?.() ?? (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
    for (const cookie of setCookies) {
      const part = cookie.split(';', 1)[0];
      const eq = part.indexOf('=');
      if (eq > 0) {
        const k = part.slice(0,eq); const v = part.slice(eq+1);
        if (!v) jar.delete(k); else jar.set(k,v);
      }
    }
    return res;
  };
}
async function json(client, method, path, body) {
  const res = await client(path, {method, headers: {'content-type':'application/json'}, body: JSON.stringify(body)});
  const text = await res.text();
  let data; try {data=JSON.parse(text);} catch {data={raw:text.slice(0,300)};}
  return {status:res.status, data, headers:res.headers};
}
async function login(client, email) {
  const csrfResponse = await client('/api/auth/csrf');
  assert.equal(csrfResponse.status, 200, 'Auth CSRF endpoint');
  const {csrfToken} = await csrfResponse.json();
  assert.ok(csrfToken, 'CSRF token missing');
  const form = new URLSearchParams({csrfToken, email, password, callbackUrl:base + '/account'});
  const response = await client('/api/auth/callback/credentials', {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'},body:form});
  assert.ok([200,302,303].includes(response.status), `Credentials callback HTTP ${response.status}`);
  const session = await client('/api/auth/session');
  const sessionData = await session.json();
  assert.equal(sessionData?.user?.email, email, `Login session failed: ${JSON.stringify(sessionData)}`);
}
async function main() {
  const passwordHash = await hash(password);
  const [customer, admin, book] = await Promise.all([
    db.user.create({data:{email:customerEmail,name:'Stage 23 Customer',role:'CUSTOMER',passwordHash}}),
    db.user.create({data:{email:adminEmail,name:'Stage 23 Admin',role:'ADMIN',passwordHash}}),
    db.book.create({data:{title:'Stage 23 Test Book',slug:`stage23-book-${suffix}`,description:'Isolated E2E test fixture',pricePaise:49900,active:true,inventory:{create:{quantity:10}}}}),
  ]);
  console.log('Isolated fixture IDs:', {customer:customer.id,admin:admin.id,book:book.id});
  const guest = cookieClient(), buyer = cookieClient(), manager = cookieClient();
  const shipping = {fullName:'Test Customer',phone:'9876543210',line1:'123 Testing Road',line2:'',city:'Pune',state:'Maharashtra',postalCode:'411001'};
  const payload = (key, qty=1) => ({idempotencyKey:key,paymentMethod:'cod',shipping,items:[{bookId:book.id,quantity:qty,expectedPricePaise:49900}]});
  const stock = async () => (await db.inventory.findUniqueOrThrow({where:{bookId:book.id}})).quantity;

  const home = await guest('/'); assert.ok([200,307,308].includes(home.status), `Homepage HTTP ${home.status}`); pass('Homepage available');
  let result = await json(guest,'POST','/api/v1/orders',{}); assert.equal(result.status,401); pass('Guest checkout denied');
  result = await json(guest,'PATCH',`/api/v1/admin/orders/${randomUUID()}/status`,{status:'SHIPPED'}); assert.equal(result.status,401); pass('Guest admin status denied');
  result = await json(guest,'PATCH',`/api/v1/admin/orders/${randomUUID()}/payment`,{paymentStatus:'PAID'}); assert.equal(result.status,401); pass('Guest admin payment denied');

  await login(buyer,customerEmail); pass('Customer credentials login');
  await login(manager,adminEmail); pass('Admin credentials login');
  result = await json(buyer,'PATCH',`/api/v1/admin/orders/${randomUUID()}/status`,{status:'SHIPPED'}); assert.equal(result.status,403); pass('Customer admin action forbidden');

  result = await json(buyer,'POST','/api/v1/orders',{invalid:true}); assert.equal(result.status,400); pass('Checkout schema validation');
  const key1 = randomUUID();
  result = await json(buyer,'POST','/api/v1/orders',payload(key1,2)); assert.equal(result.status,201,JSON.stringify(result.data));
  const firstId = result.data.order.id; assert.equal(result.data.replayed,false); assert.equal(await stock(),8); pass('COD checkout and atomic stock deduction');
  result = await json(buyer,'POST','/api/v1/orders',payload(key1,2)); assert.equal(result.status,200,JSON.stringify(result.data)); assert.equal(result.data.replayed,true); assert.equal(result.data.order.id,firstId); assert.equal(await stock(),8); pass('Idempotent checkout replay without double deduction');
  result = await json(buyer,'POST','/api/v1/orders',payload(key1,1)); assert.equal(result.status,409); assert.equal(await stock(),8); pass('Reused key with changed payload rejected');
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${firstId}/payment`,{paymentStatus:'PAID'}); assert.equal(result.status,409); pass('Cannot mark undelivered COD order paid');
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${firstId}/status`,{status:'CANCELLED'}); assert.equal(result.status,200,JSON.stringify(result.data)); assert.equal(await stock(),10); pass('Cancellation restores inventory');
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${firstId}/status`,{status:'CANCELLED'}); assert.equal(result.status,409); assert.equal(await stock(),10); pass('Repeat cancellation does not restore stock twice');

  const key2 = randomUUID();
  result = await json(buyer,'POST','/api/v1/orders',payload(key2,1)); assert.equal(result.status,201,JSON.stringify(result.data));
  const secondId = result.data.order.id; assert.equal(await stock(),9); pass('Second order created');
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${secondId}/status`,{status:'DELIVERED'}); assert.equal(result.status,409); pass('Cannot skip order status transitions');
  for (const status of ['PROCESSING','SHIPPED','DELIVERED']) {
    result = await json(manager,'PATCH',`/api/v1/admin/orders/${secondId}/status`,{status});
    assert.equal(result.status,200,JSON.stringify(result.data)); pass(`Order transition to ${status}`);
  }
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${secondId}/payment`,{paymentStatus:'PAID'}); assert.equal(result.status,200,JSON.stringify(result.data)); pass('Admin records delivered COD payment');
  result = await json(manager,'PATCH',`/api/v1/admin/orders/${secondId}/payment`,{paymentStatus:'PAID'}); assert.equal(result.status,409); pass('Duplicate COD payment rejected');
  const order = await db.order.findUniqueOrThrow({where:{id:secondId},include:{payments:true}});
  assert.equal(order.paymentStatus,'PAID'); assert.equal(order.payments.length,1); assert.equal(order.payments[0].amountPaise,49900); assert.equal(await stock(),9); pass('Payment, order and stock database invariants');
  console.log(`\nSTAGE 23 HTTP E2E: ${count} CHECKS PASSED`);
}
main().catch(error=>{console.error('\nSTAGE 23 FAILED:',error);process.exitCode=1;}).finally(async()=>{await db.$disconnect();});
