const K=['heroBanner','activitesRegulières','programmation','ressources','team','partners','photoYears','temoignages','ourStory','theme'];
const D={
  heroBanner:{label:'Page d\'accueil',fields:[['caption','Légende','text']]},
  activitesRegulières:{label:'Activités régulières',fields:[['name','Nom activité','text'],['desc','Description','textarea']]},
  programmation:{label:'Programmation mensuelle',fields:[['facebookLink','Lien Facebook','text'],['calendarImage','Image calendrier','image']]},
  ressources:{label:'Ressources d\'aide',fields:[['name','Nom organisme','text'],['phone','Numéro téléphone','text'],['url','Site web','text'],['logo','Logo','image']]},
  team:{label:'Équipe',fields:[['name','Nom','text'],['gender','Genre','select'],['role','Rôle','text'],['section','Section','select'],['facts','Infos (une par ligne)','textarea']]},
  partners:{label:'Partenaires',fields:[['name','Nom','text'],['type','Type','select'],['logo','Logo','image']]},
  photoYears:{label:'Photos',fields:[['year','Année','number']]},
  temoignages:{label:'Témoignages',fields:[['message','Message','textarea'],['author','Auteur (optionnel)','text']]},
  ourStory:{label:'Notre histoire',fields:[['date','Date','text'],['description','Description','textarea']]},
  theme:{label:'Thème du site',fields:[]}
};

const API_URL = window.location.origin + '/api';

// In-memory cache - loaded once at startup
let dataCache = {};

// Load all data from database once at startup
async function initializeFromDatabase() {
  console.log('📡 Loading all data from database...');
  for (const section of K) {
    try {
      const response = await fetch(`${API_URL}/${section}`);
      if (response.ok) {
        let data = await response.json();
        
        // Special handling for non-array sections
        if (section === 'programmation' || section === 'theme') {
          // These are objects, keep as-is
          dataCache[section] = data || (section === 'theme' ? 'aucun' : { facebookLink: '', calendarImage: '' });
          console.log(`✅ Loaded ${section} (object)`);
        } else if (section === 'heroBannerDuration') {
          dataCache[section] = data || 5;
          console.log(`✅ Loaded ${section} (setting)`);
        } else {
          // Regular array sections
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            console.warn(`⚠️ ${section} returned object instead of array, converting...`);
            data = [];
          }
          dataCache[section] = data || [];
          console.log(`✅ Loaded ${section} (${Array.isArray(data) ? data.length : 'empty'})`);
        }
      } else {
        console.warn(`⚠️ Failed to load ${section}: HTTP ${response.status}`);
        dataCache[section] = section === 'theme' ? 'aucun' : (section === 'programmation' ? { facebookLink: '', calendarImage: '' } : []);
      }
    } catch (err) {
      console.warn(`Failed to load ${section}:`, err.message);
      dataCache[section] = section === 'theme' ? 'aucun' : (section === 'programmation' ? { facebookLink: '', calendarImage: '' } : []);
    }
  }
  
  // Load settings
  try {
    const response = await fetch(`${API_URL}/heroBannerDuration`);
    if (response.ok) {
      dataCache.heroBannerDuration = await response.json();
    }
  } catch (err) {
    dataCache.heroBannerDuration = 5;
  }
  
  // Load theme
  try {
    const response = await fetch(`${API_URL}/theme`);
    if (response.ok) {
      dataCache.theme = await response.json();
    }
  } catch (err) {
    dataCache.theme = 'aucun';
  }
  
  console.log('✅ Database initialization complete');
  console.log('📊 Cache state:', dataCache);
}

// Get data from memory cache
function load(k) {
  const value = dataCache[k];
  
  // If not loaded yet, return safe default based on section type
  if (value === undefined) {
    if (k === 'theme') return 'aucun';
    if (k === 'heroBannerDuration') return 5;
    if (k === 'programmation') return { facebookLink: '', calendarImage: '' };
    return []; // Most sections are arrays
  }
  
  // Return the cached data
  return value;
}

// Save data to database AND update cache
async function save(k, v) {
  try {
    // Update in-memory cache immediately
    dataCache[k] = v;
    console.log(`💾 Saving ${k} to database...`, v);
    
    // Send to database (wait for response)
    const response = await fetch(`${API_URL}/${k}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    
    if (response.ok) {
      console.log(`✅ ${k} successfully saved to database`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Database save failed for ${k}: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Error saving ${k}:`, err.message);
    return false;
  }
}

function e(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function logged(){return sessionStorage.getItem('squat_admin')==='1'}
function saveDurationSetting(value){
  const duration=Math.max(2,Math.min(20,parseInt(value)||5));
  save('heroBannerDuration',duration);
}

function getDataUrlSize(dataUrl){
  if(!dataUrl||!dataUrl.startsWith('data:'))return 0;
  const base64=dataUrl.split(',')[1];
  if(!base64)return 0;
  return Math.round(base64.length*3/4);
}

function formatBytes(bytes){
  if(bytes===0)return '0 B';
  const k=1024;
  const sizes=['B','KB','MB','GB'];
  const i=Math.floor(Math.log(bytes)/Math.log(k));
  return parseFloat((bytes/Math.pow(k,i)).toFixed(2))+' '+sizes[i];
}

function getEventTotalSize(event){
  return (event.photos||[]).reduce((sum,p)=>sum+getDataUrlSize(p.src),0);
}

function getYearTotalSize(year){
  let total=getDataUrlSize(year.cover);
  (year.events||[]).forEach(e=>{
    total+=getEventTotalSize(e);
  });
  return total;
}

function getStorageColor(bytes){
  const MB=bytes/1024/1024;
  if(MB<25)return '#10b981';
  if(MB<75)return '#f59e0b';
  return '#ef4444';
}

function resizeImage(dataUrl,maxWidth=800,maxHeight=600,quality=0.70){
  return new Promise((resolve)=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      let width=img.width;
      let height=img.height;
      
      // Calculer les nouvelles dimensions en maintenant le ratio
      if(width>height){
        if(width>maxWidth){
          height=Math.round((height*maxWidth)/width);
          width=maxWidth;
        }
      }else{
        if(height>maxHeight){
          width=Math.round((width*maxHeight)/height);
          height=maxHeight;
        }
      }
      
      canvas.width=maxWidth;
      canvas.height=maxHeight;
      const ctx=canvas.getContext('2d');
      
      // Fond blanc et centrer l'image
      ctx.fillStyle='#ffffff';
      ctx.fillRect(0,0,maxWidth,maxHeight);
      
      const x=(maxWidth-width)/2;
      const y=(maxHeight-height)/2;
      ctx.drawImage(img,x,y,width,height);
      
      const resized=canvas.toDataURL('image/jpeg',quality);
      resolve(resized);
    };
    img.src=dataUrl;
  });
}

function renderStorageBar(bytes,label='',limit=100){
  const MB=bytes/1024/1024;
  const percent=Math.min((MB/limit)*100,100);
  const color=getStorageColor(bytes);
  return `
    <div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:#0c255f">${label}</span>
        <span style="font-size:12px;color:#657089">${MB.toFixed(1)} MB</span>
      </div>
      <div style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden">
        <div style="width:${percent}%;height:100%;background:${color};transition:all 0.3s ease"></div>
      </div>
    </div>
  `;
}

