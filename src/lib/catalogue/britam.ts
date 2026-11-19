import type { CatalogueEntry } from "./types";

/**
 * Britam's actual products, as published on ke.britam.com and
 * connect.britam.com.
 *
 * Britam Connect is the group's microinsurance arm, licensed by the IRA in
 * March 2025 and built for exactly this market — it says so itself, and its
 * launch material names boda boda riders among the people it covers through
 * personal accident insurance bundled with mobile data.
 *
 * Prices below are the published "from" figures. A real premium depends on
 * the rider, the bike and the cover chosen, so every entry says so rather
 * than quoting a number as if it were a quote.
 */

const SRC_CONNECT_HEALTH = "https://connect.britam.com/categories/health";
const SRC_CONNECT_LAST = "https://connect.britam.com/categories/last-expense-solutions";
const SRC_CONNECT_PA = "https://connect.britam.com/categories/personal-accident-covers";
const SRC_DATAPLUS = "https://ke.britam.com/images/FormsAndDownloads/Data-Plus-PA-FAQs-Dec-24.pdf";
const SRC_MMF = "https://ke.britam.com/images/forms/bronchures/Money%20Market%20Fund%20Brochure.PDF";
const SRC_PENSION = "https://ke.britam.com/pension/personal/plan-for-retirement/individual-pension-plans";
const SRC_MOTOR = "https://ke.britam.com/home/personal/protect-what-you-love/britam-motor-insurance/britam-motor-commercial-insurance";
const SRC_MOTIFLEX = "https://britam.com/news/britam-provides-affordable-car-insurance";
const CHECKED = "2026-11-20";

