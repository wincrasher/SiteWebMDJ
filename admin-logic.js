const defaults = {
  // Keep ONLY minimal defaults - all real data should come from database
  heroBanner: [],
  heroBannerDuration: 5,
  news: [],
  activitesRegulières: [],
  programmation: { facebookLink: '', calendarImage: '' },
  ressources: [],
  events: [],
  team: [],
  partners: [],
  photoYears: [],
  temoignages: [],
  ourStory: [],
  theme: 'aucun'
};

// In-memory data cache for public pages (loaded from API)
const publicDataCache = {};

// Load all data from API once at page startup
async function initializeDataFromAPI() {
  console.log('📡 Loading data from API...');
  const API_URL = window.location.origin + '/api';
  
  // List of sections to load
  const sections = ['heroBanner', 'activitesRegulières', 'programmation', 'ressources', 'team', 'partners', 'photoYears', 'temoignages', 'ourStory', 'theme', 'news', 'events'];
  
  for (const section of sections) {
    try {
      const response = await fetch(`${API_URL}/${section}`);
      if (response.ok) {
        let data = await response.json();
        
        // Special handling for non-array sections
        if (section === 'programmation') {
          publicDataCache[section] = data || { facebookLink: '', calendarImage: '' };
          console.log(`✅ Loaded ${section} (object)`);
        } else if (section === 'theme') {
          publicDataCache[section] = data || 'aucun';
          console.log(`✅ Loaded ${section} (string)`);
        } else {
          // Regular array sections
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            console.warn(`⚠️ ${section} returned object instead of array`);
            data = [];
          }
          publicDataCache[section] = Array.isArray(data) ? data : (data || []);
          if (section === 'photoYears') {
            console.log(`✅ Loaded photoYears: ${Array.isArray(publicDataCache[section]) ? publicDataCache[section].length : 0} years`);
            publicDataCache[section].forEach(year => {
              console.log(`   - ${year.year}: ${year.events ? year.events.length : 0} events, cover: ${year.cover}`);
            });
          } else {
            console.log(`✅ Loaded ${section} (${Array.isArray(publicDataCache[section]) ? publicDataCache[section].length : 'empty'})`);
          }
        }
      } else {
        console.warn(`⚠️ Failed to load ${section} (status ${response.status}), using defaults`);
        if (section === 'photoYears') {
          console.warn(`  📷 photoYears defaults: ${defaults[section] ? defaults[section].length : 0} years`);
        }
        publicDataCache[section] = section === 'programmation' ? { facebookLink: '', calendarImage: '' } : (section === 'theme' ? 'aucun' : (defaults[section] || []));
      }
    } catch (err) {
      console.error(`❌ Failed to fetch ${section}:`, err.message);
      if (section === 'photoYears') {
        console.error(`  📷 photoYears fetch error, will use defaults (${defaults[section] ? defaults[section].length : 0} years)`);
      }
      publicDataCache[section] = section === 'programmation' ? { facebookLink: '', calendarImage: '' } : (section === 'theme' ? 'aucun' : (defaults[section] || []));
    }
  }
  
  // Load settings
  try {
    const response = await fetch(`${API_URL}/heroBannerDuration`);
    if (response.ok) {
      publicDataCache.heroBannerDuration = await response.json();
    }
  } catch (err) {
    publicDataCache.heroBannerDuration = 5;
  }
  
  console.log('✅ API initialization complete');
  console.log('📊 Public cache:', publicDataCache);
}

function getData(key) {
  const value = publicDataCache[key];
  
  // If loaded, return from cache
  if (value !== undefined) {
    return value;
  }
  
  // Fallback to defaults  
  return defaults[key] || (key === 'programmation' ? { facebookLink: '', calendarImage: '' } : (key === 'theme' ? 'aucun' : []));
}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