// Get and display database storage stats
async function getDatabaseStats(){
  try {
    const response = await fetch(`${API_URL}/db-stats`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to get DB stats:', err.message);
  }
  return null;
}

function showDatabaseStats(){
  getDatabaseStats().then(stats => {
    if (!stats) return;
    
    const MB = parseFloat(stats.used_mb);
    const percent = parseFloat(stats.percentage_used);
    const color = percent > 75 ? '#ef4444' : (percent > 50 ? '#f59e0b' : '#10b981');
    
    const statsHTML = `
      <div style="position:fixed;bottom:20px;right:20px;background:white;border:1px solid #d4d4d4;border-radius:12px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:320px;z-index:9999">
        <h4 style="margin:0 0 12px;color:#0c255f;font-size:14px">💾 Base de données</h4>
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:12px;color:#657089">Utilisation</span>
            <strong style="font-size:12px;color:#0c255f">${MB} MB / ${stats.limit_mb} MB</strong>
          </div>
          <div style="width:100%;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden">
            <div style="width:${percent}%;height:100%;background:${color};transition:all 0.3s ease"></div>
          </div>
          <small style="color:#657089;display:block;margin-top:4px">${percent}% utilisé</small>
        </div>
        <div style="font-size:11px;color:#657089;border-top:1px solid #e8e8e8;padding-top:8px;margin-top:8px">
          <div>📊 ${stats.row_count} section(s) sauvegardée(s)</div>
        </div>
      </div>
    `;
    
    // Remove existing stats if present
    const existing = document.querySelector('[data-db-stats]');
    if (existing) existing.remove();
    
    // Add new stats
    const div = document.createElement('div');
    div.setAttribute('data-db-stats', 'true');
    div.innerHTML = statsHTML;
    document.body.appendChild(div);
  });
}

function showLogin(){document.body.innerHTML=`<div class="login-wrap"><div class="login-card"><div class="brand"><span class="brandmark"></span><span>LE SQUAT<small>Espace administrateur</small></span></div><h1>Connexion</h1><p>Accédez à l'interface d'administration pour gérer le contenu du site.</p><form id="login" class="form"><input id="user" placeholder="Utilisateur" autocomplete="username" required><input id="pass" type="password" placeholder="Mot de passe" autocomplete="current-password" required><button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:8px">Se connecter</button><div id="err" style="color:#a31515;margin-top:12px;font-weight:700"></div></form><div class="hint"><strong>Identifiants de démo :</strong> admin / squat-demo<br><em>ℹ️ Pour la production, l'authentification doit être gérée côté serveur avec un vrai système sécurisé.</em></div><a href="index.html" style="display:inline-block;margin-top:18px;color:#143a8f;font-weight:800">← Retour au site</a></div></div>`;
const form=document.querySelector('#login');
form.onsubmit=(ev)=>{ev.preventDefault();
if(document.querySelector('#user').value==='admin'&&document.querySelector('#pass').value==='squat-demo'){sessionStorage.setItem('squat_admin','1');location.reload()}
else document.querySelector('#err').textContent='❌ Identifiants invalides. Vérifiez votre saisie.'}}

function rowSummary(k,o){
  if(k==='news')return `<strong>${e(o.title)}</strong><br><small>${e(o.date)} — ${e(o.text).slice(0,100)}</small>`;
  if(k==='events')return `<strong>${e(o.title)}</strong><br><small>${e(o.date)} · ${e(o.time)} — ${e(o.desc)}</small>`;
  if(k==='team')return `<strong>${e(o.name)}</strong><br><small>${e(o.role)} (${e(o.section||'Équipe')}) — ${(o.facts||[]).map(e).join(' · ')}</small>`;
  if(k==='partners')return `<strong>${e(o.name)}</strong><br><small>${e(o.type)}${o.logo?' — Logo présent':''}</small>`;
  if(k==='photoYears')return `<strong>${o.year}</strong><br><small>${(o.events||[]).length} événement(s)</small>`;
  if(k==='temoignages')return `<strong>${e(o.message).slice(0,80)}${o.message.length>80?'...':''}</strong><br><small>${o.author?'— '+e(o.author):'(Anonyme)'}</small>`;
  if(k==='ressources')return `<strong>${e(o.name)}</strong><br><small>${e(o.phone)} — ${e(o.url)}</small>`;
  if(k==='ourStory')return `<strong>${e(o.date)}</strong><br><small>${e(o.description).slice(0,80)}${o.description.length>80?'...':''}</small>`;
  return `<strong>${e(o.caption)}</strong><br><small>${e(o.src)}</small>`
}

function renderPanel(k){
  const p=document.querySelector('#panel-'+k);
  if(!p) return;
  
  // Get data from in-memory cache (loaded at startup)
  let data = load(k);
  
  console.log(`📋 Rendering panel: ${k}, data =`, data);
  
  // Ensure data is correct type
  if (!Array.isArray(data) && k !== 'programmation' && k !== 'theme') {
    console.warn(`⚠️ renderPanel: ${k} data is not an array, fixing...`);
    data = [];
  }
  
  renderPanelContent(k, p, data);
}

function renderPanelContent(k, p, data){
  
  if(k==='activitesRegulières'){
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez les activités régulières du Squat. ${data.length} activité(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter activité</button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Activité</th>
            <th style="width:200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(o=>`<tr><td><strong>${e(o.name)}</strong><br><small>${e(o.desc)}</small></td><td><div class="action-row"><button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button><button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button></div></td></tr>`).join('')||'<tr><td colspan="2" style="color:#657089">Aucune activité. Cliquez sur « + Ajouter activité » pour commencer.</td></tr>'}
        </tbody>
      </table>
    `;
    return;
  }
  
  if(k==='programmation'){
    const prog=data||{facebookLink:'',calendarImage:''};
    console.log('🔧 Programming panel - prog data:', prog);
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez le calendrier et le lien Facebook pour la programmation.</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div style="border:1px solid #d4d4d4;border-radius:8px;padding:20px">
          <h3 style="margin:0 0 12px;color:#0c255f">📘 Lien Facebook</h3>
          <div style="display:flex;gap:8px">
            <input type="url" id="fb-link-input" placeholder="https://www.facebook.com/..." value="${e(prog.facebookLink||'')}" style="flex:1;padding:8px 12px;border:1px solid #d4d4d4;border-radius:4px;font-size:14px">
            <button class="btn btn-primary" onclick="saveProgramming({facebookLink:document.getElementById('fb-link-input').value})">💾 Enregistrer</button>  
          </div>
          <small style="color:#657089;display:block;margin-top:8px">Lien vers la page Facebook du Squat</small>
        </div>
        <div style="border:1px solid #d4d4d4;border-radius:8px;padding:20px">
          <h3 style="margin:0 0 12px;color:#0c255f">📅 Image calendrier</h3>
          <div style="gap:8px;margin-top:12px">
            ${prog.calendarImage?`
              <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:12px;background:#f0f0f0">
                <img src="${prog.calendarImage}" alt="Calendrier" style="max-width:100%;max-height:300px;width:100%;object-fit:contain;border-radius:8px;display:block">
              </div>
            `:''}
            <div style="display:flex;gap:8px">
              <button class="btn btn-outline" style="flex:1" onclick="document.getElementById('calendar-input').click()">
                ${prog.calendarImage?'✎ Remplacer':'📤 Uploader'}
              </button>
              ${prog.calendarImage?`<button class="btn btn-danger" onclick="saveProgramming({calendarImage:''})">🗑 Supprimer</button>`:''}
            </div>
            <input type="file" id="calendar-input" accept="image/*" style="display:none" onchange="handleCalendarUpload(event)">
          </div>
          <small style="color:#657089;display:block;margin-top:8px">JPG, PNG (max 2 MB)</small>
        </div>
      </div>
    `;
    return;
  }
  
  if(k==='heroBanner'){
    const duration=load('heroBannerDuration')||5;
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez les images et légende de la page d'accueil. ${data.length} image(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter image</button>
      </div>
      <div style="background:#f5f5f5;border-radius:12px;padding:20px;margin-bottom:24px">
        <h3 style="margin:0 0 16px;color:#0c255f;font-size:14px">⏱️ Paramètres</h3>
        <label style="display:flex;align-items:center;gap:16px">
          <div style="flex:1">
            <div style="font-weight:600;color:#0c255f;margin-bottom:4px">Durée d'affichage des images</div>
            <small style="color:#657089">Temps avant passage à l'image suivante</small>
          </div>
          <div style="display:flex;align-items:center;gap:12px;min-width:180px">
            <input type="range" id="duration-slider" min="2" max="20" value="${duration}" style="flex:1" onchange="saveDurationSetting(this.value)">
            <span id="duration-value" style="font-weight:700;color:#143a8f;min-width:50px;text-align:right">${duration}s</span>
          </div>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        ${data.map(o=>{
          const imgSize=getDataUrlSize(o.src);
          return `
          <div style="border:1px solid #d4d4d4;border-radius:8px;overflow:hidden;display:flex;flex-direction:column">
            <img src="${o.src}" alt="${e(o.caption)}" style="width:100%;height:150px;object-fit:cover;background:#f0f0f0">
            <div style="padding:12px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <small style="color:#0c255f;font-weight:600;display:block;word-break:break-word">${e(o.caption)}</small>
                <small style="color:#999;display:block;margin-top:4px">${formatBytes(imgSize)}</small>
              </div>
              <div class="action-row" style="margin-top:8px">
                <button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button>
                <button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button>
              </div>
            </div>
          </div>
        `;
        }).join('')||'<div style="grid-column:1/-1;color:#657089">Aucune image. Cliquez sur « + Ajouter image » pour commencer.</div>'}
      </div>
    `;
    // Setup slider event listeners
    setTimeout(()=>{
      const slider=document.getElementById('duration-slider');
      if(slider){
        slider.addEventListener('input',(e)=>{
          document.getElementById('duration-value').textContent=e.target.value+'s';
        });
      }
    },0);
    return;
  }

  if(k==='photoYears'){
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez les années et événements photo. ${data.length} année(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter année</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${data.sort((a,b)=>b.year-a.year).map(o=>{
          const yearSize=getYearTotalSize(o);
          return `
          <div style="border:1px solid #d4d4d4;border-radius:8px;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              <div style="flex:1">
                <h3 style="margin:0;color:#0c255f;font-size:18px">${o.year} <span style="font-size:12px;color:#999">ANNÉE</span></h3>
                <small style="color:#657089;display:block;margin-top:4px">${(o.events||[]).length} événement(s)</small>
                <div style="margin-top:8px">
                  ${renderStorageBar(yearSize,'Stockage année',100)}
                </div>
              </div>
              <div class="action-row">
                <button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button>
                <button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button>
              </div>
            </div>
            <div style="border-top:1px solid #e8e8e8;padding-top:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <h4 style="margin:0;color:#0c255f;font-size:14px">Événements</h4>
                <button class="btn btn-primary btn-small" onclick="openEventEditor('${k}',${o.id})">+ Ajouter</button>
              </div>
              ${(o.events||[]).length===0?'<small style="color:#999">Aucun événement</small>':`
                <div style="display:flex;flex-direction:column;gap:12px">
                  ${(o.events||[]).map(ev=>{
                    const eventSize=getEventTotalSize(ev);
                    const dateStr=ev.date?new Date(ev.date+'T12:00').toLocaleDateString('fr-CA',{year:'numeric',month:'short',day:'numeric'}):'';
                    return `
                    <div style="background:#f5f5f5;padding:12px;border-radius:4px">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                        <div style="flex:1">
                          <strong style="color:#0c255f">${e(ev.name)} <span style="font-size:11px;color:#999">ÉVÉNEMENT</span></strong>
                          <small style="display:block;color:#657089;margin-top:2px">${(ev.photos||[]).length} photo(s) ${dateStr?'· '+dateStr:''}</small>
                        </div>
                        <div class="action-row">
                          <button class="btn btn-outline btn-small" onclick="openEventEditor('${k}',${o.id},${ev.id})">✎</button>
                          <button class="btn btn-danger btn-small" onclick="delEvent('${k}',${o.id},${ev.id})">🗑</button>
                        </div>
                      </div>
                      <div style="margin-top:8px;font-size:12px">
                        ${renderStorageBar(eventSize,'Stockage événement',100)}
                      </div>
                    </div>
                  `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>
        `}).join('')||'<div style="color:#657089">Aucune année. Cliquez sur « + Ajouter année » pour commencer.</div>'}
      </div>
    `;
    return;
  }

  if(k==='temoignages'){
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez les témoignages des jeunes affichés en bas des pages. ${data.length} témoignage(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter témoignage</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${data.map(o=>{
          return `
          <div style="border:1px solid #d4d4d4;border-radius:8px;padding:16px;background:#fffef5">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              <div style="flex:1">
                <p style="margin:0;color:#13213a;line-height:1.6;font-style:italic">"${e(o.message)}"</p>
                <p style="margin:8px 0 0;color:#143a8f;font-weight:600;font-style:normal">${o.author?'— '+e(o.author):'— Anonyme'}</p>
              </div>
              <div class="action-row">
                <button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button>
                <button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button>
              </div>
            </div>
          </div>
        `}).join('')||'<div style="color:#657089">Aucun témoignage. Cliquez sur « + Ajouter témoignage » pour commencer.</div>'}
      </div>
    `;
    return;
  }

  if(k==='ourStory'){
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez la chronologie de l'histoire du Squat. ${data.length} date(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter une date</button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Contenu</th>
            <th style="width:200px">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.length>0?data.map(o=>`<tr><td><strong>${e(o.date)}</strong><br><small>${e(o.description).slice(0,100)}${o.description.length>100?'...':''}</small></td><td><div class="action-row"><button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button><button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button></div></td></tr>`).join(''):`<tr><td colspan="2" style="color:#657089">Aucune date. Cliquez sur « + Ajouter une date » pour commencer.</td></tr>`}
        </tbody>
      </table>
    `;
    return;
  }

  if(k==='theme'){
    const currentTheme=load('theme')||'aucun';
    const themes=['aucun','halloween','noel','paque','st-valentin','saint-jean-baptiste','fete-du-canada','hiver','ete','printemps','automne'];
    const themeLabels={
      aucun:'Aucun thème',
      halloween:'🎃 Halloween',
      noel:'🎄 Noël',
      paque:'🐰 Pâques',
      'st-valentin':'❤️ Saint-Valentin',
      'saint-jean-baptiste':'🔥 Saint-Jean-Baptiste',
      'fete-du-canada':'🇨🇦 Fête du Canada',
      hiver:'❄️ Hiver',
      ete:'☀️ Été',
      printemps:'🌱 Printemps',
      automne:'🍂 Automne'
    };
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Choisissez un thème pour ajouter des décorations thématiques au site.</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
        ${themes.map(t=>`
          <button type="button" onclick="saveTheme('${t}')" style="padding:16px;border:2px solid ${currentTheme===t?'#143a8f':'#d4d4d4'};background:${currentTheme===t?'#f0f4ff':'#fff'};border-radius:8px;cursor:pointer;font-weight:${currentTheme===t?'700':'500'};color:${currentTheme===t?'#143a8f':'#657089'};font-size:14px;transition:all 0.2s">
            ${themeLabels[t]}
          </button>
        `).join('')}
      </div>
      <div style="background:#f0f4ff;border-radius:12px;padding:16px;margin-top:24px;border-left:4px solid #143a8f">
        <strong style="color:#143a8f">📌 Thème actuel : ${themeLabels[currentTheme]}</strong>
        <p style="margin:8px 0 0;color:#657089;font-size:14px">Les décorations thématiques apparaîtront sur l'ensemble du site. Les visiteurs verront des petits emojis festifs selon la thématique choisie.</p>
      </div>
    `;
    return;
  }

  if(k==='ressources'){
    p.innerHTML=`
      <div class="admin-top">
        <div>
          <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
          <p style="margin:6px 0;color:#657089">Gérez les organismes d'aide et leurs logos. ${data.length} organisme(s).</p>
        </div>
        <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter organisme</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        ${data.map(o=>{
          const logoSize=getDataUrlSize(o.logo||'');
          return `
          <div style="border:1px solid #d4d4d4;border-radius:8px;overflow:hidden;display:flex;flex-direction:column">
            ${o.logo?`
              <div style="background:#f0f0f0;height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden">
                <img src="${o.logo}" alt="${e(o.name)}" style="max-width:100%;max-height:100%;object-fit:contain;padding:8px">
              </div>
            `:`
              <div style="background:#f5f5f5;height:120px;display:flex;align-items:center;justify-content:center;color:#999">
                <small>Pas de logo</small>
              </div>
            `}
            <div style="padding:12px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <small style="color:#0c255f;font-weight:600;display:block;word-break:break-word">${e(o.name)}</small>
                <small style="color:#657089;display:block;margin-top:4px;word-break:break-word">${e(o.phone)}</small>
                <small style="color:#999;display:block;margin-top:2px;word-break:break-word">${e(o.url)}</small>
                ${o.logo?`<small style="color:#999;display:block;margin-top:4px">${formatBytes(logoSize)}</small>`:''}
              </div>
              <div class="action-row" style="margin-top:8px">
                <button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button>
                <button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button>
              </div>
            </div>
          </div>
        `;
        }).join('')||'<div style="grid-column:1/-1;color:#657089">Aucun organisme. Cliquez sur « + Ajouter organisme » pour commencer.</div>'}
      </div>
    `;
    return;
  }

  let sortedData=data;
  if(k==='team'){
    const teamRoleOrder=['Coordonnateur','Intervenante','Intervenant'];
    const adminRoleOrder=['Président','Présidente','Vice-Président','Vice-Présidente','Secrétaire','Trésorier','Trésorière','Administrateur (Membre adulte)','Administratrice (Membre adulte)','Administrateur (Membre jeunesse)','Administratrice (Membre jeunesse)'];
    
    sortedData=data.sort((a,b)=>{
      // First group by section
      if(a.section!==b.section){
        return a.section==='Équipe'?-1:1;
      }
      // Then sort by role order
      const roleOrder=a.section==='Équipe'?teamRoleOrder:adminRoleOrder;
      const roleA=roleOrder.indexOf(a.role);
      const roleB=roleOrder.indexOf(b.role);
      if(roleA!==roleB) return roleA-roleB;
      // Finally sort alphabetically by name
      return a.name.localeCompare(b.name,'fr');
    });
  }

  p.innerHTML=`
    <div class="admin-top">
      <div>
        <h2 style="margin:0;color:#0c255f">${D[k].label}</h2>
        <p style="margin:6px 0;color:#657089">Contenu visible publiquement sur le site. ${data.length} élément(s).</p>
      </div>
      <button class="btn btn-primary" onclick="openEditor('${k}')">+ Ajouter</button>
    </div>
    <table class="admin-table">
      <thead>
        <tr>
          <th>Contenu</th>
          <th style="width:200px">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${sortedData.map(o=>`<tr><td>${rowSummary(k,o)}</td><td><div class="action-row"><button class="btn btn-outline btn-small" onclick="openEditor('${k}',${o.id})">✎ Modifier</button><button class="btn btn-danger btn-small" onclick="delItem('${k}',${o.id})">🗑 Supprimer</button></div></td></tr>`).join('')||'<tr><td colspan="2" style="color:#657089">Aucun contenu. Cliquez sur « + Ajouter » pour commencer.</td></tr>'}
      </tbody>
    </table>
  `
}

