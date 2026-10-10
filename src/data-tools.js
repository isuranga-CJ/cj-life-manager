export const backupTables=['profiles','accounts','income','expenses','transactions','rider_logs','casino_shifts','budgets','bills','savings_goals'];

// Read-only requests can be cancelled safely; writes are never automatically retried.
export async function readWorkspace(client,tables,{signal,pageSize=1000}={}){
 const entries=await Promise.all(tables.map(async table=>{
  const rows=[];
  for(let offset=0;;offset+=pageSize){
   signal?.throwIfAborted();
   let query=client.from(table).select('*').order('id').range(offset,offset+pageSize-1);
   if(signal)query=query.abortSignal(signal);
   const result=await query;
   if(result.error)throw Error(result.error.message);
   if(!Array.isArray(result.data))throw Error('Invalid workspace response.');
   rows.push(...result.data);
   if(result.data.length<pageSize)break;
  }
  return [table,rows];
 }));
 return Object.fromEntries(entries);
}

export function workspaceBackup(data,{demo=false,now=new Date()}={}){
 return JSON.stringify({app:'CJ Life Manager',format_version:1,exported_at:now.toISOString(),currency:'LKR',timezone:'Asia/Colombo',sample:demo,tables:Object.fromEntries(backupTables.map(t=>[t,data[t]||[]]))},null,2);
}