const themeEmojis={
  aucun:[],
  halloween:['🎃','👻','🦇'],
  noel:['🎄','❄️','🎅'],
  paque:['🐰','🥚','🌷'],
  'st-valentin':['❤️','💕','💐'],
  'saint-jean-baptiste':['🔥','📻','🎆'],
  'fete-du-canada':['🇨🇦','🍁','🎆'],
  hiver:['❄️','⛄','🧊'],
  ete:['☀️','🌞','🌊'],
  printemps:['🌱','🌸','🌼'],
  automne:['🍂','🍁','🎃']
};

function getThemeDecorations(){
  const theme=getData('theme')||'aucun';
  const emojis=themeEmojis[theme]||[];
  if(!emojis.length)return '';
  return emojis.map(e=>`<span style="font-size:24px;margin:0 4px;display:inline-block;animation:float 3s ease-in-out infinite">${e}</span>`).join('');
}

function displayThemeDecorations(){
  const heroSection=document.querySelector('.hero');
  if(!heroSection)return;
  if(heroSection.querySelector('.theme-decorations'))return; // Éviter les doublons
  
  const decorations=getThemeDecorations();
  if(!decorations)return;
  
  const container=document.createElement('div');
  container.className='theme-decorations';
  container.style.cssText='text-align:center;padding:12px 0;font-size:0;letter-spacing:2px';
  container.innerHTML=decorations;
  heroSection.appendChild(container);
}

function getThemeIcons(theme){
  const themes={
    aucun:{activites:'🎯',equipe:'👥',apropos:'✨',ressources:'🆘',team:'👥',partenaires:'🤝',photos:'📸'},
    halloween:{activites:'🎃',equipe:'👻',apropos:'🦇',ressources:'🦇',team:'👻',partenaires:'🧛',photos:'🧟'},
    noel:{activites:'🎄',equipe:'🎅',apropos:'⛄',ressources:'🎁',team:'🎅',partenaires:'🤶',photos:'❄️'},
    paque:{activites:'🐰',equipe:'🐣',apropos:'🌷',ressources:'🥚',team:'🐣',partenaires:'🐰',photos:'🌱'},
    'st-valentin':{activites:'💕',equipe:'❤️',apropos:'💑',ressources:'💌',team:'❤️',partenaires:'💖',photos:'🌹'},
    'saint-jean-baptiste':{activites:'🔥',equipe:'📻',apropos:'🎆',ressources:'🎉',team:'📻',partenaires:'🎊',photos:'🎇'},
    'fete-du-canada':{activites:'🇨🇦',equipe:'🍁',apropos:'🎆',ressources:'🍁',team:'🍁',partenaires:'🇨🇦',photos:'🎆'},
    hiver:{activites:'⛸️',equipe:'☃️',apropos:'🧊',ressources:'🎿',team:'☃️',partenaires:'🏂',photos:'❄️'},
    ete:{activites:'🏖️',equipe:'☀️',apropos:'🌞',ressources:'🏄',team:'☀️',partenaires:'🌊',photos:'🌴'},
    printemps:{activites:'🌸',equipe:'🦋',apropos:'🌼',ressources:'🐝',team:'🦋',partenaires:'🌻',photos:'🌷'},
    automne:{activites:'🍂',equipe:'🦃',apropos:'🎃',ressources:'🌰',team:'🦃',partenaires:'🍁',photos:'🍄'}
  };
  return themes[theme]||themes.aucun;
}

function applyThemeIcons(theme){
  const icons=getThemeIcons(theme);
  
  // Change icons in h3 headings for main sections
  document.querySelectorAll('h3').forEach(h3=>{
    const text=h3.textContent.trim();
    if(text.includes('Activités')){
      h3.textContent=icons.activites+' Activités';
    }else if(text.includes('L\'Équipe') || text.includes('Équipe')){
      h3.textContent=icons.equipe+' L\'Équipe';
    }else if(text.includes('propos')){
      h3.textContent=icons.apropos+' À propos';
    }else if(text.includes('Ressources')){
      h3.textContent=icons.ressources+' Ressources';
    }else if(text.includes('Partenaires')){
      h3.textContent=icons.partenaires+' Partenaires';
    }else if(text.includes('Photos')){
      h3.textContent=icons.photos+' Photos';
    }
  });
  
  // Change icons in button data-k attributes (admin menu)
  document.querySelectorAll('[data-k]').forEach(btn=>{
    if(btn.dataset.k==='programmation'){
      btn.innerHTML='📅 Programmation mensuelle';
    }
  });
}

