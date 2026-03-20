const bsState=[null,null,null,null,null];

// Pour state: keyed by unique pour ID
// Bloom is fixed at key 'bloom', dynamic pours get numeric keys
const pourAgit = { bloom: null };
let pourCounter = 0;
const dynamicPourIds = []; // ordered list of active dynamic pour IDs
const DYNAMIC_POUR_NAMES = ['Second Pour','Third Pour','Fourth Pour'];
const MAX_DYNAMIC = 3;

function addPour(){
  if(dynamicPourIds.length >= MAX_DYNAMIC) return;
  const id = ++pourCounter;
  dynamicPourIds.push(id);
  pourAgit[id] = null;
  const name = DYNAMIC_POUR_NAMES[dynamicPourIds.length - 1];
  const container = document.getElementById('dynamic-pours');
  const div = document.createElement('div');
  div.id = 'pour-wrapper-' + id;
  div.innerHTML = `<div class="divider"></div><div class="pour-block">
    <div class="pour-name-row">
      <span class="pour-name">${name}</span>
      <button class="pour-remove" onclick="removePour(${id})">Remove</button>
    </div>
    <div class="pour-row">
      <div class="field"><label>Quantity (g)</label><input type="number" id="pd${id}-qty" placeholder="e.g. 60" step="0.1"/></div>
      <div class="field"><label>Water Temp</label><input type="text" id="pd${id}-temp" placeholder="e.g. 93°C"/></div>
      <div class="field"><label>Pour Type</label><input type="text" id="pd${id}-type" placeholder="Centre / Spiral…"/></div>
      <div class="field"><label>Time</label><input type="text" id="pd${id}-time" placeholder="e.g. 1:15"/></div>
      <div class="agit-wrap"><label>Agitation</label><div class="agit-btns">
        <button class="agit-btn" id="pd${id}-yes" onclick="setAgitD(${id},'Yes')">Yes</button>
        <button class="agit-btn" id="pd${id}-no"  onclick="setAgitD(${id},'No')">No</button>
      </div></div>
    </div>
  </div>`;
  container.appendChild(div);
  const wrap = document.getElementById('add-pour-wrap');
  if(dynamicPourIds.length >= MAX_DYNAMIC) wrap.style.display = 'none';
}

function removePour(id){
  const wrapper = document.getElementById('pour-wrapper-' + id);
  if(wrapper) wrapper.remove();
  const i = dynamicPourIds.indexOf(id);
  if(i > -1) dynamicPourIds.splice(i, 1);
  delete pourAgit[id];
  document.getElementById('add-pour-wrap').style.display = '';
}

function setAgitD(id, val){
  pourAgit[id] = val;
  ['yes','no'].forEach(v => {
    document.getElementById('pd'+id+'-'+v).classList.toggle('active', v === val.toLowerCase());
  });
}
const scores={sweetness:0,acidity:0,clarity:0,body:0,balance:0};
let difficulty=null;

function setAgit(key,val){
  pourAgit[key]=val;
  ['yes','no'].forEach(v=>{
    document.getElementById('p'+key+'-'+v).classList.toggle('active',v===val.toLowerCase());
  });
}
function setBs(i,val){
  bsState[i]=val;
  const map={yes:'sy',no:'sn',unsure:'su'};
  ['yes','no','un'].forEach(v=>{
    const btn=document.getElementById('bs'+i+'-'+v);
    const vkey=v==='un'?'unsure':v;
    btn.className='bs-btn'+(vkey===val.toLowerCase()?' '+map[vkey]:'');
  });
}
['sweetness','acidity','clarity','body','balance'].forEach(key=>{
  const wrap=document.getElementById('sc-'+key);
  for(let i=1;i<=5;i++){
    const b=document.createElement('button');
    b.className='cb';b.dataset.v=i;
    b.onclick=()=>setScore(key,i);
    wrap.appendChild(b);
  }
});
function setScore(key,val){
  scores[key]=val;
  document.getElementById('sc-'+key).querySelectorAll('.cb').forEach((b,i)=>{
    b.classList.toggle('on',i<val);
  });
  document.getElementById('sv-'+key).textContent=val+'/5';
}
function setDiff(val){
  difficulty=val;
  ['easy','moderate','technical'].forEach(v=>{
    document.getElementById('diff-'+v).classList.toggle('active',v===val.toLowerCase());
  });
}
document.getElementById('meta-date').valueAsDate=new Date();
const gv=id=>(document.getElementById(id)?.value||'').trim();

