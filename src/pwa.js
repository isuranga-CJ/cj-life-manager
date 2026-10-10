import {Capacitor} from '@capacitor/core';
export const nativeApp=Capacitor.isNativePlatform();
let installPrompt=null,installed=nativeApp||window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
export function installButton(){return `<button class="install-button" data-install ${installed?'hidden':''} aria-label="Install CJ Life Manager">↓ Install app</button>`;}
export function refreshConnection(){const banner=document.querySelector('#connection-banner');if(banner)banner.hidden=navigator.onLine;document.querySelectorAll('[data-install]').forEach(b=>b.hidden=installed);}
function showInstallHelp(){let d=document.querySelector('#install-help');if(!d){d=document.createElement('dialog');d.id='install-help';document.body.append(d)}d.innerHTML='<div class="panel-heading"><h2>Keep CJ close</h2><button aria-label="Close">×</button></div><p>On Android, open this page in Chrome, then use the browser menu → <b>Install app</b> or <b>Add to Home screen</b>.</p><p>On iPhone, use the Share menu → <b>Add to Home Screen</b>.</p><p class="muted">Sign-in and saving entries need an internet connection.</p>';d.querySelector('button').onclick=()=>d.close();d.showModal();}
export function setupPWA(){
 const banner=document.createElement('div');banner.id='connection-banner';banner.className='connection-banner';banner.setAttribute('role','status');banner.textContent='You’re offline. Reconnect to refresh or save your entries.';document.body.append(banner);refreshConnection();
 window.addEventListener('offline',refreshConnection);window.addEventListener('online',refreshConnection);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;refreshConnection()});
 window.addEventListener('appinstalled',()=>{installed=true;installPrompt=null;refreshConnection()});
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-install]');if(!b)return;if(!installPrompt){showInstallHelp();return}b.disabled=true;const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')installed=true}catch{showInstallHelp()}finally{b.disabled=false;refreshConnection()}});
 if(!nativeApp&&'serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{/* Browser installation can still work without offline fallback. */});
}