function getThemeColors(theme){
  const colors={
    aucun:{primary:'#143a8f',secondary:'#ff6b35',accent:'#ffd23f',background:'#f0f4ff',surface:'#e8ecff'},
    halloween:{primary:'#1a1a1a',secondary:'#ff8c00',accent:'#ffd700',background:'#fff5f0',surface:'#ffe8de'},
    noel:{primary:'#165b33',secondary:'#c41e3a',accent:'#ffd700',background:'#f0fdf4',surface:'#dffce8'},
    paque:{primary:'#ff69b4',secondary:'#87ceeb',accent:'#ffb6c1',background:'#fef1f8',surface:'#fedeef'},
    'st-valentin':{primary:'#c41e3a',secondary:'#ff69b4',accent:'#ffe4e1',background:'#fef2f2',surface:'#fde4e4'},
    'saint-jean-baptiste':{primary:'#1e3a8a',secondary:'#dc2626',accent:'#fbbf24',background:'#f0f7ff',surface:'#e0eeff'},
    'fete-du-canada':{primary:'#c41e3a',secondary:'#ffffff',accent:'#ff0000',background:'#fef2f2',surface:'#fde4e4'},
    hiver:{primary:'#0ea5e9',secondary:'#e0f2fe',accent:'#64748b',background:'#f0f9ff',surface:'#e0f7ff'},
    ete:{primary:'#f59e0b',secondary:'#fef3c7',accent:'#ec4899',background:'#fffbf0',surface:'#ffe8cc'},
    printemps:{primary:'#16a34a',secondary:'#dcfce7',accent:'#f97316',background:'#f7fce4',surface:'#eef9d0'},
    automne:{primary:'#ea580c',secondary:'#fed7aa',accent:'#b45309',background:'#fef5f0',surface:'#fde3d0'}
  };
  return colors[theme]||colors.aucun;
}

function applyThemeColors(){
  const theme=getData('theme')||'aucun';
  const colors=getThemeColors(theme);
  
  const root=document.documentElement;
  root.style.setProperty('--theme-primary',colors.primary);
  root.style.setProperty('--theme-secondary',colors.secondary);
  root.style.setProperty('--theme-accent',colors.accent);
  root.style.setProperty('--theme-background',colors.background);
  root.style.setProperty('--surface',colors.surface);
  document.body.style.background=colors.background;
  applyThemeIcons(theme);
}

function renderNews(){
  const el=document.querySelector('#news-grid');
  if(!el)return;
  el.innerHTML=getData('news').sort((a,b)=>b.date.localeCompare(a.date)).map(n=>`
    <article class="card news-card">
      <span class="badge">Nouvelle</span>
      <h3>${esc(n.title)}</h3>
      <div class="news-meta">${new Date(n.date+'T12:00').toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'})}</div>
      <p>${esc(n.text)}</p>
    </article>
  `).join('')
}

function openImageModal(src){
  const modal=document.createElement('div');
  modal.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;cursor:pointer';
  modal.innerHTML=`<div style="max-width:90vw;max-height:90vh;position:relative" onclick="event.stopPropagation()"><img src="${src}" alt="Calendrier" style="width:100%;height:100%;object-fit:contain;border-radius:12px"><div style="position:absolute;top:16px;right:16px;width:32px;height:32px;background:white;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:bold;color:black" onclick="this.parentElement.parentElement.remove()">✕</div></div>`;
  modal.onclick=()=>modal.remove();
  document.body.appendChild(modal);
}

