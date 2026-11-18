import type { LessonEnrichment } from "./types";

/**
 * Module 3 — Investment.
 *
 * Deliberately conservative. The aim is not to make riders traders; it is to
 * explain why cash loses value, where an honest return comes from, and how
 * to recognise the schemes that target exactly this group.
 */
export const INVESTMENT_LESSONS: LessonEnrichment[] = [
  // ───────────────────────────────────────────────────────────────── INV-1 ──
  {
    code: "INV-1",
    durationMin: 7,
    summary: {
      En: "Money kept as cash quietly loses value every year. Saving protects you from emergencies; investing protects you from inflation.",
      Sw: "Pesa iliyohifadhiwa taslimu hupoteza thamani kimya kila mwaka. Akiba inakulinda dhidi ya dharura; uwekezaji unakulinda dhidi ya mfumuko wa bei.",
      Sh: "Doo imehifadhiwa cash inapoteza value kimya kila year. Saving inakuprotect against emergency; investing inakuprotect against inflation.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "In 2019 a plate of ugali and sukuma at the stage was about KSh 50. Today the same plate is KSh 100 or more. Your money did not change. What it buys did.\n\nThis is the part of money that nobody explains at the stage: a KSh 100,000 that sits still for five years is not KSh 100,000 at the end. It is worth roughly KSh 70,000 in what it can actually buy. You did not spend it, and you still lost a third of it.\n\nSaving under the mattress or in a plain wallet is not safe. It is a slow, invisible loss. Investing is not about getting rich — for most riders it is simply the defence against that loss.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Inflation is a cost you pay without noticing",
              detail:
                "Kenyan inflation has typically run somewhere around 5–8% a year. Money earning nothing loses that much of its purchasing power annually, every year, whether or not you touch it.",
            },
            {
              title: "Your return has to beat inflation to be a real return",
              detail:
                "An account paying 4% while prices rise 7% is losing you 3% a year in real terms. It feels like growth because the number goes up. Always subtract inflation before deciding whether something worked.",
            },
            {
              title: "Saving and investing do different jobs — keep both",
              detail:
                "Savings are reachable today and must not fall in value: that is the emergency fund. Investments may fall in the short term, and in exchange they are expected to outgrow prices over years. Never put the emergency fund in the investment bucket.",
            },
            {
              title: "Time does the heavy lifting, not the amount",
              detail:
                "KSh 2,000 a month at 10% becomes about KSh 155,000 in five years and about KSh 413,000 in ten. The second five years add more than twice what the first did, from the same contribution. Starting earlier beats starting bigger.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 100,000 over five years, three places",
          ledger: [
            { label: "Under the mattress", value: "KSh 100,000" },
            { label: "— what it can actually buy, at 7% inflation", value: "KSh 71,300" },
            { label: "Ordinary savings account at 4%", value: "KSh 121,700" },
            { label: "— real value after inflation", value: "KSh 86,700" },
            { label: "SACCO / money market fund at 10%", value: "KSh 161,100" },
            { label: "— real value after inflation", value: "KSh 114,900", total: true },
          ],
          note: "Only the third option leaves you better off than when you started. The first two look like saving and are actually slow spending.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Inflation",
              definition:
                "The rate at which prices rise, so the rate at which your shilling buys less. Published monthly by the Kenya National Bureau of Statistics.",
            },
            {
              term: "Real return",
              definition:
                "Your return minus inflation. The only figure that tells you whether you gained anything. A 'nominal' return of 6% with 7% inflation is a real return of −1%.",
            },
            {
              term: "Compounding",
              definition:
                "Earning a return on returns you already earned. Slow and unimpressive for two years, then the main reason anyone ends up with money after ten.",
            },
            {
              term: "Money market fund",
              definition:
                "A regulated fund that lends your money short-term to banks and the government. Low risk, interest paid monthly, usually reachable within a few working days.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Hearing \"inflation eats savings\" and concluding you should chase the highest return available. That reasoning is exactly what the schemes in lesson three are built on.\n\nBeating inflation needs about 8–12% a year, which is ordinary and widely available from SACCOs, money market funds and government paper. Anything promising 30% a month is not solving inflation — it is a different and much faster way to lose the money.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Think of one thing you buy weekly and what it cost five years ago. That difference is your inflation lesson, in your own prices.",
            "Check what your current savings actually pay you per year. If you cannot find out in ten minutes, that is itself the answer.",
            "Separate your money on paper into two buckets: emergency (reachable, safe) and long-term (growing). Write the amount in each.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Cash standing still goes backwards — save what you may need soon, and invest what you will not.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Mwaka 2019 sahani ya ugali na sukuma kituoni ilikuwa takriban KSh 50. Leo sahani ile ile ni KSh 100 au zaidi. Pesa yako haikubadilika. Kinachonunuliwa nayo ndicho kilichobadilika.\n\nHii ndiyo sehemu ya pesa ambayo hakuna anayeieleza kituoni: KSh 100,000 inayokaa tuli kwa miaka mitano si KSh 100,000 mwishoni. Ina thamani ya takriban KSh 70,000 kwa kile inachoweza kununua. Hukuitumia, na bado umepoteza theluthi yake.\n\nKuweka akiba chini ya godoro au kwenye pochi ya kawaida si usalama. Ni hasara ya polepole isiyoonekana. Uwekezaji si kuhusu kuwa tajiri — kwa waendeshaji wengi ni ulinzi tu dhidi ya hasara hiyo.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Mfumuko wa bei ni gharama unayolipa bila kutambua",
              detail:
                "Mfumuko wa bei nchini Kenya umekuwa takriban 5–8% kwa mwaka. Pesa isiyopata chochote hupoteza kiasi hicho cha uwezo wake wa kununua kila mwaka, uiguse au usiiguse.",
            },
            {
              title: "Faida yako lazima ishinde mfumuko wa bei ili iwe faida halisi",
              detail:
                "Akaunti inayolipa 4% wakati bei zinapanda 7% inakupotezea 3% kwa mwaka kihalisi. Inahisi kama ukuaji kwa sababu namba inapanda. Toa mfumuko wa bei kila wakati kabla ya kuamua kama kitu kilifanya kazi.",
            },
            {
              title: "Akiba na uwekezaji hufanya kazi tofauti — shikilia vyote",
              detail:
                "Akiba inafikika leo na haipaswi kushuka thamani: hiyo ni akiba ya dharura. Uwekezaji unaweza kushuka kwa muda mfupi, na badala yake unatarajiwa kuzidi bei kwa miaka. Kamwe usiweke akiba ya dharura kwenye ndoo ya uwekezaji.",
            },
            {
              title: "Muda ndio unaofanya kazi nzito, si kiasi",
              detail:
                "KSh 2,000 kwa mwezi kwa 10% inakuwa takriban KSh 155,000 kwa miaka mitano na takriban KSh 413,000 kwa kumi. Miaka mitano ya pili inaongeza zaidi ya mara mbili ya ya kwanza, kutoka mchango ule ule. Kuanza mapema kunashinda kuanza kwa kiasi kikubwa.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 100,000 kwa miaka mitano, mahali patatu",
          ledger: [
            { label: "Chini ya godoro", value: "KSh 100,000" },
            { label: "— inachoweza kununua, kwa mfumuko 7%", value: "KSh 71,300" },
            { label: "Akaunti ya kawaida ya akiba kwa 4%", value: "KSh 121,700" },
            { label: "— thamani halisi baada ya mfumuko", value: "KSh 86,700" },
            { label: "SACCO / mfuko wa soko la fedha kwa 10%", value: "KSh 161,100" },
            { label: "— thamani halisi baada ya mfumuko", value: "KSh 114,900", total: true },
          ],
          note: "Chaguo la tatu pekee linakuacha katika hali bora kuliko ulipoanza. Mawili ya kwanza yanaonekana kama kuweka akiba na kwa kweli ni matumizi ya polepole.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Mfumuko wa bei",
              definition:
                "Kasi ambayo bei zinapanda, hivyo kasi ambayo shilingi yako inanunua kidogo. Hutangazwa kila mwezi na Shirika la Takwimu la Kenya.",
            },
            {
              term: "Faida halisi",
              definition:
                "Faida yako ukitoa mfumuko wa bei. Namba pekee inayokuambia kama umepata chochote. Faida ya 6% na mfumuko wa 7% ni faida halisi ya −1%.",
            },
            {
              term: "Mrundikano (compounding)",
              definition:
                "Kupata faida juu ya faida uliyokwisha pata. Polepole na isiyovutia kwa miaka miwili, kisha sababu kuu mtu yeyote anaishia na pesa baada ya kumi.",
            },
            {
              term: "Mfuko wa soko la fedha",
              definition:
                "Mfuko wenye usimamizi unaokopesha pesa yako kwa muda mfupi kwa benki na serikali. Hatari ndogo, riba hulipwa kila mwezi, mara nyingi inapatikana ndani ya siku chache za kazi.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kusikia \"mfumuko wa bei unakula akiba\" na kuhitimisha unapaswa kufuata faida kubwa zaidi inayopatikana. Hoja hiyo ndiyo hasa mipango ya somo la tatu imejengwa juu yake.\n\nKushinda mfumuko wa bei kunahitaji takriban 8–12% kwa mwaka, ambayo ni ya kawaida na inapatikana kwa wingi kutoka SACCO, mifuko ya soko la fedha na hati za serikali. Chochote kinachoahidi 30% kwa mwezi hakitatui mfumuko wa bei — ni njia tofauti na ya haraka zaidi ya kupoteza pesa.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Fikiria kitu kimoja ununuacho kila wiki na kilichogharimu miaka mitano iliyopita. Tofauti hiyo ni somo lako la mfumuko wa bei, kwa bei zako mwenyewe.",
            "Angalia akiba yako ya sasa inakulipa kiasi gani kwa mwaka. Usipoweza kujua ndani ya dakika kumi, hilo lenyewe ni jibu.",
            "Tenganisha pesa yako kwenye karatasi kuwa ndoo mbili: dharura (inayofikika, salama) na ya muda mrefu (inayokua). Andika kiasi kwa kila moja.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Pesa taslimu iliyotulia inarudi nyuma — weka akiba unachoweza kuhitaji karibuni, na wekeza usichokihitaji.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Mwaka 2019 plate ya ugali na sukuma base ilikuwa kama KSh 50. Leo plate ile ile ni KSh 100 ama zaidi. Doo yako haikubadilika. Inachonunua ndio kilibadilika.\n\nHii ndio sehemu ya doo hakuna anaexplain base: KSh 100,000 inakaa tu kwa miaka mitano si KSh 100,000 mwisho. Ina value ya kama KSh 70,000 kwa inachoweza kununua. Hukuitumia, na bado umepoteza third yake.\n\nKusave chini ya godoro ama kwa wallet ya kawaida si safe. Ni loss ya polepole haionekani. Investing si kuhusu kuwa tajiri — kwa madere wengi ni defence tu against hiyo loss.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Inflation ni cost unalipa bila kunotice",
              detail:
                "Inflation ya Kenya imekuwa kama 5–8% kwa year. Doo haipati kitu inapoteza hiyo amount ya purchasing power kila year, uiguse ama usiiguse.",
            },
            {
              title: "Return yako lazima ibeat inflation ikue return real",
              detail:
                "Account inalipa 4% wakati bei zinapanda 7% inakupotezea 3% kwa year kwa ukweli. Inafeel kama growth juu number inapanda. Toa inflation kila time kabla uamue kama kitu kilifanya kazi.",
            },
            {
              title: "Saving na investing zinafanya kazi tofauti — keep zote",
              detail:
                "Savings inareachable leo na haitakiwi kushuka value: hiyo ni emergency fund. Investment inaweza kushuka short term, na badala yake inatarajiwa kubeat bei kwa miaka. Usiweke emergency fund kwa bucket ya investment kamwe.",
            },
            {
              title: "Time ndio inafanya kazi nzito, si amount",
              detail:
                "KSh 2,000 kwa mwezi kwa 10% inakuwa kama KSh 155,000 kwa miaka mitano na kama KSh 413,000 kwa kumi. Miaka mitano ya pili inaadd zaidi ya mara mbili ya ya kwanza, kutoka contribution ile ile. Kuanza mapema inabeat kuanza kubwa.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 100,000 kwa miaka mitano, mahali patatu",
          ledger: [
            { label: "Chini ya godoro", value: "KSh 100,000" },
            { label: "— inaweza kununua nini, inflation 7%", value: "KSh 71,300" },
            { label: "Savings account ya kawaida 4%", value: "KSh 121,700" },
            { label: "— value real baada ya inflation", value: "KSh 86,700" },
            { label: "SACCO / money market fund 10%", value: "KSh 161,100" },
            { label: "— value real baada ya inflation", value: "KSh 114,900", total: true },
          ],
          note: "Option ya tatu pekee inakuacha poa kuliko ulipoanza. Mbili za kwanza zinaonekana kama saving na kwa ukweli ni spending ya polepole.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Inflation",
              definition:
                "Rate ambayo bei zinapanda, kwa hivyo rate ambayo shilingi yako inanunua kidogo. Inapublishwa kila mwezi na Kenya National Bureau of Statistics.",
            },
            {
              term: "Real return",
              definition:
                "Return yako minus inflation. Figure pekee inakuambia kama ulipata kitu. Return ya 6% na inflation ya 7% ni real return ya −1%.",
            },
            {
              term: "Compounding",
              definition:
                "Kupata return kwa return tayari umepata. Polepole na haivutii kwa miaka miwili, halafu reason kuu mtu yeyote anaishia na doo baada ya kumi.",
            },
            {
              term: "Money market fund",
              definition:
                "Fund ina regulation inakopesha doo yako short term kwa bank na serikali. Risk ndogo, interest inalipwa kila mwezi, mara nyingi inapatikana ndani ya siku chache za kazi.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kusikia \"inflation inakula savings\" na kuconclude unatakiwa kuchase return kubwa zaidi inapatikana. Hiyo reasoning ndio exactly schemes za lesson tatu zimejengwa juu yake.\n\nKubeat inflation inahitaji kama 8–12% kwa year, ambayo ni ya kawaida na inapatikana sana kutoka SACCO, money market funds na government paper. Chochote kinapromise 30% kwa mwezi hakisolve inflation — ni njia tofauti na ya haraka zaidi ya kupoteza doo.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Fikiria kitu kimoja unanunua kila wiki na kiligharimu ngapi miaka mitano iliyopita. Hiyo tofauti ni lesson yako ya inflation, kwa bei zako mwenyewe.",
            "Check savings yako ya saa hii inakulipa ngapi kwa year. Usipoweza kujua ndani ya dakika kumi, hiyo yenyewe ni jibu.",
            "Separate doo yako kwa karatasi kwa buckets mbili: emergency (inareachable, safe) na long-term (inakua). Andika amount kwa kila moja.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Cash imekaa tu inaenda nyuma — save unachoweza kuhitaji karibuni, na invest usichohitaji.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── INV-2 ──
  {
    code: "INV-2",
    durationMin: 8,
    summary: {
      En: "An honest return is someone paying you to use your money. If you cannot say who is paying and why, there is no return — only other people's deposits.",
      Sw: "Faida ya kweli ni mtu anayekulipa kutumia pesa yako. Usipoweza kusema nani analipa na kwa nini, hakuna faida — ni amana za watu wengine tu.",
      Sh: "Return ya ukweli ni mtu anakulipa kutumia doo yako. Usipoweza kusema nani analipa na kwa nini, hakuna return — ni deposits za watu wengine tu.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Every honest investment has a person at the other end who is paying you, and a reason they are willing to. A SACCO pays you because it lends your deposit to another member at a higher rate. The government pays you because it needs to build a road before the taxes arrive. A business pays you because your capital let it buy stock it sold at a profit.\n\nIf you can name who pays and why, you are investing. If you cannot, you are in a scheme — and the money paying your \"return\" is coming from the person who joined after you.\n\nThat single test is worth more than any amount of financial jargon.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Lending — you are paid interest for waiting",
              detail:
                "SACCO deposits, money market funds, Treasury bills and bonds. Someone borrows your money and pays rent on it. The most predictable return there is, and where almost every rider should start.",
            },
            {
              title: "Ownership — you are paid a share of profits",
              detail:
                "SACCO share capital paying a dividend, a stake in a business, shares on the Nairobi exchange. Higher potential return, no promise, and the value moves. Money you will not need for five years.",
            },
            {
              title: "Productive assets — you are paid by the work it does",
              detail:
                "A second bike with a rider on it, a carrier box, a fridge for a kiosk. For most riders this is the strongest return available, because you understand the business better than any fund manager does.",
            },
            {
              title: "Risk and return move together, always",
              detail:
                "Treasury bills pay least and are safest. A second bike pays well and can be stolen. If something offers a high return and claims no risk, the risk has not been removed — it has been hidden from you.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000, four honest homes",
          ledger: [
            { label: "Treasury bill, 91 days — who pays: the government", value: "about 9% a year" },
            { label: "Money market fund — who pays: banks borrowing short-term", value: "about 10% a year" },
            { label: "SACCO deposits and dividend — who pays: borrowing members", value: "8–13% a year" },
            { label: "Second-hand bike rented to a rider — who pays: the rider", value: "KSh 7,000/month gross" },
            { label: "— less maintenance, insurance and idle weeks", value: "about 30–40% a year, with real risk", total: true },
          ],
          note: "Every line names the person paying. That is what makes them investments. The bike pays most and is also the only one that can be crashed, stolen, or left idle for a month.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Dividend",
              definition:
                "Your share of a profit that was actually made. A SACCO declares it once a year at the AGM, from real lending income. No profit, no dividend — which is exactly how it should work.",
            },
            {
              term: "Treasury bill / bond",
              definition:
                "A loan to the Government of Kenya, bought through the Central Bank. Bills run 91–364 days, bonds for years. The lowest-risk investment available in the country.",
            },
            {
              term: "Diversification",
              definition:
                "Not putting everything in one place. Two bikes on two routes is better than one bike; a SACCO plus a fund is better than either alone.",
            },
            {
              term: "Capital",
              definition:
                "Money put to work rather than spent. The bike you own outright is capital; the same amount spent on fuel is not.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Buying into something because someone you trust is already in it and is being paid. Early participants in a scheme are always paid — that is the mechanism, not evidence that it works. Their payment is funded by the people they recruit, which will include you.\n\nTrust tells you about the person. It tells you nothing at all about where the money is coming from. Ask the question anyway, and ask it of a friend as firmly as you would of a stranger.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Take anything you are currently invested in and answer out loud: who pays me, and out of what?",
            "Pick one lending option — a SACCO deposit or a money market fund — and find out its actual current rate.",
            "If you are considering a productive asset, write down its monthly cost as well as its monthly income. Most people only write the income.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Name the person paying you and the reason they can afford to — if you cannot, keep your money.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Kila uwekezaji wa kweli una mtu upande wa pili anayekulipa, na sababu anayokubali kufanya hivyo. SACCO inakulipa kwa sababu inakopesha amana yako kwa mwanachama mwingine kwa kiwango cha juu zaidi. Serikali inakulipa kwa sababu inahitaji kujenga barabara kabla kodi hazijafika. Biashara inakulipa kwa sababu mtaji wako uliiwezesha kununua bidhaa iliyouza kwa faida.\n\nUkiweza kutaja nani analipa na kwa nini, unawekeza. Usipoweza, uko kwenye mpango — na pesa inayolipa \"faida\" yako inatoka kwa mtu aliyejiunga baada yako.\n\nKipimo hicho kimoja kina thamani kuliko lugha yoyote ngumu ya kifedha.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Kukopesha — unalipwa riba kwa kusubiri",
              detail:
                "Amana za SACCO, mifuko ya soko la fedha, hati fupi na ndefu za serikali. Mtu anakopa pesa yako na anailipia kodi. Faida inayotabirika zaidi iliyopo, na ndipo karibu kila mwendeshaji anapaswa kuanzia.",
            },
            {
              title: "Umiliki — unalipwa sehemu ya faida",
              detail:
                "Hisa za SACCO zinazolipa gawio, sehemu katika biashara, hisa kwenye soko la Nairobi. Faida kubwa zaidi inayowezekana, bila ahadi, na thamani inasogea. Pesa usiyoihitaji kwa miaka mitano.",
            },
            {
              title: "Mali zinazozalisha — unalipwa na kazi inayofanya",
              detail:
                "Pikipiki ya pili yenye mwendeshaji, sanduku la mizigo, friji ya kibanda. Kwa waendeshaji wengi hii ndiyo faida kubwa zaidi inayopatikana, kwa sababu unaelewa biashara kuliko msimamizi yeyote wa mfuko.",
            },
            {
              title: "Hatari na faida husogea pamoja, kila wakati",
              detail:
                "Hati fupi za serikali hulipa kidogo zaidi na ni salama zaidi. Pikipiki ya pili hulipa vizuri na inaweza kuibiwa. Kitu kikitoa faida kubwa na kudai hakuna hatari, hatari haijaondolewa — imefichwa kwako.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000, makazi manne ya kweli",
          ledger: [
            { label: "Hati fupi ya serikali, siku 91 — analipa: serikali", value: "takriban 9% kwa mwaka" },
            { label: "Mfuko wa soko la fedha — wanalipa: benki zinazokopa", value: "takriban 10% kwa mwaka" },
            { label: "Amana na gawio la SACCO — wanalipa: wanachama wanaokopa", value: "8–13% kwa mwaka" },
            { label: "Pikipiki ya pili iliyokodishwa — analipa: mwendeshaji", value: "KSh 7,000/mwezi jumla" },
            { label: "— toa matengenezo, bima na wiki za utulivu", value: "takriban 30–40% kwa mwaka, na hatari halisi", total: true },
          ],
          note: "Kila mstari unataja mtu anayelipa. Ndicho kinachowafanya kuwa uwekezaji. Pikipiki inalipa zaidi na pia ndiyo pekee inayoweza kupata ajali, kuibiwa, au kukaa bila kazi kwa mwezi.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Gawio (dividend)",
              definition:
                "Sehemu yako ya faida iliyopatikana kweli. SACCO huitangaza mara moja kwa mwaka kwenye mkutano mkuu, kutoka mapato halisi ya ukopeshaji. Hakuna faida, hakuna gawio — ndivyo inavyopaswa kuwa.",
            },
            {
              term: "Hati ya serikali",
              definition:
                "Mkopo kwa Serikali ya Kenya, ununuliwa kupitia Benki Kuu. Hati fupi ni siku 91–364, ndefu ni miaka. Uwekezaji wenye hatari ndogo zaidi nchini.",
            },
            {
              term: "Kugawanya (diversification)",
              definition:
                "Kutoweka kila kitu mahali pamoja. Pikipiki mbili kwenye njia mbili ni bora kuliko moja; SACCO pamoja na mfuko ni bora kuliko kimoja peke yake.",
            },
            {
              term: "Mtaji",
              definition:
                "Pesa iliyowekwa kufanya kazi badala ya kutumika. Pikipiki unayomiliki kamili ni mtaji; kiasi kile kile kilichotumika kwa mafuta si mtaji.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuingia kwenye kitu kwa sababu mtu unayemwamini tayari yumo na analipwa. Washiriki wa awali kwenye mpango hulipwa kila wakati — hiyo ndiyo njia yenyewe, si ushahidi kwamba inafanya kazi. Malipo yao yanafadhiliwa na watu wanaowaleta, ambao watakujumuisha wewe.\n\nUaminifu unakuambia kuhusu mtu. Haukuambii chochote kuhusu pesa inatoka wapi. Uliza swali hata hivyo, na uliulize rafiki kwa uthabiti ule ule ungemuuliza mgeni.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Chukua chochote ulichowekeza sasa na ujibu kwa sauti: nani ananilipa, na kutoka wapi?",
            "Chagua chaguo moja la kukopesha — amana ya SACCO au mfuko wa soko la fedha — na ujue kiwango chake halisi cha sasa.",
            "Ikiwa unafikiria mali inayozalisha, andika gharama yake ya mwezi pamoja na kipato chake cha mwezi. Watu wengi huandika kipato pekee.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Taja mtu anayekulipa na sababu anaweza kumudu — usipoweza, shikilia pesa yako.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Kila investment ya ukweli ina mtu upande wa pili anakulipa, na reason anakubali. SACCO inakulipa juu inakopesha deposit yako kwa member mwingine kwa rate ya juu zaidi. Serikali inakulipa juu inahitaji kujenga barabara kabla tax ifike. Biz inakulipa juu capital yako iliiwezesha kununua stock iliuza kwa profit.\n\nUkiweza kutaja nani analipa na kwa nini, unainvest. Usipoweza, uko kwa scheme — na doo inalipa \"return\" yako inatoka kwa mtu alijoin baada yako.\n\nHiyo test moja ina thamani kuliko jargon yoyote ya finance.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Kukopesha — unalipwa interest kwa kusubiri",
              detail:
                "Deposits za SACCO, money market funds, Treasury bills na bonds. Mtu anakopa doo yako na analipa rent juu yake. Return inapredictable zaidi iko, na ndio karibu kila dere anafaa kuanzia.",
            },
            {
              title: "Ownership — unalipwa share ya profit",
              detail:
                "Shares za SACCO zinalipa dividend, stake kwa biz, shares kwa Nairobi exchange. Return kubwa zaidi inawezekana, bila promise, na value inasogea. Doo hutahitaji kwa miaka mitano.",
            },
            {
              title: "Productive assets — unalipwa na kazi inafanya",
              detail:
                "Pikipiki ya pili na dere juu yake, carrier box, fridge ya kibanda. Kwa madere wengi hii ndio return kubwa zaidi inapatikana, juu unaelewa biz kuliko fund manager yeyote.",
            },
            {
              title: "Risk na return zinasogea pamoja, kila time",
              detail:
                "Treasury bills zinalipa kidogo zaidi na ziko safe zaidi. Pikipiki ya pili inalipa poa na inaweza kuibiwa. Kitu kikioffer return kubwa na kuclaim hakuna risk, risk haijaondolewa — imefichwa kwako.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000, homes nne za ukweli",
          ledger: [
            { label: "Treasury bill, siku 91 — analipa: serikali", value: "kama 9% kwa year" },
            { label: "Money market fund — wanalipa: bank zinakopa", value: "kama 10% kwa year" },
            { label: "SACCO deposits na dividend — wanalipa: members wanakopa", value: "8–13% kwa year" },
            { label: "Pikipiki ya pili imekodishwa — analipa: dere", value: "KSh 7,000/mwezi gross" },
            { label: "— toa maintenance, bima na wiki za kukaa", value: "kama 30–40% kwa year, na risk real", total: true },
          ],
          note: "Kila line inataja mtu analipa. Ndio inazifanya kuwa investment. Pikipiki inalipa zaidi na pia ndio pekee inaweza kucrash, kuibiwa, ama kukaa bila kazi kwa mwezi.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Dividend",
              definition:
                "Share yako ya profit ilipatikana kwa ukweli. SACCO inaideclare mara moja kwa year kwa AGM, kutoka lending income real. Hakuna profit, hakuna dividend — ndivyo inafaa kufanya kazi.",
            },
            {
              term: "Treasury bill / bond",
              definition:
                "Loan kwa Government ya Kenya, inanunuliwa through Central Bank. Bills ni siku 91–364, bonds ni miaka. Investment ina risk ndogo zaidi iko kwa country.",
            },
            {
              term: "Diversification",
              definition:
                "Kutoweka kila kitu mahali pamoja. Pikipiki mbili kwa routes mbili ni poa kuliko moja; SACCO plus fund ni poa kuliko moja pekee.",
            },
            {
              term: "Capital",
              definition:
                "Doo imewekwa kufanya kazi badala ya kutumika. Pikipiki unamiliki fully ni capital; amount ile ile imetumika kwa fuel si capital.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kununua kitu juu mtu unamtrust tayari yuko ndani na analipwa. Participants wa mapema kwa scheme wanalipwa kila time — hiyo ndio mechanism, si evidence inafanya kazi. Payment yao inafundiwa na watu wanawarecruit, ambao watakuinclude wewe.\n\nTrust inakuambia kuhusu mtu. Haikuambii kitu kuhusu doo inatoka wapi. Uliza swali bado, na uulize beste kwa firmness ile ile ungeuliza stranger.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Chukua chochote umeinvest saa hii na ujibu kwa sauti: nani ananilipa, na kutoka wapi?",
            "Chagua option moja ya kukopesha — SACCO deposit ama money market fund — na ujue rate yake real ya saa hii.",
            "Kama unaconsider productive asset, andika cost yake ya mwezi pamoja na income yake ya mwezi. Watu wengi wanaandika income pekee.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Taja mtu anakulipa na reason anaweza afford — usipoweza, keep doo yako.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── INV-3 ──
  {
    code: "INV-3",
    durationMin: 7,
    summary: {
      En: "Guaranteed high returns, pressure to recruit, and difficulty withdrawing are the three signs. Any one of them is enough to walk away.",
      Sw: "Faida kubwa ya uhakika, shinikizo la kuleta wengine, na ugumu wa kutoa pesa ni ishara tatu. Mojawapo tu inatosha kuondoka.",
      Sh: "Return kubwa guaranteed, pressure ya kurecruit, na ugumu wa kutoa doo ni signs tatu. Moja tu inatosha kuondoka.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Boda riders are a deliberate target. You handle cash daily, you are reachable in a group at the stage, you trust people you ride beside, and you are actively looking for a way to grow money. Every one of those is a feature from a fraudster's point of view.\n\nThe schemes do not look like fraud. They look like an opportunity brought by a friend who has already been paid twice, with a WhatsApp group, a smart office in town and a laminated certificate on the wall.\n\nYou do not need to understand how each one works. You need three signs, and the discipline to act on any one of them.",
        },
        {
          kind: "points",
          heading: "The three signs",
          points: [
            {
              title: "A high return described as guaranteed",
              detail:
                "Real returns move with the world. Anything promising a fixed 10%, 20% or 30% a month regardless of conditions is not investing — nobody in the legitimate market can promise that, which is why nobody does.",
            },
            {
              title: "You are paid for bringing people, not for what your money does",
              detail:
                "The moment your return depends on recruiting, the business is the recruiting. Your payout is funded by the deposits of people below you, and it stops the day recruitment slows — which is always.",
            },
            {
              title: "Getting money out is slow, conditional, or discouraged",
              detail:
                "Withdrawal fees, lock-in periods that appear after you join, a 'reinvest and earn more' offer every time you ask. A real fund pays out on request. Test this early with a small withdrawal, before you commit anything serious.",
            },
            {
              title: "Supporting signals: urgency, secrecy and borrowed credibility",
              detail:
                "'Closes Friday.' 'Do not discuss outside the group.' A photo with a politician or a pastor. None of these are regulation. Pressure to decide quickly exists only to stop you checking.",
            },
          ],
        },
        {
          kind: "example",
          heading: "How KSh 20,000 disappears, step by step",
          ledger: [
            { label: "Month 1 — you deposit", value: "KSh 20,000" },
            { label: "Month 1 — 'return' paid, from new members' deposits", value: "+ KSh 4,000" },
            { label: "Month 2 — you add more, convinced", value: "KSh 50,000" },
            { label: "Month 2 — you bring two friends, who deposit", value: "KSh 60,000" },
            { label: "Month 3 — withdrawals 'under system upgrade'", value: "KSh 0" },
            { label: "Month 4 — group silent, office closed", value: "− KSh 70,000 and two friendships", total: true },
          ],
          note: "The KSh 4,000 in month one was never a return. It was your own deposit, handed back to make you deposit more — and to turn you into the recruiter.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Ponzi scheme",
              definition:
                "Early investors are paid with later investors' money. There is no underlying business. Collapse is not a risk — it is certain, the only question is when.",
            },
            {
              term: "Pyramid scheme",
              definition:
                "Income comes from recruiting rather than from selling anything real. Often disguised with a token product nobody actually wants.",
            },
            {
              term: "CMA licence",
              definition:
                "The Capital Markets Authority licenses anyone legally taking investment money in Kenya. The register is public and free to search. If a firm is not on it, that is the end of the conversation.",
            },
            {
              term: "SASRA",
              definition:
                "The authority that regulates deposit-taking SACCOs. A genuine SACCO is on its published list. Ask for the registration number and check it yourself.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Thinking you can get in early and get out before it collapses. Thousands of people have tried that; the ones who succeeded tell the story loudly and the ones who did not stay quiet, which is exactly why it looks like it works.\n\nYou will not be told when the collapse is coming. The people running it will withdraw first, and the group will go silent on an ordinary Tuesday.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Search the CMA and SASRA registers for any organisation currently holding your money. It takes five minutes.",
            "Agree a personal rule now, while nothing is being offered: no investment decision on the same day it is presented. Ever.",
            "If something has already taken your money, report it to the CMA and to the police. Do not deposit more trying to recover it — that is the second trap, and it catches more people than the first.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Guaranteed returns, payment for recruiting, or trouble withdrawing — any one of the three means walk away today.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Waendeshaji wa boda ni walengwa kwa makusudi. Mnashika pesa taslimu kila siku, mnafikika kama kundi kituoni, mnawaamini mnaoendesha pamoja nao, na mnatafuta njia ya kukuza pesa. Kila moja kati ya hizi ni sifa kwa mtazamo wa mlaghai.\n\nMipango haionekani kama ulaghai. Inaonekana kama fursa iliyoletwa na rafiki ambaye tayari amelipwa mara mbili, ikiwa na kundi la WhatsApp, ofisi nzuri mjini na cheti ukutani.\n\nHuhitaji kuelewa jinsi kila mmoja unavyofanya kazi. Unahitaji ishara tatu, na nidhamu ya kuchukua hatua kwa mojawapo.",
        },
        {
          kind: "points",
          heading: "Ishara tatu",
          points: [
            {
              title: "Faida kubwa inayoelezwa kama ya uhakika",
              detail:
                "Faida halisi husogea na dunia. Chochote kinachoahidi 10%, 20% au 30% kwa mwezi bila kujali hali si uwekezaji — hakuna aliye kwenye soko halali anayeweza kuahidi hivyo, ndiyo sababu hakuna anayefanya.",
            },
            {
              title: "Unalipwa kwa kuleta watu, si kwa kile pesa yako inachofanya",
              detail:
                "Mara faida yako inapotegemea kuleta wengine, biashara ni kuleta wengine. Malipo yako yanafadhiliwa na amana za walio chini yako, na yanasimama siku uletaji unapopungua — jambo linalotokea kila wakati.",
            },
            {
              title: "Kutoa pesa ni polepole, kwa masharti, au kunakatishwa tamaa",
              detail:
                "Ada za kutoa, vipindi vya kufunga vinavyojitokeza baada ya kujiunga, ofa ya 'wekeza tena upate zaidi' kila unapouliza. Mfuko halisi hulipa ukiomba. Jaribu hili mapema kwa kutoa kiasi kidogo, kabla hujaweka chochote kikubwa.",
            },
            {
              title: "Ishara za ziada: haraka, usiri na uaminifu wa kuazima",
              detail:
                "'Inafungwa Ijumaa.' 'Msijadili nje ya kundi.' Picha na mwanasiasa au mchungaji. Hakuna kati ya hizi ni usimamizi. Shinikizo la kuamua haraka lipo ili tu kukuzuia kuhakiki.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Jinsi KSh 20,000 inavyopotea, hatua kwa hatua",
          ledger: [
            { label: "Mwezi 1 — unaweka", value: "KSh 20,000" },
            { label: "Mwezi 1 — 'faida' iliyolipwa, kutoka amana za wapya", value: "+ KSh 4,000" },
            { label: "Mwezi 2 — unaongeza, umeshawishika", value: "KSh 50,000" },
            { label: "Mwezi 2 — unaleta marafiki wawili, wanaweka", value: "KSh 60,000" },
            { label: "Mwezi 3 — kutoa pesa 'mfumo unaboreshwa'", value: "KSh 0" },
            { label: "Mwezi 4 — kundi kimya, ofisi imefungwa", value: "− KSh 70,000 na urafiki wawili", total: true },
          ],
          note: "KSh 4,000 za mwezi wa kwanza hazikuwa faida kamwe. Ilikuwa amana yako mwenyewe, iliyorudishwa ili uweke zaidi — na ili ukufanye mletaji.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Mpango wa Ponzi",
              definition:
                "Wawekezaji wa awali hulipwa kwa pesa ya wawekezaji wa baadaye. Hakuna biashara halisi chini yake. Kuanguka si hatari — ni hakika, swali pekee ni lini.",
            },
            {
              term: "Mpango wa piramidi",
              definition:
                "Kipato kinatoka kwa kuleta watu badala ya kuuza kitu halisi. Mara nyingi hufichwa kwa bidhaa ndogo ambayo hakuna anayeitaka kweli.",
            },
            {
              term: "Leseni ya CMA",
              definition:
                "Mamlaka ya Masoko ya Mitaji hutoa leseni kwa yeyote anayechukua pesa za uwekezaji kihalali nchini Kenya. Orodha ni ya umma na ni bure kutafuta. Kampuni isipokuwepo, mazungumzo yameisha.",
            },
            {
              term: "SASRA",
              definition:
                "Mamlaka inayosimamia SACCO zinazochukua amana. SACCO halisi iko kwenye orodha yake iliyochapishwa. Omba namba ya usajili na uihakiki mwenyewe.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kufikiri unaweza kuingia mapema na kutoka kabla haijaanguka. Maelfu wamejaribu hivyo; waliofanikiwa husimulia kwa sauti na wasiofanikiwa hukaa kimya, ndiyo sababu inaonekana inafanya kazi.\n\nHutaambiwa kuanguka kunakuja lini. Wanaoiendesha watatoa pesa kwanza, na kundi litanyamaza Jumanne ya kawaida.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Tafuta kwenye orodha za CMA na SASRA shirika lolote linaloshikilia pesa yako sasa. Inachukua dakika tano.",
            "Kubaliana na sheria yako binafsi sasa, wakati hakuna kinachotolewa: hakuna uamuzi wa uwekezaji siku ile ile unapowasilishwa. Kamwe.",
            "Ikiwa kitu tayari kimechukua pesa yako, ripoti kwa CMA na polisi. Usiweke zaidi ukijaribu kuirudisha — hiyo ni mtego wa pili, na hunasa watu wengi kuliko wa kwanza.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Faida ya uhakika, malipo kwa kuleta watu, au shida ya kutoa pesa — mojawapo kati ya hizi tatu inamaanisha ondoka leo.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Madere wa boda ni target kwa makusudi. Mnashika cash kila siku, mnareachable kama group base, mnatrust watu mnaride nao, na mnatafuta njia ya kugrow doo. Kila moja ya hizi ni feature kwa mtazamo wa scammer.\n\nSchemes hazionekani kama fraud. Zinaonekana kama opportunity imeletwa na beste tayari amelipwa mara mbili, na group ya WhatsApp, ofisi smart town na certificate ukutani.\n\nHuhitaji kuelewa vile kila moja inafanya kazi. Unahitaji signs tatu, na discipline ya kuact kwa moja yoyote.",
        },
        {
          kind: "points",
          heading: "Signs tatu",
          points: [
            {
              title: "Return kubwa inadescribiwa kama guaranteed",
              detail:
                "Returns real zinasogea na dunia. Chochote kinapromise 10%, 20% ama 30% kwa mwezi bila kujali hali si investing — hakuna yuko kwa market legit anaweza promise hiyo, ndio maana hakuna anafanya.",
            },
            {
              title: "Unalipwa kwa kuleta watu, si kwa doo yako inafanya nini",
              detail:
                "Moment return yako inadepend kwa kurecruit, biz ni kurecruit. Payout yako inafundiwa na deposits za watu chini yako, na inasimama siku recruitment inapungua — ambayo ni kila time.",
            },
            {
              title: "Kutoa doo ni polepole, kwa masharti, ama inadiscouragiwa",
              detail:
                "Withdrawal fees, lock-in periods zinaonekana baada ya kujoin, offer ya 'reinvest upate zaidi' kila unauliza. Fund real inalipa ukiomba. Test hii mapema kwa withdrawal ndogo, kabla ucommit kitu serious.",
            },
            {
              title: "Signals za ziada: urgency, secrecy na credibility ya kuazima",
              detail:
                "'Inafunga Friday.' 'Msidiscuss nje ya group.' Picha na mwanasiasa ama pastor. Hakuna kati ya hizi ni regulation. Pressure ya kuamua haraka iko ili tu ikuzuie kucheck.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Vile KSh 20,000 inapotea, step by step",
          ledger: [
            { label: "Month 1 — unadeposit", value: "KSh 20,000" },
            { label: "Month 1 — 'return' imelipwa, kutoka deposits za wapya", value: "+ KSh 4,000" },
            { label: "Month 2 — unaadd zaidi, umeconvinced", value: "KSh 50,000" },
            { label: "Month 2 — unaleta mabeste wawili, wanadeposit", value: "KSh 60,000" },
            { label: "Month 3 — withdrawals 'system inaupgradiwa'", value: "KSh 0" },
            { label: "Month 4 — group kimya, ofisi imefungwa", value: "− KSh 70,000 na urafiki wawili", total: true },
          ],
          note: "Hiyo KSh 4,000 ya month one haikuwa return kamwe. Ilikuwa deposit yako mwenyewe, imerudishwa ili udeposit zaidi — na ikufanye recruiter.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Ponzi scheme",
              definition:
                "Investors wa mapema wanalipwa na doo ya investors wa baadaye. Hakuna biz real chini yake. Kuanguka si risk — ni certain, swali pekee ni lini.",
            },
            {
              term: "Pyramid scheme",
              definition:
                "Income inatoka kwa kurecruit badala ya kuuza kitu real. Mara nyingi inafichwa na product ndogo hakuna anataka kwa ukweli.",
            },
            {
              term: "CMA licence",
              definition:
                "Capital Markets Authority inatoa licence kwa yeyote anachukua investment money legally Kenya. Register ni public na ni bure kusearch. Kampuni haiko ndani, hiyo ndio mwisho wa story.",
            },
            {
              term: "SASRA",
              definition:
                "Authority inaregulate SACCO zinachukua deposits. SACCO ya ukweli iko kwa list yake imepublishwa. Omba registration number na uicheck mwenyewe.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kufikiri unaweza kuingia mapema na kutoka kabla ianguke. Maelfu wamejaribu hiyo; waliofanikiwa wanasimulia kwa sauti na wasiofanikiwa wanakaa kimya, ndio exactly maana inaonekana inafanya kazi.\n\nHutaambiwa collapse inakuja lini. Wanaoiendesha watatoa doo kwanza, na group itanyamaza Jumanne ya kawaida.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Search CMA na SASRA registers kwa organisation yoyote inashikilia doo yako saa hii. Inachukua dakika tano.",
            "Agree rule yako binafsi saa hii, wakati hakuna kinaofferiwa: hakuna investment decision siku ile ile inapresentiwa. Kamwe.",
            "Kama kitu tayari kimechukua doo yako, report kwa CMA na polisi. Usideposit zaidi ukijaribu kuirecover — hiyo ni trap ya pili, na inanasa watu wengi kuliko ya kwanza.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Return guaranteed, payment kwa kurecruit, ama shida kutoa doo — moja yoyote ya hizo tatu inamaanisha ondoka leo.",
        },
      ],
    },
  },
];