async function generateDocx(){
  const btn=document.querySelector(".dl-btn");
  const orig=btn.innerHTML;
  btn.textContent="Generating…";btn.disabled=true;
  try{
  const{Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,
        AlignmentType,BorderStyle,WidthType,ShadingType}=docx;
  const BD="0A0A0A",BM="222222",CL="222222",CM="272727",
        AC="F5F0E8",GT="888888",WH="F5F0E8",BC="2E2E2E",W=10080;
  const C1=2100,C2=2940,C3=2100,C4=2940;
  const bds=(c=BC,sz=4)=>({style:BorderStyle.SINGLE,size:sz,color:c});
  const nob=()=>({style:BorderStyle.NONE,size:0,color:"FFFFFF"});
  const n4=()=>({top:nob(),bottom:nob(),left:nob(),right:nob()});
  const uln=(c=AC)=>({top:nob(),left:nob(),right:nob(),bottom:bds(c,6)});
  const allb=(c=BC)=>({top:bds(c),bottom:bds(c),left:bds(c),right:bds(c)});
  const sp=(b=180)=>new Paragraph({spacing:{before:b,after:0},children:[new TextRun("")]});
  const run=(t,o={})=>new TextRun({text:(t===null||t===undefined)?'':String(t),font:"Arial",size:18,...o});

  function titleBlock(){
    return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[
      new TableRow({children:[new TableCell({borders:n4(),shading:{fill:BD,type:ShadingType.CLEAR},
        width:{size:W,type:WidthType.DXA},margins:{top:200,bottom:140,left:200,right:200},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[
          run("DRIP COFFEE ",{size:44,bold:true,color:WH}),
          run("BREW LOG",{size:44,bold:true,color:"F5F0E8"})
        ]})]})]}),
      new TableRow({children:[new TableCell({borders:n4(),shading:{fill:CM,type:ShadingType.CLEAR},
        width:{size:W,type:WidthType.DXA},margins:{top:80,bottom:80,left:200,right:200},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[
          run("Kappu  ·  Single Origin Tasting Notes",{size:20,color:BM,italics:true})
        ]})]})]}),
    ]});
  }
  function secHdr(text){
    return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[
      new TableRow({children:[new TableCell({
        borders:{top:nob(),left:bds(AC,12),right:nob(),bottom:nob()},
        shading:{fill:CL,type:ShadingType.CLEAR},
        width:{size:W,type:WidthType.DXA},margins:{top:80,bottom:80,left:160,right:160},
        children:[new Paragraph({children:[run(text.toUpperCase(),{bold:true,size:22,color:BM,characterSpacing:60})]})]
      })]})
    ]});
  }
  function fRow(label,value,w1=2600){
    const w2=W-w1;
    return new TableRow({children:[
      new TableCell({borders:n4(),width:{size:w1,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:120},
        children:[new Paragraph({children:[run(label,{bold:true,color:GT})]})] }),
      new TableCell({borders:uln(),width:{size:w2,type:WidthType.DXA},margins:{top:80,bottom:80,left:80,right:0},
        children:[new Paragraph({children:[run(value)]})] }),
    ]});
  }
  function pRow(l1,v1,l2,v2){
    return new TableRow({children:[
      new TableCell({borders:n4(),width:{size:C1,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:120},children:[new Paragraph({children:[run(l1,{bold:true,color:GT})]})] }),
      new TableCell({borders:uln(),width:{size:C2,type:WidthType.DXA},margins:{top:80,bottom:80,left:80,right:200},children:[new Paragraph({children:[run(v1)]})] }),
      new TableCell({borders:n4(),width:{size:C3,type:WidthType.DXA},margins:{top:80,bottom:80,left:100,right:120},children:[new Paragraph({children:[run(l2,{bold:true,color:GT})]})] }),
      new TableCell({borders:uln(),width:{size:C4,type:WidthType.DXA},margins:{top:80,bottom:80,left:80,right:0},children:[new Paragraph({children:[run(v2)]})] }),
    ]});
  }
  function singl(rows){return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2600,W-2600],rows});}
  function pair(rows){return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[C1,C2,C3,C4],rows});}

  const PC=[Math.round(W/5),Math.round(W/5),Math.round(W/5),Math.round(W/5),W-4*Math.round(W/5)];
  const PH=["Quantity","Water Temp","Pour Type","Time","Agitation"];
  function pourBlock(label,data){
    const lr=new TableRow({children:[new TableCell({columnSpan:5,borders:n4(),shading:{fill:CL,type:ShadingType.CLEAR},
      width:{size:W,type:WidthType.DXA},margins:{top:80,bottom:60,left:140,right:140},
      children:[new Paragraph({children:[run(label,{size:18,bold:true,color:BM})]})]})]});
    const hr=new TableRow({children:PH.map((h,i)=>new TableCell({
      borders:{top:nob(),left:nob(),right:nob(),bottom:bds(AC,4)},
      width:{size:PC[i],type:WidthType.DXA},margins:{top:40,bottom:40,left:i===0?140:60,right:60},
      children:[new Paragraph({children:[run(h,{size:16,color:GT,italics:true})]})] }))});
    const vals=[data.qty,data.temp,data.type,data.time,data.agit||''];
    const vr=new TableRow({children:vals.map((v,i)=>new TableCell({
      borders:{top:nob(),left:nob(),right:nob(),bottom:bds(BC,3)},
      width:{size:PC[i],type:WidthType.DXA},margins:{top:60,bottom:80,left:i===0?140:60,right:60},
      children:[new Paragraph({children:[run(v,{size:18})]})] }))});
    return[lr,hr,vr];
  }
  function chkRow(q,ans){
    const qW=Math.round(W*.64),aW=W-qW;
    return new TableRow({children:[
      new TableCell({borders:n4(),width:{size:qW,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:80},children:[new Paragraph({children:[run(q,{color:GT})]})] }),
      new TableCell({borders:n4(),width:{size:aW,type:WidthType.DXA},margins:{top:80,bottom:80,left:60,right:0},children:[new Paragraph({children:[run(ans||'—',{color:BM})]})] }),
    ]});
  }
  function phHdr(text){
    return new TableRow({children:[new TableCell({columnSpan:2,borders:n4(),shading:{fill:CM,type:ShadingType.CLEAR},
      width:{size:W,type:WidthType.DXA},margins:{top:100,bottom:80,left:140,right:140},
      children:[new Paragraph({children:[run(text,{size:18,bold:true,color:BM})]})]})]});
  }
  function scoreRow(label,val){
    const lW=2800,rW=W-2800;
    const circles=Array.from({length:5},(_,i)=>run(i<val?'●':'○',{size:24,color:AC}));
    return new TableRow({children:[
      new TableCell({borders:n4(),width:{size:lW,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:80},children:[new Paragraph({children:[run(label,{size:18,bold:true,color:GT})]})]}),
      new TableCell({borders:n4(),width:{size:rW,type:WidthType.DXA},margins:{top:70,bottom:70,left:0,right:0},children:[new Paragraph({children:[...circles,run(val>0?'   '+val+'/5':'',{size:16,color:GT})]})]}),
    ]});
  }
  function moodCell(text,active){
    const cW=Math.round(W/3);
    return new TableCell({borders:allb(BC),shading:{fill:active?"F5F0E8":"161616",type:ShadingType.CLEAR},
      width:{size:cW,type:WidthType.DXA},margins:{top:100,bottom:100,left:80,right:80},
      children:[new Paragraph({alignment:AlignmentType.CENTER,children:[run(text,{size:18,color:active?"0A0A0A":GT})]})]});
  }

  // Collect only active pours
  // Collect pour data: bloom first, then dynamic pours in order
  const pourLabels = ['Bloom / First Pour', ...DYNAMIC_POUR_NAMES.slice(0, dynamicPourIds.length)];
  const pourData = [
    { qty:gv('p0-qty'), temp:gv('p0-temp'), type:gv('p0-type'), time:gv('p0-time'), agit:pourAgit['bloom']||'' },
    ...dynamicPourIds.map(id => ({
      qty:gv('pd'+id+'-qty'), temp:gv('pd'+id+'-temp'), type:gv('pd'+id+'-type'), time:gv('pd'+id+'-time'), agit:pourAgit[id]||''
    }))
  ];
  const bsQ=["Did the bed dome?","Was bloom aggressive?","Was drawdown fast or choked?","Any channeling?","Any agitation used?"];
  const moodOrder=["Rainy day","Quiet day","Reset / Recovery","Creative day","Momentum / Work","Long Conversation"];
  const activeMoods=new Set([...document.querySelectorAll('.mood-btn.active')].map(b=>b.textContent.trim()));
  const dateVal=gv('meta-date')||new Date().toISOString().slice(0,10);

  const doc2=new Document({
    styles:{default:{document:{run:{font:"Arial",size:20}}}},
    sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1080,bottom:1080,left:1080}}},
    children:[
      titleBlock(),sp(240),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[Math.floor(W/2),W-Math.floor(W/2)],rows:[new TableRow({children:[
        new TableCell({borders:uln(),width:{size:Math.floor(W/2),type:WidthType.DXA},margins:{top:60,bottom:60,left:0,right:200},children:[new Paragraph({children:[run("Date:  "+dateVal,{color:GT,bold:true})]})]}),
        new TableCell({borders:uln(),width:{size:W-Math.floor(W/2),type:WidthType.DXA},margins:{top:60,bottom:60,left:100,right:0},children:[new Paragraph({children:[run("Barista:  "+gv('meta-barista'),{color:GT,bold:true})]})]})
      ]})]
      }),sp(260),
      secHdr("01 · Coffee Identity"),sp(120),
      singl([fRow("Coffee Name",gv('ci-name')),fRow("Roaster",gv('ci-roaster')),fRow("Origin",gv('ci-origin')),fRow("Roaster's Tasting Notes",gv('ci-tasting-notes'))]),
      sp(60),
      pair([pRow("Altitude",gv('ci-altitude'),"Process",gv('ci-process')),pRow("Variety",gv('ci-variety'),"Roast Level",gv('ci-roast-level')),pRow("Roast Date",gv('ci-roast-date'),"Days Rested",gv('ci-rested'))]),
      sp(260),
      secHdr("02 · Brew Tech"),sp(120),
      pair([pRow("Brewer",gv('bt-brewer'),"Filter Type",gv('bt-filter')),pRow("Dose (g)",gv('bt-dose'),"Water (g)",gv('bt-water')),pRow("Ratio",gv('bt-ratio'),"Grind Size",gv('bt-grind'))]),
      sp(80),
      singl([fRow("Total Brew Time",gv('bt-brew-time')), fRow("Brew Type", brewType==='iced'?'Iced':'Hot')]),
      ...(brewType==='iced' ? [
        sp(60),
        pair([pRow("Ice in Carafe (g)",gv('bt-ice-carafe'),"Ice in Serving Glass (g)",gv('bt-ice-glass'))]),
      ] : []),
      sp(100),
      new Paragraph({spacing:{before:60,after:60},children:[run("POURS",{size:18,bold:true,color:GT,characterSpacing:60})]}),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:PC,
        rows:pourData.flatMap((d,i)=>pourBlock(pourLabels[i],d))
      }),sp(260),
      secHdr("03 · Brew Story"),sp(120),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[Math.round(W*.64),Math.round(W*.36)],rows:bsQ.map((q,i)=>chkRow(q,bsState[i]))}),
      sp(260),
      secHdr("04 · Sensory Test"),sp(120),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2600,W-2600],rows:[
        phHdr("Hot Phase  (0 – 30 seconds)"),
        fRow("First Aroma",gv('st-aroma')),fRow("Immediate Taste",gv('st-taste')),fRow("Texture",gv('st-texture')),
        phHdr("Warm Phase  (30 sec – 3 mins)"),
        fRow("Dominant Note",gv('st-dominant')),fRow("Acidity Quality",gv('st-acidity')),fRow("Sweetness",gv('st-sweetness')),fRow("Aftertaste",gv('st-aftertaste')),
        phHdr("Cooling Phase  (3+ mins)"),
        fRow("New Notes Appeared",gv('st-new-notes')),fRow("Bitterness Change",gv('st-bitterness')),fRow("Structure Shift",gv('st-structure')),
      ]}),sp(260),
      secHdr("05 · Flavour Notes"),sp(120),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[
        new TableRow({children:[new TableCell({borders:{top:nob(),left:nob(),right:nob(),bottom:bds(BC,3)},width:{size:W,type:WidthType.DXA},margins:{top:60,bottom:100,left:0,right:0},children:[new Paragraph({children:[run(gv('flavour'),{size:18})]})]})]})  ,
        new TableRow({children:[new TableCell({borders:{top:nob(),left:nob(),right:nob(),bottom:bds(BC,3)},width:{size:W,type:WidthType.DXA},margins:{top:60,bottom:100,left:0,right:0},children:[new Paragraph({children:[run("")]})]})]})  ,
        new TableRow({children:[new TableCell({borders:{top:nob(),left:nob(),right:nob(),bottom:bds(BC,3)},width:{size:W,type:WidthType.DXA},margins:{top:60,bottom:100,left:0,right:0},children:[new Paragraph({children:[run("")]})]})]}),
      ]}),sp(260),
      secHdr("06 · Kappu Score"),sp(120),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[2800,W-2800],rows:[
        scoreRow("Sweetness",scores.sweetness),scoreRow("Acidity Quality",scores.acidity),
        scoreRow("Clarity",scores.clarity),scoreRow("Body",scores.body),scoreRow("Balance",scores.balance),
        new TableRow({children:[
          new TableCell({borders:n4(),width:{size:2800,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:80},children:[new Paragraph({children:[run("Brew Difficulty",{size:18,bold:true,color:GT})]})]}),
          new TableCell({borders:n4(),width:{size:W-2800,type:WidthType.DXA},margins:{top:70,bottom:70,left:0,right:0},children:[new Paragraph({children:[run(difficulty||'—',{size:18,color:BM})]})]}),
        ]}),
      ]}),sp(260),
      secHdr("07 · Mood Pairing"),sp(80),
      new Paragraph({spacing:{before:60,after:100},children:[run("Circle the mood this cup fits:",{size:17,color:GT,italics:true})]}),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[Math.round(W/3),Math.round(W/3),W-2*Math.round(W/3)],rows:[
        new TableRow({children:[moodCell(moodOrder[0],activeMoods.has(moodOrder[0])),moodCell(moodOrder[1],activeMoods.has(moodOrder[1])),moodCell(moodOrder[2],activeMoods.has(moodOrder[2]))]}),
        new TableRow({children:[moodCell(moodOrder[3],activeMoods.has(moodOrder[3])),moodCell(moodOrder[4],activeMoods.has(moodOrder[4])),moodCell(moodOrder[5],activeMoods.has(moodOrder[5]))]}),
      ]}),sp(300),
      new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({children:[new TableCell({
        borders:{top:bds(CM,6),bottom:nob(),left:nob(),right:nob()},
        width:{size:W,type:WidthType.DXA},margins:{top:100,bottom:60,left:0,right:0},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[run("Kappu  ·  Every cup tells a story",{size:16,color:AC,italics:true})]})]
      })]})]}),
    ]}]
  });

  const blob=await docx.Packer.toBlob(doc2);
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const slug=(gv('ci-name')||'brew').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const date=(gv('meta-date')||new Date().toISOString().slice(0,10)).replace(/-/g,'');
  a.href=url;a.download='kappu-'+slug+'-'+date+'.docx';a.click();
  URL.revokeObjectURL(url);
  } catch(e){console.error(e);alert("Error generating file: "+e.message);}
  finally{btn.innerHTML=orig;btn.disabled=false;}
}
// ── Section nav scroll tracking ───────────────────────────────────
function scrollToSection(id){
  const el=document.getElementById(id);
  if(!el) return;
  const navH=document.getElementById('section-nav').offsetHeight;
  const top=el.getBoundingClientRect().top+window.scrollY-navH-8;
  window.scrollTo({top,behavior:'smooth'});
}