function openEditor(k,id){
  const data=load(k),obj=data.find(x=>x.id===id)||{id:Date.now()};
  
  let fields='';
  
  if(k==='heroBanner'){
    // Special handling for hero banner with image upload
    const hasImage=obj.src&&obj.src.length>0;
    fields=`
      <label>Légende<input name="caption" type="text" value="${e(obj.caption||'')}" required></label>
      <div style="border-top:1px solid #e8e8e8;padding-top:16px;margin-top:16px">
        <label style="display:block;margin-bottom:8px"><strong>Image</strong></label>
        <div id="image-upload-zone" style="border:2px dashed #143a8f;border-radius:8px;padding:16px;text-align:center;cursor:pointer;background:#f8faff;display:${hasImage?'none':'block'}">
          <input type="file" id="image-input" accept="image/*" style="display:none">
          <div style="font-size:28px;margin-bottom:6px">📸</div>
          <small style="color:#143a8f;display:block;font-weight:600">Cliquez ou glissez</small>
          <small style="color:#657089;display:block;margin-top:4px">JPG, PNG (max 2 MB)</small>
        </div>
        <div id="image-preview-zone" style="display:${hasImage?'block':'none'};margin-top:12px">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:12px;background:#f0f0f0">
            <img id="image-preview-img" src="${obj.src||''}" alt="Image" style="max-width:100%;max-height:300px;width:100%;object-fit:contain;border-radius:8px;display:block">
            <button type="button" class="btn btn-outline btn-small" style="position:absolute;bottom:8px;right:8px;opacity:0.9" onclick="document.getElementById('image-input').click()">✎ Remplacer</button>
          </div>
          <div id="image-storage-bar" style="font-size:12px">
            ${renderStorageBar(getDataUrlSize(obj.src||''),'Taille image',100)}
          </div>
        </div>
      </div>
    `;
  }else if(k==='team'){
    // Special handling for team with dynamic role selection
    const adminRoles={
      'Homme':['Président','Vice-Président','Secrétaire','Trésorier','Administrateur (Membre adulte)','Administrateur (Membre jeunesse)'],
      'Femme':['Présidente','Vice-Présidente','Secrétaire','Trésorière','Administratrice (Membre adulte)','Administratrice (Membre jeunesse)']
    };
    
    const gender=obj.gender||'Homme';
    const section=obj.section||'Équipe';
    const role=obj.role||'';
    const showAdminRoles=section==='Conseil d\'administration';
    
    fields=`
      <label>Nom<input name="name" type="text" value="${e(obj.name||'')}" required></label>
      <label>Genre<select id="gender-select" name="gender">
        <option ${gender==='Homme'?'selected':''}>Homme</option>
        <option ${gender==='Femme'?'selected':''}>Femme</option>
      </select></label>
      <label>Section<select id="section-select" name="section">
        <option ${section==='Équipe'?'selected':''}>Équipe</option>
        <option ${section==='Conseil d\'administration'?'selected':''}>Conseil d'administration</option>
      </select></label>
      <label>Rôle
        <div id="role-container">
          ${showAdminRoles?
            `<select name="role" id="role-select">
              ${adminRoles[gender].map(r=>`<option ${role===r?'selected':''}>${r}</option>`).join('')}
            </select>`:
            `<input name="role" type="text" id="role-input" value="${e(role)}" required>`
          }
        </div>
      </label>
      <label>Infos (une par ligne)<textarea name="facts">${e((obj.facts||[]).join('\n'))}</textarea></label>
    `;
  }else if(k==='ressources'){
    // Special handling for ressources with logo upload
    const hasLogo=obj.logo&&obj.logo.length>0;
    fields=`
      <label>Nom organisme<input name="name" type="text" value="${e(obj.name||'')}" required></label>
      <label>Numéro téléphone<input name="phone" type="text" value="${e(obj.phone||'')}" required></label>
      <label>Site web<input name="url" type="url" value="${e(obj.url||'')}" required></label>
      <div style="border-top:1px solid #e8e8e8;padding-top:16px;margin-top:16px">
        <label style="display:block;margin-bottom:8px"><strong>Logo</strong></label>
        <div id="logo-upload-zone" style="border:2px dashed #143a8f;border-radius:8px;padding:16px;text-align:center;cursor:pointer;background:#f8faff;display:${hasLogo?'none':'block'}">
          <input type="file" id="logo-input" accept="image/*" style="display:none">
          <div style="font-size:28px;margin-bottom:6px">📋</div>
          <small style="color:#143a8f;display:block;font-weight:600">Cliquez ou glissez</small>
          <small style="color:#657089;display:block;margin-top:4px">JPG, PNG (max 2 MB)</small>
        </div>
        <div id="logo-preview-zone" style="display:${hasLogo?'block':'none'};margin-top:12px">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:12px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;height:150px">
            <img id="logo-preview-img" src="${obj.logo||''}" alt="Logo" style="max-width:100%;max-height:100%;object-fit:contain;padding:8px">
            <button type="button" class="btn btn-outline btn-small" style="position:absolute;bottom:8px;right:8px;opacity:0.9" onclick="document.getElementById('logo-input').click()">✎ Remplacer</button>
          </div>
          <div id="logo-storage-bar" style="font-size:12px">
            ${renderStorageBar(getDataUrlSize(obj.logo||''),'Taille logo',100)}
          </div>
        </div>
      </div>
    `;
  }else{
    // Standard field handling for other types
    fields=D[k].fields.map(([name,label,type])=>{
      let val=obj[name]??'';
      if(Array.isArray(val))val=val.join('\n');
      if(type==='textarea')return `<label>${label}<textarea name="${name}" required>${e(val)}</textarea></label>`;
      if(type==='select'){
        if(name==='section' && k==='team'){
          return `<label>${label}<select name="${name}"><option ${val==='Équipe'?'selected':''}>Équipe</option><option ${val==='Conseil d\'administration'?'selected':''}>Conseil d'administration</option></select></label>`;
        }
        return `<label>${label}<select name="${name}"><option ${val==='Partenaire'?'selected':''}>Partenaire</option><option ${val==='Commanditaire'?'selected':''}>Commanditaire</option></select></label>`;
      }
      const isRequired=!label.includes('(optionnel)');
      return `<label>${label}<input name="${name}" type="${type}" value="${e(val)}" ${isRequired?'required':''}></label>`
    }).join('');
  }
  
  // Spécial handling for team photo upload
  let photoHTML='';
  if(k==='team'){
    const hasPhoto=obj.photo&&obj.photo.length>0;
    photoHTML=`
      <div style="border-top:1px solid #e8e8e8;padding-top:16px;margin-top:16px">
        <label style="display:block;margin-bottom:8px"><strong>Photo</strong></label>
        <div id="photo-upload-zone" style="border:2px dashed #143a8f;border-radius:8px;padding:16px;text-align:center;cursor:pointer;background:#f8faff;display:${hasPhoto?'none':'block'}">
          <input type="file" id="photo-input" accept="image/*" style="display:none">
          <div style="font-size:28px;margin-bottom:6px">📸</div>
          <small style="color:#143a8f;display:block;font-weight:600">Cliquez ou glissez</small>
          <small style="color:#657089;display:block;margin-top:4px">JPG, PNG (max 2 MB)</small>
        </div>
        <div id="photo-preview-zone" style="display:${hasPhoto?'block':'none'};margin-top:12px">
          <div style="position:relative;border-radius:8px;overflow:hidden;margin-bottom:12px;background:#f0f0f0">
            <img id="photo-preview-img" src="${obj.photo||''}" alt="Photo" style="max-width:100%;max-height:300px;width:100%;object-fit:contain;border-radius:8px;display:block">
            <button type="button" class="btn btn-outline btn-small" style="position:absolute;bottom:8px;right:8px;opacity:0.9" onclick="document.getElementById('photo-input').click()">✎ Remplacer</button>
          </div>
          <div id="photo-storage-bar" style="font-size:12px">
            ${renderStorageBar(getDataUrlSize(obj.photo||''),'Taille image',100)}
          </div>
        </div>
      </div>
    `;
  }
  
  // Spécial handling for photoYears cover upload
  let coverHTML='';
  if(k==='photoYears'){
    coverHTML=`
      <div style="border-top:1px solid #e8e8e8;padding-top:16px;margin-top:16px">
        <label style="display:block;margin-bottom:8px"><strong>Image de couverture</strong></label>
        <div style="border:2px dashed #143a8f;border-radius:8px;padding:16px;text-align:center;cursor:pointer;background:#f8faff" id="cover-upload-zone">
          <input type="file" id="cover-input" accept="image/*" style="display:none">
          <div style="font-size:28px;margin-bottom:6px">📸</div>
          <small style="color:#143a8f;display:block;font-weight:600">Cliquez ou glissez</small>
          <small style="color:#657089;display:block;margin-top:4px">JPG, PNG (max 2 MB)</small>
        </div>
        <div id="cover-preview-zone" style="display:${obj.cover?'block':'none'};margin-top:12px">
          <img id="cover-preview-img" src="${obj.cover||''}" alt="Couverture" style="max-width:100%;max-height:200px;border-radius:8px;display:block;margin-bottom:8px">
          <button type="button" class="btn btn-outline btn-small" onclick="document.getElementById('cover-input').click()" style="width:100%">✎ Remplacer l'image</button>
        </div>
      </div>
    `;
  }
  
  const mb=document.querySelector('#modal-backdrop');
  mb.innerHTML=`
    <div class="modal">
      <h3>${id?'Modifier':'Ajouter'} ${D[k].label.toLowerCase()}</h3>
      <form id="edit-form" class="form">
        ${fields}
        ${photoHTML}
        ${coverHTML}
        <div class="action-row">
          <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
          <button type="button" class="btn btn-outline" onclick="closeModal()">Annuler</button>
        </div>
      </form>
    </div>
  `;
  mb.classList.add('open');
  
  // Setup image upload for hero banner
  if(k==='heroBanner'){
    const uploadZone=document.getElementById('image-upload-zone');
    const fileInput=document.getElementById('image-input');
    const previewZone=document.getElementById('image-preview-zone');
    const previewImg=document.getElementById('image-preview-img');
    let imageData=obj.src||'';
    
    const toggleZones=()=>{
      uploadZone.style.display=imageData?'none':'block';
      previewZone.style.display=imageData?'block':'none';
    };
    
    uploadZone.onclick=()=>fileInput.click();
    uploadZone.ondragover=(e)=>{e.preventDefault();uploadZone.style.background='#e0e7ff'};
    uploadZone.ondragleave=(e)=>{e.preventDefault();uploadZone.style.background='#f8faff'};
    uploadZone.ondrop=(e)=>{
      e.preventDefault();
      uploadZone.style.background='#f8faff';
      if(e.dataTransfer.files.length)handleImageFile(e.dataTransfer.files[0]);
    };
    
    fileInput.onchange=(e)=>{
      if(e.target.files.length)handleImageFile(e.target.files[0]);
    };
    
    function handleImageFile(file){
      if(!file.type.startsWith('image/')){
        alert('Veuillez sélectionner une image');
        return;
      }
      if(file.size>2*1024*1024){
        alert('L\'image doit faire moins de 2 MB');
        return;
      }
      const reader=new FileReader();
      reader.onload=async(evt)=>{
        const originalData=evt.target.result;
        // Redimensionner l'image à 800x600px (ratio 4:3)
        imageData=await resizeImage(originalData);
        previewImg.src=imageData;
        toggleZones();
        const imgSize=getDataUrlSize(imageData);
        document.querySelector('#image-storage-bar').innerHTML=renderStorageBar(imgSize,'Taille image',100);
      };
      reader.readAsDataURL(file);
    }
    
    document.querySelector('#edit-form').onsubmit=(ev)=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      obj.caption=fd.get('caption')||'';
      if(imageData)obj.src=imageData;
      if(!obj.src){
        alert('Veuillez ajouter une image');
        return;
      }
      const arr=load(k);
      const ix=arr.findIndex(x=>x.id===obj.id);
      ix>=0?arr[ix]=obj:arr.push(obj);
      save(k,arr);
      closeModal();
      renderPanel(k);
    };
    return;
  }
  
  // Setup dynamic role selection for team members
  if(k==='team'){
    const adminRoles={
      'Homme':['Président','Vice-Président','Secrétaire','Trésorier','Administrateur (Membre adulte)','Administrateur (Membre jeunesse)'],
      'Femme':['Présidente','Vice-Présidente','Secrétaire','Trésorière','Administratrice (Membre adulte)','Administratrice (Membre jeunesse)']
    };
    
    const genderSelect=document.getElementById('gender-select');
    const sectionSelect=document.getElementById('section-select');
    const roleContainer=document.getElementById('role-container');
    
    const updateRoleField=()=>{
      const gender=genderSelect.value;
      const section=sectionSelect.value;
      const currentRole=roleContainer.querySelector('[name="role"]')?.value||'';
      
      if(section==='Conseil d\'administration'){
        const options=adminRoles[gender];
        roleContainer.innerHTML=`<select name="role" id="role-select">
          ${options.map(r=>`<option ${currentRole===r?'selected':''}>${r}</option>`).join('')}
        </select>`;
      }else{
        roleContainer.innerHTML=`<input name="role" type="text" id="role-input" value="${e(currentRole)}" required>`;
      }
    };
    
    genderSelect.onchange=updateRoleField;
    sectionSelect.onchange=updateRoleField;
  }
  
  // Setup cover upload handlers for photoYears
  if(k==='photoYears'){
    const uploadZone=document.getElementById('cover-upload-zone');
    const fileInput=document.getElementById('cover-input');
    const previewZone=document.getElementById('cover-preview-zone');
    const previewImg=document.getElementById('cover-preview-img');
    let coverData=obj.cover||'';
    
    uploadZone.onclick=()=>fileInput.click();
    uploadZone.ondragover=(e)=>{e.preventDefault();uploadZone.style.background='#e0e7ff'};
    uploadZone.ondragleave=(e)=>{e.preventDefault();uploadZone.style.background='#f8faff'};
    uploadZone.ondrop=(e)=>{
      e.preventDefault();
      uploadZone.style.background='#f8faff';
      if(e.dataTransfer.files.length)handleCoverFile(e.dataTransfer.files[0]);
    };
    
    fileInput.onchange=(e)=>{
      if(e.target.files.length)handleCoverFile(e.target.files[0]);
    };
    
    function handleCoverFile(file){
      if(!file.type.startsWith('image/')){
        alert('Veuillez sélectionner une image');
        return;
      }
      if(file.size>2*1024*1024){
        alert('L\'image doit faire moins de 2 MB');
        return;
      }
      const reader=new FileReader();
      reader.onload=(evt)=>{
        coverData=evt.target.result;
        previewImg.src=coverData;
        previewZone.style.display='block';
      };
      reader.readAsDataURL(file);
    }
    
    document.querySelector('#edit-form').onsubmit=(ev)=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      D[k].fields.forEach(([name,label,type])=>{
        let v=fd.get(name)||'';
        if(type==='number')v=parseInt(v);
        obj[name]=v
      });
      if(coverData)obj.cover=coverData;
      const arr=load(k);
      const ix=arr.findIndex(x=>x.id===obj.id);
      ix>=0?arr[ix]=obj:arr.push(obj);
      save(k,arr);
      closeModal();
      renderPanel(k)
    }
  }else if(k==='team'){
    // Handle team photo upload
    const uploadZone=document.getElementById('photo-upload-zone');
    const fileInput=document.getElementById('photo-input');
    const previewZone=document.getElementById('photo-preview-zone');
    const previewImg=document.getElementById('photo-preview-img');
    let photoData=obj.photo||'';
    
    const toggleZones=()=>{
      uploadZone.style.display=photoData?'none':'block';
      previewZone.style.display=photoData?'block':'none';
    };
    
    uploadZone.onclick=()=>fileInput.click();
    uploadZone.ondragover=(e)=>{e.preventDefault();uploadZone.style.background='#e0e7ff'};
    uploadZone.ondragleave=(e)=>{e.preventDefault();uploadZone.style.background='#f8faff'};
    uploadZone.ondrop=(e)=>{
      e.preventDefault();
      uploadZone.style.background='#f8faff';
      if(e.dataTransfer.files.length)handlePhotoFile(e.dataTransfer.files[0]);
    };
    
    fileInput.onchange=(e)=>{
      if(e.target.files.length)handlePhotoFile(e.target.files[0]);
    };
    
    function handlePhotoFile(file){
      if(!file.type.startsWith('image/')){
        alert('Veuillez sélectionner une image');
        return;
      }
      if(file.size>2*1024*1024){
        alert('L\'image doit faire moins de 2 MB');
        return;
      }
      const reader=new FileReader();
      reader.onload=async(evt)=>{
        // Resize and compress team member photo before storing
        const originalData=evt.target.result;
        photoData=await resizeImage(originalData, 250, 300, 0.55);
        previewImg.src=photoData;
        toggleZones();
        const photoSize=getDataUrlSize(photoData);
        document.querySelector('#photo-storage-bar').innerHTML=renderStorageBar(photoSize,'Taille image',100);
      };
      reader.readAsDataURL(file);
    }
    
    document.querySelector('#edit-form').onsubmit=async(ev)=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      D[k].fields.forEach(([name])=>{
        let v=fd.get(name)||'';
        if(k==='team'&&name==='facts')v=v.split('\n').map(x=>x.trim()).filter(Boolean);
        obj[name]=v
      });
      if(photoData)obj.photo=photoData;
      
      // Validate required fields for team members
      if(!obj.name||!obj.name.trim()){
        alert('❌ Le nom est obligatoire');
        return;
      }
      if(!obj.photo){
        alert('❌ Une photo est obligatoire');
        return;
      }
      if(!obj.role||!obj.role.trim()){
        alert('❌ Le rôle est obligatoire');
        return;
      }
      
      console.log('💾 Saving team member:', obj.name);
      
      // Send only the member object (not the entire array)
      const response=await fetch(`${API_URL}/team`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(obj)
      });
      
      if(!response.ok){
        const error=await response.json();
        alert(`❌ ${error.error||'Erreur lors de la sauvegarde'}`);
        return;
      }
      
      // Refetch all team members to update cache and display
      console.log('🔄 Refetching team data...');
      const teamData=await fetch(`${API_URL}/team`).then(r=>r.json());
      dataCache.team=teamData;
      
      closeModal();
      renderPanel(k);
      
      // Show success message
      const msg=document.createElement('div');
      msg.style.cssText='position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:6px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
      msg.textContent='✅ Membre sauvegardé!';
      document.body.appendChild(msg);
      setTimeout(()=>msg.remove(),3000);
    }
  }else if(k==='ressources'){
    // Handle ressources logo upload
    const uploadZone=document.getElementById('logo-upload-zone');
    const fileInput=document.getElementById('logo-input');
    const previewZone=document.getElementById('logo-preview-zone');
    const previewImg=document.getElementById('logo-preview-img');
    let logoData=obj.logo||'';
    
    const toggleZones=()=>{
      uploadZone.style.display=logoData?'none':'block';
      previewZone.style.display=logoData?'block':'none';
    };
    
    uploadZone.onclick=()=>fileInput.click();
    uploadZone.ondragover=(e)=>{e.preventDefault();uploadZone.style.background='#e0e7ff'};
    uploadZone.ondragleave=(e)=>{e.preventDefault();uploadZone.style.background='#f8faff'};
    uploadZone.ondrop=(e)=>{
      e.preventDefault();
      uploadZone.style.background='#f8faff';
      if(e.dataTransfer.files.length)handleLogoFile(e.dataTransfer.files[0]);
    };
    
    fileInput.onchange=(e)=>{
      if(e.target.files.length)handleLogoFile(e.target.files[0]);
    };
    
    function handleLogoFile(file){
      if(!file.type.startsWith('image/')){
        alert('Veuillez sélectionner une image');
        return;
      }
      if(file.size>2*1024*1024){
        alert('L\'image doit faire moins de 2 MB');
        return;
      }
      const reader=new FileReader();
      reader.onload=(evt)=>{
        logoData=evt.target.result;
        previewImg.src=logoData;
        toggleZones();
        const logoSize=getDataUrlSize(logoData);
        document.querySelector('#logo-storage-bar').innerHTML=renderStorageBar(logoSize,'Taille logo',100);
      };
      reader.readAsDataURL(file);
    }
    
    document.querySelector('#edit-form').onsubmit=(ev)=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      D[k].fields.forEach(([name])=>{
        let v=fd.get(name)||'';
        obj[name]=v
      });
      if(logoData)obj.logo=logoData;
      const arr=load(k);
      const ix=arr.findIndex(x=>x.id===obj.id);
      ix>=0?arr[ix]=obj:arr.push(obj);
      save(k,arr);
      closeModal();
      renderPanel(k)
    }
  }else{
    document.querySelector('#edit-form').onsubmit=(ev)=>{
      ev.preventDefault();
      const fd=new FormData(ev.target);
      D[k].fields.forEach(([name])=>{
        let v=fd.get(name)||'';
        if(k==='team'&&name==='facts')v=v.split('\n').map(x=>x.trim()).filter(Boolean);
        obj[name]=v
      });
      const arr=load(k);
      const ix=arr.findIndex(x=>x.id===obj.id);
      ix>=0?arr[ix]=obj:arr.push(obj);
      save(k,arr);
      closeModal();
      renderPanel(k)
    }
  }
}

