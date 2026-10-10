import test from 'node:test';
import assert from 'node:assert/strict';
import {budgetProgress,goalProgress,safeToSpend,validatePlan} from '../src/planning-finance.js';
import {planningView} from '../src/planning.js';
import {demoData} from '../src/demo.js';
import {localDate} from '../src/finance.js';
const ledger=()=>({accounts:[{id:'a',opening_balance:10000}],income:[],expenses:[],transactions:[],budgets:[],bills:[],savings_goals:[]});
test('budget warning follows actual category expenses in the selected month',()=>{
 const b={month:'2026-10-01',category:'Food',amount:100};
 const expenses=[{date:'2026-10-10',category:'Food',amount:80},{date:'2026-09-10',category:'Food',amount:50},{date:'2026-10-10',category:'Rent',amount:100}];
 assert.deepEqual(budgetProgress(b,expenses),{spent:80,remaining:20,ratio:0.8,state:'Near limit'});
 expenses.push({date:'2026-10-11',category:'Food',amount:20.01});assert.equal(budgetProgress(b,expenses).state,'Over budget');
});
test('safe spending removes bill-budget overlap without removing other categories',()=>{
 const d=ledger();d.budgets=[{month:'2026-10-01',category:'Bills',amount:3000}];
 d.bills=[{due_date:'2026-10-20',status:'pending',category:'Bills',amount:2000},{due_date:'2026-09-20',status:'pending',category:'Rent',amount:1000}];
 d.savings_goals=[{saved_amount:500}];
 assert.equal(safeToSpend(d,'2026-10-10').available,5500);
 d.bills[0].amount=4000;assert.equal(safeToSpend(d,'2026-10-10').available,4500);
});
test('paid and future bills are excluded while overdue bills remain reserved',()=>{
 const d=ledger();d.bills=[{due_date:'2026-10-02',status:'paid',category:'Rent',amount:1000},{due_date:'2026-11-01',status:'pending',category:'Rent',amount:1000},{due_date:'2026-09-01',status:'pending',category:'Rent',amount:500}];
 assert.equal(safeToSpend(d,'2026-10-10').commitments,500);
});
test('insufficient funds produce a visible shortfall instead of negative available cash',()=>{
 const d=ledger();d.savings_goals=[{saved_amount:12000}];const s=safeToSpend(d,'2026-10-10');assert.equal(s.available,0);assert.equal(s.shortfall,2000);
});
test('goal monthly estimate rounds up and handles completed or overdue goals',()=>{
 const g={target_amount:100,saved_amount:0,target_date:'2026-12-01'};assert.equal(goalProgress(g,'2026-10-10').monthly,33.34);
 assert.equal(goalProgress({...g,saved_amount:100},'2026-10-10').remaining,0);
 assert.equal(goalProgress({...g,target_date:'2026-09-01'},'2026-10-10').overdue,true);
});
test('planning rejects invalid amounts, duplicate budgets and overallocated goals',()=>{
 const b={id:'b',month:'2026-10-01',category:'Food',amount:100};assert.throws(()=>validatePlan('budgets',b,[b]));assert.doesNotThrow(()=>validatePlan('budgets',b,[b],'b'));
 assert.throws(()=>validatePlan('bills',{category:'Food',status:'pending',amount:Infinity}));
 assert.throws(()=>validatePlan('savings_goals',{target_amount:100,saved_amount:101}));
});
test('all planning views render sample data and escape stored names',()=>{
 const d=demoData();d.bills[0].name='<script>bad()</script>';
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const stat=(label,value)=>`<article>${label}: ${value}</article>`;
 for(const page of ['budgets','bills','savings_goals','safe_to_spend']){
  const html=planningView(page,d,localDate().slice(0,7),{esc,stat});assert.ok(html.length>200);assert.ok(!html.includes('<script>bad()'));
 }
 assert.equal(safeToSpend(d).available,64200);
});