(function(){
  const ids=['meta','s01','s02','s03','s04','s05','s06','s07'];
  const navItems=document.querySelectorAll('.nav-item');
  const navBar=document.getElementById('section-nav');

  function update(){
    const navH=navBar.offsetHeight;
    let current=ids[0];
    ids.forEach(id=>{
      const el=document.getElementById(id);
      if(el && el.getBoundingClientRect().top<=navH+32) current=id;
    });
    navItems.forEach((item,i)=>{
      const active=ids[i]===current;
      item.classList.toggle('active',active);
      if(active){
        // scroll nav item into view within the bar
        const bar=navBar.querySelector('.nav-inner');
        const itemLeft=item.offsetLeft;
        const itemW=item.offsetWidth;
        const barW=bar.offsetWidth;
        if(itemLeft<bar.scrollLeft || itemLeft+itemW>bar.scrollLeft+barW){
          bar.scrollTo({left:itemLeft-barW/2+itemW/2,behavior:'smooth'});
        }
      }
    });
  }
  window.addEventListener('scroll',update,{passive:true});
  update();
})();

// ── Brew ratio auto-calculator ─────────────────────────────────────
// Ratio format: "1:16" or just "16" (treated as 1:N)
// ── Days Rested auto-calculator ────────────────────────────────────
function calcDaysRested(){
  const roastDate = document.getElementById('ci-roast-date').value;
  if(!roastDate) return;
  const roast = new Date(roastDate);
  const today = new Date();
  today.setHours(0,0,0,0);
  const diff = Math.floor((today - roast) / (1000*60*60*24));
  if(diff >= 0){
    document.getElementById('ci-rested').value = diff;
  }
}
// Run on load in case date is pre-filled
calcDaysRested();

