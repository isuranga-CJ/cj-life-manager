import {localDate} from './finance.js';
export function demoData(){const date=localDate(),m=date.slice(0,7);return {
profiles:[{id:'demo',full_name:'CJ'}],accounts:[{id:'bank',name:'BOC savings',type:'Bank',opening_balance:25000},{id:'cash',name:'Everyday cash',type:'Cash',opening_balance:5000}],
income:[{id:'i1',account_id:'bank',date:m+'-01',source:'Monthly salary',category:'Salary',amount:100000},{id:'i2',account_id:'cash',date,source:'Rider payout',category:'Side income',amount:4200}],
expenses:[{id:'e1',account_id:'bank',date:m+'-02',category:'Rent',amount:18000,note:'Monthly rent'},{id:'e2',account_id:'cash',date,category:'Food',amount:850,note:'Lunch & groceries'},{id:'e3',account_id:'cash',date,category:'Transport',amount:1200,note:'Fuel'}],
transactions:[{id:'t1',from_account_id:'bank',to_account_id:'cash',amount:10000,date,note:'Cash withdrawal'}],
rider_logs:[{id:'r1',date,platform:'PickMe',trips:9,hours:3.5,distance:62,gross:5800,commission:870,fuel:1200,other_cost:0}],
budgets:[{id:'b1',month:m+'-01',category:'Food',amount:12000},{id:'b2',month:m+'-01',category:'Transport',amount:10000},{id:'b3',month:m+'-01',category:'Bills',amount:5000}],
bills:[{id:'bill1',name:'Electricity',due_date:m+'-20',amount:3500,category:'Bills',status:'pending'},{id:'bill2',name:'Monthly rent',due_date:m+'-02',amount:18000,category:'Rent',status:'paid'}],
savings_goals:[{id:'g1',name:'Emergency fund',target_amount:150000,saved_amount:25000,target_date:String(Number(m.slice(0,4))+1)+m.slice(4)+'-01'}],
casino_shifts:[{id:'s1',starts_at:date+'T08:00:00+05:30',ends_at:date+'T18:00:00+05:30',break_minutes:60,table_game:'Blackjack',tips:1500}]
}}
