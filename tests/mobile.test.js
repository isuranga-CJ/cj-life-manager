import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {bottomNavigation,hubView,menuChoices} from '../src/navigation.js';
test('every finance/work/planning destination stays reachable in mobile menus',()=>{
 const expected=['accounts','income','expenses','transactions','rider_logs','casino_shifts','reports','budgets','bills','savings_goals','safe_to_spend'];
 const destinations=menuChoices('more').map(c=>c[0]);for(const page of expected)assert.ok(destinations.includes(page),page);
 const icons=Object.fromEntries(expected.map(p=>[p,'<svg/>']));for(const page of ['money','plans'])assert.doesNotMatch(hubView(page,{icons}),/undefined/);
 assert.equal(menuChoices('add').length,9);
});
test('mobile bottom navigation has five named controls and highlights each parent',()=>{
 const icons={dashboard:'<svg/>',accounts:'<svg/>',bills:'<svg/>'};
 for(const [page,parent] of [['expenses','Money'],['savings_goals','Plans'],['rider_logs','More'],['dashboard','Home']]){
 const html=bottomNavigation(page,{icons});assert.equal((html.match(/<button /g)||[]).length,5);assert.match(html,new RegExp(`aria-label="${parent}" title="${parent}" aria-current="page"`));
 }
});
test('install manifest has standalone identity and actual PNG sizes including maskable icon',()=>{
 const manifest=JSON.parse(readFileSync('public/manifest.webmanifest'));assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');assert.equal(manifest.id,'/');
 for(const size of [192,512])assert.ok(manifest.icons.some(i=>i.sizes===`${size}x${size}`));
 assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));
 for(const icon of manifest.icons){const png=readFileSync(`public${icon.src}`);const [w,h]=icon.sizes.split('x').map(Number);assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h)}
});
test('offline worker caches only generic reconnect content and ignores API/auth/writes',async()=>{
 const handlers={},added=[],deleted=[];let claimed=0,fetches=0;
 const cache={add:async url=>added.push(url),match:async()=>({offline:true})};
 const context={URL,caches:{open:async()=>cache,keys:async()=>['cj-offline-old','other-app-cache'],delete:async name=>deleted.push(name)},fetch:async()=>{fetches++;throw Error('offline')},self:{location:{origin:'https://cj-life-manager.vercel.app'},addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>claimed++}}};
 vm.runInNewContext(readFileSync('public/sw.js','utf8'),context);
 let pending;handlers.install({waitUntil:p=>pending=p});await pending;assert.deepEqual(added,['/offline.html']);
 handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['cj-offline-old']);assert.equal(claimed,1);
 for(const request of [{method:'POST',mode:'navigate',url:'https://cj-life-manager.vercel.app/'},{method:'GET',mode:'cors',url:'https://hrrflxpcbsywiffseouv.supabase.co/rest/v1/accounts'},{method:'GET',mode:'cors',url:'https://cj-life-manager.vercel.app/api/auth'},{method:'GET',mode:'cors',url:'https://cj-life-manager.vercel.app/assets/app.js'}])handlers.fetch({request,respondWith:()=>assert.fail('private/API/asset request was intercepted')});
 handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://cj-life-manager.vercel.app/'},respondWith:p=>pending=p});assert.deepEqual(await pending,{offline:true});assert.equal(fetches,1);
});