function calcBrew(changed){
  const doseEl  = document.getElementById('bt-dose');
  const waterEl = document.getElementById('bt-water');
  const ratioEl = document.getElementById('bt-ratio');

  const dose  = parseFloat(doseEl.value);
  const water = parseFloat(waterEl.value);
  const ratioRaw = ratioEl.value.trim();

  // Parse ratio string -> multiplier (e.g. "1:16" or "16" -> 16)
  function parseRatio(str){
    if(!str) return null;
    if(str.includes(':')){
      const parts = str.split(':');
      const a = parseFloat(parts[0]), b = parseFloat(parts[1]);
      if(!isNaN(a) && !isNaN(b) && a>0) return b/a;
    } else {
      const n = parseFloat(str);
      if(!isNaN(n) && n>0) return n;
    }
    return null;
  }

  const ratio = parseRatio(ratioRaw);

  if(changed === 'dose' || changed === 'water'){
    // Both dose and water filled -> calculate ratio
    if(!isNaN(dose) && dose > 0 && !isNaN(water) && water > 0){
      const r = water / dose;
      ratioEl.value = '1:' + r.toFixed(1);
    }
  } else if(changed === 'ratio'){
    // Ratio changed: if dose filled -> calculate water
    if(ratio !== null && !isNaN(dose) && dose > 0){
      waterEl.value = (dose * ratio).toFixed(1);
    }
    // Ratio changed: if water filled but no dose -> calculate dose
    else if(ratio !== null && !isNaN(water) && water > 0 && (isNaN(dose) || dose <= 0)){
      doseEl.value = (water / ratio).toFixed(1);
    }
  }
}

