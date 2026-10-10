export const zone='Asia/Colombo';
export const money=n=>new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR',maximumFractionDigits:2}).format(n||0);
export const localDate=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export const cents=n=>Math.round(Number(n||0)*100);
export const sum=(rows,key='amount')=>rows.reduce((s,r)=>s+cents(r[key]),0)/100;
export function balance(a,d){return (cents(a.opening_balance)+cents(sum(d.income.filter(r=>r.account_id===a.id)))-cents(sum(d.expenses.filter(r=>r.account_id===a.id)))+cents(sum(d.transactions.filter(r=>r.to_account_id===a.id)))-cents(sum(d.transactions.filter(r=>r.from_account_id===a.id))))/100}
export const riderNet=r=>(cents(r.gross)-cents(r.commission)-cents(r.fuel)-cents(r.other_cost))/100;
export const shiftHours=r=>(new Date(r.ends_at)-new Date(r.starts_at))/3600000-Number(r.break_minutes)/60;
export const monthRows=(rows,month)=>rows.filter(r=>(r.date||localDate(new Date(r.starts_at))).startsWith(month));
export function validate(table,r){
 if(['income','expenses','transactions'].includes(table)&&(!Number.isFinite(r.amount)||r.amount<=0||r.amount>=1e12))throw Error('Enter a positive amount below LKR 1 trillion.');
 if(table==='transactions'&&(!r.from_account_id||!r.to_account_id||r.from_account_id===r.to_account_id))throw Error('Choose two different accounts.');
 if(table==='casino_shifts'&&(!Number.isFinite(shiftHours(r))||shiftHours(r)<=0||new Date(r.ends_at)-new Date(r.starts_at)>86400000))throw Error('Shift must end after its start, within 24 hours, with a shorter break.');
 if(table==='rider_logs'&&(r.hours<=0||r.hours>24||!Number.isInteger(r.trips)||r.trips<0))throw Error('Check rider hours and trip count.');
 return r;
}
export function csv(rows){return rows.map(r=>r.map(v=>'"'+String(v??'').replace(/^[=+@\-]/,"'$&").replaceAll('"','""')+'"').join(',')).join('\r\n')}
