import {localDate,money} from './finance.js';
import {budgetProgress,goalProgress} from './planning-finance.js';

export function homeHighlights(data,{esc,icons}){
 const today=localDate(),month=today.slice(0,7);
 const bills=data.bills.filter(b=>b.status==='pending').sort((a,b)=>a.due_date.localeCompare(b.due_date)).slice(0,3);
 const budgets=data.budgets.filter(b=>b.month.startsWith(month)).map(b=>({...b,progress:budgetProgress(b,data.expenses)}));
 const goals=data.savings_goals.slice(0,3);
 const shortcuts=[['expenses','Add expense','Quick entry','add'],['income','Add income','Record a payout','add'],['budgets','Budgets','Plan your month','page'],['bills','Bills calendar','Stay ahead of due dates','page'],['savings_goals','Savings goals','Make progress','page'],['rider_logs','Rider studio','Track your work','page']];
 return `<div class="home-shortcuts">${shortcuts.map(([page,label,detail,action])=>`<button class="home-shortcut" data-${action}="${page}"><span class="shortcut-icon">${icons[page]}</span><b>${label}</b><small>${detail}</small></button>`).join('')}</div><div class="home-plans"><section class="panel"><div class="panel-heading"><h2>Coming up</h2><button data-page="bills">All bills ↗</button></div>${bills.map(b=>`<div class="home-item"><div><b>${esc(b.name)}</b><small class="${b.due_date<today?'warning':''}">${b.due_date<today?'Overdue · ':b.due_date===today?'Due today · ':''}${esc(b.due_date)}</small></div><strong>${money(b.amount)}</strong></div>`).join('')||'<p class="muted">No unpaid bills recorded.</p>'}</section><section class="panel"><div class="panel-heading"><h2>Budget pulse</h2><button data-page="budgets">All budgets ↗</button></div>${budgets.slice(0,3).map(b=>`<div class="home-item"><div><b>${esc(b.category)}</b><small class="${b.progress.ratio>=0.8?'warning':''}">${b.progress.state}</small></div><strong>${money(Math.abs(b.progress.remaining))}<small>${b.progress.remaining<0?'over limit':'remaining'}</small></strong></div>`).join('')||'<p class="muted">Create a budget to see your monthly progress.</p>'}</section><section class="panel"><div class="panel-heading"><h2>Saving for tomorrow</h2><button data-page="savings_goals">All goals ↗</button></div>${goals.map(g=>{const p=goalProgress(g);return `<div class="home-item"><div><b>${esc(g.name)}</b><small>${p.remaining===0?'Goal reached':Math.round(p.ratio*100)+'% reserved'}</small></div><strong>${money(g.saved_amount)}</strong></div>`}).join('')||'<p class="muted">Add a goal and give your savings a purpose.</p>'}</section></div>`;
}

export function homeWelcome(data,{esc}){
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',hour:'numeric',hour12:false}).format(new Date()));
 const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 return `<section class="home-welcome"><div><span class="eyebrow">YOUR LIFE, A LITTLE MORE ORGANIZED</span><h2>${greeting}${data.profiles[0]?.full_name?', '+esc(data.profiles[0].full_name):''}.</h2><p class="muted">Let’s make room for your next move.</p></div><span class="welcome-mark" aria-hidden="true">✦</span></section>`;
}