// ── Brew type toggle ───────────────────────────────────────────────
let brewType = 'hot';
function setBrewType(type){
  brewType = type;
  document.getElementById('bt-hot').classList.toggle('active', type === 'hot');
  document.getElementById('bt-iced').classList.toggle('active', type === 'iced');
  document.getElementById('ice-fields').classList.toggle('visible', type === 'iced');
}

// ── Import / Export ────────────────────────────────────────────────

const EXPORT_SECTIONS = [
  { key: 'meta',     label: 'Date & Barista' },
  { key: 'identity', label: '01 · Coffee Identity' },
  { key: 'brewtech', label: '02 · Brew Tech' },
  { key: 'pours',    label: '02 · Pours' },
  { key: 'story',    label: '03 · Brew Story' },
  { key: 'sensory',  label: '04 · Sensory Test' },
  { key: 'flavour',  label: '05 · Flavour Notes' },
  { key: 'score',    label: '06 · Kappu Score' },
  { key: 'mood',     label: '07 · Mood Pairing' },
];

function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if(e.target === el) el.classList.remove('open'); });
});

function openExportModal(){
  const list = document.getElementById('export-section-list');
  list.innerHTML = '';
  EXPORT_SECTIONS.forEach(s => {
    const row = document.createElement('label');
    row.className = 'modal-check';
    row.innerHTML = `<input type="checkbox" data-key="${s.key}"/><div class="modal-check-box"><div class="modal-check-tick"></div></div><span class="modal-check-label">${s.label}</span>`;
    row.addEventListener('click', () => {
      const cb = row.querySelector('input');
      cb.checked = !cb.checked;
      row.classList.toggle('selected', cb.checked);
    });
    list.appendChild(row);
  });
  // Pre-fill filename from coffee name + date
  const date = (gv('meta-date')||new Date().toISOString().slice(0,10)).replace(/-/g,'');
  const slug = (gv('ci-name')||'brew').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  document.getElementById('export-filename').value = `kappu-${slug}-${date}`;
  openModal('export-modal');
}