function renderEvents(){
  const el=document.querySelector('#program-grid');
  if(!el)return;
  
  const activites=getData('activitesRegulières')||[];
  const prog=getData('programmation')||{};
  
  let html=`
    <div style="grid-column:1/-1">
      <h2 style="color:#0c255f;margin:0 0 24px;font-size:24px">🎯 Activités régulières</h2>
      <div class="grid grid-2" style="gap:16px">
        ${activites.map(a=>`
          <div class="card" style="padding:20px">
            <h3 style="margin:0 0 8px;color:#143a8f">${esc(a.name)}</h3>
            <p style="margin:0;color:#657089;line-height:1.5">${esc(a.desc)}</p>
          </div>
        `).join('')||'<p style="color:#657089">Aucune activité régulière.</p>'}
      </div>
    </div>
    
    <div style="grid-column:1/-1;margin-top:40px;border-top:2px solid #e5e7eb;padding-top:40px">
      <h2 style="color:#0c255f;margin:0 0 24px;font-size:24px">📅 Programmation mensuelle</h2>
      <div style="text-align:center">
        ${prog.calendarImage?`<div style="margin-bottom:24px"><img src="${prog.calendarImage}" alt="Calendrier" style="max-width:100%;max-height:500px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" onclick="openImageModal('${prog.calendarImage}')"></div>`:''}
${prog.facebookLink?`<a href="${prog.facebookLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:8px">📘 Suivre sur Facebook</a>`:''}
        ${!prog.calendarImage && !prog.facebookLink?`<p style="color:#657089;padding:40px;font-size:18px">Calendrier à venir...</p>`:''}
      </div>
    </div>
  `;
  el.innerHTML=html;
}

