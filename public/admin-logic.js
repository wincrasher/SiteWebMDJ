const defaults = {
  heroBanner:[
    {id:1,src:'assets/mission.jpeg',caption:'Un espace à toi.'}
  ],
  heroBannerDuration:5,
  news:[
    {id:1,title:"Bienvenue sur le nouveau site du Squat!",date:"2026-09-09",text:"Un nouvel espace pour suivre nos activités, notre programmation et les nouvelles de la Maison des jeunes."},
    {id:2,title:"Programmation d'automne",date:"2026-09-01",text:"Surveille le calendrier : soirées thématiques, jeux, sports, ateliers et sorties seront ajoutés tout au long de la saison."}
  ],
  activitesRegulières:[
    {id:1,name:"Bouffe",desc:"Venez partager des moments conviviaux autour de collations et repas."},
    {id:2,name:"Table de jeu",desc:"Pool, air hockey, ping pong et autres jeux de table. Un classique du Squat!"},
    {id:3,name:"Salle de musique",desc:"Instruments, répétitions et passion musicale dans un espace dédié."},
    {id:4,name:"Coin calme",desc:"Un espace zen pour te détendre, lire ou méditer en toute tranquillité."},
    {id:5,name:"Coin art",desc:"Peinture, dessin, sculpture et création libre. Laisse ton imagination s'exprimer!"},
    {id:6,name:"Coin jeu vidéo",desc:"Consoles, PC gaming et jeux variés pour les amateurs de gaming."},
    {id:7,name:"Jeu de société",desc:"Stratégie, coopération, fun - des jeux pour tous les goûts!"},
    {id:8,name:"Aide aux devoirs",desc:"Les intervenants t'aident avec tes devoirs et tes études."}
  ],
  programmation:{
    facebookLink:"https://www.facebook.com/Maison.Des.Ados11.17",
    calendarImage:"assets/mission.jpeg"
  },
  ressources:[
    {id:1,name:"Jeunesse J'écoute",phone:"1 800 668-6868",url:"http://jeunessejecoute.ca",logo:"https://jeunessejecoute.ca/wp-content/uploads/sites/2/JJE_DEPUIS1989_FR_Colour-Pairings-pink-alpine.png"},
    {id:2,name:"Tel-Aide",phone:"514 935-1105",url:"http://telaide.org",logo:""},
    {id:3,name:"S.O.S grossesse",phone:"1 877 662-9666",url:"http://sosgrossesse.ca",logo:"https://sosgrossesse.ca/wp-content/uploads/logo-woo.png"},
    {id:4,name:"Drogue : aide et référence",phone:"514 527-2626 ou 1 800 265-2626",url:"http://drogue-aidereference.qc.ca",logo:""},
    {id:5,name:"Interligne",phone:"1 888 505-1010",url:"http://interligne.co",logo:""},
    {id:6,name:"LigneParents",phone:"1 800 361-5085",url:"http://ligneparents.com",logo:""},
    {id:7,name:"S.O.S Suicide Jeunesse",phone:"1 800 595-5580",url:"http://sos-suicide.org",logo:""}
  ],
  events:[
    {id:1,title:"Soirée jeux & arcade",date:"2026-09-11",time:"17 h à 21 h",desc:"Jeux de société, jeux vidéo et arcade entre amis."},
    {id:2,title:"Atelier créatif",date:"2026-09-15",time:"18 h à 20 h",desc:"Peinture, dessin et création libre."},
    {id:3,title:"Vendredi cinéma",date:"2026-09-18",time:"19 h",desc:"Film choisi par les jeunes et collations sur place."}
  ],
  team:[
    {id:1,name:"Jérémy",gender:"Homme",role:"Coordonnateur",section:"Équipe",photo:"",facts:["Sa couleur préférée est le rose","Il sait faire un trèfle avec sa langue","Il aime jouer aux jeux vidéo"]},
    {id:2,name:"Ellie",gender:"Femme",role:"Intervenante",section:"Équipe",photo:"",facts:["Sa couleur préférée est le vert","Elle joue du saxophone","Elle aime la randonnée"]},
    {id:3,name:"Naomy",gender:"Femme",role:"Intervenante",section:"Équipe",photo:"",facts:["Sa couleur préférée est le bleu","Son animal préféré est le phoque","Elle aime faire du kayak et de l'escalade"]},
    {id:4,name:"Marie Contourex",gender:"Femme",role:"Présidente",section:"Conseil d'administration",photo:"",facts:["Directrice générale","Engagement communautaire"]},
    {id:5,name:"Jean Tremblay",gender:"Homme",role:"Trésorier",section:"Conseil d'administration",photo:"",facts:["Expert financier","Gestion budgétaire"]}
  ],
  partners:[
    {id:1,name:"Municipalité de Saint-Liguori",type:"Partenaire",logo:""},
    {id:2,name:"Partenaire communautaire",type:"Partenaire",logo:""},
    {id:3,name:"Commanditaire local",type:"Commanditaire",logo:""}
  ],
  photoYears:[
    {id:2026,year:2026,cover:"assets/mission.jpeg",events:[
      {id:1,name:"Basketball Championship",date:"2026-09-20",description:"",photos:[
        {id:1,src:"assets/mission.jpeg",caption:"Moment du match"},
        {id:2,src:"assets/activites.jpeg",caption:"Les jeunes en action"}
      ]},
      {id:2,name:"Atelier Créatif",date:"2026-09-15",description:"",photos:[
        {id:3,src:"assets/participation.jpeg",caption:"Création en cours"},
        {id:4,src:"assets/equipe.jpeg",caption:"Présentation des œuvres"}
      ]}
    ]},
    {id:2025,year:2025,cover:"assets/activites.jpeg",events:[]}
  ],
  temoignages:[
    {id:1,message:"Le Squat c'est comme une deuxième famille. J'y viens pour me détendre et être moi-même.",author:"Mégane"},
    {id:2,message:"J'ai trouvé des amis ici et les intervenants vraiment à l'écoute. C'est cool!",author:"Xavier"},
    {id:3,message:"C'est un espace où on peut faire plein d'activités différentes. Je ne m'ennuie jamais!",author:"Jasmine"},
    {id:4,message:"Merci au Squat d'avoir créé ce lieu magique pour nous.",author:""},
    {id:5,message:"Les jeudi soir c'est ma journée préférée de la semaine! On passe du bon temps ensemble.",author:"Félix"}
  ],
  ourStory:[
    {id:1,date:"2016",description:"La mairesse Ghislaine Pomerleau contacte des citoyens afin de discuter d'un projet de Maison des jeunes. La municipalité offre un local gratuitement."},
    {id:2,date:"1er décembre 2017",description:"Assemblée de fondation de la Maison des jeunes."},
    {id:3,date:"2019–2020",description:"Reconnaissance comme organisme communautaire, puis obtention d'un financement récurrent à la mission."},
    {id:4,date:"12 juin 2024",description:"Signature du bail pour le nouveau local à l'ancienne caserne, avec l'accompagnement de la municipalité."},
    {id:5,date:"16 février 2026",description:"Emménagement dans le nouveau local après les travaux réalisés à l'hiver 2024–2025."}
  ],
  theme:'aucun'
};

function getData(key){const d=localStorage.getItem('squat_'+key);return d?JSON.parse(d):defaults[key]}
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
      <figcaption>📁 ${y.year} (${y.events.length} événement${y.events.length!==1?'s':''})</figcaption>
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

document.addEventListener('DOMContentLoaded',()=>{
  renderNews();
  renderEvents();
  renderTeam();
  renderPartners();
  renderPhotos();
  setupNav();
});