function collectData(){
  const bsLabels = ['Did the bed dome?','Was bloom aggressive?','Drawdown','Any channeling?','Any agitation used?'];
  return {
    meta:     { date: gv('meta-date'), barista: gv('meta-barista') },
    identity: {
      coffeeName:   gv('ci-name'),
      roaster:      gv('ci-roaster'),
      origin:       gv('ci-origin'),
      altitude:     gv('ci-altitude'),
      process:      gv('ci-process'),
      variety:      gv('ci-variety'),
      roastLevel:   gv('ci-roast-level'),
      roastDate:    gv('ci-roast-date'),
      daysRested:   gv('ci-rested'),
      tastingNotes: gv('ci-tasting-notes'),
    },
    brewtech: {
      brewer:    gv('bt-brewer'),
      filter:    gv('bt-filter'),
      dose:      gv('bt-dose'),
      water:     gv('bt-water'),
      ratio:     gv('bt-ratio'),
      grindSize: gv('bt-grind'),
      brewTime:  gv('bt-brew-time'),
      brewType:  brewType,
      iceCarafe: gv('bt-ice-carafe'),
      iceGlass:  gv('bt-ice-glass'),
    },
    pours: {
      bloom: { qty:gv('p0-qty'), temp:gv('p0-temp'), type:gv('p0-type'), time:gv('p0-time'), agit:pourAgit['bloom']||'' },
      dynamic: dynamicPourIds.map(id => ({
        id, qty:gv('pd'+id+'-qty'), temp:gv('pd'+id+'-temp'),
        type:gv('pd'+id+'-type'), time:gv('pd'+id+'-time'), agit:pourAgit[id]||''
      }))
    },
    story: Object.fromEntries(bsLabels.map((q,i) => [q, bsState[i]])),
    sensory: {
      aroma:      gv('st-aroma'),
      taste:      gv('st-taste'),
      texture:    gv('st-texture'),
      dominant:   gv('st-dominant'),
      acidity:    gv('st-acidity'),
      sweetness:  gv('st-sweetness'),
      aftertaste: gv('st-aftertaste'),
      newNotes:   gv('st-new-notes'),
      bitterness: gv('st-bitterness'),
      structure:  gv('st-structure'),
    },
    flavour: { notes: gv('flavour') },
    score: { ...scores, difficulty },
    mood: [...document.querySelectorAll('.mood-btn.active')].map(b => b.textContent.trim()),
  };
}

