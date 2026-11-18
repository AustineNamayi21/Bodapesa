import type { LessonEnrichment } from "./types";

/**
 * Module 1 — Savings.
 *
 * Figures throughout are the ones a Nairobi rider actually sees: a daily
 * take-home of roughly KSh 800–1,500 before fuel, fuel at KSh 250–400 a day,
 * a stage fee, and a SACCO that wants share capital before it will lend.
 * Every example is worked in shillings so the arithmetic can be checked
 * rather than taken on trust.
 */
export const SAVINGS_LESSONS: LessonEnrichment[] = [
  // ───────────────────────────────────────────────────────────────── SAV-1 ──
  {
    code: "SAV-1",
    durationMin: 7,
    summary: {
      En: "Move a fixed amount out of your pocket the moment you earn it — before fuel, before lunch, before the stage.",
      Sw: "Toa kiasi maalum mfukoni mwako mara tu unapokipata — kabla ya mafuta, kabla ya chakula, kabla ya kituo.",
      Sh: "Toa amount fixed kwa mfuko immediately unaipata — kabla ya fuel, kabla ya lunch, kabla ya base.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Ask any rider at the stage how much they saved last month and most will say the same thing: nothing was left. That is not a discipline problem. It is an ordering problem.\n\nIf saving is the last thing that happens to your money, it competes with fuel, lunch, airtime, the stage fee, a friend who needs a hundred bob, and the puncture you did not plan for. Saving loses that competition every single day, because everything else is urgent and saving is not.\n\nThis lesson reverses the order. You will stop asking \"what is left to save?\" and start asking \"what is left to spend?\"",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Pick one amount you can survive a bad day with",
              detail:
                "Not your best day — your worst. If a slow Tuesday still brings KSh 700 home, then KSh 100 is safe. An amount you abandon on quiet days is not a plan, it is a wish.",
            },
            {
              title: "Move it before you spend anything",
              detail:
                "Not at the end of the day. Not when you get home. The first time you stop — fuel station, first long fare, lunch — move the money first and then buy what you stopped for.",
            },
            {
              title: "Move it somewhere awkward to reach",
              detail:
                "A separate M-Pesa line, a SACCO paybill, a fixed account. The friction is the point. Money sitting in the wallet you buy fuel from is already spent; you just have not done it yet.",
            },
            {
              title: "Do not raise the amount for three months",
              detail:
                "The habit is worth more than the figure. Riders who start at KSh 300 to catch up usually stop within two weeks. Riders who start at KSh 100 and keep going are still going a year later.",
            },
          ],
        },
        {
          kind: "example",
          heading: "What KSh 100 a day actually becomes",
          ledger: [
            { label: "Per day", value: "KSh 100" },
            { label: "Per week (6 riding days)", value: "KSh 600" },
            { label: "Per month", value: "KSh 2,600" },
            { label: "After 6 months", value: "KSh 15,600" },
            { label: "After 12 months", value: "KSh 31,200" },
            { label: "Twelve months, in a SACCO paying 8% on deposits", value: "KSh 32,500", total: true },
          ],
          note: "KSh 31,200 is share capital at most SACCOs with money to spare, a full year of comprehensive boda cover, or an engine rebuild paid in cash instead of on a 20% loan.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Pay yourself first",
              definition:
                "Treating your savings like a bill with a due date rather than whatever survives the day. The oldest rule in personal finance, and the only one that works without willpower.",
            },
            {
              term: "Share capital",
              definition:
                "The money you put into a SACCO to become a member and an owner. It is not a deposit you draw on — it is your stake, and it is what your borrowing limit is calculated from.",
            },
            {
              term: "Standing order",
              definition:
                "An instruction that moves a fixed amount automatically on a fixed day. The strongest version of this lesson, because it removes you from the decision entirely.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Keeping your savings in the same M-Pesa wallet you pay for fuel from. You will see the balance, you will count it as available, and within a month it will be gone — not to one big expense, but to twenty small ones you will not be able to name afterwards.\n\nSeparate the money physically, not mentally. Mental accounting fails under pressure; a second account does not.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Work out your worst-day take-home, then take 10–15% of it. That is your number. Write it down.",
            "Open the place it will go — a second M-Pesa line, your SACCO's paybill, or a fixed deposit account. Today, not this week.",
            "Move the first amount now, before you ride again. The first transfer is the one that makes this real.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Decide what you save, move it the moment you earn it, and spend only what is left behind.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Muulize mwendeshaji yeyote kituoni aliweka akiba kiasi gani mwezi uliopita, wengi watasema kitu kimoja: hakuna kilichobaki. Hilo si tatizo la nidhamu. Ni tatizo la mpangilio.\n\nIkiwa kuweka akiba ni jambo la mwisho kutokea kwa pesa yako, linashindana na mafuta, chakula, salio, ada ya kituo, rafiki anayehitaji mia moja, na pancha ambayo hukuipanga. Akiba hushindwa kila siku, kwa sababu kila kitu kingine ni cha haraka na akiba si cha haraka.\n\nSomo hili linabadilisha mpangilio. Utaacha kuuliza \"nini kimebaki cha kuweka akiba?\" na kuanza kuuliza \"nini kimebaki cha kutumia?\"",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Chagua kiasi kimoja unachoweza kuvumilia siku mbaya",
              detail:
                "Si siku yako bora — siku yako mbaya zaidi. Ikiwa Jumanne ya biashara ndogo bado inaleta KSh 700 nyumbani, basi KSh 100 ni salama. Kiasi unachokiacha siku za utulivu si mpango, ni matamanio.",
            },
            {
              title: "Kitoe kabla hujatumia chochote",
              detail:
                "Si mwisho wa siku. Si ukifika nyumbani. Mara ya kwanza unaposimama — kituo cha mafuta, abiria wa kwanza wa mbali, chakula — toa pesa kwanza kisha ununue ulichosimamia.",
            },
            {
              title: "Kipeleke mahali pagumu kufikia",
              detail:
                "Laini tofauti ya M-Pesa, paybill ya SACCO, akaunti ya kudumu. Ugumu ndio lengo. Pesa iliyo kwenye pochi unayonunua mafuta tayari imetumika; ni kwamba bado hujafanya hivyo.",
            },
            {
              title: "Usiongeze kiasi kwa miezi mitatu",
              detail:
                "Tabia ina thamani kuliko kiasi. Waendeshaji wanaoanza na KSh 300 ili wapate haraka huacha ndani ya wiki mbili. Wanaoanza na KSh 100 na kuendelea bado wanaendelea mwaka mmoja baadaye.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 100 kwa siku inakuwa nini hasa",
          ledger: [
            { label: "Kwa siku", value: "KSh 100" },
            { label: "Kwa wiki (siku 6 za kazi)", value: "KSh 600" },
            { label: "Kwa mwezi", value: "KSh 2,600" },
            { label: "Baada ya miezi 6", value: "KSh 15,600" },
            { label: "Baada ya miezi 12", value: "KSh 31,200" },
            { label: "Miezi 12, kwenye SACCO inayolipa 8%", value: "KSh 32,500", total: true },
          ],
          note: "KSh 31,200 ni hisa katika SACCO nyingi ukiwa na ziada, bima kamili ya boda ya mwaka mzima, au ukarabati wa injini uliolipwa kwa pesa taslimu badala ya mkopo wa 20%.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Jilipe wewe kwanza",
              definition:
                "Kuchukulia akiba yako kama bili yenye tarehe ya mwisho badala ya kile kinachosalia. Sheria ya zamani zaidi ya fedha binafsi, na pekee inayofanya kazi bila nguvu ya utashi.",
            },
            {
              term: "Hisa (share capital)",
              definition:
                "Pesa unayoweka kwenye SACCO ili uwe mwanachama na mmiliki. Si amana unayotoa — ni sehemu yako, na ndiyo kikomo chako cha kukopa kinahesabiwa kutoka.",
            },
            {
              term: "Amri ya kudumu (standing order)",
              definition:
                "Maagizo yanayohamisha kiasi maalum kiotomatiki siku maalum. Toleo imara zaidi la somo hili, kwa sababu linakuondoa kwenye uamuzi kabisa.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuweka akiba yako kwenye pochi ile ile ya M-Pesa unayolipia mafuta. Utaona salio, utaihesabu kama inapatikana, na ndani ya mwezi itakuwa imeisha — si kwa gharama moja kubwa, bali kwa gharama ishirini ndogo usizoweza kuzitaja baadaye.\n\nTenganisha pesa kimwili, si kiakili. Hesabu ya kiakili hushindwa chini ya shinikizo; akaunti ya pili haishindwi.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Hesabu mapato yako ya siku mbaya zaidi, kisha chukua asilimia 10–15. Hicho ndicho kiasi chako. Kiandike.",
            "Fungua mahali kitakapoenda — laini ya pili ya M-Pesa, paybill ya SACCO yako, au akaunti ya amana ya kudumu. Leo, si wiki hii.",
            "Hamisha kiasi cha kwanza sasa, kabla hujaendesha tena. Uhamisho wa kwanza ndio unaofanya hili liwe halisi.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Amua unachoweka akiba, kitoe mara tu unapokipata, na utumie kilichobaki tu.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Uliza dere yeyote base alisave ngapi last month, wengi watasema kitu moja: hakuna kitu ilibaki. Hiyo si issue ya discipline. Ni issue ya order.\n\nKama kusave ni kitu ya mwisho kufanyika kwa doo yako, inacompete na fuel, lunch, airtime, base fee, beste anataka mia, na pancha hukupanga. Saving inalose hiyo competition kila siku, juu kila kitu kingine ni urgent na saving si urgent.\n\nLesson hii inareverse order. Utaacha kuuliza \"nini imebaki ya kusave?\" na uanze kuuliza \"nini imebaki ya kutumia?\"",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Chagua amount moja unaweza survive siku mbaya",
              detail:
                "Si siku yako poa — siku yako mbaya kabisa. Kama Jumanne ya mchezo mbaya bado inaleta KSh 700 home, basi KSh 100 iko safe. Amount unaidrop siku za utulivu si plan, ni ndoto.",
            },
            {
              title: "Itoe kabla ujatumia kitu",
              detail:
                "Si end ya siku. Si ukifika home. Mara ya kwanza unasimama — petrol station, fare ya kwanza mrefu, lunch — toa doo kwanza halafu ununue ulisimamia.",
            },
            {
              title: "Ipeleke mahali ngumu kureach",
              detail:
                "Line tofauti ya M-Pesa, paybill ya SACCO, fixed account. Hiyo ugumu ndio point. Doo iko kwa wallet unanunua fuel nayo tayari imetumika; ni wewe hujafanya tu.",
            },
            {
              title: "Usiongeze amount kwa miezi tatu",
              detail:
                "Habit ina thamani kuliko figure. Madere wanaanza na KSh 300 wacatch up huacha ndani ya wiki mbili. Wanaanza na KSh 100 na waendelee bado wako hadi mwaka mmoja baadaye.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 100 kwa siku inakuwa nini kwa ukweli",
          ledger: [
            { label: "Kwa siku", value: "KSh 100" },
            { label: "Kwa wiki (siku 6 za kazi)", value: "KSh 600" },
            { label: "Kwa mwezi", value: "KSh 2,600" },
            { label: "Baada ya miezi 6", value: "KSh 15,600" },
            { label: "Baada ya miezi 12", value: "KSh 31,200" },
            { label: "Miezi 12, SACCO inalipa 8%", value: "KSh 32,500", total: true },
          ],
          note: "KSh 31,200 ni shares kwa SACCO nyingi na ziada, bima kamili ya boda ya mwaka mzima, ama engine rebuild umelipa cash badala ya loan ya 20%.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Jilipe wewe kwanza",
              definition:
                "Kutreat savings yako kama bill ina due date badala ya kile kinabaki. Rule ya zamani zaidi ya pesa, na pekee inafanya kazi bila willpower.",
            },
            {
              term: "Shares (share capital)",
              definition:
                "Doo unaweka kwa SACCO ili uwe member na owner. Si deposit unatoa — ni stake yako, na ndio limit yako ya kukopa inahesabiwa kutoka.",
            },
            {
              term: "Standing order",
              definition:
                "Instruction inahamisha amount fixed automatically siku fixed. Version imara zaidi ya lesson hii, juu inakuondoa kwa decision kabisa.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kuweka savings yako kwa wallet ile ile ya M-Pesa unalipia fuel. Utaona balance, utaicount kama inapatikana, na ndani ya mwezi itaisha — si kwa expense moja kubwa, ni kwa expense ishirini ndogo hutaweza kuzitaja baadaye.\n\nSeparate doo physically, si kwa akili. Mental accounting inafail under pressure; account ya pili haifail.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Count take-home yako ya siku mbaya kabisa, halafu chukua 10–15%. Hiyo ndio number yako. Iandike.",
            "Fungua mahali itaenda — line ya pili ya M-Pesa, paybill ya SACCO yako, ama fixed deposit account. Leo, si wiki hii.",
            "Hamisha amount ya kwanza sasa, kabla uende kuride tena. Transfer ya kwanza ndio inafanya hii iwe real.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Amua unasave ngapi, itoe immediately unaipata, na utumie kilichobaki tu.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── SAV-2 ──
  {
    code: "SAV-2",
    durationMin: 7,
    summary: {
      En: "Three months of expenses, held somewhere boring, is what stops a breakdown from becoming a debt.",
      Sw: "Matumizi ya miezi mitatu, yakiwekwa mahali pa kawaida, ndiyo yanayozuia hitilafu kuwa deni.",
      Sh: "Expenses za miezi tatu, zimewekwa mahali boring, ndio inazuia breakdown ikue deni.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "A gearbox goes. A traffic officer impounds the bike. A child is admitted on a Sunday night. None of these are unlikely — across a riding career they are close to certain.\n\nWhat separates riders who recover from riders who do not is never the size of the problem. It is whether there was money standing ready when it arrived. Without it, the only options are a shylock at 20% a month, selling the bike below value, or borrowing from family in a way that costs you something harder to repay than money.\n\nAn emergency fund is not an investment. It is not meant to grow. Its only job is to be there, in full, on the worst day of your year.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Size it on expenses, not on income",
              detail:
                "Add up what one month costs you to stay alive and keep riding: rent, food, school, fuel, the bike payment. Multiply by three. That is the target — not three months of earnings, which is a much bigger and more discouraging number.",
            },
            {
              title: "Build it in stages, or you will never start",
              detail:
                "KSh 5,000 first — that covers a tyre, a chain and a service. Then one month of expenses. Then three. Each stage is a real milestone that already protects you against something.",
            },
            {
              title: "Keep it boring and reachable in a day",
              detail:
                "A SACCO savings account or a separate M-Pesa line. Not shares you must sell, not a chama with a rotation, not money lent to a cousin. You need it the same afternoon you need it.",
            },
            {
              title: "Define what counts as an emergency before one happens",
              detail:
                "Write the rule down while you are calm: the bike cannot earn, someone is in hospital, or the family cannot eat. A phone upgrade and a friend's wedding are not emergencies, and you will not be able to judge that fairly in the moment.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Sizing it for a typical rider",
          ledger: [
            { label: "Rent", value: "KSh 6,000" },
            { label: "Food, household", value: "KSh 9,000" },
            { label: "School costs, spread monthly", value: "KSh 3,000" },
            { label: "Fuel and servicing", value: "KSh 8,000" },
            { label: "Bike instalment", value: "KSh 6,000" },
            { label: "One month", value: "KSh 32,000" },
            { label: "Emergency fund target (× 3)", value: "KSh 96,000", total: true },
          ],
          note: "At KSh 150 a day that is about 21 months — which is why you build it in stages. The first KSh 5,000 arrives in five weeks and already covers the most common breakdown.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Emergency fund",
              definition:
                "Money set aside for events that stop you earning or threaten your household. Held in cash or near-cash, never invested, never counted as part of your savings goal.",
            },
            {
              term: "Liquidity",
              definition:
                "How quickly something turns into spendable money without losing value. M-Pesa is highly liquid; SACCO shares are not; a motorbike sold in a hurry is the least liquid thing you own.",
            },
            {
              term: "Shylock",
              definition:
                "An informal lender charging 10–20% a month, usually against your logbook or ID. The thing an emergency fund exists to keep you away from.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Investing the emergency fund because it \"is just sitting there\". The moment it is in shares, a money market fund with a settlement delay, or a friend's business, it is no longer an emergency fund — it is an investment that will be unavailable or at a loss on precisely the day you need it.\n\nBoring is the feature, not a flaw. Earning 7% on money you can reach beats earning 14% on money you cannot.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Write down your one-month cost of living, honestly, including the bike. Multiply by three and write that figure down too.",
            "Set KSh 5,000 as stage one and work out how many weeks it takes at your daily amount.",
            "Agree your own definition of an emergency, in writing, and tell one person in your household what it says.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Three months of expenses, somewhere boring and reachable the same day, is the difference between a bad week and a lost year.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Gia inaharibika. Askari wa trafiki anakamata pikipiki. Mtoto analazwa hospitalini Jumapili usiku. Hakuna kati ya haya ambalo si la kawaida — katika maisha ya kuendesha, yote ni karibu ya hakika.\n\nKinachotofautisha waendeshaji wanaopona na wasiopona kamwe si ukubwa wa tatizo. Ni iwapo kulikuwa na pesa tayari wakati lilipofika. Bila hiyo, chaguo pekee ni mkopeshaji wa 20% kwa mwezi, kuuza pikipiki chini ya thamani, au kukopa kwa familia kwa njia inayokugharimu kitu kigumu kulipa kuliko pesa.\n\nAkiba ya dharura si uwekezaji. Haikusudiwi kukua. Kazi yake pekee ni kuwepo, kamili, siku mbaya zaidi ya mwaka wako.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Pima kwa matumizi, si kwa mapato",
              detail:
                "Jumlisha gharama ya mwezi mmoja ya kuishi na kuendelea kuendesha: kodi, chakula, shule, mafuta, malipo ya pikipiki. Zidisha kwa tatu. Hilo ndilo lengo — si mapato ya miezi mitatu, ambayo ni namba kubwa zaidi na inayovunja moyo.",
            },
            {
              title: "Ijenge kwa hatua, au hutaanza kamwe",
              detail:
                "KSh 5,000 kwanza — hiyo inashughulikia tairi, mnyororo na huduma. Kisha matumizi ya mwezi mmoja. Kisha mitatu. Kila hatua ni hatua halisi inayokulinda dhidi ya kitu fulani tayari.",
            },
            {
              title: "Iweke mahali pa kawaida na panapofikika kwa siku moja",
              detail:
                "Akaunti ya akiba ya SACCO au laini tofauti ya M-Pesa. Si hisa lazima uuze, si chama chenye zamu, si pesa uliyomkopesha binamu. Unaihitaji mchana ule ule unapoihitaji.",
            },
            {
              title: "Fafanua dharura ni nini kabla haijatokea",
              detail:
                "Andika sheria ukiwa mtulivu: pikipiki haiwezi kuzalisha, mtu yuko hospitalini, au familia haiwezi kula. Simu mpya na harusi ya rafiki si dharura, na hutaweza kuamua hilo kwa haki wakati huo.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Kupima kwa mwendeshaji wa kawaida",
          ledger: [
            { label: "Kodi", value: "KSh 6,000" },
            { label: "Chakula na nyumbani", value: "KSh 9,000" },
            { label: "Gharama za shule kwa mwezi", value: "KSh 3,000" },
            { label: "Mafuta na huduma", value: "KSh 8,000" },
            { label: "Malipo ya pikipiki", value: "KSh 6,000" },
            { label: "Mwezi mmoja", value: "KSh 32,000" },
            { label: "Lengo la akiba ya dharura (× 3)", value: "KSh 96,000", total: true },
          ],
          note: "Kwa KSh 150 kwa siku ni takriban miezi 21 — ndiyo sababu unaijenga kwa hatua. KSh 5,000 za kwanza zinafika kwa wiki tano na tayari zinashughulikia hitilafu ya kawaida zaidi.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Akiba ya dharura",
              definition:
                "Pesa iliyowekwa kando kwa matukio yanayokuzuia kuzalisha au yanayotishia familia yako. Inashikiliwa kama pesa taslimu, kamwe haiwekezwi, kamwe haihesabiwi kama sehemu ya lengo lako la akiba.",
            },
            {
              term: "Upatikanaji (liquidity)",
              definition:
                "Jinsi kitu kinavyogeuka haraka kuwa pesa inayotumika bila kupoteza thamani. M-Pesa inapatikana sana; hisa za SACCO hapana; pikipiki inayouzwa kwa haraka ndicho kitu kisichopatikana zaidi unachomiliki.",
            },
            {
              term: "Mkopeshaji wa kienyeji",
              definition:
                "Mkopeshaji asiye rasmi anayetoza 10–20% kwa mwezi, mara nyingi dhidi ya logbook au kitambulisho chako. Kitu ambacho akiba ya dharura ipo ili kukuepusha nacho.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuwekeza akiba ya dharura kwa sababu \"imekaa tu\". Mara inapokuwa kwenye hisa, mfuko wa soko la fedha wenye kuchelewa kulipa, au biashara ya rafiki, haiko tena akiba ya dharura — ni uwekezaji ambao hautapatikana au utakuwa kwa hasara siku ile ile unaihitaji.\n\nKuwa ya kawaida ni sifa, si kasoro. Kupata 7% kwa pesa unayoweza kuifikia ni bora kuliko 14% kwa pesa usiyoweza kuifikia.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Andika gharama yako ya kuishi ya mwezi mmoja, kwa ukweli, ikijumuisha pikipiki. Zidisha kwa tatu na uandike namba hiyo pia.",
            "Weka KSh 5,000 kama hatua ya kwanza na uhesabu inachukua wiki ngapi kwa kiasi chako cha kila siku.",
            "Kubaliana na maana yako mwenyewe ya dharura, kwa maandishi, na umwambie mtu mmoja nyumbani kwako inasema nini.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Matumizi ya miezi mitatu, mahali pa kawaida na panapofikika siku ile ile, ndiyo tofauti kati ya wiki mbaya na mwaka uliopotea.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Gearbox inaenda. Traffic anashika pikipiki. Mtoto analazwa Sunday usiku. Hakuna kati ya hizi iko unlikely — kwa career ya kuride, zote ni karibu certain.\n\nInachoseparate madere wanarecover na wasiorecover si size ya problem. Ni kama kulikuwa na doo iko ready ilipofika. Bila hiyo, option pekee ni shylock wa 20% kwa mwezi, kuuza pikipiki chini ya value, ama kukopa kwa family kwa njia inakucost kitu ngumu kulipa kuliko doo.\n\nEmergency fund si investment. Haitakiwi kugrow. Kazi yake pekee ni kuwepo, full, siku mbaya kabisa ya year yako.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Size yake ni expenses, si income",
              detail:
                "Add gharama ya mwezi mmoja ya kuishi na kuendelea kuride: rent, chakula, school, fuel, bike payment. Multiply by three. Hiyo ndio target — si earnings za miezi tatu, ambayo ni number kubwa zaidi na inakata moyo.",
            },
            {
              title: "Ijenge kwa stages, ama hutaanza kabisa",
              detail:
                "KSh 5,000 kwanza — hiyo inacover tyre, chain na service. Halafu expenses za mwezi mmoja. Halafu mitatu. Kila stage ni milestone real inakuprotect against kitu tayari.",
            },
            {
              title: "Iweke boring na ireachable kwa siku moja",
              detail:
                "SACCO savings account ama line tofauti ya M-Pesa. Si shares lazima uuze, si chama ina rotation, si doo umekopesha cousin. Unaihitaji mchana ule ule unaihitaji.",
            },
            {
              title: "Define emergency ni nini kabla ifanyike",
              detail:
                "Andika rule ukiwa calm: pikipiki haiwezi kuearn, mtu yuko hospital, ama family haiwezi kula. Simu mpya na harusi ya beste si emergency, na hutaweza kujudge hiyo fairly hiyo moment.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Kusize kwa dere wa kawaida",
          ledger: [
            { label: "Rent", value: "KSh 6,000" },
            { label: "Chakula, nyumbani", value: "KSh 9,000" },
            { label: "School costs kwa mwezi", value: "KSh 3,000" },
            { label: "Fuel na service", value: "KSh 8,000" },
            { label: "Bike instalment", value: "KSh 6,000" },
            { label: "Mwezi mmoja", value: "KSh 32,000" },
            { label: "Emergency fund target (× 3)", value: "KSh 96,000", total: true },
          ],
          note: "Kwa KSh 150 kwa siku ni kama miezi 21 — ndio maana unaijenga kwa stages. KSh 5,000 za kwanza zinafika kwa wiki tano na tayari zinacover breakdown ya kawaida zaidi.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Emergency fund",
              definition:
                "Doo imewekwa pembeni kwa vitu vinakuzuia kuearn ama vinathreaten family yako. Iko cash, haiwekezwi kabisa, haihesabiwi kama sehemu ya goal yako ya savings.",
            },
            {
              term: "Liquidity",
              definition:
                "Vile kitu kinageuka haraka kuwa doo inatumika bila kupoteza value. M-Pesa iko liquid sana; SACCO shares hapana; pikipiki ukiuza kwa haraka ndio kitu kiko least liquid unamiliki.",
            },
            {
              term: "Shylock",
              definition:
                "Mkopeshaji si official anacharge 10–20% kwa mwezi, mara nyingi against logbook ama ID yako. Kitu emergency fund iko ili ikuepushe nacho.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kuinvest emergency fund juu \"imekaa tu\". Moment iko kwa shares, money market fund ina settlement delay, ama biz ya beste, si emergency fund tena — ni investment itakuwa haipatikani ama iko kwa loss siku hiyo hiyo unaihitaji.\n\nBoring ni feature, si flaw. Kupata 7% kwa doo unaweza reach ni poa kuliko 14% kwa doo huwezi reach.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Andika cost yako ya kuishi ya mwezi mmoja, kwa ukweli, na pikipiki pia. Multiply by three na uandike hiyo number pia.",
            "Weka KSh 5,000 kama stage one na ucount inachukua wiki ngapi kwa amount yako ya kila siku.",
            "Agree definition yako ya emergency, kwa maandishi, na uambie mtu mmoja home inasema nini.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Expenses za miezi tatu, mahali boring na unaweza reach siku hiyo hiyo, ndio tofauti kati ya wiki mbaya na year imepotea.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── SAV-3 ──
  {
    code: "SAV-3",
    durationMin: 6,
    summary: {
      En: "The bike earns money and the bike costs money. Keep those two flows apart and you will always know whether you are actually profitable.",
      Sw: "Pikipiki inazalisha pesa na pikipiki inagharimu pesa. Tenganisha mitiririko hii miwili nawe utajua kila wakati kama unapata faida kweli.",
      Sh: "Pikipiki inaleta doo na pikipiki inakula doo. Separate hizo flows mbili na utajua kila time kama unaprofit kwa ukweli.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Most riders can tell you what they made today. Very few can tell you what the bike cost them this year — and that second number is the one that decides whether the work is building anything.\n\nWhen fare money, fuel money, household money and the service fund all live in the same pocket, three things go wrong at once. The bike gets serviced late because the money is gone. A good month feels like profit when it was really a month you skipped maintenance. And when the engine finally needs KSh 25,000, it arrives as a crisis rather than as a bill you had been paying all along.\n\nThe fix is to treat the bike as a small business with its own books — because that is exactly what it is.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Every fare belongs to the business first",
              detail:
                "Nothing you collect is yours yet. It is the business's revenue. You pay yourself a wage out of it — the same way you would if someone else owned the bike and you rode it for them.",
            },
            {
              title: "The bike has four costs, not one",
              detail:
                "Fuel is the obvious one. The other three are servicing, parts that wear out on a schedule, and insurance. Riders budget for fuel and are ambushed by the rest.",
            },
            {
              title: "Pay the service fund like it is fuel",
              detail:
                "Set aside a fixed amount per day for maintenance, in the same movement as your savings. Tyres, chain, sprockets, brake pads and oil are not surprises — they are a known schedule with a known price.",
            },
            {
              title: "What is left after all four is your real wage",
              detail:
                "That is the number that tells you whether this bike, on this route, at these fares, is worth riding. Without the separation you are guessing, and the guess is always optimistic.",
            },
          ],
        },
        {
          kind: "example",
          heading: "One day, properly accounted",
          ledger: [
            { label: "Fares collected", value: "KSh 1,400" },
            { label: "Less fuel", value: "− KSh 350" },
            { label: "Less service fund (set aside daily)", value: "− KSh 100" },
            { label: "Less insurance fund (set aside daily)", value: "− KSh 40" },
            { label: "Less stage fee", value: "− KSh 50" },
            { label: "Less savings — paid to yourself first", value: "− KSh 100" },
            { label: "Your actual take-home", value: "KSh 760", total: true },
          ],
          note: "KSh 760 is the honest number. The rider who skips the three fund lines believes they earned KSh 1,000 — and then cannot explain where it went when the chain snaps in month four.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Revenue",
              definition:
                "Everything the bike collects before any cost is taken out. The biggest and least useful number in your day.",
            },
            {
              term: "Operating cost",
              definition:
                "What it costs to keep the bike earning: fuel, servicing, parts, insurance, licences. If revenue minus operating cost is small, the route or the fare is the problem, not your spending.",
            },
            {
              term: "Depreciation",
              definition:
                "The value the bike quietly loses every month just by being used. You do not feel it until you sell — which is why the service fund matters: a well-kept bike loses it far more slowly.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Borrowing from the service fund for something urgent and telling yourself you will put it back. You will not — not because you are careless, but because next week has its own urgent thing.\n\nIf the service fund has to be raided, that is a signal your wage is set too high or the route is not paying. Fix the cause. Do not quietly convert tomorrow's gearbox into today's groceries.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Write down the last four things you spent on the bike and what each cost. That is the start of your maintenance schedule.",
            "Divide your expected yearly bike costs by 300 riding days. That daily figure is your service fund.",
            "Open a third place for it — or at minimum, record it every evening in a notebook that only tracks the bike.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Pay the bike's costs out of the bike's earnings, pay yourself a wage from what remains, and you will always know the truth about your business.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Waendeshaji wengi wanaweza kukuambia walipata kiasi gani leo. Wachache sana wanaweza kukuambia pikipiki iliwagharimu kiasi gani mwaka huu — na namba hiyo ya pili ndiyo inayoamua kama kazi inajenga chochote.\n\nWakati pesa ya nauli, pesa ya mafuta, pesa ya nyumbani na akiba ya huduma zote zinakaa mfuko mmoja, mambo matatu yanaharibika kwa pamoja. Pikipiki inahudumiwa kwa kuchelewa kwa sababu pesa imeisha. Mwezi mzuri unahisi kama faida wakati kwa kweli ulikuwa mwezi uliruka matengenezo. Na injini inapohitaji KSh 25,000 hatimaye, inafika kama janga badala ya bili uliyokuwa ukilipa muda wote.\n\nSuluhisho ni kuichukulia pikipiki kama biashara ndogo yenye hesabu zake — kwa sababu ndivyo ilivyo hasa.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Kila nauli ni ya biashara kwanza",
              detail:
                "Chochote unachokusanya bado si chako. Ni mapato ya biashara. Unajilipa mshahara kutoka humo — kama vile ungefanya kama mtu mwingine angemiliki pikipiki nawe uiendeshe kwa ajili yake.",
            },
            {
              title: "Pikipiki ina gharama nne, si moja",
              detail:
                "Mafuta ndiyo ya wazi. Nyingine tatu ni huduma, vipuri vinavyoisha kwa ratiba, na bima. Waendeshaji hupanga bajeti ya mafuta kisha hushtukizwa na nyingine.",
            },
            {
              title: "Lipa akiba ya huduma kama ni mafuta",
              detail:
                "Weka kando kiasi maalum kwa siku kwa matengenezo, katika hatua ile ile na akiba yako. Matairi, mnyororo, sproketi, breki na mafuta ya injini si mshangao — ni ratiba inayojulikana yenye bei inayojulikana.",
            },
            {
              title: "Kilichobaki baada ya zote nne ndio mshahara wako halisi",
              detail:
                "Hiyo ndiyo namba inayokuambia kama pikipiki hii, kwenye njia hii, kwa nauli hizi, inastahili kuendeshwa. Bila kutenganisha unakisia, na kisio huwa la matumaini kila wakati.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Siku moja, iliyohesabiwa vizuri",
          ledger: [
            { label: "Nauli zilizokusanywa", value: "KSh 1,400" },
            { label: "Toa mafuta", value: "− KSh 350" },
            { label: "Toa akiba ya huduma", value: "− KSh 100" },
            { label: "Toa akiba ya bima", value: "− KSh 40" },
            { label: "Toa ada ya kituo", value: "− KSh 50" },
            { label: "Toa akiba — umejilipa kwanza", value: "− KSh 100" },
            { label: "Mapato yako halisi", value: "KSh 760", total: true },
          ],
          note: "KSh 760 ndiyo namba ya kweli. Mwendeshaji anayeruka mistari mitatu ya akiba anaamini alipata KSh 1,000 — kisha hawezi kueleza ilienda wapi mnyororo unapokatika mwezi wa nne.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Mapato (revenue)",
              definition:
                "Kila kitu pikipiki inachokusanya kabla gharama yoyote haijatolewa. Namba kubwa zaidi na isiyosaidia zaidi katika siku yako.",
            },
            {
              term: "Gharama za uendeshaji",
              definition:
                "Gharama ya kuweka pikipiki ikizalisha: mafuta, huduma, vipuri, bima, leseni. Ikiwa mapato kutoa gharama za uendeshaji ni kidogo, njia au nauli ndiyo tatizo, si matumizi yako.",
            },
            {
              term: "Kushuka kwa thamani",
              definition:
                "Thamani pikipiki inayopoteza kimya kila mwezi kwa kutumika tu. Huhisi hadi uuze — ndiyo sababu akiba ya huduma ni muhimu: pikipiki iliyotunzwa vizuri inaipoteza polepole zaidi.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kukopa kutoka akiba ya huduma kwa kitu cha haraka ukijiambia utairudisha. Hutairudisha — si kwa sababu huna uangalifu, bali kwa sababu wiki ijayo ina kitu chake cha haraka.\n\nIkiwa akiba ya huduma inabidi ivamiwe, hiyo ni ishara mshahara wako umewekwa juu sana au njia hailipi. Rekebisha chanzo. Usigeuze kimya gia ya kesho kuwa chakula cha leo.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Andika vitu vinne vya mwisho ulivyotumia kwa pikipiki na gharama ya kila kimoja. Huo ndio mwanzo wa ratiba yako ya matengenezo.",
            "Gawanya gharama unazotarajia za pikipiki za mwaka kwa siku 300 za kazi. Namba hiyo ya kila siku ndiyo akiba yako ya huduma.",
            "Fungua mahali pa tatu kwa ajili yake — au angalau, iandike kila jioni kwenye daftari linalofuatilia pikipiki pekee.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Lipa gharama za pikipiki kutoka mapato ya pikipiki, jilipe mshahara kutoka kilichobaki, nawe utajua ukweli wa biashara yako kila wakati.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Madere wengi wanaweza kukuambia walimake ngapi leo. Wachache sana wanaweza kukuambia pikipiki iliwacost ngapi hii year — na hiyo number ya pili ndio inaamua kama kazi inajenga kitu.\n\nWakati doo ya fare, doo ya fuel, doo ya nyumbani na service fund zote ziko mfuko moja, vitu tatu vinaharibika pamoja. Pikipiki inaserviced late juu doo imeisha. Mwezi poa inafeel kama profit wakati kwa ukweli ni mwezi umeskip maintenance. Na engine ikihitaji KSh 25,000 finally, inafika kama crisis badala ya bill ulikuwa unalipa all along.\n\nFix ni kutreat pikipiki kama biz ndogo ina books zake — juu ndio iko hivyo exactly.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Kila fare ni ya biz kwanza",
              detail:
                "Chochote unacollect bado si chako. Ni revenue ya biz. Unajilipa salary kutoka hapo — vile ungefanya kama mtu mwingine angemiliki pikipiki na uiride kwa ajili yake.",
            },
            {
              title: "Pikipiki ina costs nne, si moja",
              detail:
                "Fuel ndio obvious. Zingine tatu ni service, parts zinaisha kwa schedule, na bima. Madere wanabudget fuel halafu wanaambushwa na zingine.",
            },
            {
              title: "Lipa service fund kama ni fuel",
              detail:
                "Weka pembeni amount fixed kwa siku kwa maintenance, kwa movement ile ile na savings yako. Tyres, chain, sprockets, brake pads na oil si surprise — ni schedule inajulikana na bei inajulikana.",
            },
            {
              title: "Iliyobaki baada ya zote nne ndio salary yako real",
              detail:
                "Hiyo ndio number inakuambia kama pikipiki hii, kwa route hii, kwa fares hizi, inastahili kuridiwa. Bila kuseparate unaguess, na guess huwa optimistic kila time.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Siku moja, imeaccountiwa poa",
          ledger: [
            { label: "Fares umecollect", value: "KSh 1,400" },
            { label: "Toa fuel", value: "− KSh 350" },
            { label: "Toa service fund", value: "− KSh 100" },
            { label: "Toa insurance fund", value: "− KSh 40" },
            { label: "Toa base fee", value: "− KSh 50" },
            { label: "Toa savings — umejilipa kwanza", value: "− KSh 100" },
            { label: "Take-home yako real", value: "KSh 760", total: true },
          ],
          note: "KSh 760 ndio number ya ukweli. Dere anaskip hizo lines tatu za fund anaamini alimake KSh 1,000 — halafu hawezi explain ilienda wapi chain ikikatika month four.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Revenue",
              definition:
                "Kila kitu pikipiki inacollect kabla cost yoyote itolewe. Number kubwa zaidi na isiyosaidia zaidi kwa siku yako.",
            },
            {
              term: "Operating cost",
              definition:
                "Inachocost kuweka pikipiki ikiearn: fuel, service, parts, bima, licence. Kama revenue minus operating cost ni kidogo, route ama fare ndio problem, si spending yako.",
            },
            {
              term: "Depreciation",
              definition:
                "Value pikipiki inapoteza kimya kila mwezi kwa kutumika tu. Hauifeel hadi uuze — ndio maana service fund ni muhimu: pikipiki imetunzwa poa inaipoteza polepole zaidi.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kukopa kutoka service fund kwa kitu urgent ukijiambia utairudisha. Hutairudisha — si juu huna care, ni juu wiki ijayo ina kitu chake urgent.\n\nKama service fund inabidi ivamiwe, hiyo ni signal salary yako iko juu sana ama route hailipi. Fix cause. Usigeuze kimya gearbox ya kesho ikue chakula ya leo.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Andika vitu vinne vya mwisho ulitumia kwa pikipiki na kila kilicost ngapi. Hiyo ndio mwanzo wa maintenance schedule yako.",
            "Divide bike costs unatarajia za year kwa siku 300 za kazi. Hiyo daily figure ndio service fund yako.",
            "Fungua mahali pa tatu kwa ajili yake — ama at minimum, irecord kila jioni kwa notebook inatrack pikipiki pekee.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Lipa costs za pikipiki kutoka earnings za pikipiki, jilipe salary kutoka iliyobaki, na utajua ukweli wa biz yako kila time.",
        },
      ],
    },
  },
];
