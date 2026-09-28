/**
 * Partner product catalogue.
 *
 * Product structures are drawn from the partners' published product ranges.
 * All figures are INDICATIVE and are flagged as such in the rider-facing UI —
 * live rates, premiums and limits must be confirmed with Stima DT SACCO and
 * Britam before the platform goes to production.
 */

export interface SeedProduct {
  code: string;
  partner: "STIMA" | "BRITAM";
  name: string;
  category: "SAVINGS" | "CREDIT" | "INSURANCE" | "INVESTMENT" | "PENSION";
  icon: string;
  summaryEn: string;
  summarySw: string;
  summarySh: string;
  detailsEn: string;
  detailsSw: string;
  minAmount?: number;
  maxAmount?: number;
  interestRate?: string;
  premium?: string;
  termLabel?: string;
  eligibility?: string;
  requiresMembership?: boolean;
  featured?: boolean;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  // ---------------------------------------------------------------- STIMA ---
  {
    code: "STIMA-ALPHA",
    partner: "STIMA",
    name: "Alpha Deposits Account",
    category: "SAVINGS",
    icon: "piggy",
    summaryEn: "Save a fixed amount every month. Your deposits become the security that unlocks a bigger loan.",
    summarySw: "Weka kiasi maalum kila mwezi. Akiba yako ndiyo dhamana inayokufungulia mkopo mkubwa zaidi.",
    summarySh: "Save doo fixed kila mwezi. Hiyo savings ndio inakupatia loan kubwa bila kutafuta guarantor.",
    detailsEn:
      "Alpha Deposits is the core SACCO savings account. It is non-withdrawable while you remain a member, which is exactly what makes it powerful: the balance is your loan collateral and it earns interest annually. A rider saving KSh 1,000 a month builds KSh 12,000 in a year, which can qualify for a loan of up to four times that amount.",
    detailsSw:
      "Alpha Deposits ni akaunti kuu ya akiba ya SACCO. Huwezi kutoa pesa ukiwa mwanachama, na hiyo ndiyo nguvu yake: salio lako ni dhamana ya mkopo na linapata riba kila mwaka. Mwendeshaji anayeweka KSh 1,000 kwa mwezi hujenga KSh 12,000 kwa mwaka, kiasi kinachoweza kumwezesha kupata mkopo hadi mara nne zaidi.",
    minAmount: 1000,
    interestRate: "Interest paid annually on the balance",
    termLabel: "Ongoing monthly contribution",
    eligibility: "Registered SACCO member",
    requiresMembership: true,
    featured: true,
  },
  {
    code: "STIMA-TWIGA",
    partner: "STIMA",
    name: "Twiga Savings Account",
    category: "SAVINGS",
    icon: "target",
    summaryEn: "A withdrawable account for short-term goals — school fees, a spare bike, a family event.",
    summarySw: "Akaunti unayoweza kutoa kwa malengo ya muda mfupi — karo, pikipiki ya ziada, au sherehe ya familia.",
    summarySh: "Account unaweza withdraw for short term plans — fees, pikipiki ingine, ama sherehe.",
    detailsEn:
      "Twiga is built for goals you will reach within a year or two. Deposit from KSh 1,000 a month, earn around 3% per year on balances above KSh 6,000, and withdraw after the first six months — then once every three months. It is the right home for money you are saving toward something specific.",
    detailsSw:
      "Twiga imeundwa kwa malengo utakayofikia ndani ya mwaka mmoja au miwili. Weka kuanzia KSh 1,000 kwa mwezi, pata takriban asilimia 3 kwa mwaka kwa salio zaidi ya KSh 6,000, na utoe baada ya miezi sita ya kwanza — kisha kila baada ya miezi mitatu.",
    minAmount: 1000,
    interestRate: "≈3% p.a. on balances above KSh 6,000",
    termLabel: "Withdraw after 6 months, then quarterly",
    eligibility: "Registered SACCO member",
    requiresMembership: true,
    featured: true,
  },
  {
    code: "STIMA-SHARES",
    partner: "STIMA",
    name: "Share Capital Account",
    category: "INVESTMENT",
    icon: "chart",
    summaryEn: "Buy a share of the SACCO. You become an owner and earn a dividend every year.",
    summarySw: "Nunua hisa za SACCO. Unakuwa mmiliki na kupata gawio kila mwaka.",
    summarySh: "Buy shares za SACCO. Unakuwa owner na unapata dividend kila year.",
    detailsEn:
      "Share capital is your ownership stake in the SACCO. It is non-withdrawable but transferable if you exit, and it pays an annual dividend declared at the AGM. For a rider, this is usually the first real investment they ever hold — an asset that pays them rather than one that costs them.",
    detailsSw:
      "Hisa ni umiliki wako katika SACCO. Haziwezi kutolewa lakini zinaweza kuhamishwa ukiondoka, na hulipa gawio la kila mwaka linalotangazwa kwenye mkutano mkuu. Kwa mwendeshaji, hii mara nyingi ni uwekezaji wa kwanza halisi — mali inayomlipa badala ya kumgharimu.",
    minAmount: 500,
    interestRate: "Annual dividend declared at the AGM",
    termLabel: "Held for as long as you are a member",
    eligibility: "Open to all new members at registration",
    requiresMembership: true,
    featured: true,
  },
  {
    code: "STIMA-MUSTARD",
    partner: "STIMA",
    name: "Mustard Retirement Account",
    category: "PENSION",
    icon: "shield",
    summaryEn: "Save from KSh 600 a month for the day you can no longer ride. Earns about 5% a year.",
    summarySw: "Weka kuanzia KSh 600 kwa mwezi kwa siku ambayo hutaweza kuendesha tena. Hupata karibu asilimia 5 kwa mwaka.",
    summarySh: "Save from KSh 600 kwa mwezi for siku utakuwa huwezi ride tena. Inakupatia 5% kila year.",
    detailsEn:
      "Riding is physical work with a limited window. Mustard is a long-horizon account that earns roughly 5% a year and still allows you to withdraw up to 25% once a year if life demands it. Starting at 28 instead of 45 can more than double what you retire with.",
    detailsSw:
      "Kuendesha ni kazi ya nguvu yenye muda mfupi. Mustard ni akaunti ya muda mrefu inayopata takriban asilimia 5 kwa mwaka na bado inakuruhusu kutoa hadi asilimia 25 mara moja kwa mwaka ikiwa maisha yatalazimu. Kuanza ukiwa na miaka 28 badala ya 45 kunaweza kuongeza mara mbili unachostaafu nacho.",
    minAmount: 600,
    interestRate: "≈5% p.a.",
    termLabel: "Long term, 25% partial withdrawal allowed yearly",
    eligibility: "Registered SACCO member",
    requiresMembership: true,
  },
  {
    code: "STIMA-MSINGI",
    partner: "STIMA",
    name: "Msingi Bora Education Plan",
    category: "SAVINGS",
    icon: "book",
    summaryEn: "From KSh 500 a month toward your children's school fees, with life cover built in.",
    summarySw: "Kuanzia KSh 500 kwa mwezi kwa karo ya watoto wako, ikiwa na bima ya maisha ndani yake.",
    summarySh: "From KSh 500 kwa mwezi for fees za watoi, na life cover imeingia ndani.",
    detailsEn:
      "A contract of between 5 and 18 years that earns about 5% per year paid at maturity, with death and disability cover attached so the plan continues even if something happens to you. After three years you can also borrow against it for emergency school fees.",
    detailsSw:
      "Mkataba wa kati ya miaka 5 na 18 unaopata takriban asilimia 5 kwa mwaka kulipwa mwishoni, ukiwa na bima ya kifo na ulemavu ili mpango uendelee hata kitu kikikupata. Baada ya miaka mitatu unaweza pia kukopa dhidi yake kwa karo ya dharura.",
    minAmount: 500,
    interestRate: "≈5% p.a. paid at end of contract",
    termLabel: "5 – 18 year contract",
    eligibility: "Registered SACCO member with dependants",
    requiresMembership: true,
  },
  {
    code: "STIMA-MAKEOVER",
    partner: "STIMA",
    name: "Makeover Asset Finance Loan",
    category: "CREDIT",
    icon: "bike",
    summaryEn: "Finance your own motorbike instead of paying a daily target to someone else.",
    summarySw: "Fadhili pikipiki yako mwenyewe badala ya kulipa lengo la kila siku kwa mtu mwingine.",
    summarySh: "Nunua pikipiki yako badala ya kulipa target kila siku kwa mtu mwingine.",
    detailsEn:
      "Asset finance of up to KSh 1 million at 18% on a reducing balance, repayable over up to 48 months. For a rider on a daily-hire arrangement this is the single highest-impact product on the platform: the money you already pay as a daily target becomes a loan repayment that ends with you owning the bike.",
    detailsSw:
      "Ufadhili wa mali hadi KSh milioni 1 kwa asilimia 18 ya salio linalopungua, kulipwa ndani ya miezi 48. Kwa mwendeshaji anayekodi, hii ndiyo bidhaa yenye matokeo makubwa zaidi: pesa unayolipa tayari kama lengo la kila siku inakuwa malipo ya mkopo yanayoishia wewe kumiliki pikipiki.",
    maxAmount: 1000000,
    interestRate: "18% reducing balance",
    termLabel: "Up to 48 months",
    eligibility: "3 months' membership, subject to item value",
    requiresMembership: true,
    featured: true,
  },
  {
    code: "STIMA-NORMAL",
    partner: "STIMA",
    name: "Normal Development Loan",
    category: "CREDIT",
    icon: "coins",
    summaryEn: "Borrow up to four times your deposits at 12% reducing balance, over up to five years.",
    summarySw: "Kopa hadi mara nne ya akiba yako kwa asilimia 12 ya salio linalopungua, ndani ya miaka mitano.",
    summarySh: "Kopa hadi mara nne ya savings yako kwa 12% reducing, ndani ya miaka tano.",
    detailsEn:
      "The SACCO's standard development loan: up to 4× your Alpha deposits at 12% on a reducing balance over up to 60 months. Compare that to a 1%-a-day digital loan, which works out to roughly 365% a year, and the case for building deposits first becomes obvious.",
    detailsSw:
      "Mkopo wa kawaida wa maendeleo wa SACCO: hadi mara 4 ya akiba yako ya Alpha kwa asilimia 12 ya salio linalopungua ndani ya miezi 60. Linganisha na mkopo wa kidijitali wa asilimia 1 kwa siku, ambao ni takriban asilimia 365 kwa mwaka.",
    interestRate: "12% reducing balance",
    termLabel: "Up to 60 months",
    eligibility: "3 months' membership, 4× Alpha deposits",
    requiresMembership: true,
  },
  {
    code: "STIMA-MPAWA",
    partner: "STIMA",
    name: "Mpawa Short Term Loan",
    category: "CREDIT",
    icon: "bolt",
    summaryEn: "Up to KSh 120,000 repayable within six months — for stock, repairs or a short gap.",
    summarySw: "Hadi KSh 120,000 kulipwa ndani ya miezi sita — kwa bidhaa, matengenezo au pengo la muda mfupi.",
    summarySh: "Hadi KSh 120,000 ulipe ndani ya miezi sita — kwa stock, repair ama emergency.",
    detailsEn:
      "A short-term facility for working capital needs: a spare-parts bill, a servicing backlog, or bridging a slow season. Far cheaper than rolling over a mobile app loan, and it builds a formal repayment record you can show later.",
    detailsSw:
      "Mkopo wa muda mfupi kwa mahitaji ya mtaji: bili ya vipuri, matengenezo, au kipindi cha biashara ndogo. Ni wa bei nafuu kuliko kukopa tena na tena kwenye programu za simu, na hujenga rekodi rasmi ya ulipaji.",
    maxAmount: 120000,
    termLabel: "Up to 6 months",
    eligibility: "3 months' membership",
    requiresMembership: true,
  },
  {
    code: "STIMA-WORKING",
    partner: "STIMA",
    name: "Working Capital Loan",
    category: "CREDIT",
    icon: "briefcase",
    summaryEn: "Up to four times your deposits to grow a second income — a second bike, a shop, a delivery contract.",
    summarySw: "Hadi mara nne ya akiba yako kukuza kipato cha pili — pikipiki ya pili, duka, au kandarasi ya usafirishaji.",
    summarySh: "Hadi mara nne ya savings kukuza biz ingine — pikipiki ya pili, duka, ama delivery contract.",
    detailsEn:
      "Riders who build a second income stream stop depending on one pair of hands and one engine. This facility lends up to 4× Alpha deposits over as long as 72 months, which is enough runway to put a second rider on a bike you own.",
    detailsSw:
      "Waendeshaji wanaojenga kipato cha pili huacha kutegemea mikono miwili na injini moja. Mkopo huu hutoa hadi mara 4 ya akiba ya Alpha ndani ya miezi 72, muda wa kutosha kumweka mwendeshaji mwingine kwenye pikipiki unayomiliki.",
    termLabel: "Up to 72 months",
    eligibility: "3 months' membership",
    requiresMembership: true,
  },
  {
    code: "STIMA-FIXED",
    partner: "STIMA",
    name: "Fixed Deposit Account",
    category: "INVESTMENT",
    icon: "lock",
    summaryEn: "Lock away from KSh 5,000 for 3, 6 or 12 months and earn a guaranteed rate.",
    summarySw: "Funga kuanzia KSh 5,000 kwa miezi 3, 6 au 12 na upate riba ya uhakika.",
    summarySh: "Lock from KSh 5,000 for miezi 3, 6 ama 12 upate interest ya uhakika.",
    detailsEn:
      "If you have a lump sum — an insurance payout, a good season, a sold bike — a fixed deposit turns idle money into income at rates in the region of 6% to 10% depending on the term and amount. Interest is forfeited on early withdrawal, so only commit money you will not need.",
    detailsSw:
      "Ukiwa na kiasi kikubwa — malipo ya bima, msimu mzuri, au pikipiki iliyouzwa — amana ya kudumu hubadilisha pesa iliyolala kuwa kipato kwa viwango vya asilimia 6 hadi 10 kulingana na muda na kiasi. Riba hupotea ukitoa mapema.",
    minAmount: 5000,
    interestRate: "≈6% – 10% p.a. depending on term and amount",
    termLabel: "3, 6 or 12 months",
    eligibility: "Registered SACCO member",
    requiresMembership: true,
  },
  {
    code: "STIMA-FUNIKA",
    partner: "STIMA",
    name: "Funika Emergency Loan",
    category: "CREDIT",
    icon: "alert",
    summaryEn: "A 30-day emergency facility of up to KSh 15,000. Use it only for genuine emergencies.",
    summarySw: "Mkopo wa dharura wa siku 30 hadi KSh 15,000. Utumie kwa dharura za kweli tu.",
    summarySh: "Emergency loan ya siku 30 hadi KSh 15,000. Itumie tu kwa emergency ya kweli.",
    detailsEn:
      "Priced at 1% a day over 30 days, this is a genuine emergency instrument, not a spending account — the platform shows you the shilling cost before you apply. For anything you can plan for, a Mpawa or Normal loan will always be cheaper.",
    detailsSw:
      "Kwa asilimia 1 kwa siku ndani ya siku 30, huu ni mkopo wa dharura halisi, si akaunti ya matumizi — mfumo unakuonyesha gharama kwa shilingi kabla ya kuomba. Kwa jambo lolote unaloweza kupanga, mkopo wa Mpawa au Normal utakuwa nafuu zaidi.",
    maxAmount: 15000,
    interestRate: "1% per day",
    termLabel: "30 days",
    eligibility: "3 months' membership",
    requiresMembership: true,
  },