function closeModal(){document.querySelector('#modal-backdrop').classList.remove('open')}

function delItem(k,id){
  if(!confirm('Êtes-vous certain de vouloir supprimer cet élément? Cette action est irréversible.'))return;
  save(k,load(k).filter(x=>x.id!==id));
  renderPanel(k)
}

function openEventEditor(k,yearId,eventId){
  const years=load(k);
  const yearData=years.find(y=>y.id===yearId);
  if(!yearData)return;
  
  const events=yearData.events||[];
  let eventObj=eventId?events.find(e=>e.id===eventId):null;
  const isNew=!eventId;
  
  if(!eventObj){
    eventObj={id:Date.now(),name:'',date:new Date().toISOString().split('T')[0],description:'',photos:[]};
    if(isNew){
      yearData.events.push(eventObj);
      save(k,years);
    }
  }
  
  const mb=document.querySelector('#modal-backdrop');
  mb.innerHTML=`
    <div class="modal" style="max-width:700px">
      <h3>${isNew?'Ajouter':'Modifier'} événement pour ${yearData.year}</h3>
      <form id="edit-form" class="form">
        <label>Nom de l'événement<input name="name" type="text" value="${e(eventObj.name)}" required></label>
        <label>Date<input name="date" type="date" value="${eventObj.date||''}" required></label>
        <label>Description (optionnel)<textarea name="description" style="resize:vertical;min-height:80px">${e(eventObj.description||'')}</textarea></label>
        <div style="margin-top:16px;border-top:1px solid #e8e8e8;padding-top:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h4 style="margin:0;color:#0c255f;font-size:14px">Photos (${(eventObj.photos||[]).length})</h4>
            <button type="button" class="btn btn-primary btn-small" onclick="openPhotoEditor('${k}',${yearId},${eventObj.id})">+ Ajouter</button>
          </div>
          <div id="photos-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;max-height:300px;overflow-y:auto;padding:8px">
            ${(eventObj.photos||[]).map(p=>{
              const photoSize=getDataUrlSize(p.src);
              return `
              <div style="position:relative;border-radius:8px;overflow:hidden;background:#f0f0f0">
                <img src="${p.src}" alt="${e(p.caption)}" style="width:100%;height:120px;object-fit:cover">
                <div style="position:absolute;top:0;right:0;display:flex;gap:4px;padding:4px">
                  <button type="button" class="btn btn-outline btn-small" style="padding:4px 6px;font-size:12px" onclick="openPhotoEditor('${k}',${yearId},${eventObj.id},${p.id})">✎</button>
                  <button type="button" class="btn btn-danger btn-small" style="padding:4px 6px;font-size:12px" onclick="delPhoto(${yearId},${eventObj.id},${p.id})">🗑</button>
                </div>
                <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:white;font-size:10px;padding:4px;text-align:center" title="${e(p.caption)}">
                  <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e(p.caption)}</div>
                  <div style="font-size:9px;color:#ccc">${formatBytes(photoSize)}</div>
                </div>
              </div>
            `;
            }).join('')||'<small style="grid-column:1/-1;color:#999">Aucune photo</small>'}
          </div>
        </div>
        <div class="action-row" style="margin-top:16px">
          <button type="submit" class="btn btn-primary">💾 Enregistrer</button>
          <button type="button" class="btn btn-outline" onclick="closeModal()">Annuler</button>
        </div>
      </form>
    </div>
  `;
  mb.classList.add('open');
  
  document.querySelector('#edit-form').onsubmit=(ev)=>{
    ev.preventDefault();
    const name=ev.target.querySelector('input[name="name"]').value;
    const date=ev.target.querySelector('input[name="date"]').value;
    const description=ev.target.querySelector('textarea[name="description"]').value;
    eventObj.name=name;
    eventObj.date=date;
    eventObj.description=description;
    
    const yearIdx=years.findIndex(y=>y.id===yearId);
    if(yearIdx>=0){
      save(k,years);
      closeModal();
      renderPanel(k);
    }
  }
}