function doExport(){
  const selected = new Set(
    [...document.querySelectorAll('#export-section-list input:checked')].map(i => i.dataset.key)
  );
  const all = collectData();
  const out = {};
  selected.forEach(k => { if(all[k] !== undefined) out[k] = all[k]; });
  out._exported = new Date().toISOString();
  out._version = '1.0';

  const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const rawName = document.getElementById('export-filename').value.trim();
  const filename = (rawName || 'kappu-export').replace(/\.json$/,'').replace(/[^a-zA-Z0-9_\-]/g,'-');
  a.href = url; a.download = `${filename}.json`; a.click();
  URL.revokeObjectURL(url);
  closeModal('export-modal');
}

// ── Import ──────────────────────────────────────────────────────────
function handleImportFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      applyImport(data);
      closeModal('import-modal');
    } catch(err) {
      alert('Invalid JSON file. Please use a Kappu export file.');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset so same file can be re-imported
}

// Drag and drop on import drop zone
document.getElementById('import-drop').addEventListener('dragover', e => {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--accent)';
});
document.getElementById('import-drop').addEventListener('dragleave', e => {
  e.currentTarget.style.borderColor = '#2E2E2E';
});
document.getElementById('import-drop').addEventListener('drop', e => {
  e.preventDefault();
  e.currentTarget.style.borderColor = '#2E2E2E';
  const file = e.dataTransfer.files[0];
  if(file){ const ev = {target:{files:[file],value:''}}; handleImportFile(ev); }
});

