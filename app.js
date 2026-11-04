const ideaProducts = [
  {id:'ipad',category:'tech',name:'Apple iPad 10.2-inch (Renewed)',description:'The linked listing is for an Apple iPad, Wi-Fi, 32GB, in Space Gray, sold as Renewed. Check the current offer before choosing.',url:'https://link.amazon/B0a3QvkJ6',checks:['Confirm that the selected offer is the 10.2-inch, Wi-Fi, 32GB Space Gray model you want.','Read the current seller’s condition description, battery information, included accessories, return policy, and coverage terms.','Check current app and operating-system compatibility with Apple and your must-have app providers before buying.'],fit:'Consider the storage you need and the condition you are comfortable buying. This is a linked product selection, not a hands-on review.'},
  {id:'jars',category:'home',name:'Glass pantry jars',description:'For turning the everyday shelf into a space that feels a little more intentional.',checks:['Measure shelf height and depth, including room to lift the lid.','Compare opening width with the utensils you use for scooping.','Check the listing for lid seal, cleaning instructions, and included jar sizes.'],fit:'Start with the ingredients you reach for most, rather than buying a large matching set first.'},
  {id:'drawers',category:'home',name:'Adjustable drawer organizers',description:'A starting point for the catch-all drawer that has collected a little of everything.',checks:['Measure the usable interior, not the outside of the drawer.','Check both the minimum and maximum extension dimensions.','Consider whether removable compartments or dividers suit your utensils better.'],fit:'Lay out the items you want to keep before deciding on a layout.'},
  {id:'beauty-tray',category:'beauty',name:'A daily-routine organizer',description:'A dedicated home for the beauty tools and essentials you actually reach for.',checks:['Measure the counter or shelf space you can comfortably spare.','Compare compartment height with your tallest bottles and tools.','Check whether trays can be removed for cleaning.'],fit:'Choose space for your current routine, not an imaginary collection of new products.'},
  {id:'pillowcase',category:'beauty',name:'A satin pillowcase',description:'A small bedroom detail to consider when refreshing your evening routine.',checks:['Check the actual fiber composition; satin describes a weave, not a fiber.','Match the listed dimensions to your pillow size.','Read the care label and consider a closure style you prefer.'],fit:'Choose for texture, fit, and care preferences. This is not a medical or skin-treatment recommendation.'},
  {id:'phone-stand',category:'tech',name:'An adjustable phone stand',description:'A simple place to keep your screen while you cook, work, or catch up.',checks:['Confirm compatibility with your phone size and case thickness.','Check the viewing-angle range and whether a cable can connect while seated.','Compare the base footprint with the space on your desk or counter.'],fit:'A stand does not necessarily include charging. Check the exact listing before ordering.'},
  {id:'cable-clips',category:'tech',name:'Desk cable organizers',description:'An idea for keeping the cables you use within reach and off the floor.',checks:['Check the supported cable diameter and the number of slots.','Compare the mounting method with your desk surface.','Review adhesive instructions and removal guidance before applying.'],fit:'Count your daily cables first, then choose the smallest organizer that suits your setup.'}
];
const catalog=window.EVERYDAY_CATALOG;
const priorIpad=ideaProducts.find(p=>p.id==='ipad');
const products=[
 ...catalog.entries.map(entry=>({
  ...entry,
  id:entry.code==='B0a3QvkJ6'?'ipad':`amazon-${entry.code}`,
  name:entry.displayName,
  description:entry.description||(entry.positions[0]===284?'Pasta roller/cutter attachments only. The stand mixer shown in the photo is not included.':entry.verified?'See the original Amazon listing for the exact selection and current details.':'Product details could not be confirmed. Check the original Amazon link before choosing.'),
  checks:entry.code==='B0a3QvkJ6'?priorIpad.checks:['Confirm the exact item, variant, seller, and condition shown on the destination page.','Review current pricing, delivery details, return policy, and any subscription or eligibility terms.','Check dimensions, compatibility, safety information, or age guidance where relevant.'],
  fit:entry.code==='B0a3QvkJ6'?priorIpad.fit:'Start with what fits your needs and budget. This link is supplied by the site owner; it is not a claim of hands-on testing or an independent endorsement.'
 })),
 ...ideaProducts.filter(p=>!p.url)
];
const labels={home:'HOME & KITCHEN',beauty:'BEAUTY & SELF-CARE',tech:'EVERYDAY TECH',more:'MORE FINDS'};
const grid=document.querySelector('#products'),search=document.querySelector('#search'),dialog=document.querySelector('#detail');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active='all',currentPage=1;
const pageSize=12;
const ageFilter=document.querySelector('#age-filter'),typeFilter=document.querySelector('#type-filter'),statusFilter=document.querySelector('#status-filter'),sortFilter=document.querySelector('#sort-filter');
function audiences(product){
 if(!product.verified)return [];
 const title=normalizeSearch(product.title);
 const groups=[];
 if(/\b(baby|babies|toddler|toddlers|infant|infants)\b/.test(title))groups.push('baby');
 if(/\b(kids|kid|children|childrens|child|boys|girls)\b/.test(title))groups.push('kids');
 if(/\b(teen|teens|teenage|teenager|teenagers)\b/.test(title))groups.push('teens');
 if(/\b(adult|adults|men|mens|women|womens)\b/.test(title))groups.push('adults');
 return groups;
}
const audienceLabels={baby:'Baby / toddler',kids:'Kids',teens:'Teens',adults:'Adults'};
function listedAges(product){
 if(!product.verified)return null;
 const text=normalizeSearch(product.title);
 const range=text.match(/\b(?:ages?|kids)\s+(\d{1,2})\s+(\d{1,2})\b/)||text.match(/\b(\d{1,2})\s+(\d{1,2})\s*(?:yrs|years|year old)\b/);
 if(range&&Number(range[1])<=Number(range[2]))return [Number(range[1]),Number(range[2])];
 // This listing spells out "3 4 5 6 7 8 Year Old" rather than a range.
 if(product.positions?.[0]===126)return [3,8];
 const open=product.title.match(/\bage[s]?\s+(\d{1,2})\s*(?:\+|and\s+up)/i);
 return open?[Number(open[1]),Infinity]:null;
}
function matchesAge(product){
 if(ageFilter.value==='all')return true;
 if(ageFilter.value.startsWith('age-')){
  const [,low,high]=ageFilter.value.split('-').map(Number),range=listedAges(product);
  return !!range&&range[0]<=high&&range[1]>=low;
 }
 const audience=audiences(product);
 return ageFilter.value==='unspecified'?audience.length===0&&!listedAges(product):audience.includes(ageFilter.value);
}
function productPhoto(product,large=false){
 const image=window.EVERYDAY_PRODUCT_MEDIA?.[product.code]?.local;
 const cls=large?'dialog-product-photo':'product-thumbnail';
 return image?`<img class="${cls}" src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}" loading="lazy" decoding="async" data-product-photo>`:'';
}
function listingStatus(product){
 if(!product.verified)return product.destinationKind==='store'?'Store name not confirmed':'Details not confirmed';
 return {category:'Category collection',service:'Service page'}[product.destinationKind]||'Listing identified';
}
const normalizeSearch=value=>String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const typeDefinitions=window.EVERYDAY_PRODUCT_TYPES;
for(const type of [...typeDefinitions].sort((a,b)=>a.label.localeCompare(b.label))){
 const option=document.createElement('option');option.value=type.label;option.textContent=type.label;typeFilter.append(option);
}
const brandedTypes=[
 {label:'Phones',aliases:['iphone','iphones'],required:'iphone'},
 {label:'Tablets',aliases:['ipad','ipads'],required:'ipad'},
 {label:'Earbuds',aliases:['airpod','airpods'],required:'airpods'}
];
const typeAliases=[
 ...typeDefinitions.flatMap(type=>type.aliases.map(alias=>({type,alias:normalizeSearch(alias)}))),
 ...brandedTypes.flatMap(brand=>brand.aliases.map(alias=>({type:typeDefinitions.find(type=>type.label===brand.label),alias,required:brand.required})))
].sort((a,b)=>b.alias.length-a.alias.length);
function searchIntent(query){
 const normalized=normalizeSearch(query);
 const match=typeAliases.find(({alias})=>(` ${normalized} `).includes(` ${alias} `));
 if(!match)return null;
 const types=typeAliases.filter(row=>row.alias===match.alias).map(row=>row.type);
 const remainder=(` ${normalized} `).replace(` ${match.alias} `,' ').trim();
 return {types,label:types.length===1?types[0].label:match.alias[0].toUpperCase()+match.alias.slice(1),words:[...remainder.split(' ').filter(Boolean),...(match.required?[match.required]:[])]};
}
function matchesSearch(product,query,numeric,intent){
 if(!query)return true;
 if(numeric)return product.positions?.includes(Number(numeric[1]));
 if(intent){
  // Type membership is explicit: a phone case must never match a phone search.
  if(!product.verified||!intent.types.some(type=>type.positions.includes(product.positions?.[0])))return false;
  const title=normalizeSearch(`${product.name} ${product.title||''}`);
  return intent.words.every(word=>(` ${title} `).includes(` ${word} `));
 }
 const text=normalizeSearch(`${product.name} ${product.title||''} ${labels[product.category]} ${product.code||''} ${product.url||''}`);
 return normalizeSearch(query).split(' ').every(word=>text.includes(word));
}
function render(){
 const query=search.value.trim().toLowerCase();
 const numeric=query.match(/^#?(\d+)$/);
 const intent=numeric?null:searchIntent(query);
 const results=products.filter(p=>{
  const inCategory=active==='ideas'?!p.url:p.url&&(active==='all'||p.category===active);
  const matches=matchesSearch(p,query,numeric,intent);
  const matchesType=typeFilter.value==='all'||(p.verified&&typeDefinitions.find(type=>type.label===typeFilter.value)?.positions.includes(p.positions?.[0]));
  const matchesStatus=statusFilter.value==='all'||(statusFilter.value==='identified'?p.verified:p.url&&!p.verified);
  return inCategory&&matches&&matchesAge(p)&&matchesType&&matchesStatus;
 });
 if(sortFilter.value!=='original')results.sort((a,b)=>(sortFilter.value==='az'?1:-1)*a.name.localeCompare(b.name,undefined,{numeric:true}));
 const pages=Math.max(1,Math.ceil(results.length/pageSize));
 currentPage=Math.min(currentPage,pages);
 const start=(currentPage-1)*pageSize,visible=results.slice(start,start+pageSize);
 grid.innerHTML=visible.map(p=>`<article class="product-card${p.url?' catalog-card':''}"><div class="product-head"><span class="eyebrow">${labels[p.category]}</span><span class="product-number">${p.url?'#'+String(p.positions[0]).padStart(3,'0'):'IDEA'}</span></div>${p.url?`<span class="listing-status">${listingStatus(p)}</span>`:''}<div class="product-identity">${p.url?productPhoto(p):''}<h3>${escapeHTML(p.name)}</h3></div>${p.url?`<span class="audience-tag">${audiences(p).length?'Listing audience: '+audiences(p).map(a=>audienceLabels[a]).join(', '):'Age / audience not specified'}</span>`:''}<p>${escapeHTML(p.description)}</p>${p.url?`<a class="button shop-link" href="${p.url}" target="_blank" rel="sponsored noopener noreferrer">Link to Amazon <span aria-hidden="true">↗</span></a><span class="pending">Paid link. We may earn a commission.</span>`:''}<button class="notes" data-product="${p.id}" aria-label="View details for ${escapeHTML(p.name)}">${p.url?'View details':'View buying notes'} <span aria-hidden="true">↗</span></button>${p.url?'':'<span class="pending">Product idea only; no shopping link added</span>'}</article>`).join('');
 document.querySelector('#empty').hidden=results.length>0;
 document.querySelector('#result-count').textContent=(results.length?`Showing ${start+1}–${Math.min(start+pageSize,results.length)} of ${results.length} ${active==='ideas'?'buying ideas':'Amazon links'}`:'No matching finds')+(intent?` · ${intent.label} only`:'');
 document.querySelector('#pagination').hidden=pages<=1;
 document.querySelector('#page-status').textContent=`Page ${currentPage} of ${pages}`;
 document.querySelector('#previous-page').disabled=currentPage===1;
 document.querySelector('#next-page').disabled=currentPage===pages;
 document.querySelectorAll('[data-filter]').forEach(b=>{const selected=b.dataset.filter===active;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected))});
}
function setFilter(value){active=value;currentPage=1;search.value='';render()}
function resetFilters(){ageFilter.value='all';typeFilter.value='all';statusFilter.value='all';sortFilter.value='original';setFilter('all')}
for(const control of [ageFilter,typeFilter,statusFilter,sortFilter])control.addEventListener('change',()=>{currentPage=1;render()});
document.querySelector('#clear-filters').addEventListener('click',resetFilters);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
document.querySelectorAll('[data-nav-filter]').forEach(a=>a.addEventListener('click',()=>setFilter(a.dataset.navFilter)));
search.addEventListener('input',()=>{currentPage=1;render()});document.querySelector('#reset').addEventListener('click',resetFilters);
document.querySelector('#previous-page').addEventListener('click',()=>{currentPage--;render();document.querySelector('.tools').scrollIntoView({block:'start'})});
document.querySelector('#next-page').addEventListener('click',()=>{currentPage++;render();document.querySelector('.tools').scrollIntoView({block:'start'})});
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let detailAnimation;
function openDialog(label,html){
 document.querySelector('#dialog-label').textContent=label;
 const content=document.querySelector('#dialog-content');
 detailAnimation?.cancel();
 content.innerHTML=html;
 if(!dialog.open)dialog.showModal();
 dialog.scrollTop=0;
 if(!reducedMotion.matches&&content.animate)detailAnimation=content.animate([{opacity:.55,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(0.16,1,0.3,1)'});
}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)detailAnimation?.cancel()});
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
function showProduct(p,random=false){
 if(!p)return;
 let listing=p.url?`${productPhoto(p,true)}<p class="photo-note">Original list ${p.positions.length===1?'number':'numbers'}: ${p.positions.join(', ')}. ${p.positions.length>1?'Repeated URLs are combined in this entry.':''}</p>${p.verified?`<p><strong>Destination:</strong> ${escapeHTML(p.title)} <a href="${p.url}" target="_blank" rel="sponsored noopener noreferrer">View original listing (paid link)</a>.</p>`:`<p>${p.destinationKind==='store'?'This is an Amazon storefront, but we could not confirm its name or collection.':'We could not confirm this destination’s product details. This may be a product, service, category, or unavailable page.'} The original URL is preserved without changes.</p>`}`:'';
 if(p.destinationKind==='category')listing+='<p class="photo-note">Category collection, not an individual product. Photos and specifications depend on the item selected on Amazon.</p>';
 if(p.destinationKind==='service')listing+='<p class="photo-note">Service information, not a physical product. Review membership, eligibility and renewal terms on Amazon.</p>';
 if(p.detailSource&&p.detailSource!==p.url)listing+=`<p class="photo-note">Details checked against <a href="${escapeHTML(p.detailSource)}" target="_blank" rel="noopener noreferrer">Amazon page information</a>.</p>`;
 const discovery=random?'<div class="discovery-note"><p>A random find from the full product collection.</p><button type="button" class="random-again" id="another-find">Try another <span aria-hidden="true">↻</span></button></div>':'';
 openDialog(random?'A LITTLE DISCOVERY':labels[p.category],`<h2 id="dialog-title" tabindex="-1">${escapeHTML(p.name)}</h2>${discovery}${listing}<p>${escapeHTML(p.description)}</p><h3>Before you choose</h3><ul>${p.checks.map(c=>`<li>${escapeHTML(c)}</li>`).join('')}</ul><h3>A considered approach</h3><p>${escapeHTML(p.fit)}</p>${p.url?`<p class="photo-note">Paid link. We may earn a commission from qualifying purchases.</p><a class="button shop-link" href="${p.url}" target="_blank" rel="sponsored noopener noreferrer">Link to Amazon ↗</a><p class="photo-note">If a new tab does not open, copy this address into your browser:<br><span class="copyable-url">${p.url}</span></p><p class="photo-note">Check Amazon for current price, availability, seller, condition, and terms. No hands-on testing is claimed. Lifestyle images are illustrative, not photographs of this item.</p>`:'<button class="disabled-cta" disabled>Amazon affiliate link not added yet</button><p class="photo-note">This is a product-type buying guide, not a review of a particular listing. No hands-on testing is claimed.</p>'}`);
 if(random)document.querySelector('#another-find').focus({preventScroll:true});
}
grid.addEventListener('click',event=>{
 const button=event.target.closest('[data-product]');if(button)showProduct(products.find(x=>x.id===button.dataset.product));
});
// Older service/store entries predate the explicit destinationKind field.
const legacyNonProducts=new Set([28,29,30,31,65]);
const discoveryPool=products.filter(p=>p.url&&p.verified&&(!p.destinationKind||p.destinationKind==='product')&&!legacyNonProducts.has(p.positions[0]));
let discoveryBag=[],lastDiscovery;
function randomSuggestion(){
 if(!discoveryPool.length)return;
 if(!discoveryBag.length){
  discoveryBag=[...discoveryPool];
  for(let i=discoveryBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[discoveryBag[i],discoveryBag[j]]=[discoveryBag[j],discoveryBag[i]]}
  const last=discoveryBag.length-1;
  if(last>0&&discoveryBag[last].id===lastDiscovery)[discoveryBag[0],discoveryBag[last]]=[discoveryBag[last],discoveryBag[0]];
 }
 const pick=discoveryBag.pop();lastDiscovery=pick.id;
 showProduct(pick,true);
}
document.querySelector('#random-find').addEventListener('click',randomSuggestion);
dialog.addEventListener('click',event=>{if(event.target.closest('#another-find'))randomSuggestion()});
const guides={
home:{title:'An organized kitchen starts with a measuring tape.',html:'<p>Before choosing organizers, take one shelf or drawer out of the equation. Empty it, group the things you actually use, and decide what belongs somewhere else.</p><h3>Measure the space that matters</h3><p>Write down the usable interior width, depth, and height. Allow space for door hinges, drawer runners, and the movement needed to lift lids or remove a container.</p><h3>Choose around your routine</h3><p>Think about how you refill, scoop, pour, and clean. A beautiful jar is not a useful upgrade if it makes the task you repeat every morning more awkward.</p><h3>Start small</h3><p>Try one organizer or one set of containers in the area you use most. Live with that arrangement before committing the whole kitchen to it.</p>'},
beauty:{title:'Make room for a routine you’ll actually enjoy.',html:'<p>A calmer vanity does not need a longer routine. Begin with what you already use, and make those items easy to reach, clean, and put away.</p><h3>Edit before you organize</h3><p>Separate daily essentials from occasional tools. Follow each product’s label for storage, use, and replacement guidance rather than assuming every bottle belongs on a sunny counter.</p><h3>Think about maintenance</h3><p>Look for an organizer that you can comfortably clean. Check the exact listing for material and care information, and compare compartment sizes with your existing tools.</p><h3>Keep the claims in perspective</h3><p>Choose accessories for practical qualities such as dimensions, texture, and ease of care. Do not treat an accessory as a substitute for personalized skincare or medical advice.</p>'},
tech:{title:'A calmer desk, without replacing everything.',html:'<p>Notice the part of your setup that interrupts you most. It might be a cable that slips behind the desk, a phone without a home, or accessories that never quite fit.</p><h3>Fix one friction point</h3><p>Choose the problem before the product. A simple cable clip or stand may be enough; you do not have to replace the whole setup to make it feel more useful.</p><h3>Check compatibility twice</h3><p>Compare the listing’s dimensions, supported devices, connector types, and case clearance with what you own. A product that looks similar may serve a different purpose.</p><h3>Leave room to work</h3><p>Measure the surface an accessory will occupy. Keep enough clear space for your actual daily tasks, and follow the manufacturer’s installation and safety instructions.</p>'}
};
document.querySelectorAll('[data-guide]').forEach(b=>b.addEventListener('click',()=>{const g=guides[b.dataset.guide];openDialog('THE CONSIDERED SHOPPER',`<h2 id="dialog-title">${g.title}</h2>${g.html}`)}));
const info={
about:{title:'About BotchMonkey',html:`<p>BotchMonkey is a shopping-inspiration site focused on practical home details, simple self-care accessories, everyday technology, and other Amazon finds.</p><p>Our starting point is a useful question: does this fit the space, routine, and budget you actually have? The buying notes are general editorial guidance, not hands-on product reviews.</p><p>This collection contains ${catalog.stats.unique} distinct Amazon links from ${catalog.stats.submitted} submissions. Exact repeats are combined, with their original list numbers retained. Six general buying ideas remain available in a separate tab.</p><p>Unconfirmed destination details are clearly marked. The lifestyle photographs are AI-generated illustrations, not photos of the linked products.</p>`},
disclosure:{title:'Affiliate disclosure',html:`<p>As an Amazon Associate I earn from qualifying purchases.</p><p>We may earn a commission if you make a qualifying purchase through a paid link. Amazon shopping links are identified as paid links near the link.</p><p>This site contains ${catalog.stats.unique} distinct owner-supplied Amazon links. Some lead to services, promotions, or category pages rather than individual products. Unconfirmed details are marked; listing titles are not independent reviews.</p><p>The original links are preserved, including their existing tracking. The lifestyle images do not show specific recommended products. We do not claim Amazon sponsors or endorses this website.</p><p>For the program’s disclosure requirements, see <a href="https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98" target="_blank" rel="noopener noreferrer">Amazon Associates disclosure guidance</a>.</p>`},
privacy:{title:'Privacy on this site',html:'<p>This site does not include an email signup, contact form, advertising pixels, or analytics configured by the site. Search terms and category selections are processed within the page and are not saved by its application code.</p><p>Fonts are loaded from Fontshare, and the website is served by Perplexity’s hosting platform. Those providers may process connection information under their own policies.</p><p>Amazon shopping links take you to an external website and contain affiliate tracking information. Your interaction there is governed by Amazon’s policies, not this site’s application code.</p><p>This notice describes the site’s current implementation. It should be reviewed whenever hosting, analytics, affiliate links, or forms change.</p>'}
};
document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>{const i=info[b.dataset.info];openDialog('BOTCHMONKEY',`<h2 id="dialog-title">${i.title}</h2>${i.html}`)}));
document.addEventListener('error',event=>{const img=event.target;if(img.tagName!=='IMG')return;if(img.hasAttribute('data-product-photo')){img.remove();return}const f=document.createElement('span');f.className='img-fallback';f.setAttribute('role','img');f.setAttribute('aria-label',img.alt);f.textContent='Everyday inspiration';img.replaceWith(f)},true);
render();