function delEvent(k,yearId,eventId){
  if(!confirm('Supprimer cet événement et toutes ses photos?'))return;
  const years=load(k);
  const yearData=years.find(y=>y.id===yearId);
  if(yearData){
    yearData.events=(yearData.events||[]).filter(e=>e.id!==eventId);
    save(k,years);
    renderPanel(k);
  }
}

function openPhotoEditor(k,yearId,eventId,photoId){
  const years=load(k);
  const yearData=years.find(y=>y.id===yearId);
  if(!yearData)return;
  
  const eventData=yearData.events.find(e=>e.id===eventId);
  if(!eventData)return;
  
  let photoObj=photoId?eventData.photos.find(p=>p.id===photoId):{id:Date.now(),src:'',caption:''};
  const isEdit=!!photoId;
  
  const mb=document.querySelector('#modal-backdrop');
  mb.innerHTML=`
    <div class="modal" style="max-width:600px">
      <h3>${isEdit?'Modifier':'Ajouter'} une photo à ${e(eventData.name)}</h3>
      <form id="photo-form" class="form">
        <div style="border:2px dashed #143a8f;border-radius:8px;padding:20px;text-align:center;cursor:pointer;background:#f8faff" id="upload-zone" ${isEdit?'style="display:none"':''}>
          <input type="file" id="photo-input" accept="image/*" style="display:none">
          <div style="font-size:32px;margin-bottom:8px">📸</div>
          <strong style="color:#143a8f;display:block">${isEdit?'Cliquez ou glissez pour remplacer':'Cliquez ou glissez une image'}</strong>
          <small style="color:#657089;display:block;margin-top:4px">JPG, PNG, WebP (max 2 MB)</small>
        </div>
        
        <div id="preview-zone" style="display:${isEdit?'block':'none'};margin-top:16px">
          <div style="position:relative;margin-bottom:12px;border-radius:8px;overflow:hidden">
            <img id="preview-img" src="${photoObj.src}" style="max-width:100%;max-height:300px;border-radius:8px;display:block;width:100%;object-fit:contain">
            <button type="button" class="btn btn-outline btn-small" style="position:absolute;bottom:8px;right:8px;opacity:0.9" onclick="document.getElementById('photo-input').click()">✎ Remplacer</button>
          </div>
          <label>Légende<input name="caption" type="text" value="${e(photoObj.caption)}" placeholder="Description courte"></label>
          <div style="color:#999;font-size:12px;margin-top:8px">
            <small id="file-info"></small>
          </div>
        </div>
        
        <div class="action-row" style="margin-top:16px">
          <button type="submit" class="btn btn-primary" id="submit-btn">${isEdit?'💾 Enregistrer':'✅ Ajouter la photo'}</button>
          <button type="button" class="btn btn-outline" onclick="closeModal();openEventEditor('${k}',${yearId},${eventId})">Annuler</button>
        </div>
      </form>
    </div>
  `;
  mb.classList.add('open');
  
  const uploadZone=document.getElementById('upload-zone');
  const fileInput=document.getElementById('photo-input');
  const previewZone=document.getElementById('preview-zone');
  const previewImg=document.getElementById('preview-img');
  const fileInfo=document.getElementById('file-info');
  let selectedFile=null;
  
  uploadZone.onclick=()=>fileInput.click();
  uploadZone.ondragover=(e)=>{e.preventDefault();uploadZone.style.background='#e0e7ff';uploadZone.style.borderColor='#0c255f'};
  uploadZone.ondragleave=(e)=>{e.preventDefault();uploadZone.style.background='#f8faff';uploadZone.style.borderColor='#143a8f'};
  uploadZone.ondrop=(e)=>{
    e.preventDefault();
    uploadZone.style.background='#f8faff';
    uploadZone.style.borderColor='#143a8f';
    const files=e.dataTransfer.files;
    if(files.length)handleFile(files[0]);
  };
  
  fileInput.onchange=(e)=>{
    if(e.target.files.length)handleFile(e.target.files[0]);
  };
  
  function handleFile(file){
    if(!file.type.startsWith('image/')){
      alert('Veuillez sélectionner une image');
      return;
    }
    if(file.size>2*1024*1024){
      alert('L\'image doit faire moins de 2 MB');
      return;
    }
    selectedFile=file;
    const reader=new FileReader();
    reader.onload=async(evt)=>{
      // Resize and compress image before storing
      const resizedData=await resizeImage(evt.target.result, 250, 300, 0.55);
      photoObj.src=resizedData;
      previewImg.src=resizedData;
      fileInfo.textContent=`${file.name} · ${(file.size/1024).toFixed(1)} KB → resized`;
      uploadZone.style.display='none';
      previewZone.style.display='block';
    };
    reader.readAsDataURL(file);
  }
  
  document.querySelector('#photo-form').onsubmit=(ev)=>{
    ev.preventDefault();
    
    if(!photoObj.src){
      alert('Veuillez sélectionner une image');
      return;
    }
    
    const caption=ev.target.querySelector('input[name="caption"]').value;
    photoObj.caption=caption;
    
    if(!isEdit){
      eventData.photos=eventData.photos||[];
      eventData.photos.push(photoObj);
    }
    
    save(k,years);
    closeModal();
    openEventEditor(k,yearId,eventId);
  }
}