function setVal(id, val){ const el=document.getElementById(id); if(el && val!==undefined && val!==null) el.value=val; }

function applyImport(data){
  if(data.meta){
    setVal('meta-date', data.meta.date);
    setVal('meta-barista', data.meta.barista);
  }
  if(data.identity){
    const d = data.identity;
    setVal('ci-name', d.coffeeName); setVal('ci-roaster', d.roaster);
    setVal('ci-origin', d.origin); setVal('ci-altitude', d.altitude);
    setVal('ci-process', d.process); setVal('ci-variety', d.variety);
    setVal('ci-roast-level', d.roastLevel); setVal('ci-roast-date', d.roastDate);
    setVal('ci-tasting-notes', d.tastingNotes);
    calcDaysRested();
  }
  if(data.brewtech){
    const d = data.brewtech;
    setVal('bt-brewer', d.brewer); setVal('bt-filter', d.filter);
    setVal('bt-dose', d.dose); setVal('bt-water', d.water);
    setVal('bt-ratio', d.ratio); setVal('bt-grind', d.grindSize);
    setVal('bt-brew-time', d.brewTime);
    if(d.brewType) setBrewType(d.brewType);
    setVal('bt-ice-carafe', d.iceCarafe); setVal('bt-ice-glass', d.iceGlass);
  }
  if(data.pours){
    const p = data.pours;
    if(p.bloom){
      setVal('p0-qty', p.bloom.qty); setVal('p0-temp', p.bloom.temp);
      setVal('p0-type', p.bloom.type); setVal('p0-time', p.bloom.time);
      if(p.bloom.agit) setAgit('bloom', p.bloom.agit);
    }
    if(p.dynamic && p.dynamic.length){
      // Remove existing dynamic pours first
      dynamicPourIds.slice().forEach(id => removePour(id));
      p.dynamic.forEach(pd => {
        addPour();
        const id = dynamicPourIds[dynamicPourIds.length-1];
        setVal('pd'+id+'-qty', pd.qty); setVal('pd'+id+'-temp', pd.temp);
        setVal('pd'+id+'-type', pd.type); setVal('pd'+id+'-time', pd.time);
        if(pd.agit) setAgitD(id, pd.agit);
      });
    }
  }
  if(data.story){
    const bsLabels = ['Did the bed dome?','Was bloom aggressive?','Drawdown','Any channeling?','Any agitation used?'];
    bsLabels.forEach((q,i) => { if(data.story[q]) setBs(i, data.story[q]); });
  }
  if(data.sensory){
    const d = data.sensory;
    setVal('st-aroma', d.aroma); setVal('st-taste', d.taste); setVal('st-texture', d.texture);
    setVal('st-dominant', d.dominant); setVal('st-acidity', d.acidity); setVal('st-sweetness', d.sweetness);
    setVal('st-aftertaste', d.aftertaste); setVal('st-new-notes', d.newNotes);
    setVal('st-bitterness', d.bitterness); setVal('st-structure', d.structure);
  }
  if(data.flavour) setVal('flavour', data.flavour.notes);
  if(data.score){
    const d = data.score;
    ['sweetness','acidity','clarity','body','balance'].forEach(k => {
      if(d[k]) setScore(k, d[k]);
    });
    if(d.difficulty) setDiff(d.difficulty);
  }
  if(data.mood && data.mood.length){
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('active', data.mood.includes(btn.textContent.trim()));
    });
  }
}

function printPDF(){
  window.print();
}