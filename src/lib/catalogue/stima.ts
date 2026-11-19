import type { CatalogueEntry } from "./types";

/**
 * Stima DT SACCO's actual products, as published on stima-sacco.com.
 *
 * Only products a boda rider can realistically hold are here. Mortgages,
 * LPO financing, invoice discounting, diaspora accounts and the corporate
 * facilities are left out — not because they are not real, but because
 * offering a rider a KES 15M micro-mortgage is noise.
 *
 * Two things about a SACCO shape everything below, and the lesson copy
 * should say so plainly:
 *
 *   1. You must be a member before you can hold any account. Membership
 *      starts with share capital.
 *   2. Almost every loan is a multiple of your Alpha Deposits. The deposit
 *      account is not a side product — it is the thing that makes credit
 *      possible at all, which is why it is marked featured.
 *
 * Rates and minimums move. Each entry carries the page it was read from and
 * the date it was checked.
 */

const SRC_SAVINGS = "https://www.stima-sacco.com/savings-products/";
const SRC_CREDIT = "https://www.stima-sacco.com/credit-products/";
const SRC_INVEST = "https://www.stima-sacco.com/investment-options/";
const CHECKED = "2026-11-20";

export const STIMA_PRODUCTS: CatalogueEntry[] = [
  /* ════════════════════════════════════════════════════ membership ════ */
  {
    code: "STM-SHARE",
    name: "Share Capital",
    category: "SAVINGS",
    icon: "landmark",
    featured: 0,
    requiresMembership: 0,
    minAmount: 500,
    termLabel: "Held for as long as you are a member",
    eligibility: "Anyone joining Stima Sacco. This is the first step — no other account opens without it.",
    summaryEn:
      "Your stake in the SACCO. It is not savings you withdraw; it is what makes you a member and pays you a dividend each year. Entry starts at KES 500 for one share.",
    summarySw:
      "Hisa yako katika SACCO. Si akiba ya kutoa; ndiyo inayokufanya mwanachama na kukulipa gawio kila mwaka. Huanza kwa KSh 500 kwa hisa moja.",
    summarySh:
      "Hii ndio share yako kwa SACCO. Si doo ya kutoa — ndio inakufanya member na inakulipa dividend kila mwaka. Unaanza na KSh 500 kwa share moja.",
    detailsEn:
      "Share capital is ownership, not a savings balance. You cannot withdraw it while you remain a member; you sell or transfer it when you leave. In return it earns a dividend declared annually by the members. Stima publishes membership tiers — Prime Investor from KES 500 (1 share), Silver KES 5,000, Gold KES 25,000, Diamond KES 50,000 — so you can start small and build up. Understand this before anything else: a SACCO is not a bank. You are a part-owner, and the loans you can take later are built on the deposits you make as a member.",
    detailsSw:
      "Hisa ni umiliki, si akiba. Huwezi kuitoa ukiwa mwanachama; unaiuza au kuihamisha unapoondoka. Badala yake inapata gawio linalotangazwa kila mwaka na wanachama. Stima ina madaraja ya uanachama — Prime Investor kuanzia KSh 500 (hisa 1), Silver KSh 5,000, Gold KSh 25,000, Diamond KSh 50,000 — kwa hivyo unaweza kuanza kidogo na kukua. Elewa hili kwanza: SACCO si benki. Wewe ni mmiliki mwenza, na mikopo utakayochukua baadaye inategemea amana unazoweka kama mwanachama.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-ALPHA",
    name: "Alpha Deposits",
    category: "SAVINGS",
    icon: "piggy-bank",
    featured: 1,
    requiresMembership: 1,
    minAmount: 1000,
    interestRate: "Interest declared annually",
    termLabel: "Monthly, from KES 1,000",
    eligibility: "Members only. Accessible only when you withdraw your membership.",
    summaryEn:
      "The deposit account every Stima loan is measured against. Save at least KES 1,000 a month and you can borrow up to four times what you have saved.",
    summarySw:
      "Akaunti ya amana ambayo kila mkopo wa Stima hupimwa kwayo. Weka angalau KSh 1,000 kwa mwezi na unaweza kukopa hadi mara nne ya ulichoweka.",
    summarySh:
      "Hii ndio account mkopo wote wa Stima unapimwa nayo. Weka angalau KSh 1,000 kwa mwezi na unaweza kukopa mara nne ya ile umeweka.",
    detailsEn:
      "Alpha Deposits are non-withdrawable while you are a member — that is the point of them. They earn interest declared each year, and they are the multiplier: most Stima loans are capped at three to four times your Alpha balance. A rider saving KES 1,000 a month builds KES 12,000 in a year, which is roughly KES 48,000 of borrowing power on a 4x product. If you take only one thing from this app, make it this: the deposit comes first, and the loan follows from it. Money here is locked until you leave the SACCO, so keep your day-to-day cash in a Prime Account instead.",
    detailsSw:
      "Alpha Deposits haziwezi kutolewa ukiwa mwanachama — hiyo ndiyo kusudi lake. Zinapata riba inayotangazwa kila mwaka, na ndizo kizidishi: mikopo mingi ya Stima ina kikomo cha mara tatu hadi nne ya salio lako la Alpha. Mwendesha boda anayeweka KSh 1,000 kwa mwezi anajenga KSh 12,000 kwa mwaka, ambayo ni takriban KSh 48,000 ya uwezo wa kukopa kwa bidhaa ya mara 4. Ukichukua kitu kimoja tu kutoka kwa programu hii, kiwe hiki: amana kwanza, mkopo unafuata. Pesa hapa imefungwa hadi utakapoondoka, kwa hivyo weka pesa ya kila siku kwenye Prime Account.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-PRIME",
    name: "Prime Account",
    category: "SAVINGS",
    icon: "wallet",
    featured: 1,
    requiresMembership: 1,
    minAmount: 500,
    interestRate: "2% p.a. on balances from KES 20,000",
    termLabel: "Withdraw any time",
    eligibility: "Members. An active Prime account is what unlocks the M-Pawa mobile loan.",
    summaryEn:
      "Your day-to-day account at the SACCO. Minimum balance KES 500, withdraw whenever you need to, and keeping it active is what opens the M-Pawa instant loan.",
    summarySw:
      "Akaunti yako ya kila siku kwenye SACCO. Salio la chini KSh 500, toa wakati wowote, na kuiweka hai ndiko kunakofungua mkopo wa papo hapo wa M-Pawa.",
    summarySh:
      "Account yako ya kila siku kwa SACCO. Min balance KSh 500, unatoa wakati wowote, na ukiiweka active ndio unafungua M-Pawa loan ya instant.",
    detailsEn:
      "The Prime Account is the transactional one: money in from fares, money out for fuel, school fees or a repair. It keeps a minimum balance of KES 500 and pays 2% a year once you hold KES 20,000 or more, so it is not where long-term savings should sit. Its real value to a rider is access — an active Prime Account is the condition for M-Pawa, the instant mobile loan on *489#. Open this alongside Alpha Deposits: Alpha builds borrowing power, Prime gives you somewhere to receive and spend.",
    detailsSw:
      "Prime Account ni ya miamala: pesa inayoingia kutoka kwa nauli, inayotoka kwa mafuta, karo au matengenezo. Ina salio la chini la KSh 500 na inalipa 2% kwa mwaka ukishikilia KSh 20,000 au zaidi, kwa hivyo si mahali pa akiba ya muda mrefu. Thamani yake halisi kwa mwendesha boda ni ufikiaji — Prime Account hai ndiyo sharti la M-Pawa, mkopo wa papo hapo kwa *489#. Fungua hii pamoja na Alpha Deposits: Alpha inajenga uwezo wa kukopa, Prime inakupa mahali pa kupokea na kutumia.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-MUSTARD",
    name: "Mustard Account",
    category: "SAVINGS",
    icon: "sprout",
    featured: 1,
    requiresMembership: 1,
    minAmount: 600,
    interestRate: "5% p.a.",
    termLabel: "From KES 600 a month",
    eligibility: "Members. Up to 25% of your savings can be withdrawn each year.",
    summaryEn:
      "A fall-back account for the years when you cannot ride. KES 600 a month, 5% a year, and you may take out up to a quarter of it annually if you must.",
    summarySw:
      "Akaunti ya kujihifadhi kwa miaka ambayo hutaweza kuendesha. KSh 600 kwa mwezi, 5% kwa mwaka, na unaweza kutoa hadi robo yake kila mwaka ikibidi.",
    summarySh:
      "Account ya kujiwekea kwa siku utakuwa huwezi kuendesha. KSh 600 kwa mwezi, 5% kwa mwaka, na unaweza toa hadi robo yake kila mwaka ikibidi.",
    detailsEn:
      "Riding is physical work with a short career. The Mustard Account is Stima's retirement savings account: KES 600 a month minimum, KES 500 minimum balance, 5% a year — better than the Prime Account precisely because you are not meant to touch it. You can withdraw up to 25% of your savings in a year if something serious happens, with charges for early withdrawal. Think of it as the account that answers the question nobody on the stage likes asking: what happens when the knees go, or the bike does, and there is no fare money coming in.",
    detailsSw:
      "Kuendesha boda ni kazi ya mwili yenye kipindi kifupi. Mustard Account ni akaunti ya akiba ya uzeeni ya Stima: KSh 600 kwa mwezi kiwango cha chini, salio la chini KSh 500, 5% kwa mwaka — bora kuliko Prime Account kwa sababu hasa hupaswi kuigusa. Unaweza kutoa hadi 25% ya akiba yako kwa mwaka ikiwa jambo zito limetokea, na kuna gharama za kutoa mapema. Ifikirie kama akaunti inayojibu swali ambalo hakuna mtu kwenye stage anapenda kuuliza: itakuwaje magoti yakichoka, au pikipiki ikiisha, na hakuna pesa ya nauli inayoingia.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-TWIGA",
    name: "Twiga Savings",
    category: "SAVINGS",
    icon: "target",
    featured: 0,
    requiresMembership: 1,
    minAmount: 1000,
    interestRate: "3% p.a. on balances above KES 6,000",
    termLabel: "First withdrawal after 6 months, then every 3",
    eligibility: "Members saving towards a specific target.",
    summaryEn:
      "Saving for one named thing — a new bike, school fees, a plot deposit. KES 1,000 a month, and the withdrawal rules are what stop you spending it.",
    summarySw:
      "Kuweka akiba kwa kitu kimoja maalum — pikipiki mpya, karo, au malipo ya awali ya kiwanja. KSh 1,000 kwa mwezi, na sheria za kutoa ndizo zinakuzuia kuitumia.",
    summarySh:
      "Unasave kwa kitu moja specific — bike mpya, karo, ama deposit ya plot. KSh 1,000 kwa mwezi, na rules za kutoa ndio zinakuzuia kuitumia.",
    detailsEn:
      "Twiga is a targeted savings account: you name the goal and save towards it. Minimum KES 1,000 a month, minimum balance KES 500, and 3% a year once the balance passes KES 6,000. The first withdrawal is only allowed after six months, then once every three months, with charges for going early. Those restrictions are the product. A rider with fare money in their pocket every evening does not usually fail at earning — they fail at not spending, and an account you cannot easily raid is a practical answer to that.",
    detailsSw:
      "Twiga ni akaunti ya akiba yenye lengo: unataja lengo na kuweka akiba kuelekea hapo. Kiwango cha chini KSh 1,000 kwa mwezi, salio la chini KSh 500, na 3% kwa mwaka salio likipita KSh 6,000. Utoaji wa kwanza unaruhusiwa baada ya miezi sita, kisha mara moja kila miezi mitatu, na kuna gharama za kutoa mapema. Vizuizi hivyo ndivyo bidhaa yenyewe. Mwendesha boda mwenye pesa ya nauli mfukoni kila jioni mara nyingi hashindwi kupata — anashindwa kutotumia, na akaunti usiyoweza kuivamia kirahisi ni jibu la vitendo kwa hilo.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-MSINGI",
    name: "Msingi Bora",
    category: "SAVINGS",
    icon: "graduation-cap",
    featured: 0,
    requiresMembership: 1,
    minAmount: 500,
    interestRate: "5% p.a. at the end of the contract",
    termLabel: "A contract of 5 to 18 years",
    eligibility: "Members saving for a child's education. Insured against the member's death or permanent disability.",
    summaryEn:
      "A long contract for a child's school, college or university fees. From KES 500 a month, and if you die or are permanently disabled the plan is insured so the child still gets the money.",
    summarySw:
      "Mkataba wa muda mrefu wa karo ya shule, chuo au chuo kikuu cha mtoto. Kuanzia KSh 500 kwa mwezi, na ukifariki au kulemazwa kabisa mpango umewekewa bima ili mtoto apate pesa hiyo.",
    summarySh:
      "Contract ya muda mrefu ya karo ya mtoto — shule, college ama uni. Kuanzia KSh 500 kwa mwezi, na ukifariki ama ukilemazwa, plan iko na bima so mtoto bado anapata hiyo doo.",
    detailsEn:
      "Msingi Bora is a contractual plan running five to eighteen years, paying 5% a year at the end of the contract. The part that matters most to a rider is the insurance attached to it: if the member dies or is permanently disabled, the plan is covered, so the child's fees do not die with the earner. Ending the contract early forfeits the interest and attracts a 2% charge, so only commit to an amount you can hold through a bad month. There is also a matching Msingi Bora loan of up to 75% of what you have saved.",
    detailsSw:
      "Msingi Bora ni mpango wa mkataba wa miaka mitano hadi kumi na nane, unaolipa 5% kwa mwaka mwishoni mwa mkataba. Sehemu muhimu zaidi kwa mwendesha boda ni bima iliyoambatishwa: mwanachama akifariki au kulemazwa kabisa, mpango umefunikwa, kwa hivyo karo ya mtoto haifi pamoja na mchumaji. Kumaliza mkataba mapema kunapoteza riba na kuna gharama ya 2%, kwa hivyo jitolee kiasi unachoweza kushikilia hata mwezi mbaya. Pia kuna mkopo wa Msingi Bora wa hadi 75% ya ulichoweka.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-JUNIOR",
    name: "Junior Star Account",
    category: "SAVINGS",
    icon: "baby",
    featured: 0,
    requiresMembership: 1,
    minAmount: 500,
    termLabel: "Withdrawals once every 3 months",
    eligibility: "Members saving on behalf of a child.",
    summaryEn:
      "A savings account in your child's name. KES 500 a month, withdrawals once a quarter.",
    summarySw: "Akaunti ya akiba kwa jina la mtoto wako. KSh 500 kwa mwezi, utoaji mara moja kila robo mwaka.",
    summarySh: "Account ya savings kwa jina ya mtoto wako. KSh 500 kwa mwezi, unatoa mara moja kila robo mwaka.",
    detailsEn:
      "Junior Star holds savings for a child under a parent or guardian's membership: minimum KES 500 a month and a KES 500 minimum balance, with withdrawals allowed once every three months. Taking money out sooner costs KES 500 per withdrawal, unless it is going to pay off a loan or moving to another savings account. It is simpler and shorter than Msingi Bora, and a reasonable place to start if an eighteen-year contract feels like too much to promise.",
    detailsSw:
      "Junior Star inahifadhi akiba ya mtoto chini ya uanachama wa mzazi au mlezi: kiwango cha chini KSh 500 kwa mwezi na salio la chini la KSh 500, na utoaji unaruhusiwa mara moja kila miezi mitatu. Kutoa pesa mapema kunagharimu KSh 500 kwa kila utoaji, isipokuwa inapokwenda kulipa mkopo au kuhamia akaunti nyingine ya akiba. Ni rahisi na fupi kuliko Msingi Bora, na mahali pazuri pa kuanzia ikiwa mkataba wa miaka kumi na nane unaonekana ni ahadi kubwa mno.",
    sourceUrl: SRC_SAVINGS,
    verifiedOn: CHECKED,
  },

  /* ════════════════════════════════════════════════════════ credit ════ */
  {
    code: "STM-MPAWA",
    name: "M-Pawa Loan",
    category: "CREDIT",
    icon: "smartphone",
    featured: 1,
    requiresMembership: 1,
    maxAmount: 120000,
    termLabel: "Up to 6 months",
    eligibility: "Members with an active Prime Account. Applied for on *489# or the M-Stima app — no guarantors.",
    summaryEn:
      "An instant mobile loan up to KES 120,000, taken on *489# without guarantors. Repay within six months.",
    summarySw:
      "Mkopo wa papo hapo wa simu hadi KSh 120,000, kwa *489# bila wadhamini. Lipa ndani ya miezi sita.",
    summarySh:
      "Loan ya instant kwa simu hadi KSh 120,000, kwa *489# bila guarantor. Ulipe ndani ya miezi sita.",
    detailsEn:
      "M-Pawa is the Stima product that fits a rider's life most closely: unsecured, taken on USSD *489# or the M-Stima app, no guarantors to chase, up to KES 120,000 over a maximum of six months. You need an active Prime Account to qualify. The rate is set by the SACCO and shown on the menu before you confirm — check it there rather than assuming, because it changes. One warning worth taking seriously: if you fall behind, Stima recovers the balance from your Alpha Deposits and marks you a defaulter, and you must repay what was taken before the account is reinstated. That means a missed M-Pawa loan does not just cost interest, it eats the deposits your future borrowing power is built on.",
    detailsSw:
      "M-Pawa ndiyo bidhaa ya Stima inayoendana zaidi na maisha ya mwendesha boda: bila dhamana, kwa USSD *489# au programu ya M-Stima, bila wadhamini wa kufukuza, hadi KSh 120,000 kwa kipindi cha juu cha miezi sita. Unahitaji Prime Account hai ili ustahili. Kiwango cha riba kinawekwa na SACCO na kinaonyeshwa kwenye menyu kabla ya kuthibitisha — kiangalie hapo badala ya kukisia, kwa sababu kinabadilika. Onyo moja la kuzingatia: ukichelewa, Stima inarudisha salio kutoka kwa Alpha Deposits zako na kukuweka alama ya mdaiwa, na lazima ulipe kilichochukuliwa kabla akaunti kurejeshwa. Hiyo inamaanisha mkopo wa M-Pawa uliokosewa haugharimu riba tu, unakula amana ambazo uwezo wako wa kukopa baadaye umejengwa juu yake.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-NORMAL",
    name: "Normal Loan",
    category: "CREDIT",
    icon: "banknote",
    featured: 1,
    requiresMembership: 1,
    interestRate: "12% a year on reducing balance",
    termLabel: "Up to 60 months",
    eligibility: "Members with Alpha Deposits and, usually, guarantors. Borrow up to 4x your deposits.",
    summaryEn:
      "The main SACCO loan: up to four times your Alpha Deposits at 12% a year on reducing balance, repaid over as long as five years.",
    summarySw:
      "Mkopo mkuu wa SACCO: hadi mara nne ya Alpha Deposits zako kwa 12% kwa mwaka kwa salio linalopungua, kulipwa kwa hadi miaka mitano.",
    summarySh:
      "Loan kuu ya SACCO: hadi mara nne ya Alpha Deposits zako kwa 12% kwa mwaka kwa reducing balance, unalipa hadi miaka tano.",
    detailsEn:
      "This is the workhorse. Twelve per cent a year on a reducing balance means interest is charged on what you still owe, not on the original amount — so paying ahead genuinely costs you less, which is not true of every lender a rider meets. The limit is four times your Alpha Deposits, which is the clearest argument there is for saving steadily before you need to borrow. Terms run up to sixty months. Guarantors are usually required: other members pledge to cover you if you default, which is why SACCO credit is cheaper than a mobile app loan and also why defaulting costs you your standing with people you know.",
    detailsSw:
      "Huu ndio mkopo mkuu. Asilimia kumi na mbili kwa mwaka kwa salio linalopungua inamaanisha riba inatozwa kwa unachodaiwa bado, si kwa kiasi cha awali — kwa hivyo kulipa mapema kunakugharimu kidogo kweli, jambo lisilo kweli kwa kila mkopeshaji anayekutana na mwendesha boda. Kikomo ni mara nne ya Alpha Deposits zako, ambayo ndiyo hoja wazi zaidi ya kuweka akiba kwa utaratibu kabla ya kuhitaji kukopa. Muda unafika miezi sitini. Wadhamini huhitajika: wanachama wengine wanaahidi kukulipia ukishindwa, ndiyo sababu mkopo wa SACCO ni nafuu kuliko wa programu ya simu na pia ndiyo sababu kushindwa kulipa kunakugharimu heshima kwa watu unaowajua.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-WORKING",
    name: "Working Capital Loan",
    category: "CREDIT",
    icon: "briefcase",
    featured: 1,
    requiresMembership: 1,
    termLabel: "Up to 72 months",
    eligibility: "Members running a business or trade. Up to 4x your Alpha Deposits.",
    summaryEn:
      "For the business itself — a second bike, spares, a stock of parts. Up to four times your deposits, repaid over as long as six years.",
    summarySw:
      "Kwa biashara yenyewe — pikipiki ya pili, vipuri, au hisa ya vipengele. Hadi mara nne ya amana zako, kulipwa kwa hadi miaka sita.",
    summarySh:
      "Ya biashara yenyewe — bike ya pili, spare, ama stock ya parts. Hadi mara nne ya deposits zako, unalipa hadi miaka sita.",
    detailsEn:
      "Working capital is credit for the trade rather than for the household: a second motorcycle to put another rider on, a stock of spares, tyres bought in bulk before a price rise. The limit is four times your Alpha Deposits and the term runs up to seventy-two months. The discipline worth applying is simple — borrow for something that earns, not something that only costs. A second bike generating fares can repay itself; a loan taken against the same deposits for consumption cannot.",
    detailsSw:
      "Mtaji wa kazi ni mkopo wa biashara badala ya wa nyumbani: pikipiki ya pili ya kumweka mwendeshaji mwingine, hisa ya vipuri, matairi yaliyonunuliwa kwa wingi kabla bei kupanda. Kikomo ni mara nne ya Alpha Deposits zako na muda unafika miezi sabini na mbili. Nidhamu inayofaa ni rahisi — kopa kwa kitu kinachochuma, si kinachogharimu tu. Pikipiki ya pili inayoleta nauli inaweza kujilipa; mkopo uliochukuliwa kwa matumizi hauwezi.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-PRIMEADV",
    name: "Prime Advance Loan",
    category: "CREDIT",
    icon: "zap",
    featured: 0,
    requiresMembership: 1,
    maxAmount: 200000,
    termLabel: "Up to 12 months",
    eligibility: "Members with an active Prime Account.",
    summaryEn: "A short advance of up to KES 200,000, repaid within a year.",
    summarySw: "Malipo ya haraka ya hadi KSh 200,000, kulipwa ndani ya mwaka mmoja.",
    summarySh: "Advance ya haraka hadi KSh 200,000, unalipa ndani ya mwaka mmoja.",
    detailsEn:
      "A larger and slightly longer alternative to M-Pawa, up to KES 200,000 over twelve months, run through your Prime Account. Useful for a lump that M-Pawa cannot cover but that does not justify a five-year loan — a major engine rebuild, a deposit, settling a debt that is costing more elsewhere. Confirm the current rate with the SACCO before committing.",
    detailsSw:
      "Mbadala mkubwa na mrefu kidogo kuliko M-Pawa, hadi KSh 200,000 kwa miezi kumi na miwili, kupitia Prime Account yako. Ni muhimu kwa kiasi ambacho M-Pawa haiwezi kufunika lakini hakihitaji mkopo wa miaka mitano — kurekebisha injini kubwa, malipo ya awali, au kulipa deni linalogharimu zaidi kwingine. Thibitisha kiwango cha sasa na SACCO kabla ya kujitolea.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-SCHOOLFEE",
    name: "Emergency School Fees Loan",
    category: "CREDIT",
    icon: "school",
    featured: 0,
    requiresMembership: 1,
    termLabel: "Up to 15 months",
    eligibility: "Members with Alpha Deposits. Up to 3x deposits.",
    summaryEn:
      "For a fees deadline you did not plan for. Up to three times your deposits, repaid over fifteen months.",
    summarySw:
      "Kwa tarehe ya mwisho ya karo usiyoipanga. Hadi mara tatu ya amana zako, kulipwa kwa miezi kumi na mitano.",
    summarySh:
      "Ya deadline ya karo ambayo hukupanga. Hadi mara tatu ya deposits zako, unalipa kwa miezi kumi na tano.",
    detailsEn:
      "School fees arrive on a schedule everyone knows and most people are still caught by. This loan is up to three times your Alpha Deposits over fifteen months. Worth saying plainly: a Twiga or Msingi Bora account set up a year earlier is cheaper than this loan, because you pay yourself interest instead of paying the SACCO. Use the loan when the term has already started; use the savings account so that next year you do not need it.",
    detailsSw:
      "Karo huja kwa ratiba ambayo kila mtu anaijua na bado watu wengi wanashtukizwa. Mkopo huu ni hadi mara tatu ya Alpha Deposits zako kwa miezi kumi na mitano. Inafaa kusemwa wazi: akaunti ya Twiga au Msingi Bora iliyoanzishwa mwaka mmoja mapema ni nafuu kuliko mkopo huu, kwa sababu unajilipa riba badala ya kulipa SACCO. Tumia mkopo wakati muhula umeshaanza; tumia akaunti ya akiba ili mwaka ujao usiuhitaji.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-MAKEOVER",
    name: "Makeover Loan",
    category: "CREDIT",
    icon: "bike",
    featured: 0,
    requiresMembership: 1,
    maxAmount: 1000000,
    interestRate: "18% a year on reducing balance",
    termLabel: "Up to 48 months",
    eligibility: "Members buying a specific item. The amount depends on the item's value.",
    summaryEn:
      "For buying a specific thing — a motorcycle, equipment, furnishings. Up to KES 1,000,000 at 18% a year over four years.",
    summarySw:
      "Kwa kununua kitu maalum — pikipiki, vifaa, au samani. Hadi KSh 1,000,000 kwa 18% kwa mwaka kwa miaka minne.",
    summarySh:
      "Ya kununua kitu specific — bike, vifaa, ama furniture. Hadi KSh 1,000,000 kwa 18% kwa mwaka kwa miaka minne.",
    detailsEn:
      "An asset purchase loan of up to KES 1,000,000 at 18% a year on reducing balance, over as long as forty-eight months, with the amount tied to the value of the item. Note the rate against the Normal Loan's 12% — this is a more expensive way to borrow, so it is worth asking whether your Alpha Deposits can carry a Normal or Working Capital loan for the same purchase first. For a rider buying their own motorcycle rather than renting one from an owner, the arithmetic is usually still worth doing: rent paid to an owner never comes back.",
    detailsSw:
      "Mkopo wa kununua mali wa hadi KSh 1,000,000 kwa 18% kwa mwaka kwa salio linalopungua, kwa hadi miezi arobaini na nane, kiasi kikihusishwa na thamani ya kitu. Angalia kiwango hiki dhidi ya 12% ya Normal Loan — hii ni njia ghali zaidi ya kukopa, kwa hivyo inafaa kuuliza kwanza kama Alpha Deposits zako zinaweza kubeba Normal au Working Capital loan kwa ununuzi huo huo. Kwa mwendesha boda anayenunua pikipiki yake badala ya kukodisha kutoka kwa mmiliki, hesabu mara nyingi bado inafaa kufanywa: kodi unayolipa mmiliki hairudi kamwe.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-SOSA",
    name: "SOSA Loan",
    category: "CREDIT",
    icon: "banknote",
    featured: 0,
    requiresMembership: 1,
    interestRate: "15% a year on reducing balance",
    termLabel: "Up to 24 months",
    eligibility: "Members. Up to 4x Alpha Deposits.",
    summaryEn: "A two-year loan of up to four times your deposits at 15% a year on reducing balance.",
    summarySw: "Mkopo wa miaka miwili wa hadi mara nne ya amana zako kwa 15% kwa mwaka kwa salio linalopungua.",
    summarySh: "Loan ya miaka miwili ya hadi mara nne ya deposits zako kwa 15% kwa mwaka kwa reducing balance.",
    detailsEn:
      "SOSA sits between the instant mobile products and the long Normal Loan: up to four times your Alpha Deposits, 15% a year on reducing balance, repaid within twenty-four months. The shorter term means higher instalments but less interest paid overall than the same amount stretched over five years — a trade worth understanding rather than defaulting to the longest term on offer.",
    detailsSw:
      "SOSA iko kati ya bidhaa za papo hapo za simu na Normal Loan ndefu: hadi mara nne ya Alpha Deposits zako, 15% kwa mwaka kwa salio linalopungua, kulipwa ndani ya miezi ishirini na minne. Muda mfupi unamaanisha malipo makubwa kila mwezi lakini riba ndogo kwa jumla kuliko kiasi hicho hicho kilichotandazwa kwa miaka mitano — ubadilishanaji unaofaa kueleweka badala ya kuchagua muda mrefu zaidi uliopo.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-FUNIKA",
    name: "M-Pawa Funika",
    category: "CREDIT",
    icon: "alert-triangle",
    featured: 0,
    requiresMembership: 1,
    maxAmount: 15000,
    interestRate: "1% a day",
    termLabel: "30 days",
    eligibility: "Members on M-Pawa. Read the rate before you take it.",
    summaryEn:
      "A 30-day emergency top-up of up to KES 15,000 charged at 1% a day. That is about 30% in a month — the most expensive money in this list.",
    summarySw:
      "Nyongeza ya dharura ya siku 30 ya hadi KSh 15,000 kwa 1% kwa siku. Hiyo ni takriban 30% kwa mwezi — pesa ghali zaidi kwenye orodha hii.",
    summarySh:
      "Top-up ya emergency ya siku 30 hadi KSh 15,000 kwa 1% kwa siku. Hiyo ni kama 30% kwa mwezi — doo ghali zaidi kwa hii list.",
    detailsEn:
      "Funika is a short emergency facility: up to KES 15,000 for thirty days at 1% a day. We are listing it because riders meet it and should understand it, not because we recommend it. One per cent a day is roughly thirty per cent over a month, against twelve per cent a year on a Normal Loan. On KES 10,000 that is about KES 3,000 in a month. If you can wait for an M-Pawa loan, wait. If you are using Funika more than once or twice a year, the problem is not this month's emergency — it is that there is no buffer, and a Mustard or Twiga account is the fix.",
    detailsSw:
      "Funika ni kituo kifupi cha dharura: hadi KSh 15,000 kwa siku thelathini kwa 1% kwa siku. Tunaiorodhesha kwa sababu waendesha boda wanakutana nayo na wanapaswa kuielewa, si kwa sababu tunaipendekeza. Asilimia moja kwa siku ni takriban asilimia thelathini kwa mwezi, dhidi ya asilimia kumi na mbili kwa mwaka kwenye Normal Loan. Kwa KSh 10,000 hiyo ni takriban KSh 3,000 kwa mwezi. Ukiweza kusubiri mkopo wa M-Pawa, subiri. Ukitumia Funika zaidi ya mara moja au mbili kwa mwaka, shida si dharura ya mwezi huu — ni kwamba hakuna akiba ya dharura, na akaunti ya Mustard au Twiga ndiyo suluhisho.",
    sourceUrl: SRC_CREDIT,
    verifiedOn: CHECKED,
  },

  /* ════════════════════════════════════════════════════ investment ════ */
  {
    code: "STM-FIXED",
    name: "Fixed Deposit Account",
    category: "INVESTMENT",
    icon: "lock",
    featured: 0,
    requiresMembership: 1,
    minAmount: 5000,
    termLabel: "3, 6 or 12 months",
    eligibility: "Members with a lump sum they will not need for the term.",
    summaryEn:
      "Lock a lump sum of KES 5,000 or more for three, six or twelve months and take the interest at the end.",
    summarySw:
      "Funga kiasi cha KSh 5,000 au zaidi kwa miezi mitatu, sita au kumi na miwili na uchukue riba mwishoni.",
    summarySh:
      "Funga lump sum ya KSh 5,000 ama zaidi kwa miezi tatu, sita ama kumi na mbili, halafu uchukue interest mwishoni.",
    detailsEn:
      "A fixed deposit pays more than a transaction account because you give up access for a set period. Minimum KES 5,000, terms of three, six or twelve months, interest credited at maturity less 5% withholding tax. Withdrawing early forfeits the accrued interest, so only fix money you are confident you will not need — a rider's income is seasonal and a bike repair does not wait for a maturity date.",
    detailsSw:
      "Amana ya kudumu inalipa zaidi ya akaunti ya miamala kwa sababu unakubali kutoifikia kwa kipindi fulani. Kiwango cha chini KSh 5,000, muda wa miezi mitatu, sita au kumi na miwili, riba inawekwa wakati wa kukomaa baada ya kutoa kodi ya 5%. Kutoa mapema kunapoteza riba iliyokusanywa, kwa hivyo funga pesa unayoamini hutahitaji — mapato ya mwendesha boda yanabadilika kwa misimu na matengenezo ya pikipiki hayasubiri tarehe ya kukomaa.",
    sourceUrl: SRC_INVEST,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-CALL",
    name: "Call Deposit Account",
    category: "INVESTMENT",
    icon: "phone-call",
    featured: 0,
    requiresMembership: 1,
    minAmount: 5000,
    termLabel: "Recall any time",
    eligibility: "Members wanting a return without locking the money away.",
    summaryEn:
      "From KES 5,000, earning a guaranteed return but recallable at any time without losing the interest earned.",
    summarySw:
      "Kuanzia KSh 5,000, ikipata mapato ya uhakika lakini inaweza kurudishwa wakati wowote bila kupoteza riba iliyopatikana.",
    summarySh:
      "Kuanzia KSh 5,000, inapata return ya uhakika lakini unaweza kuitoa wakati wowote bila kupoteza interest.",
    detailsEn:
      "The call deposit is the compromise between a fixed deposit and a current account: a guaranteed return, minimum KES 5,000, and funds you can recall at any time without forfeiting interest already earned. For a rider whose income is uneven, that flexibility is usually worth more than the extra points a fixed deposit would pay.",
    detailsSw:
      "Call deposit ni maelewano kati ya amana ya kudumu na akaunti ya sasa: mapato ya uhakika, kiwango cha chini KSh 5,000, na pesa unazoweza kurudisha wakati wowote bila kupoteza riba iliyopatikana tayari. Kwa mwendesha boda ambaye mapato yake si sawa, unyumbufu huo mara nyingi una thamani zaidi ya pointi za ziada ambazo amana ya kudumu ingelipa.",
    sourceUrl: SRC_INVEST,
    verifiedOn: CHECKED,
  },
  {
    code: "STM-GOLDEN",
    name: "Golden Savings Account",
    category: "INVESTMENT",
    icon: "coins",
    featured: 0,
    requiresMembership: 1,
    minAmount: 5000,
    termLabel: "Fixed for 1 year",
    eligibility: "Members wanting a monthly income from a lump sum.",
    summaryEn:
      "Fix KES 5,000 or more for a year and take a guaranteed minimum return every month rather than at the end.",
    summarySw:
      "Funga KSh 5,000 au zaidi kwa mwaka mmoja na uchukue mapato ya chini ya uhakika kila mwezi badala ya mwishoni.",
    summarySh:
      "Funga KSh 5,000 ama zaidi kwa mwaka mmoja halafu uchukue return ya uhakika kila mwezi badala ya mwishoni.",
    detailsEn:
      "Golden Savings fixes a lump sum for one year and pays a guaranteed minimum return monthly, scaled to the amount invested, and the monthly return can be wired to a named beneficiary on request. That last feature is the useful one: a rider supporting a parent upcountry can have the income sent directly rather than remembering to send it.",
    detailsSw:
      "Golden Savings inafunga kiasi kwa mwaka mmoja na kulipa mapato ya chini ya uhakika kila mwezi, kulingana na kiasi kilichowekezwa, na mapato ya kila mwezi yanaweza kutumwa kwa mnufaika aliyetajwa ukiomba. Kipengele hicho cha mwisho ndicho muhimu: mwendesha boda anayemsaidia mzazi mashinani anaweza kuwa mapato yanatumwa moja kwa moja badala ya kukumbuka kuyatuma.",
    sourceUrl: SRC_INVEST,
    verifiedOn: CHECKED,
  },
];
