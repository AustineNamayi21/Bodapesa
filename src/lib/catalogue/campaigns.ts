import type { Segment } from "@/lib/types";

/**
 * One campaign per product, written for SMS.
 *
 * Three constraints shaped every message below, and they are worth stating
 * because they are not obvious:
 *
 *  1. **160 characters.** Kenyan SMS is billed per 160-character part at
 *     KES 0.80. A 300-character message does not cost a little more, it
 *     costs twice as much, per rider, every send. Every body here is built
 *     to land inside one part. That is the real reason these are short —
 *     not style.
 *
 *  2. **One idea, then a door.** You cannot explain a pension in 160
 *     characters and should not try. Each message carries the single most
 *     useful fact, the number that makes it concrete, and one instruction.
 *     The full explanation — in all three languages, with the trade-offs —
 *     already lives on the product page in the app. The SMS is the hook;
 *     the app is the lesson.
 *
 *  3. **Targeting is what separates this from spam.** Every campaign below
 *     carries a segment. A rider who already has cover does not get the
 *     insurance pitch; a rider with no bank account gets the savings one.
 *     Sending all 32 to everybody would cost real money and teach riders to
 *     ignore the sender.
 *
 * Every campaign installs as a DRAFT. Nothing is sent without someone
 * opening it, checking the audience count and pressing send.
 */

export type CampaignEntry = {
  /** The product this belongs to, matched by Product.code. */
  productCode: string;
  name: string;
  objective: "EDUCATION" | "AWARENESS" | "PRODUCT_PUSH" | "REMINDER" | "SURVEY";
  channels: string;
  segment: Segment;
  bodyEn: string;
  bodySw: string;
  bodySh: string;
};