  // --------------------------------------------------------------- BRITAM ---
  {
    code: "BRITAM-TPO",
    partner: "BRITAM",
    name: "Commercial Motorcycle Third Party Cover",
    category: "INSURANCE",
    icon: "shield",
    summaryEn: "The cover the law requires. It pays for injury or damage you cause to other people.",
    summarySw: "Bima inayotakiwa kisheria. Hulipa majeraha au uharibifu unaosababisha kwa watu wengine.",
    summarySh: "Bima ya lazima kisheria. Inalipa damage ama injury unaicause kwa wengine.",
    detailsEn:
      "Third Party Only cover is a legal requirement for every motorcycle used for hire in Kenya. It does not repair your bike — it protects you from the claim that would otherwise wipe out years of savings when someone else is injured. Riding without it risks your bike, your licence and your freedom.",
    detailsSw:
      "Bima ya Mtu wa Tatu ni sharti la kisheria kwa kila pikipiki inayotumika kwa biashara nchini Kenya. Haitengenezi pikipiki yako — inakulinda dhidi ya dai ambalo lingefuta akiba ya miaka mingi mtu mwingine akijeruhiwa. Kuendesha bila bima huhatarisha pikipiki yako, leseni na uhuru wako.",
    premium: "Annual premium — quoted per bike",
    termLabel: "12 months",
    eligibility: "Valid logbook and riding licence",
    featured: true,
  },
  {
    code: "BRITAM-PLL",
    partner: "BRITAM",
    name: "Passenger Legal Liability",
    category: "INSURANCE",
    icon: "users",
    summaryEn: "Covers claims from the passenger on your bike — the gap third party cover leaves open.",
    summarySw: "Hulipa madai ya abiria aliye kwenye pikipiki yako — pengo ambalo bima ya mtu wa tatu huacha wazi.",
    summarySh: "Inacover claims za mteja uliyembeba — hiyo gap TPO inaacha wazi.",
    detailsEn:
      "Most riders assume third party cover protects their passenger. It usually does not. Passenger Legal Liability is the extension that does, and for a rider carrying fifteen to twenty passengers a day it closes the largest uninsured risk in the business.",
    detailsSw:
      "Waendeshaji wengi hudhani bima ya mtu wa tatu inamlinda abiria wao. Mara nyingi haifanyi hivyo. Bima ya Dhima ya Abiria ndiyo nyongeza inayofanya hivyo, na kwa mwendeshaji anayebeba abiria kumi na watano hadi ishirini kwa siku, inafunga hatari kubwa zaidi isiyo na bima katika biashara hii.",
    premium: "Add-on to your motor policy",
    termLabel: "12 months",
    eligibility: "Held alongside a motor policy",
    featured: true,
  },
  {
    code: "BRITAM-PA",
    partner: "BRITAM",
    name: "Personal Accident Cover",
    category: "INSURANCE",
    icon: "heart",
    summaryEn: "Pays you a benefit if you are injured, disabled or killed in an accident — including income replacement.",
    summarySw: "Hukulipa fidia ukijeruhiwa, kupata ulemavu au kufariki katika ajali — pamoja na kufidia kipato.",
    summarySh: "Inakulipa ukiumia, ukipata disability ama ukifariki kwa accident — pamoja na income replacement.",
    detailsEn:
      "Third party cover protects other people. Personal accident cover protects you. It pays medical expenses and a lump sum on disability or death, and many versions pay a weekly benefit while you cannot ride. For a household with one earner and no sick pay, this is the difference between a hard month and a lost home.",
    detailsSw:
      "Bima ya mtu wa tatu hulinda watu wengine. Bima ya ajali binafsi hukulinda wewe. Hulipa gharama za matibabu na kiasi cha jumla kwa ulemavu au kifo, na matoleo mengi hulipa fidia ya kila wiki wakati huwezi kuendesha. Kwa familia yenye mtu mmoja anayeingiza kipato, hii ndiyo tofauti kati ya mwezi mgumu na kupoteza nyumba.",
    premium: "From a few hundred shillings a month",
    termLabel: "12 months, renewable",
    eligibility: "Aged 18 – 65, actively riding",
    featured: true,
  },
  {
    code: "BRITAM-AFYA",
    partner: "BRITAM",
    name: "Britam Connect Health Cover",
    category: "INSURANCE",
    icon: "cross",
    summaryEn: "Microinsurance health cover with flexible weekly payments from as little as KSh 50.",
    summarySw: "Bima ndogo ya afya yenye malipo ya kila wiki kuanzia KSh 50 tu.",
    summarySh: "Health cover ya micro, unalipa weekly kuanzia KSh 50 pekee.",
    detailsEn:
      "Britam Connect was built for gig workers and low-income households whose income arrives daily rather than monthly. Premiums are paid in small weekly instalments through mobile money, so cover fits the way a rider actually earns instead of demanding one large annual payment.",
    detailsSw:
      "Britam Connect iliundwa kwa wafanyakazi wa kujitegemea na familia za kipato cha chini ambao hupata pesa kila siku badala ya kila mwezi. Malipo hufanywa kwa awamu ndogo za kila wiki kupitia pesa za simu, hivyo bima inalingana na jinsi mwendeshaji anavyopata kipato.",
    premium: "Flexible weekly payments from KSh 50",
    termLabel: "Rolling weekly cover",
    eligibility: "Open to riders and their households",
    featured: true,
  },
  {
    code: "BRITAM-FARIJI",
    partner: "BRITAM",
    name: "Fariji Last Expense Plan",
    category: "INSURANCE",
    icon: "dove",
    summaryEn: "A funeral benefit paid quickly so your family is not forced to fundraise in a crisis.",
    summarySw: "Fidia ya mazishi inayolipwa haraka ili familia yako isilazimike kuchanga wakati wa msiba.",
    summarySh: "Funeral benefit inalipwa fast ili family isilazimike kufanya harambee.",
    detailsEn:
      "Last expense cover pays out within days rather than months, and can be extended to parents and dependants. Riders understand this product faster than any other — most have contributed to a stage harambee after losing a colleague.",
    detailsSw:
      "Bima ya mazishi hulipa ndani ya siku chache badala ya miezi, na inaweza kupanuliwa kwa wazazi na wategemezi. Waendeshaji huelewa bidhaa hii haraka kuliko nyingine yoyote — wengi wamechangia harambee ya kituo baada ya kupoteza mwenzao.",
    premium: "Monthly premium based on benefit level",
    termLabel: "12 months, renewable",
    eligibility: "Principal member plus dependants",
  },
  {
    code: "BRITAM-MMF",
    partner: "BRITAM",
    name: "Britam Money Market Fund",
    category: "INVESTMENT",
    icon: "chart",
    summaryEn: "Put idle cash into a fund that earns daily interest and can be withdrawn within days.",
    summarySw: "Weka pesa isiyotumika kwenye mfuko unaopata riba kila siku na unaoweza kutolewa ndani ya siku chache.",
    summarySh: "Weka doo iko idle kwa fund inapata interest kila siku na unaweza withdraw ndani ya siku chache.",
    detailsEn:
      "A money market fund is the simplest way for a rider to hold an emergency fund that actually grows. Interest accrues daily, withdrawals typically settle within a few working days, and there is no penalty for taking your money out — which makes it the right place for the three-months-of-expenses cushion every lesson in the savings module points toward.",
    detailsSw:
      "Mfuko wa soko la fedha ni njia rahisi zaidi kwa mwendeshaji kuwa na akiba ya dharura inayokua kweli. Riba hujilimbikiza kila siku, utoaji hukamilika ndani ya siku chache za kazi, na hakuna adhabu ya kutoa pesa yako — ndiyo maana ni mahali sahihi pa akiba ya matumizi ya miezi mitatu.",
    minAmount: 1000,
    interestRate: "Daily accrual, rate varies with the market",
    termLabel: "No lock-in",
    eligibility: "Open to individuals with an ID and mobile money",
  },
  {
    code: "BRITAM-IPP",
    partner: "BRITAM",
    name: "Individual Pension Plan",
    category: "PENSION",
    icon: "sunset",
    summaryEn: "A personal pension for people with no employer — contribute what you can, when you can.",
    summarySw: "Pensheni binafsi kwa watu wasio na mwajiri — changia unavyoweza, wakati unavyoweza.",
    summarySh: "Pension ya kibinafsi kwa watu hawana employer — changia vile unaweza, wakati unaweza.",
    detailsEn:
      "Riders are self-employed, which means nobody is building a pension for them. An individual pension plan accepts flexible contributions through mobile money, is tax-advantaged, and is locked until retirement age — a feature, not a bug, because the whole point is money you cannot spend on a bad week.",
    detailsSw:
      "Waendeshaji ni wajiajiri, maana yake hakuna anayewajengea pensheni. Mpango wa pensheni binafsi hukubali michango inayobadilika kupitia pesa za simu, una manufaa ya kodi, na umefungwa hadi umri wa kustaafu — sifa nzuri, kwa sababu lengo ni pesa usiyoweza kutumia wiki mbaya.",
    minAmount: 500,
    termLabel: "Until retirement age",
    eligibility: "Aged 18 and above with a KRA PIN",
  },
  {
    code: "BRITAM-MILELE",
    partner: "BRITAM",
    name: "Education & Endowment Plan",
    category: "INVESTMENT",
    icon: "graduation",
    summaryEn: "A savings plan with life cover that pays out on a date you choose — usually a school milestone.",
    summarySw: "Mpango wa akiba wenye bima ya maisha unaolipa tarehe unayochagua — mara nyingi hatua ya masomo.",
    summarySh: "Savings plan na life cover, inalipa date unaichagua — mostly time ya school.",
    detailsEn:
      "An endowment combines disciplined saving with a life benefit: you choose a maturity date, contribute monthly, and the plan pays out then. If you die before maturity the plan still pays your family the full benefit — so your child's secondary school fees survive you.",
    detailsSw:
      "Mpango huu huchanganya akiba yenye nidhamu na manufaa ya maisha: unachagua tarehe ya kukomaa, unachangia kila mwezi, na mpango hulipa wakati huo. Ukifariki kabla ya kukomaa, mpango bado hulipa familia yako manufaa kamili.",
    minAmount: 1000,
    termLabel: "Chosen maturity date",
    eligibility: "Aged 18 – 60",
  },
];
