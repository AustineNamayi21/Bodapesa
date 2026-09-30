/**
 * The BodaPesa financial literacy curriculum.
 *
 * Four modules — Savings, Credit, Investment, Insurance — of three lessons
 * each. Every lesson exists in three registers: English, Kiswahili and Sheng,
 * plus a condensed version that fits one SMS / USSD screen so the same
 * curriculum can be delivered to a feature phone.
 */

export interface SeedQuestion {
  promptEn: string;
  promptSw: string;
  promptSh: string;
  options: { en: string[]; sw: string[]; sh: string[] };
  correctIndex: number;
  explanationEn: string;
  explanationSw: string;
}

export interface SeedLesson {
  code: string;
  moduleKey: "SAVINGS" | "CREDIT" | "INVESTMENT" | "INSURANCE";
  order: number;
  durationMin: number;
  titleEn: string;
  titleSw: string;
  titleSh: string;
  bodyEn: string;
  bodySw: string;
  bodySh: string;
  smsEn: string;
  smsSw: string;
  smsSh: string;
  questions: SeedQuestion[];
}

export const SEED_LESSONS: SeedLesson[] = [
  // ================================================================ SAVINGS ==
  {
    code: "SAV-1",
    moduleKey: "SAVINGS",
    order: 1,
    durationMin: 4,
    titleEn: "Pay yourself first",
    titleSw: "Jilipe wewe kwanza",
    titleSh: "Jilipe wewe kwanza",
    bodyEn:
      "Most riders save what is left at the end of the day. On a good day something remains; on most days nothing does. The fix is to reverse the order.\n\nDecide on a fixed amount — KSh 100, KSh 150, whatever survives a slow Tuesday — and move it out of your pocket the moment you earn it, before fuel, before lunch, before the stage. Treat it like a debt you owe yourself and pay it first.\n\nKSh 100 a day is KSh 3,000 a month and KSh 36,000 a year. That is share capital in a SACCO, a year of insurance premiums, and the start of an emergency fund. The amount matters far less than the fact that it leaves your hands before you can spend it.\n\nThe practical trick: use a separate mobile money account or a SACCO paybill, not the same wallet you buy fuel from. Money you can see is money you will spend.",
    bodySw:
      "Waendeshaji wengi huweka akiba kile kinachobaki mwisho wa siku. Siku nzuri kitu hubaki; siku nyingi hakuna kinachobaki. Suluhisho ni kubadilisha mpangilio.\n\nAmua kiasi maalum — KSh 100, KSh 150, chochote kinachoweza kuvumilia siku ya biashara ndogo — na ukitoe mfukoni mwako mara tu unapokipata, kabla ya mafuta, kabla ya chakula, kabla ya kituo. Kichukulie kama deni unalojidai mwenyewe na ulipe kwanza.\n\nKSh 100 kwa siku ni KSh 3,000 kwa mwezi na KSh 36,000 kwa mwaka. Hiyo ni hisa katika SACCO, mwaka wa malipo ya bima, na mwanzo wa akiba ya dharura. Kiasi si muhimu kama ukweli kwamba kinatoka mikononi mwako kabla hujakitumia.\n\nUjanja wa vitendo: tumia akaunti tofauti ya pesa za simu au paybill ya SACCO, si pochi ile ile unayonunulia mafuta. Pesa unayoiona ni pesa utakayoitumia.",
    bodySh:
      "Madere wengi husave kile kimebaki end of day. Siku poa kitu inabaki; siku nyingi hakuna kitu. Fix ni kureverse hiyo order.\n\nDecide amount fixed — KSh 100, KSh 150, kitu kinaweza survive siku ya mchezo mbaya — na uitoe kwa mfuko yako immediately unaipata, kabla ya fuel, kabla ya lunch, kabla ya base. Ichukue kama deni unadaiwa na wewe mwenyewe.\n\nKSh 100 kwa siku ni KSh 3,000 kwa mwezi na KSh 36,000 kwa mwaka. Hiyo ni shares kwa SACCO, bima ya mwaka mzima, na mwanzo wa emergency fund. Amount si issue kubwa kama ukweli ati inatoka kwa mkono kabla ujaitumia.\n\nTrick: tumia mpesa account tofauti ama paybill ya SACCO, si ile wallet unanunua fuel nayo. Doo unaiona ni doo utaitumia.",
    smsEn:
      "BodaPesa tip: Save FIRST, not last. Move KSh 100 out of your pocket before fuel and lunch. That is KSh 36,000 a year. Dial *384*14791# to start.",
    smsSw:
      "BodaPesa: Weka akiba KWANZA, si mwisho. Toa KSh 100 mfukoni kabla ya mafuta na chakula. Ni KSh 36,000 kwa mwaka. Piga *384*14791#.",
    smsSh:
      "BodaPesa: Save KWANZA, si last. Toa KSh 100 kabla ya fuel na lunch. Hiyo ni KSh 36,000 kwa year. Dial *384*14791#.",
    questions: [
      {
        promptEn: "When is the best time to put money aside?",
        promptSw: "Ni wakati gani mzuri zaidi wa kuweka pesa kando?",
        promptSh: "Ni wakati gani best wa kuweka doo pembeni?",
        options: {
          en: [
            "At the end of the day, from whatever is left",
            "As soon as you earn it, before any spending",
            "At the end of the month when you count your income",
            "Only when you have a large amount at once",
          ],
          sw: [
            "Mwisho wa siku, kutoka kile kilichobaki",
            "Mara tu unapoipata, kabla ya matumizi yoyote",
            "Mwisho wa mwezi unapohesabu kipato chako",
            "Tu unapokuwa na kiasi kikubwa kwa mara moja",
          ],
          sh: [
            "End ya siku, kutoka kwa iliyobaki",
            "Immediately unaipata, kabla ya kutumia",
            "End ya mwezi ukicount income",
            "Tu ukikuwa na doo nyingi kwa mara moja",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Saving what is left over rarely works, because there is usually nothing left. Moving a fixed amount out first makes saving automatic rather than optional.",
        explanationSw:
          "Kuweka akiba kile kinachobaki mara chache hufanikiwa, kwa sababu mara nyingi hakuna kinachobaki. Kutoa kiasi maalum kwanza hufanya kuweka akiba kuwa jambo la kawaida badala ya hiari.",
      },
      {
        promptEn: "Saving KSh 100 every day adds up to roughly how much in a year?",
        promptSw: "Kuweka akiba ya KSh 100 kila siku hufikia takriban kiasi gani kwa mwaka?",
        promptSh: "Kusave KSh 100 kila siku inafika ngapi kwa year?",
        options: {
          en: ["KSh 3,600", "KSh 12,000", "KSh 36,000", "KSh 100,000"],
          sw: ["KSh 3,600", "KSh 12,000", "KSh 36,000", "KSh 100,000"],
          sh: ["KSh 3,600", "KSh 12,000", "KSh 36,000", "KSh 100,000"],
        },
        correctIndex: 2,
        explanationEn:
          "KSh 100 × 365 days is about KSh 36,500 — enough for share capital, a year of premiums and the beginning of an emergency fund.",
        explanationSw:
          "KSh 100 × siku 365 ni takriban KSh 36,500 — inatosha kwa hisa, malipo ya bima ya mwaka mmoja na mwanzo wa akiba ya dharura.",
      },
    ],
  },
  {
    code: "SAV-2",
    moduleKey: "SAVINGS",
    order: 2,
    durationMin: 5,
    titleEn: "Your emergency fund",
    titleSw: "Akiba yako ya dharura",
    titleSh: "Emergency fund yako",
    bodyEn:
      "A puncture, a police fine, a chain snapping, a child falling sick — none of these are surprises. They are certainties with unknown dates. The only question is whether you meet them with savings or with a loan.\n\nAn emergency fund is money set aside purely for these events. Aim first for KSh 10,000 — enough to cover the most common breakdown without borrowing. Then build toward three months of household expenses.\n\nKeep it somewhere with friction but not a wall: a money market fund or a Twiga-type savings account, not your daily wallet and not a fixed deposit you cannot break. You want it reachable in two days, not two minutes.\n\nThe rider with KSh 10,000 set aside and the rider without it earn the same money. But one of them loses three days of work to a breakdown and the other loses three days of work plus a loan at 1% a day.",
    bodySw:
      "Pancha, faini ya polisi, mnyororo kukatika, mtoto kuugua — hakuna hata moja kati ya haya ni mshangao. Ni mambo ya hakika yenye tarehe zisizojulikana. Swali pekee ni kama utayakabili kwa akiba au kwa mkopo.\n\nAkiba ya dharura ni pesa iliyotengwa kwa matukio haya tu. Lenga kwanza KSh 10,000 — inayotosha kushughulikia hitilafu ya kawaida bila kukopa. Kisha jenga hadi matumizi ya miezi mitatu ya nyumbani.\n\nIweke mahali penye kizuizi kidogo lakini si ukuta: mfuko wa soko la fedha au akaunti ya aina ya Twiga, si pochi yako ya kila siku wala amana ya kudumu usiyoweza kuvunja. Unataka iweze kufikiwa ndani ya siku mbili, si dakika mbili.\n\nMwendeshaji mwenye KSh 10,000 iliyotengwa na yule asiye nayo hupata pesa sawa. Lakini mmoja hupoteza siku tatu za kazi kwa hitilafu, mwingine hupoteza siku tatu pamoja na mkopo wa asilimia 1 kwa siku.",
    bodySh:
      "Pancha, faini ya karao, chain kukatika, mtoi kuwa mgonjwa — hakuna ya hizi ni surprise. Ni vitu zitahappen, tu hatujui lini. Question ni kama utazimeet na savings ama na loan.\n\nEmergency fund ni doo umeweka pembeni kwa hizi vitu pekee. Target ya kwanza KSh 10,000 — inatosha kufix breakdown ya kawaida bila kukopa. Halafu jenga hadi expenses za miezi tatu.\n\nIweke mahali iko na friction kiasi lakini si wall: money market fund ama savings account ka Twiga, si wallet ya kila siku na si fixed deposit huwezi break. Unataka uifikie ndani ya siku mbili, si dakika mbili.\n\nDere mwenye KSh 10,000 pembeni na yule hana wanapata doo sawa. Lakini mmoja anapoteza siku tatu za kazi kwa breakdown, mwingine anapoteza siku tatu plus loan ya 1% kwa siku.",
    smsEn:
      "BodaPesa: A breakdown is not a surprise, it is a date you do not know yet. Build KSh 10,000 you only touch for emergencies. Dial *384*14791#.",
    smsSw:
      "BodaPesa: Hitilafu si mshangao, ni tarehe usiyoijua bado. Jenga KSh 10,000 utakayogusa kwa dharura pekee. Piga *384*14791#.",
    smsSh:
      "BodaPesa: Breakdown si surprise, ni date haujaijua tu. Jenga KSh 10,000 utaitouch kwa emergency pekee. Dial *384*14791#.",
    questions: [
      {
        promptEn: "Where should an emergency fund be kept?",
        promptSw: "Akiba ya dharura inapaswa kuwekwa wapi?",
        promptSh: "Emergency fund inafaa kuwekwa wapi?",
        options: {
          en: [
            "In your daily mobile money wallet",
            "In a long fixed deposit you cannot break",
            "Somewhere safe you can reach within a day or two",
            "In cash at the stage",
          ],
          sw: [
            "Katika pochi yako ya kila siku ya pesa za simu",
            "Katika amana ya kudumu ya muda mrefu usiyoweza kuvunja",
            "Mahali salama unapoweza kufikia ndani ya siku moja au mbili",
            "Kwa fedha taslimu kituoni",
          ],
          sh: [
            "Kwa mpesa wallet ya kila siku",
            "Kwa fixed deposit ndefu huwezi break",
            "Mahali safe unaweza reach ndani ya siku moja ama mbili",
            "Cash base",
          ],
        },
        correctIndex: 2,
        explanationEn:
          "An emergency fund needs to be reachable quickly but not so easy to reach that it gets spent. A money market fund or a short-notice savings account strikes that balance.",
        explanationSw:
          "Akiba ya dharura inahitaji kufikiwa haraka lakini isiwe rahisi kiasi cha kutumiwa. Mfuko wa soko la fedha au akaunti ya akiba ya notisi fupi hufanya usawa huo.",
      },
      {
        promptEn: "What is a sensible first emergency fund target for a rider?",
        promptSw: "Ni lengo gani la kwanza la busara la akiba ya dharura kwa mwendeshaji?",
        promptSh: "Ni target gani ya kwanza ya emergency fund inamake sense kwa dere?",
        options: {
          en: ["KSh 500", "KSh 10,000", "KSh 500,000", "One year of income"],
          sw: ["KSh 500", "KSh 10,000", "KSh 500,000", "Kipato cha mwaka mmoja"],
          sh: ["KSh 500", "KSh 10,000", "KSh 500,000", "Income ya year moja"],
        },
        correctIndex: 1,
        explanationEn:
          "KSh 10,000 covers the most common breakdowns and medical costs without borrowing. Three months of household expenses is the longer-term goal.",
        explanationSw:
          "KSh 10,000 hushughulikia hitilafu za kawaida na gharama za matibabu bila kukopa. Matumizi ya miezi mitatu ya nyumbani ni lengo la muda mrefu.",
      },
    ],
  },
  {
    code: "SAV-3",
    moduleKey: "SAVINGS",
    order: 3,
    durationMin: 4,
    titleEn: "Separate the bike's money from your money",
    titleSw: "Tenganisha pesa ya pikipiki na pesa yako",
    titleSh: "Separate doo ya pikipiki na doo yako",
    bodyEn:
      "The bike is a business. You are its employee. The day those two get mixed up is the day the business starts losing.\n\nEvery shilling that comes in has four jobs before it is yours: fuel, maintenance and service, insurance and licences, and loan or daily-target repayment. What remains after those four is your wage. Most riders skip the maintenance and insurance jobs entirely, which is why a service becomes a crisis and a crash becomes a catastrophe.\n\nSet aside a small fixed amount per day for servicing — even KSh 50 builds KSh 1,500 a month, roughly what a decent service costs. Do the same for insurance so the annual premium is already sitting there when it falls due.\n\nWrite down what you take in and what you spend for just two weeks. Almost every rider who does this discovers a leak they did not know about — and finds their savings amount without earning a shilling more.",
    bodySw:
      "Pikipiki ni biashara. Wewe ni mfanyakazi wake. Siku hizo mbili zinapochanganyika ndiyo siku biashara inaanza kupoteza.\n\nKila shilingi inayoingia ina kazi nne kabla haijawa yako: mafuta, matengenezo na huduma, bima na leseni, na malipo ya mkopo au lengo la kila siku. Kinachobaki baada ya hizo nne ndicho mshahara wako. Waendeshaji wengi huruka kazi za matengenezo na bima kabisa, ndiyo maana huduma inakuwa mgogoro na ajali inakuwa janga.\n\nTenga kiasi kidogo maalum kwa siku kwa matengenezo — hata KSh 50 hujenga KSh 1,500 kwa mwezi, takriban gharama ya huduma nzuri. Fanya vivyo hivyo kwa bima ili malipo ya mwaka yawe tayari yapo yanapofika.\n\nAndika kinachoingia na kinachotoka kwa wiki mbili tu. Karibu kila mwendeshaji anayefanya hivi hugundua uvujaji asioujua — na hupata kiasi cha akiba bila kuongeza shilingi.",
    bodySh:
      "Pikipiki ni biashara. Wewe ni mfanyakazi wake. Siku hizo mbili zinachanganyikana ndio siku biz inaanza kupoteza.\n\nKila shilingi inaingia iko na kazi nne kabla iwe yako: fuel, service na maintenance, bima na licence, na loan ama target. Inayobaki baada ya hizo nne ndio mshahara wako. Madere wengi wanaskip service na bima kabisa, ndio maana service inakuwa crisis na accident inakuwa disaster.\n\nWeka pembeni kidogo kila siku kwa service — hata KSh 50 inajenga KSh 1,500 kwa mwezi, karibu bei ya service poa. Fanya same kwa bima ili premium ya mwaka ikuwe iko ready ikifika.\n\nAndika inayoingia na inayotoka kwa wiki mbili tu. Karibu kila dere anafanya hii anadiscover leak hakujua — na anapata savings bila kuongeza shilingi.",
    smsEn:
      "BodaPesa: Your bike is a business. Fuel, service, insurance and repayment come out first. What is left is your wage. Track it for 2 weeks. *384*14791#",
    smsSw:
      "BodaPesa: Pikipiki yako ni biashara. Mafuta, huduma, bima na mkopo hutoka kwanza. Kilichobaki ni mshahara wako. Fuatilia wiki 2. *384*14791#",
    smsSh:
      "BodaPesa: Pikipiki yako ni biz. Fuel, service, bima na loan zinatoka kwanza. Inayobaki ni mshahara. Track kwa wiki 2. *384*14791#",
    questions: [
      {
        promptEn: "Which cost do riders most often leave out of their daily calculations?",
        promptSw: "Ni gharama gani ambayo waendeshaji mara nyingi huiacha katika hesabu zao za kila siku?",
        promptSh: "Ni gharama gani madere wanaforget mostly kwa calculation ya kila siku?",
        options: {
          en: ["Fuel", "Lunch", "Servicing and insurance", "Stage fees"],
          sw: ["Mafuta", "Chakula cha mchana", "Matengenezo na bima", "Ada ya kituo"],
          sh: ["Fuel", "Lunch", "Service na bima", "Base fee"],
        },
        correctIndex: 2,
        explanationEn:
          "Fuel is paid daily so it is never forgotten. Servicing and insurance arrive occasionally, so they get treated as shocks instead of costs — which is exactly why they hurt.",
        explanationSw:
          "Mafuta hulipwa kila siku hivyo hayasahauliwi. Matengenezo na bima hufika mara chache, hivyo huchukuliwa kama mshtuko badala ya gharama — ndiyo maana huumiza.",
      },
      {
        promptEn: "What should you treat as your actual wage?",
        promptSw: "Ni kipi unapaswa kukichukulia kama mshahara wako halisi?",
        promptSh: "Ni nini unafaa kuchukulia kama mshahara wako halisi?",
        options: {
          en: [
            "Everything the bike brings in that day",
            "What remains after fuel, service, insurance and repayment",
            "Half of the day's takings",
            "Whatever is in your pocket at night",
          ],
          sw: [
            "Kila kitu pikipiki inacholeta siku hiyo",
            "Kinachobaki baada ya mafuta, huduma, bima na mkopo",
            "Nusu ya mapato ya siku",
            "Chochote kilicho mfukoni usiku",
          ],
          sh: [
            "Kila kitu pikipiki imeleta siku hiyo",
            "Inayobaki baada ya fuel, service, bima na loan",
            "Nusu ya collection ya siku",
            "Chochote iko kwa mfuko usiku",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Treating gross takings as income is the most common reason a profitable bike still leaves a rider broke.",
        explanationSw:
          "Kuchukulia mapato yote kama kipato ndiyo sababu ya kawaida zaidi ya pikipiki yenye faida kumwacha mwendeshaji bila pesa.",
      },
    ],
  },

  // ================================================================= CREDIT ==
  {
    code: "CRE-1",
    moduleKey: "CREDIT",
    order: 1,
    durationMin: 5,
    titleEn: "What a loan really costs",
    titleSw: "Gharama halisi ya mkopo",
    titleSh: "Loan inakucost ngapi kwa ukweli",
    bodyEn:
      "A loan advertised at \"1% a day\" sounds smaller than one at \"12% a year\". It is about thirty times more expensive.\n\nOne percent a day is roughly 30% a month and around 365% a year. Twelve percent a year on a reducing balance means you pay interest only on what you still owe, so the real cost falls every month you repay. These are not neighbours. They are different worlds.\n\nBefore you accept any loan, ask one question: what is the total amount I will hand back? Not the rate, not the monthly instalment — the total. KSh 10,000 borrowed for 30 days at 1% a day comes back as about KSh 13,000. The same KSh 10,000 from a SACCO at 12% reducing over a year costs a few hundred shillings in interest.\n\nThe expensive loan is not always wrong. If a KSh 3,000 fee today keeps you earning all week, it may be worth it. But you should be choosing it with the number in front of you, not discovering it afterwards.",
    bodySw:
      "Mkopo unaotangazwa kwa \"asilimia 1 kwa siku\" husikika mdogo kuliko wa \"asilimia 12 kwa mwaka\". Ni ghali takriban mara thelathini zaidi.\n\nAsilimia moja kwa siku ni takriban asilimia 30 kwa mwezi na karibu asilimia 365 kwa mwaka. Asilimia kumi na mbili kwa mwaka kwa salio linalopungua ina maana unalipa riba kwa unachodaiwa tu, hivyo gharama halisi hupungua kila mwezi unapolipa.\n\nKabla ya kukubali mkopo wowote, uliza swali moja: jumla ya kiasi nitakachorudisha ni kipi? Si kiwango, si malipo ya mwezi — jumla. KSh 10,000 iliyokopwa kwa siku 30 kwa asilimia 1 kwa siku hurudi kama KSh 13,000. KSh 10,000 hiyo hiyo kutoka SACCO kwa asilimia 12 ya salio linalopungua kwa mwaka hugharimu mia chache za shilingi kwa riba.\n\nMkopo ghali si mbaya kila wakati. Lakini unapaswa kuuchagua ukiwa na namba mbele yako, si kuigundua baadaye.",
    bodySh:
      "Loan inaadvertisewa kama \"1% kwa siku\" inasikika ndogo kuliko ya \"12% kwa mwaka\". Ni ghali mara thelathini zaidi.\n\nOne percent kwa siku ni around 30% kwa mwezi na 365% kwa mwaka. Twelve percent kwa mwaka kwa reducing balance ina maana unalipa interest kwa deni iliyobaki pekee, kwa hivyo cost inapungua kila mwezi unalipa. Hizi si majirani. Ni dunia mbili tofauti.\n\nKabla uaccept loan yoyote, uliza question moja: total nitarudisha ni ngapi? Si rate, si monthly instalment — total. KSh 10,000 ya siku 30 kwa 1% kwa siku inarudi kama KSh 13,000. Hiyo hiyo KSh 10,000 kutoka SACCO kwa 12% reducing kwa mwaka inakucost mia chache za interest.\n\nLoan ghali si mbaya kila time. Lakini unafaa kuichagua na number mbele yako, si kuidiscover baadaye.",
    smsEn:
      "BodaPesa: 1% a day is about 365% a year. Always ask the TOTAL you will repay, not the rate. Compare before you borrow: *384*14791#",
    smsSw:
      "BodaPesa: Asilimia 1 kwa siku ni takriban 365% kwa mwaka. Uliza JUMLA utakayolipa, si kiwango. Linganisha: *384*14791#",
    smsSh:
      "BodaPesa: 1% kwa siku ni around 365% kwa mwaka. Uliza TOTAL utarudisha, si rate. Compare kabla ukope: *384*14791#",
    questions: [
      {
        promptEn: "A loan charging 1% per day costs roughly how much per year?",
        promptSw: "Mkopo unaotoza asilimia 1 kwa siku hugharimu takriban kiasi gani kwa mwaka?",
        promptSh: "Loan inacharge 1% kwa siku inacost around ngapi kwa mwaka?",
        options: {
          en: ["About 12%", "About 36%", "About 100%", "About 365%"],
          sw: ["Takriban 12%", "Takriban 36%", "Takriban 100%", "Takriban 365%"],
          sh: ["Around 12%", "Around 36%", "Around 100%", "Around 365%"],
        },
        correctIndex: 3,
        explanationEn:
          "1% × 365 days ≈ 365% a year, before compounding. Daily pricing hides the size of the number.",
        explanationSw:
          "Asilimia 1 × siku 365 ≈ asilimia 365 kwa mwaka. Bei ya kila siku huficha ukubwa wa namba.",
      },
      {
        promptEn: "What is the single most useful question to ask before taking a loan?",
        promptSw: "Ni swali gani muhimu zaidi la kuuliza kabla ya kuchukua mkopo?",
        promptSh: "Ni question gani muhimu zaidi kuuliza kabla uchukue loan?",
        options: {
          en: [
            "How fast will the money arrive?",
            "What is the total amount I will repay?",
            "What is the monthly instalment?",
            "Who else has borrowed from them?",
          ],
          sw: [
            "Pesa itafika haraka kiasi gani?",
            "Jumla ya kiasi nitakacholipa ni kipi?",
            "Malipo ya mwezi ni kiasi gani?",
            "Ni nani mwingine amekopa kwao?",
          ],
          sh: [
            "Doo itafika haraka aje?",
            "Total nitarudisha ni ngapi?",
            "Monthly instalment ni ngapi?",
            "Ni nani mwingine amekopa hapo?",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "The total repayment is the only figure that cannot be dressed up. Rates and instalments can both be presented to look small.",
        explanationSw:
          "Jumla ya malipo ndiyo namba pekee isiyoweza kupambwa. Viwango na malipo ya mwezi vyote vinaweza kuonyeshwa vidogo.",
      },
    ],
  },
  {
    code: "CRE-2",
    moduleKey: "CREDIT",
    order: 2,
    durationMin: 4,
    titleEn: "Debt that builds, debt that eats",
    titleSw: "Deni linalojenga na deni linalokula",
    titleSh: "Deni inajenga na deni inakula",
    bodyEn:
      "There are only two kinds of debt. One buys something that earns. The other buys something that disappears.\n\nA loan that puts you on your own bike is the first kind. If you currently pay KSh 500 a day to hire, that KSh 500 is already leaving you — the only question is whether it leaves forever or becomes a repayment that ends with a logbook in your name. Asset finance at 18% reducing over 48 months converts rent into ownership.\n\nA loan for a phone, a wedding contribution, or a bet is the second kind. The money is gone, the repayment stays. That is how riders end up borrowing from one app to pay another.\n\nThe test is one sentence: after this loan is repaid, will I own something that still earns? If the answer is no, the loan should be small, short, and rare.",
    bodySw:
      "Kuna aina mbili tu za deni. Moja hununua kitu kinachoingiza kipato. Nyingine hununua kitu kinachotoweka.\n\nMkopo unaokuweka kwenye pikipiki yako mwenyewe ni wa aina ya kwanza. Kama sasa unalipa KSh 500 kwa siku kukodi, hizo KSh 500 tayari zinakuondoka — swali pekee ni kama zinaondoka milele au zinakuwa malipo yanayoishia na logbook kwa jina lako. Ufadhili wa mali kwa asilimia 18 ya salio linalopungua kwa miezi 48 hubadilisha kodi kuwa umiliki.\n\nMkopo wa simu, mchango wa harusi, au kamari ni wa aina ya pili. Pesa imeisha, deni linabaki. Ndivyo waendeshaji huishia kukopa programu moja kulipa nyingine.\n\nKipimo ni sentensi moja: baada ya mkopo huu kulipwa, nitamiliki kitu kinachoendelea kuingiza kipato? Jibu likiwa hapana, mkopo uwe mdogo, mfupi, na wa nadra.",
    bodySh:
      "Kuna aina mbili tu za deni. Moja inanunua kitu inaingiza doo. Ingine inanunua kitu inapotea.\n\nLoan inakuweka kwa pikipiki yako ni ya kwanza. Kama saa hii unalipa KSh 500 kwa siku kukodi, hiyo KSh 500 tayari inakuacha — question ni kama inaenda forever ama inakuwa repayment inaishia na logbook kwa jina lako. Asset finance ya 18% reducing kwa miezi 48 inabadilisha rent kuwa ownership.\n\nLoan ya simu, contribution ya harusi, ama beti ni ya pili. Doo imeisha, deni imebaki. Ndio maana madere wanaishia kukopa app moja kulipa ingine.\n\nTest ni sentence moja: baada ya hii loan kuisha, nitakuwa na kitu bado inaingiza doo? Kama jibu ni hapana, loan iwe ndogo, fupi, na ya nadra.",
    smsEn:
      "BodaPesa: Ask before you borrow — after I repay, will I own something that still earns? Turn your daily hire into your own logbook. *384*14791#",
    smsSw:
      "BodaPesa: Uliza kabla ya kukopa — nikilipa, nitamiliki kitu kinachoingiza kipato? Badilisha kodi ya kila siku kuwa logbook yako. *384*14791#",
    smsSh:
      "BodaPesa: Uliza kabla ukope — nikilipa, nitakuwa na kitu bado inaingiza doo? Badilisha hire ya kila siku kuwa logbook yako. *384*14791#",
    questions: [
      {
        promptEn: "Which of these is productive debt?",
        promptSw: "Ni lipi kati ya haya ni deni lenye tija?",
        promptSh: "Ni ipi kati ya hizi ni deni ya maana?",
        options: {
          en: [
            "A loan to buy the bike you currently hire",
            "A loan to place a bet",
            "A loan to buy a new phone",
            "A loan to repay another loan",
          ],
          sw: [
            "Mkopo wa kununua pikipiki unayoikodi sasa",
            "Mkopo wa kuweka kamari",
            "Mkopo wa kununua simu mpya",
            "Mkopo wa kulipa mkopo mwingine",
          ],
          sh: [
            "Loan ya kununua pikipiki unayoihire",
            "Loan ya kuweka beti",
            "Loan ya kununua simu mpya",
            "Loan ya kulipa loan ingine",
          ],
        },
        correctIndex: 0,
        explanationEn:
          "Buying the asset you already rent converts a permanent cost into a temporary one that ends in ownership.",
        explanationSw:
          "Kununua mali unayoikodi tayari hubadilisha gharama ya kudumu kuwa ya muda inayoishia kwenye umiliki.",
      },
      {
        promptEn: "Borrowing from one lender to repay another usually means what?",
        promptSw: "Kukopa kutoka mkopeshaji mmoja kulipa mwingine mara nyingi kunamaanisha nini?",
        promptSh: "Kukopa kwa lender mmoja kulipa mwingine mostly inamaanisha nini?",
        options: {
          en: [
            "You are managing your debt well",
            "You are in a debt spiral and the total owed is growing",
            "You are building a good credit record",
            "You are saving on interest",
          ],
          sw: [
            "Unasimamia deni lako vizuri",
            "Uko kwenye mzunguko wa madeni na jumla unayodaiwa inaongezeka",
            "Unajenga rekodi nzuri ya mikopo",
            "Unaokoa riba",
          ],
          sh: [
            "Unamanage deni yako poa",
            "Uko kwa debt spiral na total unadaiwa inaongezeka",
            "Unajenga credit record poa",
            "Unasave interest",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Each roll-over adds fees and interest. The way out is a single consolidation at a lower rate plus a hard stop on new borrowing.",
        explanationSw:
          "Kila mzunguko huongeza ada na riba. Njia ya kutoka ni kuunganisha kwa kiwango cha chini na kusimamisha kabisa kukopa kwingine.",
      },
    ],
  },
  {
    code: "CRE-3",
    moduleKey: "CREDIT",
    order: 3,
    durationMin: 4,
    titleEn: "Your credit record is an asset",
    titleSw: "Rekodi yako ya mkopo ni mali",
    titleSh: "Credit record yako ni mali",
    bodyEn:
      "Every loan you take and every repayment you make is recorded. That record decides what you will be offered for the rest of your working life.\n\nA clean record is what turns a KSh 15,000 emergency loan into a KSh 400,000 asset finance approval three years later. A default — even on a KSh 500 app loan — can close that door for years. The amount does not matter to the record; the behaviour does.\n\nTwo practical rules. First, if you are going to miss a payment, talk to the lender before the due date, not after. A restructured loan is recorded very differently from a defaulted one. Second, do not let a tiny forgotten balance sit unpaid; check and clear it.\n\nBeing listed is not permanent. Clear the debt, obtain a clearance certificate, and keep a clean record going forward — the listing stops blocking you once the account is settled and time passes.",
    bodySw:
      "Kila mkopo unaochukua na kila malipo unayofanya hurekodiwa. Rekodi hiyo huamua utakachopewa kwa maisha yako yote ya kazi.\n\nRekodi safi ndiyo hubadilisha mkopo wa dharura wa KSh 15,000 kuwa idhini ya ufadhili wa mali ya KSh 400,000 miaka mitatu baadaye. Kushindwa kulipa — hata mkopo wa programu wa KSh 500 — kunaweza kufunga mlango huo kwa miaka. Kiasi hakina maana kwa rekodi; tabia ndiyo yenye maana.\n\nKanuni mbili. Kwanza, ukijua utakosa malipo, ongea na mkopeshaji kabla ya tarehe ya mwisho, si baadaye. Mkopo uliopangwa upya hurekodiwa tofauti sana na uliyoshindwa kulipwa. Pili, usiache salio dogo ulilosahau bila kulipwa; angalia na ulimalize.\n\nKuorodheshwa si kwa kudumu. Lipa deni, pata cheti cha kibali, na uendelee na rekodi safi.",
    bodySh:
      "Kila loan unachukua na kila repayment unafanya inarecordiwa. Hiyo record ndio inadecide utaofferiwa nini for the rest ya working life yako.\n\nRecord safi ndio inabadilisha emergency loan ya KSh 15,000 kuwa asset finance approval ya KSh 400,000 miaka mitatu baadaye. Default — hata ya app loan ya KSh 500 — inaweza funga huo mlango kwa miaka. Amount haina maana kwa record; behaviour ndio ina maana.\n\nRules mbili. One, ukijua utamiss payment, ongea na lender kabla ya due date, si baadaye. Loan iliyorestructuriwa inarecordiwa tofauti sana na iliyodefault. Two, usiache balance ndogo umeforget bila kulipa; check na uimalize.\n\nKulistiwa si permanent. Lipa deni, pata clearance certificate, na uendelee na record safi.",
    smsEn:
      "BodaPesa: Even a KSh 500 unpaid app loan is on your record. If you will be late, call the lender BEFORE the due date. *384*14791#",
    smsSw:
      "BodaPesa: Hata mkopo wa KSh 500 usiolipwa uko kwenye rekodi yako. Ukijua utachelewa, piga simu KABLA ya tarehe. *384*14791#",
    smsSh:
      "BodaPesa: Hata app loan ya KSh 500 haijalipwa iko kwa record yako. Ukijua utachelewa, call lender KABLA ya due date. *384*14791#",
    questions: [
      {
        promptEn: "You realise you cannot make a repayment on time. What is best?",
        promptSw: "Unagundua huwezi kulipa kwa wakati. Ni lipi bora?",
        promptSh: "Unarealise huwezi lipa on time. Ni ipi best?",
        options: {
          en: [
            "Say nothing and hope to catch up later",
            "Contact the lender before the due date to restructure",
            "Take another loan to cover it",
            "Change your phone number",
          ],
          sw: [
            "Usiseme kitu na utumaini kulipa baadaye",
            "Wasiliana na mkopeshaji kabla ya tarehe kupanga upya",
            "Chukua mkopo mwingine kulipa",
            "Badilisha nambari yako ya simu",
          ],
          sh: [
            "Usiseme kitu utumaini kucatch up baadaye",
            "Call lender kabla ya due date murestructure",
            "Chukua loan ingine kuilipa",
            "Badilisha number yako",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Lenders record a restructured loan very differently from a default, and most will negotiate if you reach them early.",
        explanationSw:
          "Wakopeshaji hurekodi mkopo uliopangwa upya tofauti sana na uliyoshindwa kulipwa, na wengi watajadiliana ukiwafikia mapema.",
      },
      {
        promptEn: "Does the size of a defaulted loan change how much it damages your record?",
        promptSw: "Je, ukubwa wa mkopo usiolipwa hubadilisha kiasi cha uharibifu kwa rekodi yako?",
        promptSh: "Je, size ya loan uliyodefault inabadilisha damage kwa record yako?",
        options: {
          en: [
            "Yes — small defaults are not recorded",
            "No — the behaviour is recorded regardless of the amount",
            "Only loans above KSh 50,000 are recorded",
            "Only bank loans are recorded",
          ],
          sw: [
            "Ndiyo — madeni madogo hayarekodiwi",
            "Hapana — tabia hurekodiwa bila kujali kiasi",
            "Mikopo zaidi ya KSh 50,000 pekee hurekodiwa",
            "Mikopo ya benki pekee hurekodiwa",
          ],
          sh: [
            "Ndio — default ndogo hazirecordiwi",
            "Hapana — behaviour inarecordiwa bila kujali amount",
            "Loans za juu ya KSh 50,000 pekee zinarecordiwa",
            "Loans za bank pekee zinarecordiwa",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "A small unpaid balance can block a large approval years later. Clear small debts deliberately rather than forgetting them.",
        explanationSw:
          "Salio dogo lisilolipwa linaweza kuzuia idhini kubwa miaka baadaye. Lipa madeni madogo kwa makusudi badala ya kuyasahau.",
      },
    ],
  },

  // ============================================================= INVESTMENT ==
  {
    code: "INV-1",
    moduleKey: "INVESTMENT",
    order: 1,
    durationMin: 5,
    titleEn: "Why saving alone is not enough",
    titleSw: "Kwa nini akiba pekee haitoshi",
    titleSh: "Kwa nini kusave pekee haitoshi",
    bodyEn:
      "Money kept under a mattress does not stay the same size. It shrinks — not in shillings, but in what those shillings buy.\n\nIf prices rise by around 6% in a year, KSh 100,000 kept as cash buys about KSh 94,000 worth of goods by the end of it. You did not lose money. You lost value, quietly, without a transaction.\n\nInvesting means putting money somewhere it earns a return that at least keeps up with rising prices. A SACCO dividend, a money market fund, a fixed deposit — these are not exotic. They are the ordinary tools that stop your savings from leaking.\n\nThe order matters: emergency fund first, then insurance so one accident cannot undo everything, then investment. Investing while uninsured and without a cushion usually ends with the investment being sold at the worst possible moment.",
    bodySw:
      "Pesa iliyohifadhiwa chini ya godoro haibaki ukubwa ule ule. Hupungua — si kwa shilingi, bali kwa kile shilingi hizo zinaweza kununua.\n\nKama bei zinapanda kwa takriban asilimia 6 kwa mwaka, KSh 100,000 iliyowekwa kama fedha taslimu hununua bidhaa za thamani ya takriban KSh 94,000 mwisho wa mwaka. Hukupoteza pesa. Ulipoteza thamani, kimya kimya, bila muamala.\n\nKuwekeza ni kuweka pesa mahali inapopata faida inayoendana angalau na kupanda kwa bei. Gawio la SACCO, mfuko wa soko la fedha, amana ya kudumu — hivi si vitu vya ajabu. Ni zana za kawaida zinazozuia akiba yako kuvuja.\n\nMpangilio ni muhimu: akiba ya dharura kwanza, kisha bima ili ajali moja isiharibu kila kitu, kisha uwekezaji.",
    bodySh:
      "Doo iko chini ya mattress haibaki size ile ile. Inapungua — si kwa shilingi, ni kwa vile hizo shilingi zinaweza nunua.\n\nKama bei zinapanda kwa around 6% kwa mwaka, KSh 100,000 ya cash inanunua vitu za thamani ya around KSh 94,000 end ya mwaka. Haukupoteza doo. Ulipoteza value, kimya kimya, bila transaction.\n\nKuinvest ni kuweka doo mahali inapata return angalau inakeep up na bei zinapanda. Dividend ya SACCO, money market fund, fixed deposit — hizi si vitu za ajabu. Ni tools za kawaida zinazuia savings yako kuleak.\n\nOrder ni muhimu: emergency fund kwanza, halafu bima ili accident moja isiharibu kila kitu, halafu investment.",
    smsEn:
      "BodaPesa: Cash loses value quietly — at 6% inflation, KSh 100,000 buys KSh 94,000 next year. Learn where to put it: *384*14791#",
    smsSw:
      "BodaPesa: Fedha taslimu hupoteza thamani kimya — kwa mfumuko wa 6%, KSh 100,000 hununua KSh 94,000 mwaka ujao. Jifunze: *384*14791#",
    smsSh:
      "BodaPesa: Cash inapoteza value kimya — kwa inflation ya 6%, KSh 100,000 inanunua KSh 94,000 next year. Jifunze: *384*14791#",
    questions: [
      {
        promptEn: "Why does cash kept at home lose value over time?",
        promptSw: "Kwa nini fedha taslimu iliyowekwa nyumbani hupoteza thamani baada ya muda?",
        promptSh: "Kwa nini cash iko home inapoteza value na time?",
        options: {
          en: [
            "The notes physically wear out",
            "Prices rise, so the same money buys less",
            "The government takes a share",
            "It does not lose value",
          ],
          sw: [
            "Noti huchakaa kimwili",
            "Bei hupanda, hivyo pesa ile ile hununua kidogo",
            "Serikali huchukua sehemu",
            "Haipotezi thamani",
          ],
          sh: [
            "Noti zinachakaa",
            "Bei zinapanda, kwa hivyo doo ile ile inanunua kidogo",
            "Serikali inachukua share",
            "Haipotezi value",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Inflation means the same shillings buy fewer goods each year. Money needs to earn a return simply to stand still.",
        explanationSw:
          "Mfumuko wa bei unamaanisha shilingi zile zile hununua bidhaa chache kila mwaka. Pesa inahitaji kupata faida ili tu kubaki pale pale.",
      },
      {
        promptEn: "What is the right order to build financial security?",
        promptSw: "Ni mpangilio gani sahihi wa kujenga usalama wa kifedha?",
        promptSh: "Ni order gani sahihi ya kujenga financial security?",
        options: {
          en: [
            "Investment, then insurance, then emergency fund",
            "Emergency fund, then insurance, then investment",
            "Insurance only",
            "Investment only — it grows fastest",
          ],
          sw: [
            "Uwekezaji, kisha bima, kisha akiba ya dharura",
            "Akiba ya dharura, kisha bima, kisha uwekezaji",
            "Bima pekee",
            "Uwekezaji pekee — hukua haraka zaidi",
          ],
          sh: [
            "Investment, halafu bima, halafu emergency fund",
            "Emergency fund, halafu bima, halafu investment",
            "Bima pekee",
            "Investment pekee — inakua fastest",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Without a cushion and cover, the first emergency forces you to sell the investment at the worst time — often at a loss.",
        explanationSw:
          "Bila akiba ya dharura na bima, dharura ya kwanza hukulazimu kuuza uwekezaji wakati mbaya zaidi — mara nyingi kwa hasara.",
      },
    ],
  },
  {
    code: "INV-2",
    moduleKey: "INVESTMENT",
    order: 2,
    durationMin: 5,
    titleEn: "Where returns actually come from",
    titleSw: "Faida hutoka wapi hasa",
    titleSh: "Return inatoka wapi kwa ukweli",
    bodyEn:
      "Any honest investment pays you because your money is being used for something real. Understanding what that something is tells you how safe the return is.\n\nA SACCO dividend comes from the interest other members pay on their loans. You own a share of a lending business, so you receive a share of what it earns. A money market fund lends to governments and large companies for short periods and passes on the interest. A fixed deposit is the institution paying you to hold your money for a set time.\n\nAll three are modest, understandable, and regulated. None of them will double your money in a month, and that is the point — a return has to come from somewhere, and returns that are too large to explain are usually being paid out of the next person's deposit.\n\nStart with what you can lose sight of for a year. A rider putting KSh 2,000 a month into a SACCO with dividends builds both an investment and the deposit base that unlocks a bike loan.",
    bodySw:
      "Uwekezaji wowote wa kweli hukulipa kwa sababu pesa yako inatumiwa kwa jambo halisi. Kuelewa jambo hilo hukuambia usalama wa faida.\n\nGawio la SACCO hutoka kwa riba wanachama wengine wanayolipa kwa mikopo yao. Unamiliki sehemu ya biashara ya ukopeshaji, hivyo unapokea sehemu ya inachopata. Mfuko wa soko la fedha hukopesha serikali na kampuni kubwa kwa muda mfupi na kupitisha riba. Amana ya kudumu ni taasisi kukulipa kushikilia pesa yako kwa muda maalum.\n\nZote tatu ni za wastani, zinazoeleweka, na zinazosimamiwa. Hakuna itakayomaradufu pesa yako kwa mwezi, na hilo ndilo jambo — faida lazima itoke mahali, na faida kubwa mno kuelezeka mara nyingi hulipwa kutoka amana ya mtu anayefuata.\n\nAnza na kile unachoweza kukiacha kwa mwaka.",
    bodySh:
      "Investment yoyote ya ukweli inakulipa kwa sababu doo yako inatumika kwa kitu halisi. Kuelewa hicho kitu inakuambia return iko safe aje.\n\nDividend ya SACCO inatoka kwa interest wanachama wengine wanalipa kwa loans zao. Unaown share ya lending business, kwa hivyo unapata share ya inachopata. Money market fund inakopesha serikali na makampuni kubwa kwa muda mfupi na inapitisha interest. Fixed deposit ni taasisi kukulipa ushikilie doo yako kwa muda fulani.\n\nZote tatu ni za wastani, zinaeleweka, na ziko regulated. Hakuna itadouble doo yako kwa mwezi, na hiyo ndio point — return lazima itoke mahali, na return kubwa sana kuexplain mostly inalipwa kutoka deposit ya mtu anayefuata.\n\nAnza na kile unaweza kuacha kwa mwaka.",
    smsEn:
      "BodaPesa: A real return always has a source — SACCO dividends come from members' loan interest. If nobody can explain it, do not invest. *384*14791#",
    smsSw:
      "BodaPesa: Faida halisi huwa na chanzo — gawio la SACCO hutoka riba ya mikopo ya wanachama. Kama hakuna anayeweza kueleza, usiwekeze. *384*14791#",
    smsSh:
      "BodaPesa: Return ya ukweli huwa na source — dividend ya SACCO inatoka interest ya loans za members. Kama hakuna anaweza explain, usiinvest. *384*14791#",
    questions: [
      {
        promptEn: "Where does a SACCO dividend come from?",
        promptSw: "Gawio la SACCO hutoka wapi?",
        promptSh: "Dividend ya SACCO inatoka wapi?",
        options: {
          en: [
            "Government grants",
            "Interest paid by members on their loans",
            "New members' registration fees only",
            "Nobody knows",
          ],
          sw: [
            "Ruzuku za serikali",
            "Riba inayolipwa na wanachama kwa mikopo yao",
            "Ada za usajili za wanachama wapya pekee",
            "Hakuna anayejua",
          ],
          sh: [
            "Grants za serikali",
            "Interest inayolipwa na members kwa loans zao",
            "Registration fees za members wapya pekee",
            "Hakuna anajua",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "A SACCO is a member-owned lending business. Its surplus comes from lending, and members share it as a dividend.",
        explanationSw:
          "SACCO ni biashara ya ukopeshaji inayomilikiwa na wanachama. Ziada yake hutoka kwa ukopeshaji, na wanachama hugawana kama gawio.",
      },
      {
        promptEn: "An investment promises to double your money in one month. What should you do?",
        promptSw: "Uwekezaji unaahidi kumaradufu pesa yako kwa mwezi mmoja. Ufanye nini?",
        promptSh: "Investment inapromise kudouble doo yako kwa mwezi moja. Ufanye nini?",
        options: {
          en: [
            "Invest quickly before the offer ends",
            "Invest a small amount to test it",
            "Walk away — that return has no honest source",
            "Ask friends to join with you",
          ],
          sw: [
            "Wekeza haraka kabla ofa haijaisha",
            "Wekeza kiasi kidogo kujaribu",
            "Ondoka — faida hiyo haina chanzo cha kweli",
            "Waombe marafiki wajiunge nawe",
          ],
          sh: [
            "Invest fast kabla offer iishe",
            "Invest kidogo utest",
            "Toka — hiyo return haina source ya ukweli",
            "Uliza wasee wajoin na wewe",
          ],
        },
        correctIndex: 2,
        explanationEn:
          "No regulated investment doubles money in a month. Such returns are paid from new deposits until the scheme collapses.",
        explanationSw:
          "Hakuna uwekezaji unaosimamiwa unaomaradufu pesa kwa mwezi. Faida hizo hulipwa kutoka amana mpya hadi mpango unaporomoka.",
      },
    ],
  },
  {
    code: "INV-3",
    moduleKey: "INVESTMENT",
    order: 3,
    durationMin: 4,
    titleEn: "Spotting a scam",
    titleSw: "Kutambua ulaghai",
    titleSh: "Kuspot scam",
    bodyEn:
      "Riders are targeted deliberately. You handle cash daily, you are reachable by phone, and stage groups spread a message fast — which is exactly what a fraudulent scheme needs.\n\nFive warning signs, any one of which should stop you: a guaranteed high return; pressure to decide today; payment to a personal mobile number rather than a registered paybill; earnings that depend on recruiting other riders; and no licence you can verify.\n\nVerification takes two minutes and costs nothing. SACCOs are licensed by SASRA, insurers and agents by the IRA, and funds and investment managers by the CMA. Every one of those registers can be checked, and a genuine institution will wait while you check.\n\nOne more rule that protects you more than any other: never send money to an individual's personal number for a financial product. Registered institutions collect through registered paybills in the institution's name.",
    bodySw:
      "Waendeshaji hulengwa kwa makusudi. Mnashughulikia fedha kila siku, mnapatikana kwa simu, na vikundi vya vituo husambaza ujumbe haraka — ndicho hasa mpango wa ulaghai unachohitaji.\n\nDalili tano za onyo, mojawapo inapaswa kukuzuia: faida kubwa ya uhakika; shinikizo la kuamua leo; malipo kwa nambari binafsi ya simu badala ya paybill iliyosajiliwa; mapato yanayotegemea kuandikisha waendeshaji wengine; na hakuna leseni unayoweza kuthibitisha.\n\nUthibitisho huchukua dakika mbili na hauna gharama. SACCO husajiliwa na SASRA, bima na mawakala na IRA, na mifuko na wasimamizi wa uwekezaji na CMA. Kila daftari linaweza kuangaliwa, na taasisi halisi itasubiri unapoangalia.\n\nKanuni moja zaidi: usiwahi kutuma pesa kwa nambari binafsi ya mtu kwa bidhaa ya kifedha.",
    bodySh:
      "Madere wanatargetiwa kwa makusudi. Mnahandle cash kila siku, mnapatikana kwa simu, na base groups zinaspread message fast — ndio hasa scheme ya ulaghai inahitaji.\n\nSigns tano za warning, moja tu inafaa kukustop: return kubwa ya guarantee; pressure ya kudecide leo; malipo kwa number binafsi badala ya paybill registered; earnings zinadepend na kurecruit madere wengine; na hakuna licence unaweza verify.\n\nKuverify ni dakika mbili na ni free. SACCO ziko licensed na SASRA, insurance na agents na IRA, na funds na investment managers na CMA. Kila register unaweza check, na taasisi ya ukweli itasubiri ucheki.\n\nRule moja zaidi: usiwahi tuma doo kwa number ya mtu binafsi kwa financial product.",
    smsEn:
      "BodaPesa: Never pay for a financial product to a personal number. SACCOs = SASRA, insurers = IRA, funds = CMA. Verify first. *384*14791#",
    smsSw:
      "BodaPesa: Usilipe bidhaa ya kifedha kwa nambari binafsi. SACCO = SASRA, bima = IRA, mifuko = CMA. Thibitisha kwanza. *384*14791#",
    smsSh:
      "BodaPesa: Usilipe financial product kwa number binafsi. SACCO = SASRA, bima = IRA, funds = CMA. Verify kwanza. *384*14791#",
    questions: [
      {
        promptEn: "Which is the clearest warning sign of a fraudulent investment?",
        promptSw: "Ni ipi dalili wazi zaidi ya uwekezaji wa ulaghai?",
        promptSh: "Ni ipi warning sign clear zaidi ya investment ya ulaghai?",
        options: {
          en: [
            "It has an office in town",
            "Your earnings depend on recruiting other people",
            "It has a website",
            "It accepts small amounts",
          ],
          sw: [
            "Ina ofisi mjini",
            "Mapato yako yanategemea kuandikisha watu wengine",
            "Ina tovuti",
            "Inakubali viasi vidogo",
          ],
          sh: [
            "Iko na ofisi town",
            "Earnings zako zinadepend na kurecruit watu wengine",
            "Iko na website",
            "Inaaccept amounts ndogo",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "When returns depend on recruitment rather than on a real business activity, the money is coming from new members — that is a pyramid.",
        explanationSw:
          "Faida inapotegemea kuandikisha badala ya shughuli halisi ya biashara, pesa inatoka kwa wanachama wapya — huo ni mpango wa piramidi.",
      },
      {
        promptEn: "Who licenses SACCOs in Kenya?",
        promptSw: "Ni nani anayesajili SACCO nchini Kenya?",
        promptSh: "Ni nani analicense SACCO Kenya?",
        options: {
          en: ["SASRA", "IRA", "CMA", "The county government"],
          sw: ["SASRA", "IRA", "CMA", "Serikali ya kaunti"],
          sh: ["SASRA", "IRA", "CMA", "Serikali ya county"],
        },
        correctIndex: 0,
        explanationEn:
          "SASRA regulates deposit-taking SACCOs, the IRA regulates insurers and agents, and the CMA regulates funds and investment managers.",
        explanationSw:
          "SASRA husimamia SACCO zinazopokea amana, IRA husimamia bima na mawakala, na CMA husimamia mifuko na wasimamizi wa uwekezaji.",
      },
    ],
  },

  // ============================================================== INSURANCE ==
  {
    code: "INS-1",
    moduleKey: "INSURANCE",
    order: 1,
    durationMin: 4,
    titleEn: "How insurance actually works",
    titleSw: "Jinsi bima inavyofanya kazi",
    titleSh: "Bima inafanya kazi aje",
    bodyEn:
      "Riders often describe insurance as money thrown away. That comes from a real experience — paying every year and receiving nothing back. But that is the mechanism working, not failing.\n\nInsurance is a thousand riders each paying a small amount into one pot so that the ten who have a serious accident this year are not destroyed by it. You are not buying a return. You are buying the removal of a risk that could end your business in one afternoon.\n\nThe cost of not having it is easy to underestimate because it arrives all at once. A single serious injury claim can exceed what a rider earns in several years. Against that, an annual premium is small.\n\nThink of it the same way you think of a helmet. You do not wear a helmet expecting to crash. You wear it because the one time it matters, nothing else will do.",
    bodySw:
      "Waendeshaji mara nyingi huelezea bima kama pesa iliyotupwa. Hilo hutoka kwa uzoefu halisi — kulipa kila mwaka bila kupokea kitu. Lakini huo ni mfumo ukifanya kazi, si kushindwa.\n\nBima ni waendeshaji elfu moja kila mmoja akilipa kiasi kidogo kwenye chungu kimoja ili wale kumi wenye ajali mbaya mwaka huu wasiangamizwe nayo. Hununui faida. Hununua kuondolewa kwa hatari inayoweza kumaliza biashara yako mchana mmoja.\n\nGharama ya kutokuwa nayo ni rahisi kudharau kwa sababu hufika yote kwa mara moja. Dai moja la jeraha kubwa linaweza kuzidi anachopata mwendeshaji kwa miaka kadhaa.\n\nIfikirie kama unavyofikiria kofia ngumu. Huvai kofia ukitegemea kuanguka. Unavaa kwa sababu mara ile moja inapohitajika, hakuna kingine kitakachotosha.",
    bodySh:
      "Madere mostly wanasema bima ni doo imetupwa. Hiyo inatoka kwa experience ya ukweli — kulipa kila mwaka bila kupata kitu. Lakini hiyo ni mechanism inafanya kazi, si kufail.\n\nBima ni madere elfu moja kila mmoja analipa kidogo kwa pot moja ili wale kumi wenye accident mbaya mwaka huu wasimalizwe nayo. Haununui return. Unanunua kuondolewa kwa risk inaweza kumaliza biz yako mchana mmoja.\n\nCost ya kukosa ni rahisi kuunderestimate kwa sababu inafika yote mara moja. Claim moja ya injury kubwa inaweza zidi unachopata kwa miaka kadhaa.\n\nIfikirie kama helmet. Huvai helmet ukitegemea kuanguka. Unavaa kwa sababu ile time moja inahitajika, hakuna kingine kitatosha.",
    smsEn:
      "BodaPesa: Insurance is 1,000 riders paying small so the 10 who crash are not finished. You are buying protection, not a return. *384*14791#",
    smsSw:
      "BodaPesa: Bima ni waendeshaji 1,000 kulipa kidogo ili wale 10 wanaopata ajali wasiishe. Unanunua ulinzi, si faida. *384*14791#",
    smsSh:
      "BodaPesa: Bima ni madere 1,000 kulipa kidogo ili wale 10 wanaanguka wasimalizike. Unanunua protection, si return. *384*14791#",
    questions: [
      {
        promptEn: "What are you buying when you pay an insurance premium?",
        promptSw: "Unanunua nini unapolipa malipo ya bima?",
        promptSh: "Unanunua nini ukilipa premium ya bima?",
        options: {
          en: [
            "A savings account that pays back with interest",
            "Protection against a loss that could ruin you",
            "A guaranteed annual payout",
            "Nothing at all",
          ],
          sw: [
            "Akaunti ya akiba inayolipa na riba",
            "Ulinzi dhidi ya hasara inayoweza kukuangamiza",
            "Malipo ya uhakika ya kila mwaka",
            "Hakuna kitu kabisa",
          ],
          sh: [
            "Savings account inarudisha na interest",
            "Protection dhidi ya hasara inaweza kukumaliza",
            "Payout ya uhakika kila mwaka",
            "Hakuna kitu kabisa",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Insurance transfers a risk you cannot afford to carry alone. Not claiming means the risk did not happen — which is the good outcome.",
        explanationSw:
          "Bima huhamisha hatari usiyoweza kubeba peke yako. Kutodai kunamaanisha hatari haikutokea — na hilo ndilo tokeo zuri.",
      },
      {
        promptEn: "Why does one accident damage an uninsured rider so badly?",
        promptSw: "Kwa nini ajali moja humdhuru sana mwendeshaji asiye na bima?",
        promptSh: "Kwa nini accident moja inamharibu sana dere asiye na bima?",
        options: {
          en: [
            "The cost arrives all at once and can exceed years of earnings",
            "Insurance companies refuse to help afterwards",
            "The police confiscate the bike permanently",
            "It does not — riders recover quickly",
          ],
          sw: [
            "Gharama hufika yote mara moja na inaweza kuzidi mapato ya miaka",
            "Kampuni za bima hukataa kusaidia baadaye",
            "Polisi hutwaa pikipiki milele",
            "Haimdhuru — waendeshaji hupona haraka",
          ],
          sh: [
            "Cost inafika yote mara moja na inaweza zidi earnings za miaka",
            "Insurance companies zinarefuse kusaidia baadaye",
            "Karao wanachukua pikipiki forever",
            "Haiharibu — madere wanarecover fast",
          ],
        },
        correctIndex: 0,
        explanationEn:
          "A single liability claim or hospital bill can exceed several years of net earnings — which is precisely the kind of risk insurance exists to absorb.",
        explanationSw:
          "Dai moja la dhima au bili ya hospitali linaweza kuzidi mapato ya miaka kadhaa — ndiyo hatari hasa bima iliyopo kuinyonya.",
      },
    ],
  },
  {
    code: "INS-2",
    moduleKey: "INSURANCE",
    order: 2,
    durationMin: 5,
    titleEn: "The covers a rider actually needs",
    titleSw: "Bima ambazo mwendeshaji anahitaji kweli",
    titleSh: "Bima dere anahitaji kwa ukweli",
    bodyEn:
      "There are five covers that matter for this trade, and most riders hold only the first.\n\nThird Party Only is required by law for any motorcycle carrying passengers for hire. It pays for injury or damage you cause to other people. It does not repair your bike and — this is the part most riders get wrong — it usually does not cover your passenger.\n\nPassenger Legal Liability is the extension that covers the person on your seat. If you carry fifteen passengers a day, this is your largest uninsured exposure.\n\nPersonal Accident covers you: medical costs, a lump sum on disability or death, and often a weekly benefit while you cannot ride. No employer will pay you sick leave.\n\nHealth cover handles illness rather than accidents, and microinsurance versions now accept small weekly payments through mobile money instead of one annual lump sum.\n\nLast expense pays a funeral benefit quickly, so your family is not raising a harambee during the worst week of their lives.",
    bodySw:
      "Kuna bima tano muhimu kwa biashara hii, na waendeshaji wengi wana ya kwanza pekee.\n\nBima ya Mtu wa Tatu inahitajika kisheria kwa pikipiki yoyote inayobeba abiria kwa malipo. Hulipa majeraha au uharibifu unaosababisha kwa wengine. Haitengenezi pikipiki yako na — hili ndilo waendeshaji wengi hukosea — mara nyingi haimlindi abiria wako.\n\nDhima ya Abiria ndiyo nyongeza inayomlinda aliye kwenye kiti chako. Ukibeba abiria kumi na watano kwa siku, hii ndiyo hatari yako kubwa zaidi isiyo na bima.\n\nAjali Binafsi hukulinda wewe: gharama za matibabu, kiasi cha jumla kwa ulemavu au kifo, na mara nyingi fidia ya kila wiki wakati huwezi kuendesha. Hakuna mwajiri atakayekulipa likizo ya ugonjwa.\n\nBima ya afya hushughulikia magonjwa badala ya ajali, na matoleo ya bima ndogo sasa hukubali malipo madogo ya kila wiki kupitia pesa za simu.\n\nBima ya mazishi hulipa haraka, ili familia yako isifanye harambee wiki mbaya zaidi ya maisha yao.",
    bodySh:
      "Kuna bima tano muhimu kwa hii biz, na madere wengi wako na ya kwanza pekee.\n\nThird Party Only inahitajika kisheria kwa pikipiki yoyote inabeba abiria kwa malipo. Inalipa injury ama damage unayocause kwa wengine. Hairepair pikipiki yako na — hii ndio madere wengi wanakosea — mostly hai-cover abiria wako.\n\nPassenger Legal Liability ndio extension inacover mtu yuko kwa seat yako. Ukibeba abiria kumi na watano kwa siku, hii ndio exposure yako kubwa.\n\nPersonal Accident inakucover wewe: medical costs, lump sum kwa disability ama kifo, na mostly weekly benefit wakati huwezi ride. Hakuna employer atakulipa sick leave.\n\nHealth cover inahandle ugonjwa si accident, na micro versions saa hii zinaaccept payments ndogo za weekly kupitia mpesa.\n\nLast expense inalipa funeral benefit fast, ili family isifanye harambee wiki mbaya zaidi ya maisha yao.",
    smsEn:
      "BodaPesa: Third party does NOT cover your passenger. You need Passenger Legal Liability too. Check your cover: *384*14791#",
    smsSw:
      "BodaPesa: Bima ya mtu wa tatu HAIMLINDI abiria wako. Unahitaji pia Dhima ya Abiria. Angalia bima yako: *384*14791#",
    smsSh:
      "BodaPesa: Third party HAI-cover abiria wako. Unahitaji pia Passenger Legal Liability. Check bima yako: *384*14791#",
    questions: [
      {
        promptEn: "Which cover protects the passenger riding on your bike?",
        promptSw: "Ni bima gani inayomlinda abiria aliye kwenye pikipiki yako?",
        promptSh: "Ni bima gani inaprotect abiria yuko kwa pikipiki yako?",
        options: {
          en: [
            "Third Party Only",
            "Passenger Legal Liability",
            "Comprehensive fire cover",
            "Last expense cover",
          ],
          sw: [
            "Bima ya Mtu wa Tatu pekee",
            "Dhima ya Kisheria ya Abiria",
            "Bima ya moto",
            "Bima ya mazishi",
          ],
          sh: [
            "Third Party Only",
            "Passenger Legal Liability",
            "Comprehensive fire cover",
            "Last expense cover",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Third party cover generally excludes the fare-paying passenger. Passenger Legal Liability is the extension that covers them.",
        explanationSw:
          "Bima ya mtu wa tatu kwa kawaida haimjumuishi abiria anayelipa nauli. Dhima ya Abiria ndiyo nyongeza inayomlinda.",
      },
      {
        promptEn: "Which cover replaces your income while you are injured and cannot ride?",
        promptSw: "Ni bima gani inayofidia kipato chako ukiwa umejeruhiwa na huwezi kuendesha?",
        promptSh: "Ni bima gani inareplace income yako ukiumia na huwezi ride?",
        options: {
          en: [
            "Third Party Only",
            "Personal Accident cover",
            "Passenger Legal Liability",
            "None — no cover does this",
          ],
          sw: [
            "Bima ya Mtu wa Tatu pekee",
            "Bima ya Ajali Binafsi",
            "Dhima ya Abiria",
            "Hakuna — hakuna bima inayofanya hivi",
          ],
          sh: [
            "Third Party Only",
            "Personal Accident cover",
            "Passenger Legal Liability",
            "Hakuna — hakuna bima inafanya hii",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Personal accident cover pays medical costs and typically a weekly benefit during recovery — the closest thing a self-employed rider has to sick pay.",
        explanationSw:
          "Bima ya ajali binafsi hulipa gharama za matibabu na mara nyingi fidia ya kila wiki wakati wa kupona — kitu kinachokaribiana zaidi na malipo ya likizo ya ugonjwa.",
      },
    ],
  },
  {
    code: "INS-3",
    moduleKey: "INSURANCE",
    order: 3,
    durationMin: 4,
    titleEn: "Making a claim that gets paid",
    titleSw: "Kudai bima ili ulipwe",
    titleSh: "Kuclaim bima ilipwe",
    bodyEn:
      "Most rejected claims are not rejected because the insurer is dishonest. They are rejected because something was missing, late, or different from what the policy said.\n\nFour habits fix almost all of it. Report the incident to the insurer immediately — most policies require notice within a set number of days, and a late report is the most common reason for refusal. Get an abstract from the police for any road incident. Photograph the scene, the bikes, the damage and any documents before anything is moved. And keep every receipt, however small.\n\nBefore you ever need to claim, know two things about your policy: what it excludes, and how long you have to report. Riding without a valid licence, carrying more passengers than permitted, or using a private-purpose policy for commercial work are exclusions that will void an otherwise good claim.\n\nKeep a photo of your policy document and your insurer's claims number on your phone. The moment you need them is not the moment to go looking.",
    bodySw:
      "Madai mengi yanayokataliwa hayakatwi kwa sababu bima si mwaminifu. Yanakataliwa kwa sababu kitu kilikosekana, kilichelewa, au kilitofautiana na sera ilivyosema.\n\nTabia nne hurekebisha karibu yote. Ripoti tukio kwa bima mara moja — sera nyingi huhitaji taarifa ndani ya siku kadhaa, na ripoti ya kuchelewa ndiyo sababu ya kawaida zaidi ya kukataliwa. Pata abstract ya polisi kwa tukio lolote la barabarani. Piga picha eneo, pikipiki, uharibifu na nyaraka kabla kitu hakijahamishwa. Na weka kila risiti, hata ndogo.\n\nKabla hujahitaji kudai, jua mambo mawili kuhusu sera yako: inayoyakataa, na muda ulio nao wa kuripoti. Kuendesha bila leseni halali, kubeba abiria zaidi ya ruhusa, au kutumia sera ya matumizi binafsi kwa kazi ya biashara ni vighairi vitakavyobatilisha dai zuri.\n\nWeka picha ya nyaraka za sera na nambari ya madai kwenye simu yako.",
    bodySh:
      "Claims nyingi zinarejectiwa si kwa sababu insurance ni mwizi. Zinarejectiwa kwa sababu kitu kilikosekana, kilichelewa, ama kilikuwa tofauti na policy ilisema.\n\nHabits nne zinafix karibu zote. Report incident kwa insurer immediately — policies nyingi zinahitaji notice ndani ya siku fulani, na report ya late ndio reason ya kawaida ya refusal. Pata abstract ya karao kwa road incident yoyote. Piga picha ya scene, pikipiki, damage na documents kabla kitu kihamishwe. Na weka kila receipt, hata ndogo.\n\nKabla uhitaji kuclaim, jua vitu viwili kuhusu policy yako: inaexclude nini, na una muda gani wa kureport. Kuride bila licence halali, kubeba abiria zaidi ya ruhusa, ama kutumia private policy kwa kazi ya biz ni exclusions zitavoid claim nzuri.\n\nWeka picha ya policy na claims number kwa simu yako.",
    smsEn:
      "BodaPesa: Report an accident to your insurer the SAME day, get a police abstract and photograph everything. Late reports are the top reason claims fail.",
    smsSw:
      "BodaPesa: Ripoti ajali kwa bima SIKU HIYO HIYO, pata abstract ya polisi na piga picha kila kitu. Ripoti za kuchelewa ndizo sababu kuu ya madai kukataliwa.",
    smsSh:
      "BodaPesa: Report accident kwa insurer SIKU HIYO, pata police abstract na piga picha kila kitu. Late reports ndio reason kuu claims zinafail.",
    questions: [
      {
        promptEn: "What is the most common reason a valid claim is refused?",
        promptSw: "Ni sababu gani ya kawaida zaidi ya dai halali kukataliwa?",
        promptSh: "Ni reason gani ya kawaida zaidi claim halali inarejectiwa?",
        options: {
          en: [
            "The premium was too low",
            "The incident was reported late",
            "The rider was too young",
            "The bike was too old",
          ],
          sw: [
            "Malipo yalikuwa madogo mno",
            "Tukio liliripotiwa kwa kuchelewa",
            "Mwendeshaji alikuwa mdogo mno",
            "Pikipiki ilikuwa ya zamani mno",
          ],
          sh: [
            "Premium ilikuwa ndogo sana",
            "Incident ilireportiwa late",
            "Dere alikuwa mdogo sana",
            "Pikipiki ilikuwa ya zamani sana",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Policies set a reporting window, often just a few days. Notify your insurer immediately, even before you have all the documents.",
        explanationSw:
          "Sera huweka muda wa kuripoti, mara nyingi siku chache tu. Mjulishe bima wako mara moja, hata kabla ya kuwa na nyaraka zote.",
      },
      {
        promptEn: "Which of these would most likely void a motor claim?",
        promptSw: "Ni lipi kati ya haya lingeweza kubatilisha dai la pikipiki?",
        promptSh: "Ni ipi kati ya hizi inaweza void claim ya pikipiki?",
        options: {
          en: [
            "Riding with a valid licence",
            "Using a private-purpose policy for commercial carrying",
            "Having a police abstract",
            "Taking photos of the scene",
          ],
          sw: [
            "Kuendesha na leseni halali",
            "Kutumia sera ya matumizi binafsi kwa kubeba abiria kibiashara",
            "Kuwa na abstract ya polisi",
            "Kupiga picha za eneo",
          ],
          sh: [
            "Kuride na licence halali",
            "Kutumia private policy kwa kubeba abiria kibiashara",
            "Kuwa na police abstract",
            "Kupiga picha za scene",
          ],
        },
        correctIndex: 1,
        explanationEn:
          "Carrying fare-paying passengers on a private policy is a breach of the policy terms and is a standard exclusion.",
        explanationSw:
          "Kubeba abiria wanaolipa nauli kwa sera ya binafsi ni kuvunja masharti ya sera na ni kighairi cha kawaida.",
      },
    ],
  },
];
