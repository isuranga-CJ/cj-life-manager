import {balance,cents,localDate,monthRows,sum} from './finance.js';

export const expenseCategories=['Food','Rent','Transport','Bills','Education','Health','Shopping','Other'];
export function budgetProgress(budget,expenses){
  const spent=sum(monthRows(expenses,budget.month.slice(0,7)).filter(e=>e.category===budget.category));
  const remaining=(cents(budget.amount)-cents(spent))/100;
  return {spent,remaining,ratio:spent/Number(budget.amount),state:remaining<0?'Over budget':spent>=Number(budget.amount)*0.8?'Near limit':'On track'};
}
export function goalProgress(goal,today=localDate()){
  const remaining=Math.max(0,cents(goal.target_amount)-cents(goal.saved_amount))/100;
  const months=Math.max(1,(Number(goal.target_date.slice(0,4))-Number(today.slice(0,4)))*12+Number(goal.target_date.slice(5,7))-Number(today.slice(5,7))+1);
  return {remaining,monthly:Math.ceil(remaining*100/months)/100,ratio:Number(goal.saved_amount)/Number(goal.target_amount),overdue:remaining>0&&goal.target_date<today};
}
export function safeToSpend(data,today=localDate()){
  const month=today.slice(0,7),end=month+'-31';
  const totalCents=data.accounts.reduce((s,a)=>s+cents(balance(a,data)),0);
  const budgetByCategory={},billByCategory={};
  for(const b of data.budgets||[])if(b.month.startsWith(month))budgetByCategory[b.category]=(budgetByCategory[b.category]||0)+Math.max(0,cents(budgetProgress(b,data.expenses).remaining));
  const due=(data.bills||[]).filter(b=>b.status==='pending'&&b.due_date<=end);
  for(const b of due)billByCategory[b.category]=(billByCategory[b.category]||0)+cents(b.amount);
  const commitments=[...new Set([...Object.keys(budgetByCategory),...Object.keys(billByCategory)])].reduce((s,c)=>s+Math.max(budgetByCategory[c]||0,billByCategory[c]||0),0);
  const reserved=(data.savings_goals||[]).reduce((s,g)=>s+cents(g.saved_amount),0);
  const available=totalCents-commitments-reserved;
  return {total:totalCents/100,commitments:commitments/100,reserved:reserved/100,available:Math.max(0,available)/100,shortfall:Math.max(0,-available)/100,due};
}
export function validatePlan(table,record,rows=[],editingId){
  const amount=table==='savings_goals'?record.target_amount:record.amount;
  if(!Number.isFinite(amount)||amount<=0||amount>=1e12)throw Error('Enter a positive amount below LKR 1 trillion.');
  const date=table==='budgets'?record.month:table==='bills'?record.due_date:record.target_date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!Number.isFinite(Date.parse(date+'T12:00:00Z'))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw Error('Choose a valid date.');
  if(table!=='budgets'&&(!record.name?.trim()||record.name.length>100))throw Error('Enter a name of up to 100 characters.');
  if(table==='budgets'){
    if(!/^\d{4}-\d{2}-01$/.test(record.month))throw Error('Choose a budget month.');
    if(rows.some(b=>b.id!==editingId&&b.month===record.month&&b.category===record.category))throw Error('This category already has a budget for that month. Edit it instead.');
  }
  if(table!=='savings_goals'&&!expenseCategories.includes(record.category))throw Error('Choose a valid expense category.');
  if(table==='savings_goals'&&(!Number.isFinite(record.saved_amount)||record.saved_amount<0||record.saved_amount>record.target_amount))throw Error('Reserved savings must be between zero and your goal target.');
  if(table==='bills'&&!['pending','paid'].includes(record.status))throw Error('Choose a bill status.');
  return record;
}