function renderRessources(){
  const el=document.querySelector('#ressources-grid');
  if(!el)return;
  const ressources=getData('ressources')||[];
  el.innerHTML=ressources.length?`<div class="grid grid-2" style="gap:24px">${ressources.map(r=>`
    <div class="card" style="padding:24px;display:flex;flex-direction:column;gap:12px">
      ${r.logo?`<img src="${r.logo}" alt="${esc(r.name)}" style="height:60px;object-fit:contain;margin-bottom:8px">`:'<div style="height:60px;display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:8px">🆘</div>'}
      <h3 style="margin:0;color:#143a8f;font-size:18px">${esc(r.name)}</h3>
      <div style="color:#657089;font-size:14px">
        <div style="margin-bottom:8px"><strong>☎</strong> ${esc(r.phone)}</div>
        ${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:none;word-break:break-all">${esc(r.url)}</a>`:''}
      </div>
      ${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="font-size:13px;padding:8px 12px;margin-top:auto">Visiter le site</a>`:''}
    </div>
  `).join('')}</div>`:`<p style="text-align:center;color:#657089;padding:40px">Aucune ressource disponible pour le moment.</p>`
}

function renderTeam(){
  const el=document.querySelector('#team-grid');
  if(!el)return;
  const fallback=['assets/equipe.jpeg','assets/mission.jpeg','assets/activites.jpeg'];
  const teamData=getData('team');
  
  // Ordre des rôles pour l'Équipe
  const teamRoleOrder=['Coordonnateur','Intervenante','Intervenant'];
  
  // Ordre des rôles pour le Conseil d'administration
  const adminRoleOrder=['Président','Présidente','Vice-Président','Vice-Présidente','Secrétaire','Trésorier','Trésorière','Administrateur (Membre adulte)','Administratrice (Membre adulte)','Administrateur (Membre jeunesse)','Administratrice (Membre jeunesse)'];
  
  const sections={
    'Équipe': teamData.filter(m=>m.section==='Équipe').sort((a,b)=>{
      const roleA=teamRoleOrder.indexOf(a.role);
      const roleB=teamRoleOrder.indexOf(b.role);
      if(roleA!==roleB) return roleA-roleB;
      return a.name.localeCompare(b.name,'fr');
    }),
    'Conseil d\'administration': teamData.filter(m=>m.section==='Conseil d\'administration').sort((a,b)=>{
      const roleA=adminRoleOrder.indexOf(a.role);
      const roleB=adminRoleOrder.indexOf(b.role);
      if(roleA!==roleB) return roleA-roleB;
      return a.name.localeCompare(b.name,'fr');
    })
  };
  
  let html='';
  Object.entries(sections).forEach(([section,members])=>{
    if(members.length>0){
      html+=`<h3 style="grid-column:1/-1;color:#0c255f;margin-top:24px;margin-bottom:0;padding-top:16px;border-top:2px solid #d4d4d4">${section}</h3>`;
      html+=members.map((m,i)=>`
        <article class="card team-card">
          <img class="team-avatar" src="${m.photo||fallback[i%fallback.length]}" alt="Photo de ${esc(m.name)}">
          <h3>${esc(m.name)}</h3>
          <div class="team-role">${esc(m.role)}</div>
          <ul class="team-facts">${(m.facts||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
        </article>
      `).join('');
    }
  });
  
  el.innerHTML=html;
}

function renderPartners(){
  const el=document.querySelector('#partners-list');
  if(!el)return;
  el.innerHTML=getData('partners').map(p=>`
    <div class="partner" style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center">
      ${p.logo?`<img src="${p.logo}" alt="${esc(p.name)}" style="height:80px;object-fit:contain">`:`<div style="height:80px;display:flex;align-items:center;justify-content:center;font-size:40px">🤝</div>`}
      <div>
        <strong style="display:block;color:#13213a">${esc(p.name)}</strong>
        <small style="display:block;color:#7d8799">${esc(p.type)}</small>
      </div>
    </div>
  `).join('')
}

function renderOurStory(){
  const el=document.querySelector('.timeline');
  if(!el)return;
  const story=getData('ourStory')||[];
  el.innerHTML=story.map(s=>`
    <div class="timeline-item">
      <strong>${esc(s.date)}</strong><br>
      ${esc(s.description)}
    </div>
  `).join('')
}

function renderPhotos(){
  const el=document.querySelector('#gallery');
  if(!el)return;
  const years=getData('photoYears').sort((a,b)=>b.year-a.year);
  el.innerHTML=years.map(y=>`
    <figure style="cursor:pointer" onclick="location.href='photos-annee.html?year=${y.year}'">
      <img src="${y.cover}" alt="Photos ${y.year}">
      <figcaption>📁 ${y.year} (${ (y.events||[]).length} événement${(y.events||[]).length!==1?'s':''})</figcaption>
    </figure>
  `).join('')
}

function renderPhotosByYear(){
  const params=new URLSearchParams(window.location.search);
  const year=parseInt(params.get('year'));
  const years=getData('photoYears');
  const yearData=years.find(y=>y.year===year);
  
  if(!yearData){
    document.querySelector('main').innerHTML='<div class="container" style="padding:60px 0">Année non trouvée</div>';
    return;
  }
  
  const el=document.querySelector('#events-grid');
  if(!el)return;
  
  const sortedEvents=[...(yearData.events||[])].sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
  
  el.innerHTML=sortedEvents.map(e=>`
    <div class="card" style="cursor:pointer;text-align:center;display:flex;flex-direction:column" onclick="location.href='photos-evenement.html?year=${year}&event=${e.id}'">
      <h3>${esc(e.name)}</h3>
      ${e.date?`<small style="color:#143a8f;font-weight:600;display:block;margin-bottom:8px">${new Date(e.date+'T12:00').toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'})}</small>`:''}
      ${e.description?`<p style="color:#657089;font-size:14px;flex:1">${esc(e.description)}</p>`:''}
      <p>${e.photos.length} photo${e.photos.length!==1?'s':''}</p>
      <div style="height:200px;background:#eef3fb;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:12px 0">
        <img src="${e.photos[0]?.src || 'assets/mission.jpeg'}" alt="${esc(e.name)}" style="max-height:100%;max-width:100%;object-fit:cover;border-radius:8px">
      </div>
      <a class="btn btn-outline" style="width:100%;justify-content:center;margin-top:auto">Voir les photos →</a>
    </div>
  `).join('')
}

function renderPhotosByEvent(){
  const params=new URLSearchParams(window.location.search);
  const year=parseInt(params.get('year'));
  const eventId=parseInt(params.get('event'));
  
  const years=getData('photoYears');
  const yearData=years.find(y=>y.year===year);
  if(!yearData){
    document.querySelector('main').innerHTML='<div class="container" style="padding:60px 0">Année non trouvée</div>';
    return;
  }
  
  const eventData=yearData.events.find(e=>e.id===eventId);
  if(!eventData){
    document.querySelector('main').innerHTML='<div class="container" style="padding:60px 0">Événement non trouvé</div>';
    return;
  }
  
  const titleEl=document.querySelector('#event-title');
  if(titleEl)titleEl.textContent=eventData.name;
  
  const dateEl=document.querySelector('#event-date');
  if(dateEl){
    if(eventData.date){
      dateEl.textContent=new Date(eventData.date+'T12:00').toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'});
      dateEl.style.display='block';
    }else{
      dateEl.style.display='none';
    }
  }
  
  const descEl=document.querySelector('#event-description');
  if(descEl){
    descEl.textContent=eventData.description||'';
    descEl.style.display=eventData.description?'block':'none';
  }
  
  const el=document.querySelector('#photos-gallery');
  if(!el)return;
  
  el.innerHTML=eventData.photos.map(p=>`
    <figure>
      <img src="${p.src}" alt="${esc(p.caption)}">
      <figcaption>${esc(p.caption)}</figcaption>
    </figure>
  `).join('')
}

function handleContactForm(event){
  event.preventDefault();
  const name=document.querySelector('#contactName').value;
  const email=document.querySelector('#contactEmail').value;
  const msg=document.querySelector('#contactMsg').value;
  const statusEl=document.querySelector('#contactStatus');
  
  // Validation simple
  if(!name.trim() || !email.trim() || !msg.trim()){
    statusEl.textContent='❌ Veuillez remplir tous les champs.';
    statusEl.style.color='#a31515';
    return;
  }
  
  // Pour la démo, afficher un message de succès
  // En production, envoyer les données à un serveur
  console.log({name,email,msg});
  statusEl.textContent='✅ Merci! Ton message a été reçu. Nous te répondrons bientôt.';
  statusEl.style.color='#2d6a4f';
  
  // Réinitialiser le formulaire après 2 secondes
  setTimeout(()=>{
    document.querySelector('#contactName').value='';
    document.querySelector('#contactEmail').value='';
    document.querySelector('#contactMsg').value='';
    statusEl.textContent='';
  },2000);
}

function setupNav(){
  const t=document.querySelector('.mobile-toggle');
  const n=document.querySelector('.navlinks');
  if(t)t.onclick=()=>n.classList.toggle('open');
  document.querySelectorAll('.navlinks a').forEach(a=>
    a.addEventListener('click',()=>n&&n.classList.remove('open'))
  );
  const year=document.querySelector('#year');
  if(year)year.textContent=new Date().getFullYear();
}

function displayRandomTestimonial(){
  const container=document.getElementById('sticky-container');
  if(!container)return;
  const temoignages=getData('temoignages');
  if(temoignages.length===0)return;
  const random=temoignages[Math.floor(Math.random()*temoignages.length)];
  container.innerHTML=`<div class="sticky-note"><p>${esc(random.message)}</p><div class="author">${random.author?'— '+esc(random.author):''}</div></div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌐 Page loaded, initializing data...');
  
  // Load all data from API first
  await initializeDataFromAPI();
  
  // Then render all sections
  try {
    renderNews();
    renderEvents();
    renderTeam();
    renderPartners();
    renderPhotos();
    renderOurStory();
    displayThemeDecorations();
    applyThemeIcons(getData('theme'));
    displayRandomTestimonial();
    setupNav();
    console.log('✅ Page render complete');
  } catch (err) {
    console.error('❌ Error rendering page:', err);
  }
});