export const CAMPAIGNS: CampaignEntry[] = [
  /* ═══════════════════════════════════════════ Stima — the foundation ══ */
  {
    productCode: "STM-ALPHA",
    name: "Alpha Deposits — save first, borrow after",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { saccoMember: false },
    bodyEn:
      "BodaPesa: At Stima your loan is 4x your savings. Save KSh 1,000/month and in a year you can borrow about KSh 48,000. Savings first. Details in the app.",
    bodySw:
      "BodaPesa: Stima, mkopo ni mara 4 ya akiba yako. Weka KSh 1,000/mwezi, baada ya mwaka ukope kama KSh 48,000. Akiba kwanza. Maelezo kwenye app.",
    bodySh:
      "BodaPesa: Kwa Stima, loan yako ni mara 4 ya ile umesave. Weka KSh 1,000/mwezi, baada ya mwaka unaweza kukopa kama KSh 48,000. Savings kwanza. Angalia app.",
  },
  {
    productCode: "STM-SHARE",
    name: "Share Capital — join from KSh 500",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { saccoMember: false },
    bodyEn:
      "BodaPesa: Joining Stima Sacco starts at KSh 500 for one share. That share makes you a part-owner and pays a dividend each year. See how it works in the app.",
    bodySw:
      "BodaPesa: Kujiunga na Stima Sacco huanza kwa KSh 500 kwa hisa moja. Hisa hiyo inakufanya mmiliki mwenza na kulipa gawio kila mwaka. Ona kwenye app.",
    bodySh:
      "BodaPesa: Kujoin Stima Sacco inaanza na KSh 500 kwa share moja. Hiyo share inakufanya co-owner na inalipa dividend kila mwaka. Check app uone inavyofanya kazi.",
  },
  {
    productCode: "STM-PRIME",
    name: "Prime Account — the account that unlocks M-Pawa",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { hasBankAccount: false },
    bodyEn:
      "BodaPesa: A Stima Prime account needs only KSh 500 to stay open, and keeping it active is what unlocks the M-Pawa instant loan on *489#. Details in the app.",
    bodySw:
      "BodaPesa: Akaunti ya Stima Prime inahitaji KSh 500 tu kubaki wazi, na kuiweka hai ndiko kunafungua mkopo wa papo hapo wa M-Pawa kwa *489#. Maelezo kwenye app.",
    bodySh:
      "BodaPesa: Stima Prime account inahitaji KSh 500 tu ibaki wazi, na ukiiweka active ndio unafungua M-Pawa loan ya instant kwa *489#. Details kwa app.",
  },
  {
    productCode: "STM-MUSTARD",
    name: "Mustard — the account for when you cannot ride",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { statuses: ["ACTIVE", "ONBOARDED"] },
    bodyEn:
      "BodaPesa: Riding is hard on the body and the years are short. Stima Mustard saves from KSh 600/month at 5% a year, for when fares stop. See the app.",
    bodySw:
      "BodaPesa: Boda ni kazi ngumu na miaka ni michache. Stima Mustard inaweka kuanzia KSh 600/mwezi kwa 5% kwa mwaka, nauli zikikoma. Soma kwenye app.",
    bodySh:
      "BodaPesa: Kuendesha ni ngumu kwa mwili na miaka ni kidogo. Stima Mustard unasave kuanzia KSh 600/mwezi kwa 5% kwa mwaka, kwa siku nauli itaisha. Soma kwa app.",
  },
  {
    productCode: "STM-TWIGA",
    name: "Twiga — save for one named thing",
    objective: "EDUCATION",
    channels: "SMS",
    segment: { hasBankAccount: false },
    bodyEn:
      "BodaPesa: Most riders earn enough. The problem is the money never rests. Stima Twiga locks savings for 6 months so you cannot spend them. From KSh 1,000/month.",
    bodySw:
      "BodaPesa: Waendesha boda wengi wanachuma vya kutosha. Shida ni pesa haipumziki. Stima Twiga inafunga akiba miezi 6 usiweze kuitumia. Kuanzia KSh 1,000/mwezi.",
    bodySh:
      "BodaPesa: Wengi wenu mnachuma ya kutosha. Shida ni doo haipumziki. Stima Twiga inafunga savings miezi 6 usiweze kuitumia. Kuanzia KSh 1,000/mwezi.",
  },
  {
    productCode: "STM-MSINGI",
    name: "Msingi Bora — fees that survive you",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { statuses: ["ACTIVE", "ONBOARDED"] },
    bodyEn:
      "BodaPesa: Stima Msingi Bora saves school fees from KSh 500/month. If you die or are disabled, it is insured, so your child's fees continue. Details in the app.",
    bodySw:
      "BodaPesa: Stima Msingi Bora inaweka karo kuanzia KSh 500/mwezi. Ukifariki au kulemazwa, ina bima, kwa hivyo karo ya mtoto inaendelea. Maelezo kwenye app.",
    bodySh:
      "BodaPesa: Stima Msingi Bora inasave karo kuanzia KSh 500/mwezi. Ukifariki ama ukilemazwa, iko na bima, so karo ya mtoto inaendelea. Details kwa app.",
  },
  {
    productCode: "STM-JUNIOR",
    name: "Junior Star — a start for the child",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { statuses: ["ACTIVE", "ONBOARDED"] },
    bodyEn:
      "BodaPesa: Stima Junior Star opens a savings account in your child's name from KSh 500/month, withdrawn once a quarter. See it in the app.",
    bodySw:
      "BodaPesa: Stima Junior Star inafungua akaunti ya akiba kwa jina la mtoto wako kuanzia KSh 500/mwezi, kutolewa mara moja kila robo mwaka. Iangalie kwenye app.",
    bodySh:
      "BodaPesa: Stima Junior Star inafungua savings account kwa jina ya mtoto wako kuanzia KSh 500/mwezi, unatoa mara moja kila robo mwaka. Angalia kwa app.",
  },

  /* ════════════════════════════════════════════════ Stima — credit ══ */
  {
    productCode: "STM-MPAWA",
    name: "M-Pawa — a loan without guarantors",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: { saccoMember: true },
    bodyEn:
      "BodaPesa: Stima M-Pawa gives up to KSh 120,000 on *489#, no guarantors, repaid in 6 months. Check the rate on the menu before you confirm. More in the app.",
    bodySw:
      "BodaPesa: Stima M-Pawa inatoa hadi KSh 120,000 kwa *489#, bila wadhamini, kulipwa miezi 6. Angalia riba kwenye menyu kabla ya kuthibitisha. Zaidi kwenye app.",
    bodySh:
      "BodaPesa: Stima M-Pawa inatoa hadi KSh 120,000 kwa *489#, bila guarantor, unalipa miezi 6. Angalia rate kwa menu kabla ya kuconfirm. Zaidi kwa app.",
  },
  {
    productCode: "STM-NORMAL",
    name: "Normal Loan — why reducing balance matters",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { saccoMember: true },
    bodyEn:
      "BodaPesa: Stima's Normal Loan is 12% a year on reducing balance. That means interest is charged on what you still owe, so paying early truly costs you less.",
    bodySw:
      "BodaPesa: Normal Loan ya Stima ni 12% kwa mwaka kwa salio linalopungua. Riba inatozwa kwa unachodaiwa bado, kwa hivyo kulipa mapema kunakugharimu kidogo kweli.",
    bodySh:
      "BodaPesa: Normal Loan ya Stima ni 12% kwa mwaka kwa reducing balance. Interest inatozwa kwa ile unadaiwa bado, so ukilipa mapema unalipa kidogo kweli.",
  },
  {
    productCode: "STM-WORKING",
    name: "Working Capital — borrow for what earns",
    objective: "EDUCATION",
    channels: "SMS",
    segment: { saccoMember: true, incomeBands: ["1000-1500", ">1500"] },
    bodyEn:
      "BodaPesa: A second bike earning fares can repay its own loan. A loan spent on something that only costs cannot. Stima Working Capital: up to 4x your savings.",
    bodySw:
      "BodaPesa: Pikipiki ya pili inayoleta nauli inaweza kulipa mkopo wake. Uliotumika kwa kinachogharimu tu hauwezi. Stima Working Capital: mara 4 ya akiba.",
    bodySh:
      "BodaPesa: Bike ya pili inayoleta nauli inaweza kulipa loan yake. Loan ya kitu kinachogharimu tu haiwezi. Stima Working Capital: hadi mara 4 ya savings zako.",
  },
  {
    productCode: "STM-PRIMEADV",
    name: "Prime Advance — a bigger short loan",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { saccoMember: true },
    bodyEn:
      "BodaPesa: Need more than M-Pawa but not a 5-year loan? Stima Prime Advance goes to KSh 200,000 over 12 months. Confirm the rate with Stima. Details in the app.",
    bodySw:
      "BodaPesa: Unahitaji zaidi ya M-Pawa lakini si mkopo wa miaka 5? Stima Prime Advance inafika KSh 200,000 kwa miezi 12. Thibitisha riba na Stima.",
    bodySh:
      "BodaPesa: Unahitaji zaidi ya M-Pawa lakini si loan ya miaka 5? Stima Prime Advance inafika KSh 200,000 kwa miezi 12. Confirm rate na Stima. Details kwa app.",
  },
  {
    productCode: "STM-SCHOOLFEE",
    name: "School fees — the loan, and the cheaper way",
    objective: "EDUCATION",
    channels: "SMS",
    segment: { statuses: ["ACTIVE", "ONBOARDED"] },
    bodyEn:
      "BodaPesa: Stima lends up to 3x your savings for school fees. But saving the same amount a year earlier is cheaper: you earn the interest instead of paying it.",
    bodySw:
      "BodaPesa: Stima inakopesha hadi mara 3 ya akiba yako kwa karo. Lakini kuweka kiasi hicho mwaka mapema ni nafuu: unapata riba badala ya kuilipa.",
    bodySh:
      "BodaPesa: Stima inakopesha hadi mara 3 ya savings zako kwa karo. Lakini kusave hiyo hiyo mwaka mapema ni poa zaidi: unapata interest badala ya kuilipa.",
  },
  {
    productCode: "STM-MAKEOVER",
    name: "Makeover — buying your own bike",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { incomeBands: ["1000-1500", ">1500"] },
    bodyEn:
      "BodaPesa: Rent paid to a bike owner never comes back. Stima Makeover finances a purchase up to KSh 1M at 18% a year. Compare it with a Normal Loan in the app.",
    bodySw:
      "BodaPesa: Kodi unayolipa mwenye pikipiki hairudi kamwe. Stima Makeover inafadhili ununuzi hadi KSh 1M kwa 18% kwa mwaka. Linganisha na Normal Loan kwenye app.",
    bodySh:
      "BodaPesa: Kodi unayolipa mwenye bike hairudi kamwe. Stima Makeover inafadhili ununuzi hadi KSh 1M kwa 18% kwa mwaka. Compare na Normal Loan kwa app.",
  },
  {
    productCode: "STM-SOSA",
    name: "SOSA — shorter term, less interest",
    objective: "EDUCATION",
    channels: "SMS",
    segment: { saccoMember: true },
    bodyEn:
      "BodaPesa: Stima SOSA is 15% a year over 24 months. A shorter loan means bigger instalments but less interest overall. Longest term is not always cheapest.",
    bodySw:
      "BodaPesa: Stima SOSA ni 15% kwa mwaka kwa miezi 24. Mkopo mfupi ni malipo makubwa lakini riba ndogo kwa jumla. Muda mrefu zaidi si nafuu kila wakati.",
    bodySh:
      "BodaPesa: Stima SOSA ni 15% kwa mwaka kwa miezi 24. Loan fupi ni installment kubwa lakini interest ndogo kwa jumla. Term ndefu si cheap kila wakati.",
  },
  {
    productCode: "STM-FUNIKA",
    name: "Funika — know what 1% a day costs",
    objective: "AWARENESS",
    channels: "SMS,WHATSAPP",
    segment: {},
    bodyEn:
      "BodaPesa: Funika charges 1% a day. On KSh 10,000 that is about KSh 3,000 in a month. A Stima Normal Loan is 12% a YEAR. Know the difference before you borrow.",
    bodySw:
      "BodaPesa: Funika inatoza 1% kwa siku. Kwa KSh 10,000 hiyo ni takriban KSh 3,000 kwa mwezi. Normal Loan ya Stima ni 12% kwa MWAKA. Jua tofauti kabla ya kukopa.",
    bodySh:
      "BodaPesa: Funika inatoza 1% kwa siku. Kwa KSh 10,000 hiyo ni kama KSh 3,000 kwa mwezi. Stima Normal Loan ni 12% kwa MWAKA. Jua tofauti kabla ukope.",
  },

  /* ═══════════════════════════════════════════ Stima — investment ══ */
  {
    productCode: "STM-FIXED",
    name: "Fixed Deposit — lock a lump sum",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { saccoMember: true, incomeBands: ["1000-1500", ">1500"] },
    bodyEn:
      "BodaPesa: Have KSh 5,000 you will not touch for 3 months? A Stima fixed deposit pays more than a current account. Early withdrawal loses the interest.",
    bodySw:
      "BodaPesa: Una KSh 5,000 usiyoigusa miezi 3? Amana ya kudumu ya Stima inalipa zaidi ya akaunti ya kawaida. Kutoa mapema kunapoteza riba.",
    bodySh:
      "BodaPesa: Una KSh 5,000 hautagusa miezi 3? Fixed deposit ya Stima inalipa zaidi ya current account. Ukitoa mapema unapoteza interest.",
  },
  {
    productCode: "STM-CALL",
    name: "Call Deposit — return without locking",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { saccoMember: true },
    bodyEn:
      "BodaPesa: A Stima call deposit earns a guaranteed return from KSh 5,000 but you can recall it any time without losing the interest. Good for uneven income.",
    bodySw:
      "BodaPesa: Call deposit ya Stima: mapato ya uhakika kuanzia KSh 5,000, unairudisha wakati wowote bila kupoteza riba. Nzuri kwa mapato yasiyo sawa.",
    bodySh:
      "BodaPesa: Call deposit ya Stima: return ya uhakika kuanzia KSh 5,000, unaitoa wakati wowote bila kupoteza interest. Poa kwa income isiyo sawa.",
  },
  {
    productCode: "STM-GOLDEN",
    name: "Golden Savings — monthly income home",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { incomeBands: [">1500"] },
    bodyEn:
      "BodaPesa: Stima Golden Savings fixes KSh 5,000+ for a year and pays a return every month, which can be sent straight to a parent upcountry. See the app.",
    bodySw:
      "BodaPesa: Stima Golden Savings inafunga KSh 5,000+ kwa mwaka na kulipa mapato kila mwezi, yanayoweza kutumwa moja kwa moja kwa mzazi mashinani. Ona kwenye app.",
    bodySh:
      "BodaPesa: Stima Golden Savings inafunga KSh 5,000+ kwa mwaka na kulipa return kila mwezi, inaweza kutumwa moja kwa moja kwa mzazi mashinani. Angalia app.",
  },

  /* ═════════════════════════════════════════════ Britam — cover ══ */
  {
    productCode: "BRT-DATAPLUS",
    name: "Data Plus — cover for KSh 25 a day",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Accident cover from KSh 25 a day, paid with your airtime. Dial *544#, pick Data Plus, then the Britam cover. No forms, no agent. Details in the app.",
    bodySw:
      "BodaPesa: Bima ya ajali kuanzia KSh 25 kwa siku, inalipwa na salio. Piga *544#, chagua Data Plus, kisha bima ya Britam. Bila fomu wala wakala.",
    bodySh:
      "BodaPesa: Cover ya ajali kuanzia KSh 25 kwa siku, unalipa na airtime. Piga *544#, chagua Data Plus, halafu Britam cover. Hakuna fomu wala agent.",
  },
  {
    productCode: "BRT-MOTOR-COM",
    name: "Private cover voids your claim — read this",
    objective: "AWARENESS",
    channels: "SMS,WHATSAPP",
    segment: {},
    bodyEn:
      "BodaPesa: WARNING. Carry paying passengers on a PRIVATE bike policy and the insurer can refuse your claim. Boda work needs commercial PSV cover. Ask us.",
    bodySw:
      "BodaPesa: ONYO. Ukibeba abiria wanaolipa kwa bima ya BINAFSI, mwenye bima anaweza kukataa dai lako. Boda inahitaji bima ya kibiashara PSV. Tuulize.",
    bodySh:
      "BodaPesa: ONYO. Ukibeba abiria wanaolipa na policy ya bike ya PRIVATE, insurer anaweza kukataa claim yako. Boda inahitaji commercial PSV cover. Tuulize.",
  },
  {
    productCode: "BRT-MOTIFLEX",
    name: "Motiflex — pay cover monthly",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Skipped insurance because a whole year at once is too much? Britam Motiflex lets you pay comprehensive cover monthly, with the same benefits. Ask us.",
    bodySw:
      "BodaPesa: Uliacha bima kwa sababu mwaka mzima kwa mara moja ni mwingi? Britam Motiflex inakuruhusu kulipa bima kamili kila mwezi, manufaa yale yale. Tuulize.",
    bodySh:
      "BodaPesa: Uliskip bima juu ya mwaka mzima kwa mara moja ni mob? Britam Motiflex inakuruhusu kulipa comprehensive cover kila mwezi, benefits zile zile. Tuulize.",
  },
  {
    productCode: "BRT-HOSPICASH",
    name: "Hospital Cash — the fares you lose",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Medical cover pays the hospital. It does not pay your rent. Britam Hospital Cash pays YOU for each day admitted, replacing the fares you cannot earn.",
    bodySw:
      "BodaPesa: Bima ya matibabu inalipa hospitali. Hailipi kodi yako. Britam Hospital Cash inakulipa WEWE kwa kila siku uliyolazwa, ikibadilisha nauli usizochuma.",
    bodySh:
      "BodaPesa: Medical cover inalipa hospitali. Hailipi rent yako. Britam Hospital Cash inakulipa WEWE kwa kila siku uko admitted, inareplace nauli hujachuma.",
  },
  {
    productCode: "BRT-LASTEXP",
    name: "Last Expense — KSh 800 a year",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: {},
    bodyEn:
      "BodaPesa: Everyone knows what happens at the stage when someone dies: a rushed collection. Britam funeral cover from KSh 800 a YEAR replaces that. Ask us how.",
    bodySw:
      "BodaPesa: Kila mtu anajua inakuwaje stage mtu akifariki: mchango wa haraka. Bima ya mazishi ya Britam kuanzia KSh 800 kwa MWAKA inabadilisha hilo.",
    bodySh:
      "BodaPesa: Kila mtu anajua inakuwaje kwa stage mtu akifariki: harambee ya haraka. Britam funeral cover kuanzia KSh 800 kwa MWAKA inabadilisha hiyo. Tuulize.",
  },
  {
    productCode: "BRT-LASTEXP-GRP",
    name: "Group Last Expense — half price as a stage",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: {},
    bodyEn:
      "BodaPesa: Bought as a stage, Britam funeral cover is from KSh 400 a head, half the single price. Talk to your chairman and reply here and we will arrange it.",
    bodySw:
      "BodaPesa: Ikinunuliwa na stage nzima, bima ya mazishi ya Britam ni kuanzia KSh 400 kwa mtu, nusu ya bei. Ongea na mwenyekiti, kisha ujibu hapa.",
    bodySh:
      "BodaPesa: Ikinunuliwa na stage mzima, Britam funeral cover ni kuanzia KSh 400 kwa mtu, nusu ya bei ya mmoja. Ongea na chairman, ureply hapa tupange.",
  },
  {
    productCode: "BRT-WAFANYIKAZI",
    name: "Bima ya Wafanyikazi — KSh 11 a day",
    objective: "PRODUCT_PUSH",
    channels: "SMS,WHATSAPP",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Britam medical cover for informal workers: about KSh 336 a month, near KSh 11 a day. Inpatient, clinic, maternity, dental. Buy it as a stage.",
    bodySw:
      "BodaPesa: Bima ya Britam kwa wafanyakazi wasio rasmi: KSh 336 kwa mwezi, kama KSh 11 kwa siku. Kulazwa, kliniki, uzazi, meno. Nunueni kama stage.",
    bodySh:
      "BodaPesa: Britam medical cover ya wafanyakazi wa informal: KSh 336 kwa mwezi, kama KSh 11 kwa siku. Kulazwa, clinic, uzazi, meno. Nunueni kama stage.",
  },
  {
    productCode: "BRT-MWANANCHI",
    name: "Bima ya Mwananchi — cover the family",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Britam Bima ya Mwananchi covers you and your family from KSh 4,600 a year. Compare it with Bima ya Wafanyikazi in the app before choosing.",
    bodySw:
      "BodaPesa: Britam Bima ya Mwananchi inakufunika wewe na familia yako kuanzia KSh 4,600 kwa mwaka. Linganisha na Bima ya Wafanyikazi kwenye app kabla ya kuchagua.",
    bodySh:
      "BodaPesa: Britam Bima ya Mwananchi inacover wewe na family yako kuanzia KSh 4,600 kwa mwaka. Compare na Bima ya Wafanyikazi kwa app kabla uchague.",
  },
  {
    productCode: "BRT-GPA",
    name: "Group Personal Accident — cover the whole stage",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: {},
    bodyEn:
      "BodaPesa: One policy for the whole stage: Britam group accident cover, from KSh 4,500 and tailored to your group. One renewal date, not thirty. Reply to ask.",
    bodySw:
      "BodaPesa: Sera moja kwa stage nzima: bima ya ajali ya kikundi ya Britam, kuanzia KSh 4,500, imetengenezwa kwa kikundi chenu. Jibu hapa kuuliza.",
    bodySh:
      "BodaPesa: Policy moja kwa stage mzima: Britam group accident cover, kuanzia KSh 4,500, imetengenezwa kwa group yenu. Reply hapa uulize.",
  },
  {
    productCode: "BRT-MALKIA",
    name: "Malkia — KSh 620 a year for the women at home",
    objective: "AWARENESS",
    channels: "SMS",
    segment: {},
    bodyEn:
      "BodaPesa: Britam Malkia covers cancer and skin conditions for women from KSh 620 a YEAR. For women riders, and for the women in your household. Ask us.",
    bodySw:
      "BodaPesa: Britam Malkia inafunika saratani na magonjwa ya ngozi kwa wanawake kuanzia KSh 620 kwa MWAKA. Kwa waendesha na wanawake nyumbani. Tuulize.",
    bodySh:
      "BodaPesa: Britam Malkia inacover cancer na magonjwa ya ngozi kwa wanawake kuanzia KSh 620 kwa MWAKA. Kwa wanawake wanaoendesha, na wa kwenu nyumbani. Tuulize.",
  },
  {
    productCode: "BRT-JUNIORMED",
    name: "Junior Medical — cover for the children",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { hasInsurance: false },
    bodyEn:
      "BodaPesa: Britam Junior Medical covers your children on their own policy from KSh 3,378 a year. Check in the app whether a family plan works out cheaper.",
    bodySw:
      "BodaPesa: Britam Junior Medical inafunika watoto wako kwa sera yao kuanzia KSh 3,378 kwa mwaka. Angalia kwenye app kama mpango wa familia ni nafuu zaidi.",
    bodySh:
      "BodaPesa: Britam Junior Medical inacover watoto wako kwa policy yao kuanzia KSh 3,378 kwa mwaka. Check kwa app kama family plan ni cheap zaidi.",
  },

  /* ══════════════════════════════════════ Britam — growing money ══ */
  {
    productCode: "BRT-MMF",
    name: "Money Market Fund — KSh 1,000 on *778#",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { hasBankAccount: false },
    bodyEn:
      "BodaPesa: Britam Money Market Fund starts at KSh 1,000 on *778#. Interest daily, money back to M-Pesa in about 48 hours. CMA regulated, not a WhatsApp scheme.",
    bodySw:
      "BodaPesa: Britam Money Market Fund inaanza KSh 1,000 kwa *778#. Riba kila siku, pesa inarudi M-Pesa ndani ya saa 48. Inadhibitiwa na CMA, si mpango wa WhatsApp.",
    bodySh:
      "BodaPesa: Britam Money Market Fund inaanza KSh 1,000 kwa *778#. Interest kila siku, doo inarudi M-Pesa masaa 48. Iko CMA regulated, si scheme ya WhatsApp.",
  },
  {
    productCode: "BRT-BONDPLUS",
    name: "Bond Plus — for money you will not touch",
    objective: "PRODUCT_PUSH",
    channels: "SMS",
    segment: { incomeBands: [">1500"] },
    bodyEn:
      "BodaPesa: Britam Bond Plus suits money you can leave for several years. Start with the Money Market Fund first if you may need it sooner. Details in the app.",
    bodySw:
      "BodaPesa: Britam Bond Plus inafaa pesa unayoweza kuiacha miaka kadhaa. Anza na Money Market Fund kwanza ikiwa unaweza kuihitaji mapema. Maelezo kwenye app.",
    bodySh:
      "BodaPesa: Britam Bond Plus inafaa doo unayoweza kuiacha miaka kadhaa. Anza na Money Market Fund kwanza kama unaweza kuihitaji mapema. Details kwa app.",
  },
  {
    productCode: "BRT-IPP",
    name: "Pension — nobody is saving one for you",
    objective: "EDUCATION",
    channels: "SMS,WHATSAPP",
    segment: { statuses: ["ACTIVE", "ONBOARDED"] },
    bodyEn:
      "BodaPesa: No employer is putting a pension aside for you. Britam's plan takes KSh 500 whenever you can pay, guarantees at least 5% a year. More in the app.",
    bodySw:
      "BodaPesa: Hakuna mwajiri anayekuwekea pensheni. Mpango wa Britam unachukua KSh 500 wakati wowote, unahakikisha angalau 5% kwa mwaka. Zaidi kwenye app.",
    bodySh:
      "BodaPesa: Hakuna employer anayekuwekea pension. Plan ya Britam inachukua KSh 500 wakati wowote unaweza kulipa, inaguarantee angalau 5% kwa mwaka. Zaidi kwa app.",
  },
];