function delPhoto(yearId,eventId,photoId){
  if(!confirm('Supprimer cette photo?'))return;
  const years=load('photoYears');
  const yearData=years.find(y=>y.id===yearId);
  if(yearData){
    const eventData=yearData.events.find(e=>e.id===eventId);
    if(eventData){
      eventData.photos=(eventData.photos||[]).filter(p=>p.id!==photoId);
      save('photoYears',years);
      openEventEditor('photoYears',yearId,eventId);
    }
  }
}

function switchPanel(k){
  document.querySelectorAll('.admin-panel').forEach(x=>x.classList.remove('active'));
  document.querySelector('#panel-'+k).classList.add('active');
  document.querySelectorAll('.admin-nav button').forEach(x=>x.classList.toggle('active',x.dataset.k===k))
}

function showExportMenu(){
  const mb=document.querySelector('#modal-backdrop');
  mb.innerHTML=`
    <div class="modal" style="max-width:500px">
      <h3>📥 Choisir le type d'export</h3>
      <p style="color:#657089;margin:0 0 20px">Sélectionnez le type de fichier à télécharger :</p>
      
      <div style="display:flex;flex-direction:column;gap:12px">
        <button class="btn btn-primary" style="justify-content:flex-start;padding:16px;text-align:left;font-size:15px" onclick="exportData('light')">
          <span style="display:block;font-weight:700">📄 Export léger (texte seul)</span>
          <span style="font-size:12px;color:#999;display:block;margin-top:4px">Contenu, événements, équipe sans photos (~50-200 KB)</span>
          <span style="font-size:11px;color:#143a8f;display:block;margin-top:6px">✅ Recommandé - Import rapide et fiable</span>
        </button>
        
        <button class="btn btn-outline" style="justify-content:flex-start;padding:16px;text-align:left;font-size:15px;border-color:#d62828;color:#d62828" onclick="exportData('full')">
          <span style="display:block;font-weight:700">🖼️ Export complet (avec photos)</span>
          <span style="font-size:12px;color:#999;display:block;margin-top:4px">Tout, y compris les photos (1-4 MB)</span>
          <span style="font-size:11px;color:#d62828;display:block;margin-top:6px">⚠️ Peut échouer si localStorage est rempli</span>
        </button>
        
        <button class="btn btn-outline" style="justify-content:flex-start;padding:16px;text-align:left;font-size:15px;border-color:#ffd23f;color:#d62828;background:#fffef5" onclick="exportData('full-clean')">
          <span style="display:block;font-weight:700">🧹 Export complet (nettoyé) - ⭐ CONSEILLÉ</span>
          <span style="font-size:12px;color:#999;display:block;margin-top:4px">Exporte PUIS nettoie localStorage pour libérer l'espace</span>
          <span style="font-size:11px;color:#d62828;display:block;margin-top:6px">✅ Optimisé - Le site sera vidé après l'export</span>
        </button>
      </div>
      
      <div style="margin-top:20px;padding:12px;background:#fffef5;border-radius:6px;font-size:12px;color:#657089;border-left:3px solid #ffd23f">
        <strong>💡 Conseil :</strong> Si vous avez fait un export qui n'arrive pas à importer, utilisez <strong>"Export complet (nettoyé)"</strong> pour débloquer la situation.
      </div>
      
      <div class="action-row" style="margin-top:20px">
        <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
      </div>
    </div>
  `;
  mb.classList.add('open');
}

