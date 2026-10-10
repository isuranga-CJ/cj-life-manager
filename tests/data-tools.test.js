import test from 'node:test';
import assert from 'node:assert/strict';
import {readWorkspace,workspaceBackup,backupTables} from '../src/data-tools.js';
function fakeClient(pages,seen=[]){return {from(table){return {select(){return this},order(){return this},range(from,to){this.offset=from;seen.push([table,from,to]);return this},abortSignal(signal){this.signal=signal;return this},then(resolve,reject){return Promise.resolve().then(()=>{this.signal?.throwIfAborted();return pages(table,this.offset,this.signal)}).then(resolve,reject)}}}}}
test('workspace loader reads every page and retains each table separately',async()=>{
 const seen=[],signal=new AbortController().signal;
 const result=await readWorkspace(fakeClient((t,n,s)=>{assert.equal(s,signal);return {data:n===0?[{id:1},{id:2}]:[{id:3}]}},seen),['accounts','income'],{signal,pageSize:2});
 assert.equal(result.accounts.length,3);assert.equal(result.income.length,3);
 assert.deepEqual(seen.filter(x=>x[0]==='accounts'),[['accounts',0,1],['accounts',2,3]]);
});
test('failed table does not return a misleading partial workspace',async()=>{
 await assert.rejects(readWorkspace(fakeClient(t=>t==='accounts'?{data:[]}:{error:{message:'Access denied'}}),['accounts','income']),/Access denied/);
});
test('cancelled loads stop before issuing another query',async()=>{
 const controller=new AbortController(),seen=[];controller.abort();
 await assert.rejects(readWorkspace(fakeClient(()=>({data:[]}),seen),['accounts'],{signal:controller.signal}),{name:'AbortError'});assert.equal(seen.length,0);
});
test('in-flight abort reaches the underlying read request',async()=>{
 const controller=new AbortController();
 const client=fakeClient((t,n,signal)=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true})));
 const pending=readWorkspace(client,['accounts'],{signal:controller.signal});await Promise.resolve();await Promise.resolve();controller.abort();
 await assert.rejects(pending,{name:'AbortError'});
});
test('backup includes all record types and metadata, excludes session/config objects',()=>{
 const data=Object.fromEntries(backupTables.map(t=>[t,[{id:t,amount:12.34,note:'සිංහල'}]]));
 data.session={access_token:'do-not-export'};data.settings={secret:'do-not-export'};
 const backup=JSON.parse(workspaceBackup(data,{demo:true,now:new Date('2026-10-10T00:00:00Z')}));
 assert.deepEqual(backup.tables.accounts,data.accounts);assert.equal(Object.keys(backup.tables).length,10);assert.equal(backup.format_version,1);assert.equal(backup.sample,true);assert.equal(backup.timezone,'Asia/Colombo');assert.ok(!JSON.stringify(backup).includes('do-not-export'));
});
