import {localDate} from './finance.js';
export function demoData(){const date=localDate(),m=date.slice(0,7);return {
profiles:[{id:'demo',full_name:'CJ'}],accounts:[{id:'bank',name:'BOC savings',type:'Bank',opening_balance:25000},{id:'cash',name:'Everyday cash',type:'Cash',opening_balance:5000}],
income:[{id:'i1',account_id:'bank',date:m+'-01',source:'Monthly salary',category:'Salary',amount:100000},{id:'i2',account_id:'cash',date,source:'Rider payout',category:'Side income',amount:4200}],
expenses:[{id:'e1',account_id:'bank',date:m+'-02',category:'Rent',amount:18000,note:'Monthly rent'},{id:'e2',account_id:'cash',date,category:'Food',amount:850,note:'Lunch & groceries'},{id:'e3',account_id:'cash',date,category:'Transport',amount:1200,note:'Fuel'}],
transactions:[{id:'t1',from_account_id:'bank',to_account_id:'cash',amount:10000,date,note:'Cash withdrawal'}],
rider_logs:[{id:'r1',date,platform:'PickMe',trips:9,hours:3.5,distance:62,gross:5800,commission:870,fuel:1200,other_cost:0}],
casino_shifts:[{id:'s1',starts_at:date+'T08:00:00+05:30',ends_at:date+'T18:00:00+05:30',break_minutes:60,table_game:'Blackjack',tips:1500}]
}}