export const BRITAM_PRODUCTS: CatalogueEntry[] = [
  /* ════════════════════════════════════════════════════ insurance ════ */
  {
    code: "BRT-DATAPLUS",
    name: "Personal Accident Cover on Data Plus",
    category: "INSURANCE",
    icon: "shield",
    featured: 1,
    requiresMembership: 0,
    premium: "From KES 25 a day, paid with your airtime",
    termLabel: "Renews with each bundle",
    eligibility: "Any Safaricom line. Dial *544#, choose Data Plus, then the Britam accident cover.",
    summaryEn:
      "Accident cover that comes with your data bundle. From KES 25 a day on *544# — no forms, no agent, paid from airtime.",
    summarySw:
      "Bima ya ajali inayokuja na bando lako la data. Kuanzia KSh 25 kwa siku kwa *544# — bila fomu, bila wakala, inalipwa kutoka kwa salio la simu.",
    summarySh:
      "Cover ya ajali inakuja na bundle yako ya data. Kuanzia KSh 25 kwa siku kwa *544# — hakuna fomu, hakuna agent, unalipa na airtime.",
    detailsEn:
      "This is the one to start with, because it removes every excuse. You dial *544#, pick Data Plus, choose the Britam accident cover, and buy a bundle — the cover comes with it and is paid from airtime. At the KES 25 tier you get a data bundle plus accident cover; higher tiers carry larger benefits, with the KES 150 option covering accidental death and permanent total disability at KES 100,000 each, medical expenses from an accident up to KES 30,000, and emergency evacuation. Britam's own launch material names boda boda riders as the people this was built for. Check the current benefit table on the USSD menu before you buy, because tiers change.",
    detailsSw:
      "Hii ndiyo ya kuanzia, kwa sababu inaondoa kila kisingizio. Piga *544#, chagua Data Plus, chagua bima ya ajali ya Britam, kisha nunua bando — bima inakuja nalo na inalipwa kutoka kwa salio. Kwa kiwango cha KSh 25 unapata bando la data pamoja na bima ya ajali; viwango vya juu vina manufaa makubwa zaidi, na chaguo la KSh 150 linafunika kifo cha ajali na ulemavu wa kudumu kwa KSh 100,000 kila mmoja, gharama za matibabu kutoka ajali hadi KSh 30,000, na uhamishaji wa dharura. Vitabu vya uzinduzi vya Britam vinataja waendesha boda kama watu bidhaa hii ilijengwa kwa ajili yao. Angalia jedwali la manufaa la sasa kwenye menyu ya USSD kabla ya kununua, kwa sababu viwango vinabadilika.",
    sourceUrl: SRC_DATAPLUS,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-HOSPICASH",
    name: "Britam Hospital Cash Cover",
    category: "INSURANCE",
    icon: "bed",
    featured: 1,
    requiresMembership: 0,
    premium: "From KES 3,800 a year",
    termLabel: "Annual",
    eligibility: "Individuals. Pays a daily cash benefit when you are admitted for more than three days.",
    summaryEn:
      "Pays you cash for every day you are in hospital. It replaces the fares you are not earning while you cannot ride.",
    summarySw:
      "Inakulipa pesa taslimu kwa kila siku uliyo hospitalini. Inabadilisha nauli usizochuma wakati huwezi kuendesha.",
    summarySh:
      "Inakulipa cash kwa kila siku uko hospitali. Inareplace nauli ambazo huchumi wakati huwezi kuendesha.",
    detailsEn:
      "Medical cover pays the hospital. Hospital cash pays you — and for a rider, that is the gap that actually causes the damage. Two weeks off the bike means two weeks of no fares, while rent, school fees and the bike owner's daily cut carry on. Britam's hospital cash pays a daily benefit when you are admitted beyond the waiting period, up to a yearly limit. Published from KES 3,800 a year. A related microinsurance version has been offered through mobile partners at around KES 500 a day of benefit; confirm the exact daily figure and limits on the policy you are sold.",
    detailsSw:
      "Bima ya matibabu inalipa hospitali. Hospital cash inakulipa wewe — na kwa mwendesha boda, hilo ndilo pengo linalosababisha uharibifu. Wiki mbili bila pikipiki ni wiki mbili bila nauli, huku kodi, karo na sehemu ya kila siku ya mmiliki wa pikipiki vikiendelea. Hospital cash ya Britam inalipa manufaa ya kila siku unapolazwa zaidi ya kipindi cha kusubiri, hadi kikomo cha mwaka. Imechapishwa kuanzia KSh 3,800 kwa mwaka. Toleo la microinsurance linalohusiana limetolewa kupitia washirika wa simu kwa takriban KSh 500 kwa siku ya manufaa; thibitisha takwimu kamili ya kila siku na vikomo kwenye sera unayouziwa.",
    sourceUrl: SRC_CONNECT_HEALTH,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-WAFANYIKAZI",
    name: "Bima ya Wafanyikazi",
    category: "INSURANCE",
    icon: "heart-pulse",
    featured: 1,
    requiresMembership: 0,
    premium: "From about KES 336 a month (KES 4,026 a year)",
    termLabel: "Annual, payable monthly",
    eligibility:
      "Informal and domestic workers. Can be bought by an individual, an employer, or a registered workers' association — a stage can buy it together.",
    summaryEn:
      "Medical cover built for informal workers, from about KES 336 a month. Inpatient, outpatient, maternity, dental, optical and last expense.",
    summarySw:
      "Bima ya matibabu iliyojengwa kwa wafanyakazi wasio rasmi, kuanzia takriban KSh 336 kwa mwezi. Kulazwa, kliniki, uzazi, meno, macho na gharama za mwisho.",
    summarySh:
      "Medical cover imejengwa kwa wafanyakazi wa informal, kuanzia kama KSh 336 kwa mwezi. Inpatient, outpatient, uzazi, meno, macho na last expense.",
    detailsEn:
      "Launched by Britam Connect with Minet Kenya, this is aimed squarely at people outside formal employment — which is most of the boda sector. Around KES 336 a month, roughly KES 11 a day, covering inpatient and outpatient care, maternity, dental and optical, and a last expense benefit, across Britam's network of more than 600 health facilities. The detail worth acting on: registered workers' associations can buy it collectively. A stage with thirty riders is exactly that, and buying as a group is usually how a premium like this becomes affordable and how it gets renewed when one rider has a bad month.",
    detailsSw:
      "Iliyozinduliwa na Britam Connect pamoja na Minet Kenya, hii inalenga moja kwa moja watu walio nje ya ajira rasmi — ambao ni wengi wa sekta ya boda. Takriban KSh 336 kwa mwezi, kama KSh 11 kwa siku, ikifunika matibabu ya kulazwa na ya kliniki, uzazi, meno na macho, na manufaa ya gharama za mwisho, katika mtandao wa Britam wa zaidi ya vituo 600 vya afya. Jambo la kuchukua hatua juu yake: vyama vya wafanyakazi vilivyosajiliwa vinaweza kuinunua kwa pamoja. Stage yenye waendesha thelathini ni hivyo hasa, na kununua kama kikundi ndiyo njia ambayo malipo kama haya yanakuwa nafuu na yanayofanywa upya mmoja akipata mwezi mbaya.",
    sourceUrl: SRC_CONNECT_HEALTH,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-MWANANCHI",
    name: "Bima ya Mwananchi",
    category: "INSURANCE",
    icon: "users",
    featured: 0,
    requiresMembership: 0,
    premium: "From KES 4,600 a year",
    termLabel: "Annual",
    eligibility: "Individuals and families.",
    summaryEn: "Affordable medical cover for you and your family, published from KES 4,600 a year.",
    summarySw: "Bima ya matibabu nafuu kwako na familia yako, kuanzia KSh 4,600 kwa mwaka.",
    summarySh: "Medical cover ya bei poa kwako na family yako, kuanzia KSh 4,600 kwa mwaka.",
    detailsEn:
      "A household medical cover rather than a worker-only one, published from KES 4,600 a year. Where Bima ya Wafanyikazi is bought around the job, this is bought around the family. Compare the two on what each actually pays for your dependants before choosing — a rider with three children and a rider living alone are not buying the same thing.",
    detailsSw:
      "Bima ya matibabu ya kaya badala ya ya mfanyakazi pekee, kuanzia KSh 4,600 kwa mwaka. Ambapo Bima ya Wafanyikazi inanunuliwa kuzunguka kazi, hii inanunuliwa kuzunguka familia. Linganisha hizi mbili kwa kile kila moja inalipa kwa wategemezi wako kabla ya kuchagua — mwendesha boda mwenye watoto watatu na anayeishi peke yake hawanunui kitu kimoja.",
    sourceUrl: SRC_CONNECT_HEALTH,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-LASTEXP",
    name: "Retail Last Expense",
    category: "INSURANCE",
    icon: "flower",
    featured: 1,
    requiresMembership: 0,
    premium: "From KES 800 a year",
    termLabel: "Annual",
    eligibility: "Individuals. Pays out on natural or accidental death.",
    summaryEn:
      "Funeral cover from KES 800 a year, so a death does not become a collection at the stage.",
    summarySw:
      "Bima ya mazishi kuanzia KSh 800 kwa mwaka, ili kifo kisiwe mchango kwenye stage.",
    summarySh:
      "Cover ya mazishi kuanzia KSh 800 kwa mwaka, ili kifo kisiwe harambee kwa stage.",
    detailsEn:
      "Last expense pays out quickly on death, natural or accidental, to meet funeral costs. At around KES 800 a year it is the cheapest meaningful cover on this list. Everyone on a stage knows what happens without it: a hurried collection among people who are themselves short, at the worst possible week. This is the product that most directly replaces that, and it is worth buying before anything optional.",
    detailsSw:
      "Last expense inalipa haraka wakati wa kifo, cha kawaida au cha ajali, kukidhi gharama za mazishi. Kwa takriban KSh 800 kwa mwaka ni bima ya maana ya bei rahisi zaidi kwenye orodha hii. Kila mtu kwenye stage anajua kinachotokea bila hiyo: mchango wa haraka kati ya watu ambao wenyewe wana uhaba, katika wiki mbaya zaidi. Hii ndiyo bidhaa inayobadilisha hilo moja kwa moja, na inafaa kununuliwa kabla ya kitu chochote cha hiari.",
    sourceUrl: SRC_CONNECT_LAST,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-LASTEXP-GRP",
    name: "Group Last Expense",
    category: "INSURANCE",
    icon: "users",
    featured: 1,
    requiresMembership: 0,
    premium: "From KES 400 per person a year",
    termLabel: "Annual, bought as a group",
    eligibility: "Groups — a stage, a SACCO, a welfare association.",
    summaryEn:
      "The same funeral cover bought by the whole stage, from KES 400 a head — half the individual price.",
    summarySw:
      "Bima hiyo hiyo ya mazishi ikinunuliwa na stage nzima, kuanzia KSh 400 kwa kila mtu — nusu ya bei ya mtu mmoja.",
    summarySh:
      "Hiyo hiyo cover ya mazishi ikinunuliwa na stage mzima, kuanzia KSh 400 kwa kila mtu — nusu ya bei ya mtu mmoja.",
    detailsEn:
      "A microinsurance last expense policy written for a group rather than a person, published from KES 400 per person — roughly half the retail price. Boda riders are already organised into stages with chairmen and welfare kitties, which is precisely the structure a group policy needs. If your stage already runs a benevolent fund, this is the same idea with an insurer behind it and a defined payout instead of whatever can be raised on the day.",
    detailsSw:
      "Sera ya microinsurance ya gharama za mwisho iliyoandikwa kwa kikundi badala ya mtu mmoja, kuanzia KSh 400 kwa kila mtu — takriban nusu ya bei ya rejareja. Waendesha boda tayari wameandaliwa katika stage zenye wenyeviti na mifuko ya hisani, ambayo ndiyo muundo hasa sera ya kikundi inahitaji. Ikiwa stage yako tayari ina mfuko wa msaada, hii ni wazo hilo hilo lenye bima nyuma yake na malipo yaliyowekwa badala ya kile kinachoweza kukusanywa siku hiyo.",
    sourceUrl: SRC_CONNECT_LAST,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-MOTOR-COM",
    name: "Motor Commercial Insurance",
    category: "INSURANCE",
    icon: "bike",
    featured: 1,
    requiresMembership: 0,
    premium: "Quoted on your bike, its value and the cover you choose",
    termLabel: "Annual",
    eligibility:
      "Motorcycles carrying passengers or goods for payment. A PSV-class policy is what the law requires for a boda.",
    summaryEn:
      "Cover for a bike used for work. Carrying paying passengers on a private policy means your claim can be refused.",
    summarySw:
      "Bima ya pikipiki inayotumika kazini. Kubeba abiria wanaolipa kwa sera ya binafsi kunamaanisha dai lako laweza kukataliwa.",
    summarySh:
      "Cover ya bike inayotumika kazini. Ukibeba abiria wanaolipa na private policy, claim yako inaweza kukataliwa.",
    detailsEn:
      "This is the one riders get wrong most often, and it is expensive to get wrong. A private motorcycle policy does not cover commercial use. If you carry paying passengers or do deliveries on a private cover, the insurer can decline the claim — Britam lists commercial use of a private vehicle among its reasons for rejection. Boda work needs a commercial, PSV-class policy, which also addresses passenger liability. The premium depends on the bike, its value and the cover level, so ask Britam for a quote rather than relying on a figure you heard at the stage. Third-party is the legal minimum; comprehensive also covers your own machine against theft, fire and accident damage.",
    detailsSw:
      "Hii ndiyo waendesha boda wanaikosea mara nyingi zaidi, na kuikosea ni ghali. Sera ya pikipiki ya binafsi haifuniki matumizi ya kibiashara. Ukibeba abiria wanaolipa au kufanya usafirishaji kwa bima ya binafsi, mwenye bima anaweza kukataa dai — Britam inataja matumizi ya kibiashara ya gari la binafsi miongoni mwa sababu zake za kukataa. Kazi ya boda inahitaji sera ya kibiashara ya daraja la PSV, ambayo pia inashughulikia dhima ya abiria. Malipo yanategemea pikipiki, thamani yake na kiwango cha bima, kwa hivyo omba Britam nukuu badala ya kutegemea takwimu uliyoisikia kwenye stage. Third-party ndicho kiwango cha chini cha kisheria; comprehensive pia inafunika mashine yako dhidi ya wizi, moto na uharibifu wa ajali.",
    sourceUrl: SRC_MOTOR,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-MOTIFLEX",
    name: "Britam Motiflex",
    category: "INSURANCE",
    icon: "calendar",
    featured: 1,
    requiresMembership: 0,
    premium: "Comprehensive cover paid monthly instead of in one annual sum",
    termLabel: "Monthly instalments",
    eligibility: "Motor policyholders who cannot pay a full year's premium at once.",
    summaryEn:
      "Comprehensive motor cover paid month by month. The benefits are the same — only the payment is broken up.",
    summarySw:
      "Bima kamili ya gari inayolipwa mwezi kwa mwezi. Manufaa ni yale yale — malipo tu ndiyo yamegawanywa.",
    summarySh:
      "Comprehensive cover ya gari unalipa mwezi kwa mwezi. Benefits ni zile zile — ni malipo tu zimegawanywa.",
    detailsEn:
      "The single biggest reason riders go uninsured is not the price of cover — it is being asked for a year of it in one payment, in a trade where money arrives daily. Motiflex is Britam's answer: comprehensive motor insurance on a monthly payment plan, with no loss of benefits. Accidental damage, fire, theft, malicious damage and third-party liability are all still covered. If you have ever decided to risk it because the annual premium landed in a bad month, this is the product to ask about.",
    detailsSw:
      "Sababu kubwa zaidi waendesha boda hawana bima si bei ya bima — ni kuombwa mwaka mzima kwa malipo moja, katika biashara ambayo pesa inaingia kila siku. Motiflex ndilo jibu la Britam: bima kamili ya gari kwa mpango wa malipo ya kila mwezi, bila kupoteza manufaa. Uharibifu wa ajali, moto, wizi, uharibifu wa makusudi na dhima ya mtu wa tatu bado vyote vinafunikwa. Ikiwa umewahi kuamua kuhatarisha kwa sababu malipo ya mwaka yaliingia mwezi mbaya, hii ndiyo bidhaa ya kuulizia.",
    sourceUrl: SRC_MOTIFLEX,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-GPA",
    name: "Group Personal Accident",
    category: "INSURANCE",
    icon: "shield-check",
    featured: 0,
    requiresMembership: 0,
    premium: "From KES 4,500, tailored to the group",
    termLabel: "Annual",
    eligibility: "Groups — a stage or SACCO covering its members together.",
    summaryEn:
      "Accident cover written for a whole stage at once, from KES 4,500 and tailored to the group.",
    summarySw:
      "Bima ya ajali iliyoandikwa kwa stage nzima kwa mara moja, kuanzia KSh 4,500 na iliyotengenezwa kwa kikundi.",
    summarySh:
      "Cover ya ajali imeandikwa kwa stage mzima kwa mara moja, kuanzia KSh 4,500 na imetailor-make kwa group.",
    detailsEn:
      "Group personal accident covers death, disability and medical expenses from accidents for every member of a defined group. Published from KES 4,500 and tailor-made, so the benefit levels and the premium are negotiated for the group rather than taken off a shelf. For a stage, this is the more complete sibling of the Data Plus daily cover: higher benefits, a real policy document, and one renewal date instead of thirty riders each remembering to buy airtime.",
    detailsSw:
      "Group personal accident inafunika kifo, ulemavu na gharama za matibabu kutokana na ajali kwa kila mwanachama wa kikundi kilichofafanuliwa. Imechapishwa kuanzia KSh 4,500 na imetengenezwa maalum, kwa hivyo viwango vya manufaa na malipo vinajadiliwa kwa kikundi badala ya kuchukuliwa rafu. Kwa stage, hii ni dada kamili zaidi ya bima ya kila siku ya Data Plus: manufaa makubwa zaidi, hati halisi ya sera, na tarehe moja ya kufanya upya badala ya waendesha thelathini kila mmoja akikumbuka kununua salio.",
    sourceUrl: SRC_CONNECT_PA,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-MALKIA",
    name: "Malkia Cover",
    category: "INSURANCE",
    icon: "ribbon",
    featured: 0,
    requiresMembership: 0,
    premium: "From KES 620 a year",
    termLabel: "Annual",
    eligibility: "Women. Covers cancer and dermatology.",
    summaryEn:
      "Cancer and skin cover for women, from KES 620 a year — for women riders and for the women in a rider's household.",
    summarySw:
      "Bima ya saratani na ngozi kwa wanawake, kuanzia KSh 620 kwa mwaka — kwa waendesha wanawake na wanawake katika kaya ya mwendeshaji.",
    summarySh:
      "Cover ya cancer na ngozi kwa wanawake, kuanzia KSh 620 kwa mwaka — kwa wanawake wanaoendesha na wanawake kwa nyumba ya rider.",
    detailsEn:
      "A low-cost specialist cover for cancer and dermatological conditions in women, published from KES 620 a year. Women are a growing minority on the stages and are often the ones holding a household's health together regardless. At this price it sits alongside last expense as cover worth holding before anything discretionary.",
    detailsSw:
      "Bima maalum ya gharama nafuu kwa saratani na hali za ngozi kwa wanawake, kuanzia KSh 620 kwa mwaka. Wanawake ni wachache wanaoongezeka kwenye stage na mara nyingi ndio wanaoshikilia afya ya kaya bila kujali. Kwa bei hii inakaa pamoja na last expense kama bima inayofaa kushikiliwa kabla ya kitu chochote cha hiari.",
    sourceUrl: SRC_CONNECT_HEALTH,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-JUNIORMED",
    name: "Junior Medical Cover",
    category: "INSURANCE",
    icon: "baby",
    featured: 0,
    requiresMembership: 0,
    premium: "From KES 3,378 a year",
    termLabel: "Annual",
    eligibility: "Children, covered on their own policy.",
    summaryEn: "Standalone medical cover for your children, from KES 3,378 a year.",
    summarySw: "Bima ya matibabu ya watoto wako peke yao, kuanzia KSh 3,378 kwa mwaka.",
    summarySh: "Medical cover ya watoto wako peke yao, kuanzia KSh 3,378 kwa mwaka.",
    detailsEn:
      "A children's medical policy that stands on its own rather than being an add-on to a parent's cover, published from KES 3,378 a year. Worth comparing against adding the children to a family policy such as Bima ya Mwananchi — which works out cheaper depends on how many children there are and what each policy actually pays.",
    detailsSw:
      "Sera ya matibabu ya watoto inayosimama yenyewe badala ya kuwa nyongeza kwa bima ya mzazi, kuanzia KSh 3,378 kwa mwaka. Inafaa kulinganishwa na kuwaongeza watoto kwenye sera ya familia kama Bima ya Mwananchi — ipi ni nafuu inategemea watoto ni wangapi na kila sera inalipa nini hasa.",
    sourceUrl: SRC_CONNECT_HEALTH,
    verifiedOn: CHECKED,
  },

  /* ════════════════════════════════════════════════════ investment ════ */
  {
    code: "BRT-MMF",
    name: "Britam Money Market Fund",
    category: "INVESTMENT",
    icon: "trending-up",
    featured: 1,
    requiresMembership: 0,
    minAmount: 1000,
    interestRate: "Variable; interest accrues and compounds daily",
    termLabel: "No lock-in; withdrawals reach M-Pesa in about 48 hours",
    eligibility: "Anyone with a Kenyan ID or passport. Register and top up on *778#.",
    summaryEn:
      "Start with KES 1,000 on *778#. Your money earns interest every day and you can take it out in about two days.",
    summarySw:
      "Anza na KSh 1,000 kwa *778#. Pesa yako inapata riba kila siku na unaweza kuitoa ndani ya siku mbili hivi.",
    summarySh:
      "Anza na KSh 1,000 kwa *778#. Doo yako inapata interest kila siku na unaweza kuitoa ndani ya siku mbili hivi.",
    detailsEn:
      "A money market fund pools many people's money into low-risk instruments — Treasury bills, fixed deposits — and pays out the return. Britam's is regulated by the Capital Markets Authority, with KCB as trustee and Standard Chartered as custodian, which is what makes it different from the schemes that circulate on WhatsApp. You need KES 1,000 to start and KES 1,000 to top up, you register on *778#, interest accrues daily, and there is no lock-in: withdrawals reach M-Pesa in about forty-eight hours. Interest is taxed at 15% withholding, and there is an annual management fee. The yield moves with the market, so treat any figure you are quoted as today's, not a promise.",
    detailsSw:
      "Money market fund inakusanya pesa za watu wengi katika vyombo vya hatari ndogo — hati za hazina, amana za kudumu — na kulipa faida. Ya Britam inadhibitiwa na Capital Markets Authority, KCB akiwa mdhamini na Standard Chartered mhifadhi, ndicho kinachoitofautisha na mipango inayozunguka kwenye WhatsApp. Unahitaji KSh 1,000 kuanza na KSh 1,000 kuongeza, unajisajili kwa *778#, riba inakusanywa kila siku, na hakuna kufungwa: utoaji unafika M-Pesa ndani ya saa arobaini na nane hivi. Riba inatozwa kodi ya 15%, na kuna ada ya usimamizi ya mwaka. Faida inabadilika na soko, kwa hivyo chukulia takwimu yoyote unayopewa kama ya leo, si ahadi.",
    sourceUrl: SRC_MMF,
    verifiedOn: CHECKED,
  },
  {
    code: "BRT-BONDPLUS",
    name: "Britam Bond Plus Fund",
    category: "INVESTMENT",
    icon: "line-chart",
    featured: 0,
    requiresMembership: 0,
    interestRate: "Variable, from bond income",
    termLabel: "Longer horizon than a money market fund",
    eligibility: "Investors willing to hold for longer in exchange for a different return profile.",
    summaryEn:
      "A fund that invests in bonds rather than short-term paper. For money you can leave alone longer than a year.",
    summarySw:
      "Mfuko unaowekeza katika hati fungani badala ya karatasi za muda mfupi. Kwa pesa unayoweza kuiacha zaidi ya mwaka mmoja.",
    summarySh:
      "Fund inayowekeza kwa bonds badala ya short-term paper. Ya doo unayoweza kuiacha zaidi ya mwaka mmoja.",
    detailsEn:
      "Britam's bond fund invests across corporate and government bonds. It suits a longer horizon than the money market fund and its value can move more in the short term. For most riders the money market fund is the right first step; this becomes relevant once there is money that genuinely will not be touched for several years. Ask Britam Asset Managers for the current minimum and the fund fact sheet before investing.",
    detailsSw:
      "Mfuko wa hati fungani wa Britam unawekeza katika hati fungani za kampuni na serikali. Unafaa kipindi kirefu zaidi kuliko money market fund na thamani yake inaweza kubadilika zaidi kwa muda mfupi. Kwa waendesha boda wengi money market fund ndiyo hatua sahihi ya kwanza; hii inakuwa muhimu pindi kuna pesa ambayo kweli haitaguswa kwa miaka kadhaa. Omba Britam Asset Managers kiwango cha chini cha sasa na karatasi ya ukweli ya mfuko kabla ya kuwekeza.",
    sourceUrl: "https://vasiliafrica.com/partners/britam/",
    verifiedOn: CHECKED,
  },

  /* ══════════════════════════════════════════════════════ pension ════ */
  {
    code: "BRT-IPP",
    name: "Individual Retirement Plan",
    category: "PENSION",
    icon: "umbrella",
    featured: 1,
    requiresMembership: 0,
    minAmount: 500,
    interestRate: "Guaranteed minimum 5% a year, compounded",
    termLabel: "Until the retirement age you choose",
    eligibility:
      "Anyone, in or out of formal employment. Contributions can be monthly, quarterly or annual, fixed or varying.",
    summaryEn:
      "A pension for people with no employer. From KES 500 whenever you can pay it, with a guaranteed minimum 5% a year.",
    summarySw:
      "Pensheni kwa watu wasio na mwajiri. Kuanzia KSh 500 wakati wowote unaweza kulipa, na kiwango cha chini cha uhakika cha 5% kwa mwaka.",
    summarySh:
      "Pension ya watu hawana employer. Kuanzia KSh 500 wakati wowote unaweza kulipa, na guaranteed 5% kwa mwaka.",
    detailsEn:
      "Nobody is putting a pension aside for a boda rider. This plan exists for exactly that situation: no employer needed, contributions from KES 500 with no upper limit, paid monthly, quarterly or yearly, and varied whenever your income changes — which matters in a trade where December and April look nothing alike. Contributions earn a guaranteed minimum of 5% a year compounded. The plan is portable, so it follows you if you stop riding and take a job. At retirement you choose a pension option, where a third comes as a lump sum and the rest as income, or a provident option paid as one lump sum. Contributions are tax-deductible within the statutory limit, which matters more once your income is declared.",
    detailsSw:
      "Hakuna anayewekea mwendesha boda pensheni. Mpango huu upo kwa hali hiyo hasa: hauhitaji mwajiri, michango kuanzia KSh 500 bila kikomo cha juu, inayolipwa kila mwezi, robo mwaka au mwaka, na kubadilishwa wakati wowote mapato yako yanapobadilika — jambo muhimu katika biashara ambayo Desemba na Aprili hazifanani kabisa. Michango inapata kiwango cha chini cha uhakika cha 5% kwa mwaka kwa riba ya mrundikano. Mpango unahamishika, kwa hivyo unakufuata ukiacha kuendesha na kuchukua kazi. Wakati wa kustaafu unachagua chaguo la pensheni, ambapo theluthi inakuja kama kiasi kimoja na kilichobaki kama mapato, au chaguo la provident linalolipwa kama kiasi kimoja. Michango inakatwa kodi ndani ya kikomo cha kisheria, jambo muhimu zaidi mapato yako yanapotangazwa.",
    sourceUrl: SRC_PENSION,
    verifiedOn: CHECKED,
  },
];
