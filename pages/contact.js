(function(){'use strict';
var f=document.getElementById('cf');if(!f)return;
var st=document.getElementById('status'),btn=document.getElementById('send'),t0=Date.now();
var topics={web:'web-software','web-software':'web-software',mobile:'mobile-apps','mobile-apps':'mobile-apps',security:'app-security','app-security':'app-security',ai:'ai-research','ai-research':'ai-research'};
try{var tp=new URLSearchParams(location.search).get('topic');if(tp&&topics[tp])f.service.value=topics[tp];}catch(e){}
function show(kind,text,link){st.className='status show '+kind;st.textContent=text;if(link){st.appendChild(document.createTextNode(' '));var a=document.createElement('a');a.href=link.href;a.textContent=link.label;st.appendChild(a);}}
function err(id,msg){document.getElementById('e-'+id).textContent=msg;var el=f.elements[id];if(el)el.setAttribute('aria-invalid',msg?'true':'false');return !msg;}
function validate(){var ok=true,n=f.name.value.trim(),e=f.email.value.trim(),m=f.message.value.trim();
ok=err('name',n.length<2?'Please enter your name.':'')&&ok;
ok=err('email',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)?'':'Please enter a valid email address.')&&ok;
ok=err('message',m.length<10?'Please tell us a little more (at least 10 characters).':'')&&ok;
ok=err('consent',f.consent.checked?'':'Please confirm your consent to continue.')&&ok;return ok;}
f.addEventListener('submit',function(ev){ev.preventDefault();st.className='status';if(!validate()){var b=f.querySelector('[aria-invalid=true]');if(b)b.focus();return;}
if(f.website.value){show('ok','Thanks — your message has been sent.');f.reset();return;}
var d={name:f.name.value.trim(),email:f.email.value.trim(),company:f.company.value.trim(),service:f.service.value,message:f.message.value.trim(),website:f.website.value,elapsed:Date.now()-t0};
btn.disabled=true;btn.textContent='Sending…';
var ctl=new AbortController(),to=setTimeout(function(){ctl.abort();},12000);
fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d),signal:ctl.signal,credentials:'omit'})
.then(function(r){if(!r.ok)throw new Error('http '+r.status);show('ok','Thanks — your message has been sent. We will get back to you at '+d.email+'.');f.reset();})
.catch(function(){var body=(d.message+'\n\n— '+d.name+(d.company?', '+d.company:'')).slice(0,1500);
show('bad','We could not send this automatically. Please send it by email instead:',{href:'mailto:contact@develox.in?subject='+encodeURIComponent('Website enquiry: '+d.service)+'&body='+encodeURIComponent(body),label:'Open my email app'});})
.finally(function(){clearTimeout(to);btn.disabled=false;btn.textContent='Send message';});});
})();