export type Tone = 'Premium'|'Viral TikTok'|'Luxury'|'Problem/Solution'|'UGC'|'Bold Direct Response';
export type ProductInput = { productName:string; productUrl?:string; category:string; price:string; targetCustomer:string; mainProblem:string; mainBenefit:string; keyFeatures:string; competitorLink?:string; tone:Tone };
export type AdPack = { productSummary:string; hooks:string[]; tiktokScripts:string[]; metaAds:string[]; instagramCaptions:string[]; staticAdConcepts:string[]; ugcScripts:string[]; productPageAudit:string[]; faqs:string[]; seo:{title:string; metaDescription:string}; testingPlan:string[] };
export type SwipeItem = { adLink:string; platform:string; product:string; hook:string; angle:string; notes:string; status:'Idea'|'Testing'|'Winner'|'Loser' };
