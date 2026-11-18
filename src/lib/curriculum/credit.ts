import type { LessonEnrichment } from "./types";

/**
 * Module 2 — Credit and debt.
 *
 * The central skill here is arithmetic the lender does not volunteer:
 * converting a "4% per month" headline into what actually leaves your pocket,
 * and recognising that a loan taken against the bike is a loan taken against
 * your income.
 */
export const CREDIT_LESSONS: LessonEnrichment[] = [
  // ───────────────────────────────────────────────────────────────── CRE-1 ──
  {
    code: "CRE-1",
    durationMin: 8,
    summary: {
      En: "The advertised rate is never the cost. Add the fees, check whether it is flat or reducing, and compare only the total you repay.",
      Sw: "Kiwango kinachotangazwa si gharama kamwe. Ongeza ada, angalia kama ni tambarare au inayopungua, na ulinganishe jumla unayolipa tu.",
      Sh: "Rate inaadvertiswa si cost kamwe. Add fees, check kama ni flat ama reducing, na ucompare total unalipa tu.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Two lenders offer you KSh 50,000 over twelve months. One says 4% a month. The other says 36% a year. Most riders take the first, because 4 is a smaller number than 36.\n\nThe first loan costs you roughly twice as much.\n\nThis is not a trick played on riders specifically — it is how almost all small lending is advertised, everywhere. The protection is not suspicion. It is one habit: never compare interest rates. Compare the total you will hand back.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Flat interest and reducing-balance interest are different animals",
              detail:
                "Flat charges you interest on the full original amount every month, even in month eleven when you have nearly repaid it. Reducing-balance charges only on what you still owe. The same quoted percentage costs close to twice as much when it is flat.",
            },
            {
              title: "A monthly rate is not a twelfth of a yearly rate",
              detail:
                "4% per month is not 4% a year and it is not really 48% either — compounded it is about 60%. If a lender quotes per month, multiply by twelve before you feel anything about the number.",
            },
            {
              title: "The fees are part of the price",
              detail:
                "Processing fee, appraisal fee, insurance premium, excise duty on the fee, mandatory share top-up. Some loans carry 6–8% in charges before a single shilling of interest. Ask for the total, in shillings, on paper.",
            },
            {
              title: "One question settles every comparison",
              detail:
                "\"If I take this today and pay exactly on schedule, how many shillings will I have handed over by the end?\" A lender who cannot answer that in one number is a lender to walk away from.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000 over 12 months, three ways",
          ledger: [
            { label: "Digital lender — 4% flat per month, 3% fee", value: "KSh 25,500 interest + KSh 1,500 fee" },
            { label: "Total repaid", value: "KSh 77,000" },
            { label: "Shylock — 15% per month on the balance", value: "about KSh 40,000 interest" },
            { label: "Total repaid", value: "KSh 90,000" },
            { label: "SACCO — 14% a year reducing, 1.5% fee", value: "KSh 3,930 interest + KSh 750 fee" },
            { label: "Total repaid", value: "KSh 54,680", total: true },
          ],
          note: "Same KSh 50,000, same twelve months. The gap between the SACCO and the digital lender is KSh 22,320 — about four months of a rider's take-home, paid for nothing but the speed of approval.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Flat rate",
              definition:
                "Interest charged on the original amount for the whole term, regardless of how much you have repaid. Looks cheap, is not. Common in digital and dealer lending.",
            },
            {
              term: "Reducing balance",
              definition:
                "Interest charged only on what you still owe, so it falls every month as you repay. What SACCOs and banks normally use, and the fairer of the two.",
            },
            {
              term: "APR / total cost of credit",
              definition:
                "Interest plus every fee, expressed as one annual figure. The only number worth comparing between lenders. Kenyan lenders must disclose it — ask.",
            },
            {
              term: "Logbook loan",
              definition:
                "Credit secured on your motorbike. Miss the payments and the bike is taken — which removes the income you needed to make the payments.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Judging a loan by whether you can manage the monthly instalment. Lenders design the instalment to look affordable by stretching the term, and a longer term on a flat rate is where the money disappears.\n\nAn instalment you can afford on a good month is an instalment you cannot afford in the rainy season. Size the loan against your worst month, and against the total, never against the instalment alone.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Take any loan you currently hold and work out the total you will have repaid. Compare it to what you borrowed.",
            "Find out whether each loan you hold is flat or reducing. Phone and ask if the statement does not say.",
            "Before any new borrowing, write the single question on your hand: how many shillings in total?",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Never compare percentages — compare the total number of shillings you hand back, fees included.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Wakopeshaji wawili wanakupa KSh 50,000 kwa miezi kumi na miwili. Mmoja anasema 4% kwa mwezi. Mwingine anasema 36% kwa mwaka. Waendeshaji wengi huchukua wa kwanza, kwa sababu 4 ni namba ndogo kuliko 36.\n\nMkopo wa kwanza unakugharimu takriban mara mbili zaidi.\n\nHii si hila inayochezwa kwa waendeshaji pekee — ndivyo karibu mikopo yote midogo inavyotangazwa, kila mahali. Ulinzi si shaka. Ni tabia moja: usilinganishe viwango vya riba kamwe. Linganisha jumla utakayorudisha.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Riba tambarare na riba ya salio linalopungua ni vitu viwili tofauti",
              detail:
                "Tambarare inakutoza riba kwa kiasi chote cha awali kila mwezi, hata mwezi wa kumi na moja ukiwa umekaribia kumaliza. Salio linalopungua linatoza kwa unachodaiwa tu. Asilimia ile ile inagharimu karibu mara mbili ikiwa ni tambarare.",
            },
            {
              title: "Kiwango cha mwezi si sehemu ya kumi na mbili ya kiwango cha mwaka",
              detail:
                "4% kwa mwezi si 4% kwa mwaka na si 48% hasa — ikijumlishwa ni takriban 60%. Mkopeshaji akitoa kwa mwezi, zidisha kwa kumi na mbili kabla hujahisi chochote kuhusu namba hiyo.",
            },
            {
              title: "Ada ni sehemu ya bei",
              detail:
                "Ada ya kushughulikia, ada ya tathmini, malipo ya bima, ushuru kwa ada, nyongeza ya lazima ya hisa. Mikopo mingine ina 6–8% ya gharama kabla ya shilingi moja ya riba. Omba jumla, kwa shilingi, kwa maandishi.",
            },
            {
              title: "Swali moja linamaliza kila ulinganisho",
              detail:
                "\"Nikichukua hii leo na nilipe kwa ratiba kamili, nitakuwa nimetoa shilingi ngapi mwishoni?\" Mkopeshaji asiyeweza kujibu hilo kwa namba moja ni mkopeshaji wa kumwacha.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000 kwa miezi 12, njia tatu",
          ledger: [
            { label: "Mkopeshaji wa kidijitali — 4% tambarare kwa mwezi, ada 3%", value: "KSh 25,500 riba + KSh 1,500 ada" },
            { label: "Jumla iliyolipwa", value: "KSh 77,000" },
            { label: "Mkopeshaji wa kienyeji — 15% kwa mwezi kwa salio", value: "takriban KSh 40,000 riba" },
            { label: "Jumla iliyolipwa", value: "KSh 90,000" },
            { label: "SACCO — 14% kwa mwaka inayopungua, ada 1.5%", value: "KSh 3,930 riba + KSh 750 ada" },
            { label: "Jumla iliyolipwa", value: "KSh 54,680", total: true },
          ],
          note: "KSh 50,000 zile zile, miezi kumi na miwili ile ile. Pengo kati ya SACCO na mkopeshaji wa kidijitali ni KSh 22,320 — takriban miezi minne ya mapato ya mwendeshaji, kulipia kasi ya kuidhinishwa tu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Riba tambarare",
              definition:
                "Riba inayotozwa kwa kiasi cha awali kwa muda wote, bila kujali umelipa kiasi gani. Inaonekana rahisi, si rahisi. Ni ya kawaida kwa mikopo ya kidijitali na ya wauzaji.",
            },
            {
              term: "Salio linalopungua",
              definition:
                "Riba inayotozwa kwa unachodaiwa tu, hivyo inashuka kila mwezi unapolipa. Ndiyo SACCO na benki hutumia, na ni ya haki zaidi kati ya hizi mbili.",
            },
            {
              term: "Gharama jumla ya mkopo (APR)",
              definition:
                "Riba pamoja na kila ada, ikitajwa kama namba moja ya mwaka. Namba pekee inayostahili kulinganishwa kati ya wakopeshaji. Wakopeshaji wa Kenya lazima waitangaze — uliza.",
            },
            {
              term: "Mkopo wa logbook",
              definition:
                "Mkopo uliowekwa dhamana kwa pikipiki yako. Ukikosa malipo pikipiki inachukuliwa — jambo linaloondoa kipato ulichohitaji kufanya malipo.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuhukumu mkopo kwa kuangalia kama unaweza kumudu malipo ya mwezi. Wakopeshaji hubuni malipo yaonekane ya bei nafuu kwa kurefusha muda, na muda mrefu kwa riba tambarare ndipo pesa inapotea.\n\nMalipo unayoweza kumudu mwezi mzuri ni malipo usiyoweza kumudu msimu wa mvua. Pima mkopo dhidi ya mwezi wako mbaya zaidi, na dhidi ya jumla, kamwe si dhidi ya malipo ya mwezi pekee.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Chukua mkopo wowote ulio nao sasa na uhesabu jumla utakayokuwa umelipa. Ilinganishe na ulichokopa.",
            "Tafuta kama kila mkopo ulio nao ni tambarare au unaopungua. Piga simu uulize kama taarifa haisemi.",
            "Kabla ya kukopa kwingine kokote, andika swali moja mkononi mwako: jumla ni shilingi ngapi?",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Usilinganishe asilimia kamwe — linganisha jumla ya shilingi unazorudisha, ada zikiwemo.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Wakopeshaji wawili wanakuoffer KSh 50,000 kwa miezi kumi na mbili. Mmoja anasema 4% kwa mwezi. Mwingine anasema 36% kwa year. Madere wengi wanachukua wa kwanza, juu 4 ni number ndogo kuliko 36.\n\nLoan ya kwanza inakucost karibu mara mbili zaidi.\n\nHii si trick inachezwa kwa madere pekee — ndivyo karibu lending yote ndogo inaadvertiswa, kila mahali. Protection si suspicion. Ni habit moja: usicompare interest rates kamwe. Compare total utarudisha.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Flat interest na reducing balance ni vitu viwili tofauti",
              detail:
                "Flat inakucharge interest kwa amount yote ya original kila mwezi, hata month eleven ukiwa umekaribia kumaliza. Reducing inacharge kwa unadaiwa tu. Percentage ile ile inacost karibu mara mbili ikiwa ni flat.",
            },
            {
              title: "Monthly rate si theluthi moja ya kumi na mbili ya yearly rate",
              detail:
                "4% kwa mwezi si 4% kwa year na si 48% kabisa — ikicompound ni kama 60%. Lender akiquote kwa mwezi, multiply by twelve kabla ufeel chochote kuhusu hiyo number.",
            },
            {
              title: "Fees ni sehemu ya bei",
              detail:
                "Processing fee, appraisal fee, insurance premium, excise duty kwa fee, share top-up ya lazima. Loan zingine zina 6–8% ya charges kabla shilingi moja ya interest. Omba total, kwa shilingi, kwa karatasi.",
            },
            {
              title: "Swali moja inamaliza kila comparison",
              detail:
                "\"Nikichukua hii leo na nilipe exactly kwa schedule, nitakuwa nimetoa shilingi ngapi mwisho?\" Lender hawezi kujibu hiyo kwa number moja ni lender wa kuachana naye.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 50,000 kwa miezi 12, njia tatu",
          ledger: [
            { label: "Digital lender — 4% flat kwa mwezi, fee 3%", value: "KSh 25,500 interest + KSh 1,500 fee" },
            { label: "Total umelipa", value: "KSh 77,000" },
            { label: "Shylock — 15% kwa mwezi kwa balance", value: "kama KSh 40,000 interest" },
            { label: "Total umelipa", value: "KSh 90,000" },
            { label: "SACCO — 14% kwa year reducing, fee 1.5%", value: "KSh 3,930 interest + KSh 750 fee" },
            { label: "Total umelipa", value: "KSh 54,680", total: true },
          ],
          note: "KSh 50,000 zile zile, miezi kumi na mbili ile ile. Gap kati ya SACCO na digital lender ni KSh 22,320 — kama miezi minne ya take-home ya dere, umelipia speed ya approval tu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Flat rate",
              definition:
                "Interest inacharged kwa amount ya original kwa term yote, bila kujali umelipa ngapi. Inaonekana cheap, si cheap. Iko common kwa digital na dealer lending.",
            },
            {
              term: "Reducing balance",
              definition:
                "Interest inacharged kwa unadaiwa tu, kwa hivyo inashuka kila mwezi unalipa. Ndio SACCO na bank hutumia, na ndio fair zaidi kati ya hizi mbili.",
            },
            {
              term: "APR / total cost of credit",
              definition:
                "Interest plus kila fee, kama figure moja ya year. Number pekee inastahili kucompariwa kati ya wakopeshaji. Wakopeshaji wa Kenya lazima waidisclose — uliza.",
            },
            {
              term: "Logbook loan",
              definition:
                "Credit imesecuriwa kwa pikipiki yako. Ukikosa payments pikipiki inachukuliwa — ambayo inaondoa income ulihitaji kufanya hizo payments.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kujudge loan kwa kama unaweza manage instalment ya mwezi. Lenders wanadesign instalment ionekane affordable kwa kustretch term, na term ndefu kwa flat rate ndio doo inapotea.\n\nInstalment unaweza afford mwezi poa ni instalment huwezi afford season ya mvua. Size loan against mwezi wako mbaya kabisa, na against total, si against instalment pekee kamwe.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Chukua loan yoyote uko nayo saa hii na ucount total utakuwa umelipa. Icompare na ulikopa ngapi.",
            "Tafuta kama kila loan uko nayo ni flat ama reducing. Piga simu uulize kama statement haisemi.",
            "Kabla ya kukopa kitu kingine, andika swali moja kwa mkono: total ni shilingi ngapi?",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Usicompare percentage kamwe — compare total ya shilingi unarudisha, fees ziko ndani.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── CRE-2 ──
  {
    code: "CRE-2",
    durationMin: 7,
    summary: {
      En: "Debt that buys something which earns or protects is an investment. Debt that buys something which disappears is a tax on your future.",
      Sw: "Deni linalonunua kitu kinachozalisha au kinacholinda ni uwekezaji. Deni linalonunua kitu kinachopotea ni kodi kwa maisha yako yajayo.",
      Sh: "Deni inanunua kitu kinaearn ama kinaprotect ni investment. Deni inanunua kitu kinapotea ni tax kwa future yako.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "\"Avoid debt\" is advice for people who already own their tools. A rider who refuses all credit may ride a rented bike for ten years and own nothing at the end of it, while a rider who borrowed carefully owns two.\n\nThe useful question is not whether to borrow. It is what the borrowed money turns into.\n\nMoney borrowed to buy the bike you currently rent becomes an asset that pays the loan off and then keeps paying you. Money borrowed for a weekend becomes nothing, and you keep paying for it for six months. Same lender, same rate, completely different outcome.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Debt that builds buys something that earns",
              detail:
                "The bike itself, a second bike, a carrier box that lets you take deliveries, a phone that gets you onto a ride-hailing platform. These pay their own instalment and continue earning after the last one.",
            },
            {
              title: "Debt that protects is also worth taking",
              detail:
                "Borrowing to cover a medical bill or to keep a child in school is not consumption. The alternative — a withdrawn child or an untreated illness — costs far more over a lifetime than the interest does.",
            },
            {
              title: "Debt that eats buys something already gone",
              detail:
                "Betting, a night out, a phone upgrade, topping up another loan. The thing is finished and the repayment is not. This is where almost all digital borrowing goes, and it is why the balance never falls.",
            },
            {
              title: "Refinancing one loan with another is the warning sign",
              detail:
                "The moment you borrow from lender B to pay lender A, you have stopped managing debt and started rolling it. Stop, list everything you owe, and deal with the smallest or most expensive first — not with another loan.",
            },
          ],
        },
        {
          kind: "example",
          heading: "The same KSh 60,000, borrowed twice",
          ledger: [
            { label: "Borrowed to buy the bike you currently rent", value: "KSh 60,000" },
            { label: "Rent no longer paid, per month", value: "+ KSh 9,000" },
            { label: "Loan instalment, per month", value: "− KSh 5,800" },
            { label: "Better off each month, and you own the bike", value: "+ KSh 3,200", total: true },
            { label: "Borrowed and spent on consumption", value: "KSh 60,000" },
            { label: "What it earns", value: "KSh 0" },
            { label: "Worse off each month for 12 months", value: "− KSh 5,800", total: true },
          ],
          note: "Identical loan, identical interest. One version pays you KSh 3,200 a month and leaves you owning an asset; the other takes KSh 5,800 a month and leaves you with nothing.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Asset",
              definition:
                "Something that puts money into your pocket or saves you a cost you were already paying. The bike is an asset. A phone used only for social media is not.",
            },
            {
              term: "Debt stacking",
              definition:
                "Holding several loans at once, often borrowing from one to service another. The commonest route from a manageable problem to an unmanageable one.",
            },
            {
              term: "Debt service ratio",
              definition:
                "The share of your income going to loan repayments. Above about a third, one slow week puts you in default. Lenders use this; you should too.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Taking a loan for a productive reason and then spending part of it on something else. A KSh 60,000 loan of which KSh 45,000 buys the bike and KSh 15,000 disappears is not a productive loan — it is a productive loan with a hole in it, and the hole is charged interest at the same rate for the same twelve months.\n\nIf you borrow for a purpose, spend all of it on that purpose, the same day.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "List every debt you currently hold, the balance, and what the money originally bought. Be honest about the ones where you cannot remember.",
            "Mark each one: builds, protects, or eats. Pay the \"eats\" ones down first, hardest.",
            "Add up your monthly repayments and divide by your monthly income. If it is above a third, take no new credit until it is not.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Before borrowing, ask what the money becomes — if it becomes nothing, the loan is not expensive, it is pointless.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "\"Epuka deni\" ni ushauri kwa watu ambao tayari wanamiliki vifaa vyao. Mwendeshaji anayekataa mkopo wote anaweza kuendesha pikipiki ya kukodi kwa miaka kumi na asimiliki chochote mwishoni, wakati mwendeshaji aliyekopa kwa uangalifu anamiliki mbili.\n\nSwali la msaada si kama ukope. Ni pesa iliyokopwa inageuka kuwa nini.\n\nPesa iliyokopwa kununua pikipiki unayokodi sasa inakuwa mali inayolipa mkopo kisha inaendelea kukulipa. Pesa iliyokopwa kwa wikendi haiwi chochote, nawe unaendelea kuilipia miezi sita. Mkopeshaji yule yule, kiwango kile kile, matokeo tofauti kabisa.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Deni linalojenga hununua kitu kinachozalisha",
              detail:
                "Pikipiki yenyewe, pikipiki ya pili, sanduku la mizigo linalokuwezesha kubeba vifurushi, simu inayokuingiza kwenye jukwaa la kuagiza safari. Hivi hulipa malipo yake kisha huendelea kuzalisha baada ya la mwisho.",
            },
            {
              title: "Deni linalolinda pia linastahili kuchukuliwa",
              detail:
                "Kukopa kulipia bili ya hospitali au kumweka mtoto shuleni si matumizi. Mbadala wake — mtoto aliyeondolewa shule au ugonjwa usiotibiwa — hugharimu zaidi maishani kuliko riba.",
            },
            {
              title: "Deni linalokula hununua kitu kilichokwisha",
              detail:
                "Kamari, usiku wa starehe, simu mpya, kuongeza mkopo mwingine. Kitu kimeisha na malipo hayajaisha. Hapa ndipo karibu mikopo yote ya kidijitali huenda, na ndiyo sababu salio halishuki kamwe.",
            },
            {
              title: "Kulipa mkopo mmoja kwa mwingine ndiyo ishara ya hatari",
              detail:
                "Mara unapokopa kwa mkopeshaji B kulipa mkopeshaji A, umeacha kusimamia deni na umeanza kulizungusha. Simama, orodhesha kila unachodaiwa, na ushughulikie kidogo zaidi au ghali zaidi kwanza — si kwa mkopo mwingine.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 60,000 zile zile, zilizokopwa mara mbili",
          ledger: [
            { label: "Zilizokopwa kununua pikipiki unayokodi sasa", value: "KSh 60,000" },
            { label: "Kodi isiyolipwa tena, kwa mwezi", value: "+ KSh 9,000" },
            { label: "Malipo ya mkopo, kwa mwezi", value: "− KSh 5,800" },
            { label: "Faida kila mwezi, na unamiliki pikipiki", value: "+ KSh 3,200", total: true },
            { label: "Zilizokopwa na kutumika kwa matumizi", value: "KSh 60,000" },
            { label: "Zinazozalisha", value: "KSh 0" },
            { label: "Hasara kila mwezi kwa miezi 12", value: "− KSh 5,800", total: true },
          ],
          note: "Mkopo unaofanana, riba inayofanana. Toleo moja linakulipa KSh 3,200 kwa mwezi na linakuacha ukimiliki mali; lingine linachukua KSh 5,800 kwa mwezi na linakuacha bila kitu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Mali (asset)",
              definition:
                "Kitu kinachoweka pesa mfukoni mwako au kinachokuokoa gharama uliyokuwa ukilipa tayari. Pikipiki ni mali. Simu inayotumika kwa mitandao ya kijamii pekee si mali.",
            },
            {
              term: "Kurundika madeni",
              definition:
                "Kushikilia mikopo kadhaa kwa pamoja, mara nyingi ukikopa kwa mmoja kulipa mwingine. Njia ya kawaida zaidi kutoka tatizo linaloweza kudhibitiwa hadi lisiloweza.",
            },
            {
              term: "Uwiano wa malipo ya deni",
              definition:
                "Sehemu ya kipato chako inayoenda kwa malipo ya mikopo. Zaidi ya theluthi moja, wiki moja ya biashara ndogo inakuweka kwenye kushindwa kulipa. Wakopeshaji hutumia hii; nawe unastahili.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuchukua mkopo kwa sababu ya uzalishaji kisha kutumia sehemu yake kwa kitu kingine. Mkopo wa KSh 60,000 ambapo KSh 45,000 zinanunua pikipiki na KSh 15,000 zinapotea si mkopo wa uzalishaji — ni mkopo wa uzalishaji wenye tundu, na tundu linatozwa riba kwa kiwango kile kile kwa miezi ile ile kumi na miwili.\n\nUkikopa kwa kusudi, tumia yote kwa kusudi hilo, siku ile ile.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Orodhesha kila deni ulilo nalo sasa, salio, na pesa ilinunua nini awali. Kuwa mkweli kuhusu yale usiyoyakumbuka.",
            "Weka alama kwa kila moja: linajenga, linalinda, au linakula. Lipa yale yanayokula kwanza, kwa nguvu zaidi.",
            "Jumlisha malipo yako ya mwezi na ugawanye kwa kipato chako cha mwezi. Ikiwa ni zaidi ya theluthi, usichukue mkopo mpya hadi isiwe.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Kabla ya kukopa, uliza pesa itakuwa nini — ikiwa haitakuwa chochote, mkopo si ghali, hauna maana.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "\"Epuka deni\" ni advice kwa watu tayari wanamiliki tools zao. Dere anakataa credit yote anaweza kuride pikipiki ya kukodi kwa miaka kumi na asimiliki kitu mwisho, wakati dere alikopa carefully anamiliki mbili.\n\nSwali ya maana si kama ukope. Ni doo imekopwa inageuka kuwa nini.\n\nDoo imekopwa kununua pikipiki unakodi saa hii inakuwa asset inalipa loan halafu inaendelea kukulipa. Doo imekopwa kwa weekend haikui kitu, na unaendelea kuilipia miezi sita. Lender yule yule, rate ile ile, outcome tofauti kabisa.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Deni inajenga inanunua kitu kinaearn",
              detail:
                "Pikipiki yenyewe, pikipiki ya pili, carrier box inakuwezesha kubeba delivery, simu inakuingiza kwa ride-hailing platform. Hizi zinalipa instalment yake halafu zinaendelea kuearn baada ya ya mwisho.",
            },
            {
              title: "Deni inaprotect pia inastahili kuchukuliwa",
              detail:
                "Kukopa kulipa bill ya hospital ama kuweka mtoto school si consumption. Alternative — mtoto ametolewa school ama ugonjwa haujatibiwa — inacost zaidi maishani kuliko interest.",
            },
            {
              title: "Deni inakula inanunua kitu kimeisha",
              detail:
                "Betting, usiku wa raha, simu mpya, kutop up loan ingine. Kitu kimeisha na repayment haijaisha. Hapa ndio karibu borrowing yote ya digital inaenda, na ndio maana balance haishuki kamwe.",
            },
            {
              title: "Kulipa loan moja na ingine ndio warning sign",
              detail:
                "Moment unakopa kwa lender B kulipa lender A, umeacha kumanage deni na umeanza kuiroll. Simama, list kila unadaiwa, na udeal na ndogo zaidi ama expensive zaidi kwanza — si kwa loan ingine.",
            },
          ],
        },
        {
          kind: "example",
          heading: "KSh 60,000 zile zile, zimekopwa mara mbili",
          ledger: [
            { label: "Zimekopwa kununua pikipiki unakodi saa hii", value: "KSh 60,000" },
            { label: "Rent hailipwi tena, kwa mwezi", value: "+ KSh 9,000" },
            { label: "Loan instalment, kwa mwezi", value: "− KSh 5,800" },
            { label: "Uko poa kila mwezi, na unamiliki pikipiki", value: "+ KSh 3,200", total: true },
            { label: "Zimekopwa na kutumika kwa consumption", value: "KSh 60,000" },
            { label: "Zinaearn", value: "KSh 0" },
            { label: "Uko down kila mwezi kwa miezi 12", value: "− KSh 5,800", total: true },
          ],
          note: "Loan inafanana, interest inafanana. Version moja inakulipa KSh 3,200 kwa mwezi na inakuacha unamiliki asset; ingine inachukua KSh 5,800 kwa mwezi na inakuacha bila kitu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Asset",
              definition:
                "Kitu kinaweka doo kwa mfuko yako ama kinakuokoa cost ulikuwa unalipa tayari. Pikipiki ni asset. Simu inatumika kwa socials pekee si asset.",
            },
            {
              term: "Debt stacking",
              definition:
                "Kushikilia loans kadhaa kwa pamoja, mara nyingi ukikopa kwa moja kuservice ingine. Route ya kawaida zaidi kutoka problem inamanageable hadi isiyomanageable.",
            },
            {
              term: "Debt service ratio",
              definition:
                "Share ya income yako inaenda kwa loan repayments. Juu ya third, wiki moja ya mchezo mbaya inakuweka kwa default. Lenders wanatumia hii; na wewe unastahili.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kuchukua loan kwa reason ya productive halafu kutumia sehemu yake kwa kitu kingine. Loan ya KSh 60,000 ambapo KSh 45,000 inanunua pikipiki na KSh 15,000 inapotea si loan ya productive — ni loan ya productive ina tundu, na tundu inacharged interest kwa rate ile ile kwa miezi ile ile kumi na mbili.\n\nUkikopa kwa purpose, tumia yote kwa hiyo purpose, siku hiyo hiyo.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "List kila deni uko nayo saa hii, balance, na doo ilinunua nini originally. Kuwa mkweli kuhusu zile hukumbuki.",
            "Mark kila moja: inajenga, inaprotect, ama inakula. Lipa zile zinakula kwanza, kwa nguvu zaidi.",
            "Add repayments zako za mwezi na udivide kwa income yako ya mwezi. Kama iko juu ya third, usichukue credit mpya hadi isiwe.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Kabla ya kukopa, uliza doo itakuwa nini — kama haitakuwa kitu, loan si expensive, haina maana.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── CRE-3 ──
  {
    code: "CRE-3",
    durationMin: 6,
    summary: {
      En: "A clean repayment record is the cheapest asset you will ever build, and the only thing that moves you from 15% a month to 14% a year.",
      Sw: "Rekodi safi ya malipo ni mali rahisi zaidi utakayowahi kujenga, na kitu pekee kinachokutoa 15% kwa mwezi hadi 14% kwa mwaka.",
      Sh: "Record safi ya repayment ni asset cheap zaidi utawahi kujenga, na kitu pekee kinakutoa 15% kwa mwezi hadi 14% kwa year.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Two riders walk into the same SACCO on the same morning asking for KSh 80,000. One has twelve months of payments made on the date they were due. The other has three defaults from a digital app, each for less than KSh 2,000.\n\nThe first gets the money at 14% a year. The second is declined, and ends up at a shylock charging 15% a month.\n\nThe difference between those two outcomes, over one loan, is more than KSh 30,000. Neither rider earned more than the other. One simply had a record.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Every repayment is reported, including the small ones",
              detail:
                "Kenyan lenders report to credit reference bureaus. A KSh 500 digital loan you forgot about sits on the same report a SACCO reads before approving KSh 200,000. Size does not protect you.",
            },
            {
              title: "Paying on the due date is what counts, not paying eventually",
              detail:
                "A loan cleared three months late is recorded as three months late forever, even though it was cleared. If you cannot pay in full, pay something on the date and talk to the lender.",
            },
            {
              title: "A listing does not vanish when you clear the debt",
              detail:
                "Clearing a default updates the status but the history stays visible for several years. This is why the cheap move is never missing in the first place, not fixing it afterwards.",
            },
            {
              title: "You can build a record on purpose",
              detail:
                "Join a SACCO, save consistently for six months, take a small loan you could have paid cash for, and repay it exactly on schedule. You have now manufactured the thing that makes the next loan cheap.",
            },
          ],
        },
        {
          kind: "example",
          heading: "What a clean record is worth on one KSh 80,000 loan",
          ledger: [
            { label: "Clean record — SACCO, 14% a year reducing", value: "KSh 86,200 repaid" },
            { label: "Thin record — microfinance, 3.5% flat monthly", value: "KSh 113,600 repaid" },
            { label: "Listed as a defaulter — informal lender", value: "KSh 140,000+ repaid" },
            { label: "What the record alone saves you", value: "KSh 54,000", total: true },
          ],
          note: "That is not interest you negotiated down. It is interest you were never charged, because of payments you made on time on loans that were already behind you.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Credit reference bureau (CRB)",
              definition:
                "A licensed company that collects your repayment history from every lender and sells it back to them. In Kenya: TransUnion, Metropol and Creditinfo.",
            },
            {
              term: "Clearance certificate",
              definition:
                "A document from a bureau confirming you have no outstanding defaults. Many lenders ask for one. You are entitled to your own report free once a year.",
            },
            {
              term: "Guarantor",
              definition:
                "A SACCO member who agrees to repay your loan if you do not. Their record is on the line with yours — defaulting costs you a friendship as well as a rating.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Treating small digital loans as not real borrowing. An app that lends KSh 1,000 with a tap feels like nothing, and a missed repayment feels like less. It is reported identically to a KSh 500,000 bank loan.\n\nRiders are refused SACCO credit over forgotten app balances more often than over any other single cause. Before you apply for anything serious, pull your own report and clear whatever is sitting on it.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Request your free credit report from one of the three bureaus. Read every line, including the ones you do not recognise.",
            "Clear any small outstanding balance you find, however old, and keep the confirmation message.",
            "Set a reminder two days before every repayment date you currently have. Being early costs nothing and is recorded the same as being on time.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Your repayment history is the collateral you build for free — protect it the way you would protect the bike.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Waendeshaji wawili wanaingia SACCO ile ile asubuhi ile ile wakiomba KSh 80,000. Mmoja ana miezi kumi na miwili ya malipo yaliyofanyika tarehe iliyopangwa. Mwingine ana kushindwa kulipa mara tatu kutoka programu ya simu, kila moja chini ya KSh 2,000.\n\nWa kwanza anapata pesa kwa 14% kwa mwaka. Wa pili anakataliwa, na anaishia kwa mkopeshaji wa kienyeji anayetoza 15% kwa mwezi.\n\nTofauti kati ya matokeo hayo mawili, kwa mkopo mmoja, ni zaidi ya KSh 30,000. Hakuna mwendeshaji aliyepata zaidi ya mwingine. Mmoja alikuwa tu na rekodi.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Kila malipo yanaripotiwa, hata madogo",
              detail:
                "Wakopeshaji wa Kenya huripoti kwa ofisi za marejeleo ya mkopo. Mkopo wa kidijitali wa KSh 500 uliousahau upo kwenye ripoti ile ile SACCO inayosoma kabla ya kuidhinisha KSh 200,000. Ukubwa haukulindi.",
            },
            {
              title: "Kulipa tarehe iliyopangwa ndiko kunakohesabika, si kulipa hatimaye",
              detail:
                "Mkopo uliomalizwa miezi mitatu kwa kuchelewa unarekodiwa kama miezi mitatu ya kuchelewa milele, hata ukiwa umemalizwa. Usipoweza kulipa yote, lipa kitu tarehe hiyo na uzungumze na mkopeshaji.",
            },
            {
              title: "Orodha haitoweki unapomaliza deni",
              detail:
                "Kumaliza deni kunabadilisha hali lakini historia inabaki kuonekana kwa miaka kadhaa. Ndiyo sababu hatua ya bei nafuu ni kutokukosa kabisa mwanzoni, si kurekebisha baadaye.",
            },
            {
              title: "Unaweza kujenga rekodi kwa makusudi",
              detail:
                "Jiunge na SACCO, weka akiba mfululizo kwa miezi sita, chukua mkopo mdogo ambao ungeweza kulipa taslimu, na ulipe kwa ratiba kamili. Sasa umetengeneza kitu kinachofanya mkopo ujao kuwa wa bei nafuu.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Rekodi safi ina thamani gani kwa mkopo mmoja wa KSh 80,000",
          ledger: [
            { label: "Rekodi safi — SACCO, 14% kwa mwaka inayopungua", value: "KSh 86,200 zilizolipwa" },
            { label: "Rekodi hafifu — taasisi ndogo, 3.5% tambarare kwa mwezi", value: "KSh 113,600 zilizolipwa" },
            { label: "Umeorodheshwa — mkopeshaji wa kienyeji", value: "KSh 140,000+ zilizolipwa" },
            { label: "Rekodi pekee inakuokoa", value: "KSh 54,000", total: true },
          ],
          note: "Hiyo si riba uliyopunguza kwa mazungumzo. Ni riba usiyotozwa kamwe, kwa sababu ya malipo uliyofanya kwa wakati kwa mikopo iliyokuwa tayari nyuma yako.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Ofisi ya marejeleo ya mkopo (CRB)",
              definition:
                "Kampuni yenye leseni inayokusanya historia yako ya malipo kutoka kwa kila mkopeshaji na kuwauzia tena. Nchini Kenya: TransUnion, Metropol na Creditinfo.",
            },
            {
              term: "Cheti cha kibali",
              definition:
                "Hati kutoka ofisi inayothibitisha huna madeni yaliyoshindwa kulipwa. Wakopeshaji wengi huomba. Una haki ya kupata ripoti yako mwenyewe bure mara moja kwa mwaka.",
            },
            {
              term: "Mdhamini",
              definition:
                "Mwanachama wa SACCO anayekubali kulipa mkopo wako usipolipa. Rekodi yake iko hatarini pamoja na yako — kushindwa kulipa kunakugharimu urafiki pamoja na daraja.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuchukulia mikopo midogo ya kidijitali kama si ukopaji halisi. Programu inayokopesha KSh 1,000 kwa kubonyeza inahisi kama si kitu, na malipo yaliyokosekana yanahisi kama kidogo zaidi. Yanaripotiwa sawasawa na mkopo wa benki wa KSh 500,000.\n\nWaendeshaji hukataliwa mkopo wa SACCO kwa sababu ya salio la programu lililosahaulika mara nyingi zaidi kuliko sababu nyingine yoyote moja. Kabla ya kuomba chochote kikubwa, chukua ripoti yako mwenyewe na umalize chochote kilichopo.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Omba ripoti yako ya mkopo bure kutoka mojawapo ya ofisi tatu. Soma kila mstari, hata usiouelewa.",
            "Maliza salio lolote dogo unalolipata, hata la zamani, na uhifadhi ujumbe wa uthibitisho.",
            "Weka kikumbusho siku mbili kabla ya kila tarehe ya malipo uliyo nayo sasa. Kulipa mapema hakugharimu kitu na kunarekodiwa sawa na kulipa kwa wakati.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Historia yako ya malipo ni dhamana unayojenga bure — ilinde jinsi ungeilinda pikipiki.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Madere wawili wanaingia SACCO ile ile asubuhi ile ile wakiomba KSh 80,000. Mmoja ana miezi kumi na mbili ya payments zimefanyika date ilipangwa. Mwingine ana defaults tatu kutoka app, kila moja chini ya KSh 2,000.\n\nWa kwanza anapata doo kwa 14% kwa year. Wa pili anakataliwa, na anaishia kwa shylock anacharge 15% kwa mwezi.\n\nTofauti kati ya hizo outcomes mbili, kwa loan moja, ni zaidi ya KSh 30,000. Hakuna dere alimake zaidi ya mwingine. Mmoja alikuwa tu na record.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Kila repayment inareportiwa, hata ndogo",
              detail:
                "Lenders wa Kenya wanareport kwa credit reference bureaus. Loan ya digital ya KSh 500 ulisahau iko kwa report ile ile SACCO inasoma kabla ya kuapprove KSh 200,000. Size haikuprotect.",
            },
            {
              title: "Kulipa due date ndio inacount, si kulipa eventually",
              detail:
                "Loan umeclear miezi mitatu late inarecordiwa kama miezi mitatu late forever, hata ukiwa umeclear. Usipoweza kulipa yote, lipa kitu hiyo date na uongee na lender.",
            },
            {
              title: "Listing haipotei ukiclear deni",
              detail:
                "Kuclear default inaupdate status lakini history inabaki inaonekana kwa miaka kadhaa. Ndio maana move cheap ni kutokukosa kabisa mwanzoni, si kufix baadaye.",
            },
            {
              title: "Unaweza kujenga record kwa makusudi",
              detail:
                "Join SACCO, save consistently kwa miezi sita, chukua loan ndogo ungeweza kulipa cash, na uilipe exactly kwa schedule. Saa hii umetengeneza kitu kinafanya loan ijayo iwe cheap.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Record safi ina thamani gani kwa loan moja ya KSh 80,000",
          ledger: [
            { label: "Record safi — SACCO, 14% kwa year reducing", value: "KSh 86,200 umelipa" },
            { label: "Record hafifu — microfinance, 3.5% flat kwa mwezi", value: "KSh 113,600 umelipa" },
            { label: "Umelistiwa kama defaulter — informal lender", value: "KSh 140,000+ umelipa" },
            { label: "Record pekee inakuokoa", value: "KSh 54,000", total: true },
          ],
          note: "Hiyo si interest ulinegotiate ishuke. Ni interest hukuwahi kuchargiwa, juu ya payments ulifanya on time kwa loans zilikuwa tayari nyuma yako.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Credit reference bureau (CRB)",
              definition:
                "Kampuni ina licence inacollect repayment history yako kutoka kwa kila lender na kuwauzia tena. Kenya: TransUnion, Metropol na Creditinfo.",
            },
            {
              term: "Clearance certificate",
              definition:
                "Document kutoka bureau inaconfirm huna defaults outstanding. Lenders wengi wanaomba. Una haki ya report yako mwenyewe bure mara moja kwa year.",
            },
            {
              term: "Guarantor",
              definition:
                "Member wa SACCO anakubali kulipa loan yako usipolipa. Record yake iko kwa line na yako — kudefault inakucost urafiki pamoja na rating.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kutreat loans ndogo za digital kama si borrowing real. App inakopesha KSh 1,000 kwa tap inafeel kama si kitu, na repayment imekosekana inafeel kama kidogo zaidi. Inareportiwa sawasawa na bank loan ya KSh 500,000.\n\nMadere wanakataliwa SACCO credit juu ya app balance imesahaulika mara nyingi zaidi kuliko cause ingine yoyote moja. Kabla uapply kitu serious, pull report yako mwenyewe na uclear chochote kiko ndani.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Request credit report yako bure kutoka moja ya hizo bureaus tatu. Soma kila line, hata zile hutambui.",
            "Clear balance yoyote ndogo unapata, hata ya zamani, na ukeep confirmation message.",
            "Weka reminder siku mbili kabla ya kila repayment date uko nayo saa hii. Kulipa mapema haicost kitu na inarecordiwa sawa na on time.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Repayment history yako ni collateral unajenga bure — ilinde vile ungelinda pikipiki.",
        },
      ],
    },
  },
];
