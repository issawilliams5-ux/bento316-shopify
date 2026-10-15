import type { AdPack, ProductInput, SwipeItem } from './types';
export const demoInput: ProductInput = { productName:'GlowLift LED Mask', productUrl:'https://example.com/products/glowlift', category:'Beauty', price:'$89', targetCustomer:'busy skincare shoppers over 30', mainProblem:'dull skin and inconsistent routines', mainBenefit:'spa-style glow sessions at home in 10 minutes', keyFeatures:'red light, blue light, flexible silicone, USB-C rechargeable', tone:'UGC' };

// Demo/no-key output: every item is a distinct template filled from the product's own fields.
// No guarantees, before/after claims or invented social proof (see lib/legal.ts "claims").
type Ctx = { p:string; a:string; pr:string; b:string; f:string[]; price:string };
const feat = (c:Ctx, i:number) => c.f[i % c.f.length];
const cap = (s:string) => s.charAt(0).toUpperCase() + s.slice(1);
const hookT: ((c:Ctx)=>string)[] = [
  c=>`I tried ${c.p} for 7 days so you do not have to — here is what changed.`,
  c=>`If you battle ${c.pr} every day, watch this.`,
  c=>`POV: you stopped putting up with ${c.pr}.`,
  c=>`Nobody talks about how annoying ${c.pr} can be.`,
  c=>`Calling all ${c.a}: this one is for you.`,
  c=>`${cap(c.b)}? Here is how ${c.p} does it.`,
  c=>`The ${feat(c,0)} detail most people scroll past.`,
  c=>`3 reasons ${c.p} made it into my routine.`,
  c=>`Stop scrolling if you are one of the ${c.a}.`,
  c=>`What ${c.p} looks like after a week of real use.`,
  c=>`I almost returned ${c.p}. Then I gave it one more week.`,
  c=>`The honest review of ${c.p} nobody asked for.`,
  c=>`Unboxing ${c.p}: first impressions in 30 seconds.`,
  c=>`Things I wish I knew before buying ${c.p}.`,
  c=>`Is ${c.p} worth ${c.price}? Let's find out.`,
  c=>`Tired of ${c.pr}? Here is what I'm trying instead.`,
  c=>`Swap your old routine for ${c.b}.`,
  c=>`The ${c.price} upgrade I didn't know I needed.`,
  c=>`Watch me test ${c.p} with zero filter.`,
  c=>`My friends keep asking what I'm using. It's ${c.p}.`,
  c=>`It's not you. It's ${c.pr}.`,
  c=>`Before you buy anything else for ${c.pr}, see this.`,
  c=>`${cap(feat(c,0))}, explained in 15 seconds.`,
  c=>`The one feature that sold me on ${c.p}: ${feat(c,1)}.`,
  c=>`Day 1 with ${c.p}: setup, first try, verdict.`,
  c=>`Rating ${c.p} on comfort, ease and value.`,
  c=>`Three ways to use ${c.p} you might not expect.`,
  c=>`This is your sign to try ${c.b}.`,
  c=>`Save this for the next time you're dealing with ${c.pr}.`,
  c=>`I timed it: here is my real routine with ${c.p}.`,
  c=>`A quick ${c.p} routine you can do between meetings.`,
  c=>`Expectation vs reality: ${c.p}.`,
  c=>`Answering your top questions about ${c.p}.`,
  c=>`Why I stopped overthinking ${c.pr}.`,
  c=>`What ${c.price} actually gets you with ${c.p}.`,
  c=>`Duet this if you've dealt with ${c.pr}.`,
  c=>`Small change, big routine upgrade: ${c.p}.`,
  c=>`The gift idea for ${c.a} that isn't boring.`,
  c=>`I compared ${c.p} to my old routine. Here's the difference.`,
  c=>`Here's the ${feat(c,2)} close-up you asked for.`,
  c=>`If you only watch one ${c.p} video, make it this one.`,
  c=>`Real talk about ${c.p}: the good and the not-so-good.`,
  c=>`Testing ${c.p} so you can decide in 20 seconds.`,
  c=>`Tell me you deal with ${c.pr} without telling me.`,
  c=>`My no-fuss way to get ${c.b}.`,
  c=>`${c.p}: the thing I reach for first now.`,
  c=>`Is it hype? I put ${c.p} to a 7-day test.`,
  c=>`How ${c.p} fits into a busy week.`,
  c=>`Three questions to ask before buying ${c.p}.`,
  c=>`Your routine, minus the hassle: ${c.p}.`,
];
const scriptT: [string, string][] = [
  ['Open on the pain: a quick montage of {pr}', 'tap to see why it made my routine'],
  ['Open mid-routine, already halfway through a session', 'comment ‘how’ and I\'ll show the full setup'],
  ['Open with a question: “Still dealing with {pr}?”', 'save this for later'],
  ['Open on the unboxing, no talking for 2 seconds', 'link is in my bio'],
  ['Open with a myth people believe about {pr}', 'follow for part 2'],
  ['Open on the price tag: {price}', 'tell me if you\'d try it'],
  ['Open with a split screen: old routine vs {p}', 'try it and tag me'],
  ['Open with a timer on screen', 'see the full routine on the product page'],
  ['Open with a friend asking “what is that?”', 'send this to someone who needs it'],
  ['Open on a close-up of {p} in use, no voice-over', 'shop the link while it\'s in stock'],
];
const metaHead = ['{p}, made for {a}', 'Your shortcut to {b}', 'Less hassle, more routine', 'The {price} routine upgrade', 'Built around {f}', '{B}', 'A calmer routine starts here', 'For {a}', 'See how {p} works', 'Small swap, real routine'];
const metaCta = ['Shop now', 'Learn more', 'Get yours', 'See how it works'];
const captionT = ['Your routine called — it wants {p}.', 'New in my routine: {p}.', 'Saving this for my next round with {pr}.', '{B}, minus the appointment.', 'The {f} detail I keep coming back to.', 'Low effort, high routine energy: {p}.', 'Week one with {p}, logged.', 'For the {a} in your life.', 'Quiet upgrade of the week: {p}.', 'Routine check: {p} edition.'];
const staticT = ['Split-screen: the pain ({pr}) vs the routine with {p}, bold headline “{B}”', 'Product close-up on a clean surface, one line: “Built around {f}”', 'Price-led card: product shot, “{price}”, three feature chips', 'Flat lay of the unboxing with handwritten-style labels for each part', 'Single bold question: “Still dealing with {pr}?” over a product crop', 'Routine timeline: three steps, product in step two', 'Feature grid: {f} and two more features, one icon each', 'Testimonial-style frame left blank for a real customer quote', 'Gift angle: product in a box, headline “For {a}”', 'Minimal product hero on brand colour, headline “{B}”'];
const ugcT = ['“I was skeptical about {p}, but the first thing I noticed was...” Show unboxing, quick demo, honest benefit, soft CTA.', 'Get-ready-with-me: weave {p} into a real morning, mention {f} once, no hard sell.', 'Three-question review: what is it, how do I use it, would I buy it again at {price}?', 'Problem-first: describe {pr} in your own words, then show how {p} fits in.', 'Routine reset: film day one setting up {p}, end on how it fits a busy week.'];
const fillT = (t:string, c:Ctx, i:number) => t.replace(/\{p\}/g,c.p).replace(/\{a\}/g,c.a).replace(/\{pr\}/g,c.pr).replace(/\{b\}/g,c.b).replace(/\{B\}/g,cap(c.b)).replace(/\{f\}/g,feat(c,i)).replace(/\{price\}/g,c.price);
export function mockAdPack(input: ProductInput = demoInput): AdPack { const c:Ctx={ p:input.productName || 'Your Product', a:input.targetCustomer || 'online shoppers', pr:input.mainProblem || 'slow, frustrating alternatives', b:input.mainBenefit || 'a better result, faster', f:(input.keyFeatures || 'its top feature').split(',').map(s=>s.trim()).filter(Boolean), price:input.price || 'the price' }; if(!c.f.length) c.f=['its top feature']; return { productSummary:`${c.p} is a ${input.category || 'ecommerce'} offer for ${c.a}. It positions ${c.b} against the pain of ${c.pr} with a ${input.tone} creative angle.`, hooks: hookT.map((t,i)=>`${i+1}. ${t(c)}`), tiktokScripts: scriptT.map(([open,cta],i)=>`Script ${i+1}: ${fillT(open,c,i)}, show ${c.p} in hand, demo ${feat(c,i)}, call out ${c.b}, end with “${fillT(cta,c,i)}.”`), metaAds: metaHead.map((h,i)=>`Meta variation ${i+1}: Headline: ${fillT(h,c,i)}. Primary text: ${i%2?`Made for ${c.a}: ${c.b}, with ${c.f.join(', ')}.`:`Done with ${c.pr}? ${c.p} brings ${c.b}.`} CTA: ${metaCta[i%metaCta.length]}.`), instagramCaptions: captionT.map((t,i)=>`Caption ${i+1}: ${fillT(t,c,i)} #ecommercefinds`), staticAdConcepts: staticT.map((t,i)=>`Static concept ${i+1}: ${fillT(t,c,i)}.`), ugcScripts: ugcT.map((t,i)=>`UGC ${i+1}: ${fillT(t,c,i)}`), productPageAudit:['Move the core benefit above the fold.','Add three objection-handling bullets near the buy button.','Use social proof beside product imagery.','Add a comparison block against old alternatives.','Clarify shipping, returns, and guarantee language without promising outcomes.'], faqs:['Who is this best for?','How fast will it ship?','What makes it different?','Can I use it daily?','What if it is not right for me?'], seo:{title:`${c.p} | ${c.b}`, metaDescription:`Shop ${c.p} for ${c.a}. Designed to help with ${c.pr} using ${c.f.join(', ')}.`}, testingPlan: Array.from({length:7},(_,k)=>{const i=k+1; return `Day ${i}: Launch ${i===1?'hook tests':i<4?'script/angle tests':i<6?'caption and static creative tests':'winner consolidation'}, track CTR, saves, CPC, and add-to-cart quality.`})} }
export const demoPacks = [{id:'demo-1', name:'GlowLift LED Mask', created:'Today', summary:'100 ready-to-test angles for a beauty product.'},{id:'demo-2', name:'AeroPack Travel Bag', created:'Yesterday', summary:'Travel hooks, Reels scripts, and product page fixes.'}];
export const demoSwipe: SwipeItem[] = [{adLink:'https://example.com/ad', platform:'TikTok', product:'GlowLift LED Mask', hook:'I tested this for 7 nights...', angle:'Skeptic to believer', notes:'Strong opening pattern.', status:'Idea'}];