function stripPhotosFromData(data){
  // Crée une copie des données WITHOUT les photos
  const stripped=JSON.parse(JSON.stringify(data));
  
  // Supprimer les images heroBanner
  if(stripped.heroBanner){
    stripped.heroBanner.forEach(item=>{
      delete item.src;
    });
  }
  
  // Supprimer les photos des années/événements
  if(stripped.photoYears){
    stripped.photoYears.forEach(year=>{
      delete year.cover;
      if(year.events){
        year.events.forEach(event=>{
          delete event.photos; // Supprimer le tableau complet
        });
      }
    });
  }
  
  // Supprimer les photos des membres d'équipe
  if(stripped.team){
    stripped.team.forEach(member=>{
      delete member.photo;
    });
  }
  
  return stripped;
}

function compressExportImage(dataUrl){
  // Compresse les images pour l'export à une qualité plus faible
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      canvas.width=img.width;
      canvas.height=img.height;
      const ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0);
      // Qualité réduite pour l'export (55%)
      resolve(canvas.toDataURL('image/jpeg',0.55));
    };
    img.src=dataUrl;
  });
}

function compressDataForExport(data){
  // Compresse récursivement toutes les images dans les données
  return new Promise(async resolve=>{
    const compressed=JSON.parse(JSON.stringify(data));
    
    // Compresser les images heroBanner
    if(compressed.heroBanner){
      for(let i=0;i<compressed.heroBanner.length;i++){
        if(compressed.heroBanner[i].src){
          compressed.heroBanner[i].src=await compressExportImage(compressed.heroBanner[i].src);
        }
      }
    }
    
    // Compresser les photos des années
    if(compressed.photoYears){
      for(let year of compressed.photoYears){
        // Cover de l'année
        if(year.cover){
          year.cover=await compressExportImage(year.cover);
        }
        // Photos dans les événements
        if(year.events){
          for(let event of year.events){
            if(event.photos){
              for(let i=0;i<event.photos.length;i++){
                if(event.photos[i].src){
                  event.photos[i].src=await compressExportImage(event.photos[i].src);
                }
              }
            }
          }
        }
      }
    }
    
    // Compresser les photos des membres d'équipe
    if(compressed.team){
      for(let i=0;i<compressed.team.length;i++){
        if(compressed.team[i].photo){
          compressed.team[i].photo=await compressExportImage(compressed.team[i].photo);
        }
      }
    }
    
    resolve(compressed);
  });
}

function exportData(type='full'){
  closeModal();
  
  const allData={};
  K.forEach(k=>{
    allData[k]=load(k);
  });
  allData.heroBannerDuration=load('heroBannerDuration');
  
  if(type==='light'){
    // Export léger sans photos
    const lightData=stripPhotosFromData(allData);
    const json=JSON.stringify(lightData,null,2);
    const blob=new Blob([json],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`Le-Squat-Données-${new Date().toISOString().split('T')[0]}-TEXTE.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    const exportSize=(blob.size/1024).toFixed(1);
    alert(`✅ Export léger réussi!\\n\\nFichier : Le-Squat-Données-...-TEXTE.json\\nTaille : ${exportSize} KB\\n\\n✨ Cet export ne contient pas les photos mais tous les textes et métadonnées.\\n\\n💾 Très rapide à importer!`);
  }
  else if(type==='full-clean'){
    // Export complet PUIS nettoyage
    alert('⏳ Compression des images...\\nCela peut prendre quelques secondes.');
    compressDataForExport(allData).then(compressed=>{
      const json=JSON.stringify(compressed,null,2);
      const blob=new Blob([json],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=`Le-Squat-Données-${new Date().toISOString().split('T')[0]}-COMPLET.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const exportSize=(blob.size/1024/1024).toFixed(2);
      
      // Nettoyer localStorage après l'export
      setTimeout(()=>{
        K.forEach(k=>localStorage.removeItem('squat_'+k));
        localStorage.removeItem('squat_heroBannerDuration');
        
        alert(`✅ Export complet réussi!\\n\\nFichier : Le-Squat-Données-...-COMPLET.json\\nTaille : ${exportSize} MB\\n\\n🧹 localStorage a été VIDÉ!\\n\\n💡 Vous pouvez maintenant importer sans problème.\\n\\n📝 Le site est maintenant vide - réimportez le fichier pour le restaurer.`);
        
        // Recharger la page pour voir le site vide
        setTimeout(()=>location.reload(),500);
      },100);
    });
  }
  else{
    // Export complet standard sans nettoyage
    alert('⏳ Compression des images...\\nCela peut prendre quelques secondes.');
    compressDataForExport(allData).then(compressed=>{
      const json=JSON.stringify(compressed,null,2);
      const blob=new Blob([json],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=`Le-Squat-Données-${new Date().toISOString().split('T')[0]}-COMPLET.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const exportSize=(blob.size/1024/1024).toFixed(2);
      alert(`✅ Export complet réussi!\\n\\nFichier : Le-Squat-Données-...-COMPLET.json\\nTaille : ${exportSize} MB\\n\\n🖼️ Contient les photos (compressées)\\n⚠️ L'import peut être plus lent si localStorage est déjà rempli`);
    });
  }
}

function importData(event){
  const file=event.target.files[0];
  if(!file)return;
  
  const reader=new FileReader();
  reader.onload=async(e)=>{
    try{
      const data=JSON.parse(e.target.result);
      
      // Confirm before overwriting
      if(!confirm('Êtes-vous sûr? Cela remplacera toutes les données actuelles.'))return;
      
      // Clear existing data
      K.forEach(k=>localStorage.removeItem('squat_'+k));
      localStorage.removeItem('squat_heroBannerDuration');
      
      // Import par étapes
      const importLog=[];
      const failedCategories=[];
      
      // Étape 1 : Données texte (news, events, partners) - très léger
      const textCategories=['news','events','partners'];
      for(let k of textCategories){
        if(data[k]){
          try{
            save(k,data[k]);
            importLog.push(`✅ ${D[k].label}`);
          }catch(err){
            failedCategories.push(k);
            importLog.push(`❌ ${D[k].label} - ${err.message}`);
          }
        }
      }
      
      // Étape 2 : Équipe sans les photos
      if(data.team){
        try{
          const teamWithoutPhotos=data.team.map(t=>{
            const copy={...t};
            delete copy.photo; // Supprimer la photo pour cette étape
            return copy;
          });
          save('team',teamWithoutPhotos);
          importLog.push(`✅ ${D.team.label} (sans photos)`);
        }catch(err){
          failedCategories.push('team');
          importLog.push(`❌ ${D.team.label} - ${err.message}`);
        }
      }
      
      // Étape 3 : Bannière hero sans les images
      if(data.heroBanner){
        try{
          const heroBannerWithoutImages=data.heroBanner.map(b=>{
            const copy={...b};
            delete copy.src; // Supprimer l'image pour cette étape
            return copy;
          });
          save('heroBanner',heroBannerWithoutImages);
          importLog.push(`✅ ${D.heroBanner.label} (sans images)`);
        }catch(err){
          failedCategories.push('heroBanner');
          importLog.push(`❌ ${D.heroBanner.label} - ${err.message}`);
        }
      }
      
      // Étape 4 : Témoignages
      if(data.temoignages){
        try{
          save('temoignages',data.temoignages);
          importLog.push(`✅ ${D.temoignages.label}`);
        }catch(err){
          failedCategories.push('temoignages');
          importLog.push(`❌ ${D.temoignages.label} - ${err.message}`);
        }
      }
      
      // Étape 5 : Années photo sans les photos
      if(data.photoYears){
        try{
          const photoYearsNoImages=data.photoYears.map(year=>{
            const copy={...year};
            delete copy.cover;
            if(copy.events){
              copy.events=copy.events.map(evt=>{
                const evCopy={...evt};
                delete evCopy.photos; // Supprimer les photos d'événement
                return evCopy;
              });
            }
            return copy;
          });
          save('photoYears',photoYearsNoImages);
          importLog.push(`✅ ${D.photoYears.label} (structure, sans photos)`);
        }catch(err){
          failedCategories.push('photoYears');
          importLog.push(`❌ ${D.photoYears.label} - ${err.message}`);
        }
      }
      
      // Étape 6 : Durée bannière hero
      if(data.heroBannerDuration){
        try{
          save('heroBannerDuration',data.heroBannerDuration);
          importLog.push(`✅ Paramètres bannière hero`);
        }catch(err){
          importLog.push(`⚠️ Paramètres bannière - ${err.message}`);
        }
      }
      
      // Étape 7 : Ajouter les PHOTOS progressivement (c'est là qu'on peut échouer)
      let photosImported=0;
      let photosSkipped=0;
      
      // Fonction utilitaire pour limiter les save en attendre un peu
      async function saveWithDelay(key,value,delayMs=50){
        return new Promise((resolve)=>{
          setTimeout(()=>{
            try{
              save(key,value);
              resolve(true);
            }catch(err){
              resolve(false);
            }
          },delayMs);
        });
      }
      
      // Photos heroBanner
      if(data.heroBanner){
        try{
          const banners=load('heroBanner')||[];
          for(let bannerItem of data.heroBanner){
            if(bannerItem.src){
              const idx=banners.findIndex(b=>b.id===bannerItem.id);
              if(idx>=0){
                banners[idx].src=bannerItem.src;
                photosImported++;
              }
            }
          }
          await saveWithDelay('heroBanner',banners);
        }catch(err){
          photosSkipped+=data.heroBanner.filter(b=>b.src).length;
        }
      }
      
      // Photos d'équipe
      if(data.team){
        try{
          const team=load('team')||[];
          for(let teamMember of data.team){
            if(teamMember.photo){
              const idx=team.findIndex(t=>t.id===teamMember.id);
              if(idx>=0){
                team[idx].photo=teamMember.photo;
                photosImported++;
              }
            }
          }
          await saveWithDelay('team',team);
        }catch(err){
          photosSkipped+=data.team.filter(t=>t.photo).length;
        }
      }
      
      // Couvertures et photos d'événements (LA PARTIE CRITIQUE)
      // On va charger par batch (année par année) pour éviter de surcharger localStorage
      if(data.photoYears){
        try{
          const allYears=load('photoYears')||[];
          
          for(let sourceYear of data.photoYears){
            const yearIdx=allYears.findIndex(y=>y.id===sourceYear.id);
            
            if(yearIdx>=0){
              // Ajouter la couverture
              if(sourceYear.cover){
                allYears[yearIdx].cover=sourceYear.cover;
                photosImported++;
              }
              
              // Ajouter les photos d'événements (par année)
              if(sourceYear.events){
                let eventsWithPhotos=0;
                for(let sourceEvent of sourceYear.events){
                  if(allYears[yearIdx].events){
                    const eventIdx=allYears[yearIdx].events.findIndex(e=>e.id===sourceEvent.id);
                    if(eventIdx>=0 && sourceEvent.photos){
                      // S'assurer que photos est un tableau
                      if(!allYears[yearIdx].events[eventIdx].photos){
                        allYears[yearIdx].events[eventIdx].photos=[];
                      }
                      // Ajouter toutes les photos de cet événement
                      for(let photo of sourceEvent.photos){
                        allYears[yearIdx].events[eventIdx].photos.push(photo);
                        photosImported++;
                      }
                      eventsWithPhotos++;
                    }
                  }
                }
              }
            }
            
            // Sauvegarder CETTE ANNÉE (pas tout à la fois)
            await saveWithDelay('photoYears',allYears,100);
          }
        }catch(err){
          console.error('Erreur photos événements:',err);
          photosSkipped+=data.photoYears.reduce((sum,y)=>sum+(y.events||[]).reduce((es,e)=>es+(e.photos?.length||0),0),0);
        }
      }
      
      // Message final
      let summary=importLog.join('\\n');
      if(photosImported>0)summary+=`\\n✅ Photos importées: ${photosImported}`;
      if(photosSkipped>0)summary+=`\\n⚠️ Photos ignorées (espace insuffisant): ${photosSkipped}\\n\\n💡 Vous pouvez ajouter les photos manquantes manuellement`;
      
      alert(`✅ Import complété!\\n\\n${summary}`);
      
      // Refresh panels
      K.forEach(renderPanel);
      switchPanel('heroBanner');
    }catch(err){
      alert('❌ Erreur lors de l\'import:\\n\\n'+err.message);
    }
  };
  reader.readAsText(file);
  
  // Reset file input so same file can be imported again
  event.target.value='';
}

function resetDemo(){
  if(confirm('Réinitialiser toutes les données de la BD? (Cette action est irréversible)')){
    fetch(`${API_URL}/reset`, {method: 'POST'})
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(() => {
        // Clear in-memory cache
        K.forEach(k => dataCache[k] = []);
        dataCache.heroBannerDuration = 5;
        dataCache.theme = 'aucun';
        
        // Re-render all panels
        K.forEach(renderPanel);
        alert('✅ Toutes les données ont été supprimées.');
      })
      .catch(err => alert(`❌ Erreur lors de la réinitialisation: ${err.message}`));
  }
}

function saveProgramming(updates){
  const prog=load('programmation')||{facebookLink:'',calendarImage:''};
  Object.assign(prog,updates);
  
  console.log('💾 Saving programmation:', prog);
  return save('programmation',prog).then(success => {
    if (success) {
      // Update cache and re-render
      dataCache.programmation = prog;
      renderPanel('programmation');
      
      // Show success message
      const msg = document.querySelector('.save-message') || document.createElement('div');
      msg.className = 'save-message';
      msg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:6px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
      msg.textContent = '✅ Programmation sauvegardée!';
      if (!msg.parentNode) document.body.appendChild(msg);
      
      setTimeout(() => msg.remove(), 3000);
      return true;
    } else {
      alert('❌ Erreur lors de la sauvegarde. Vérifiez la console (F12) pour plus d\'informations.');
      return false;
    }
  });
}

function saveTheme(newTheme){
  save('theme',newTheme);
  applyThemeColors();
  renderPanel('theme');
}

function handleCalendarUpload(event){
  const file=event.target.files[0];
  if(!file)return;
  
  console.log('📤 Calendar upload started:', file.name, file.size, 'bytes');
  
  if(file.size>2*1024*1024){
    alert('❌ Fichier trop volumineux (max 2 MB)');
    console.error('File too large');
    return;
  }
  
  const reader=new FileReader();
  reader.onload=(e)=>{
    console.log('📖 File read complete, resizing image...');
    resizeImage(e.target.result,800,600).then(resized=>{
      console.log('🖼️ Image resized, saving to database...');
      saveProgramming({calendarImage:resized}).then(() => {
        console.log('✅ Calendar image saved and rendered');
        // Clear the input for next upload
        event.target.value = '';
      }).catch(err => {
        console.error('❌ Error saving calendar image:', err);
      });
    }).catch(err => {
      console.error('❌ Error resizing image:', err);
      alert('❌ Erreur lors du redimensionnement de l\'image');
    });
  };
  reader.readAsDataURL(file);
}

function getTotalStorageUsed(){
  // No longer using localStorage - return 0
  // DB stats are fetched via API
  return 0;
}

async function updateStorageIndicator(){
  const indicator=document.getElementById('storage-indicator');
  if(!indicator) return;
  
  try {
    const stats = await getDatabaseStats();
    if (!stats) {
      indicator.innerHTML = '<small style="color:#657089">Impossible de charger les stats BD</small>';
      return;
    }
    
    const used = parseFloat(stats.used_mb);
    const limit = stats.limit_mb;
    const percent = parseFloat(stats.percentage_used);
    const color = percent > 75 ? '#ef4444' : (percent > 50 ? '#f59e0b' : '#10b981');
    
    indicator.innerHTML = `
      <div style="font-size:12px;font-weight:600;color:#0c255f;margin-bottom:4px">💾 BD: ${used} MB / ${limit} MB (${percent}%)</div>
      <div style="width:100%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden">
        <div style="width:${percent}%;height:100%;background:${color};transition:all 0.3s ease"></div>
      </div>
    `;
  } catch (err) {
    indicator.innerHTML = '<small style="color:#999">Stats BD indisponibles</small>';
  }
}

function start(){
  console.log('🚀 Admin panel starting...');
  if(!logged()){
    console.log('❌ Not logged in');
    return showLogin();
  }
  
  console.log('✅ User logged in, initializing database...');
  
  // Load all data from database then render
  initializeFromDatabase()
    .then(() => {
      console.log('📊 Rendering panels...');
      try {
        applyThemeColors();
        K.forEach(k => {
          console.log(`📋 Rendering panel: ${k}`);
          renderPanel(k);
        });
        document.querySelectorAll('.admin-nav button[data-k]').forEach(b => {
          b.onclick = () => switchPanel(b.dataset.k);
        });
        updateStorageIndicator();
        setInterval(updateStorageIndicator, 1000);
        switchPanel('heroBanner');
        console.log('✅ Admin ready');
      } catch (err) {
        console.error('❌ Error during render:', err);
      }
    })
    .catch(err => {
      console.error('❌ Init failed:', err);
      alert('⚠️ Erreur lors du chargement des données. Vérifiez la console (F12) pour plus d\'informations.');
    });
}

document.addEventListener('DOMContentLoaded',start)
