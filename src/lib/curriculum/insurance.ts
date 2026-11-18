import type { LessonEnrichment } from "./types";

/**
 * Module 4 — Insurance.
 *
 * The hardest module to teach, because the product only proves its worth on
 * a day nobody wants to imagine. The approach here is to make the arithmetic
 * of pooling concrete, name the covers a rider specifically needs, and then
 * — the part that is almost never taught — show how to make a claim that
 * actually gets paid.
 */
export const INSURANCE_LESSONS: LessonEnrichment[] = [
  // ───────────────────────────────────────────────────────────────── INS-1 ──
  {
    code: "INS-1",
    durationMin: 6,
    summary: {
      En: "Many people each pay a small, survivable amount so that the few who are hit by something ruinous are made whole.",
      Sw: "Watu wengi kila mmoja hulipa kiasi kidogo kinachovumilika ili wachache wanaopatwa na jambo baya warudishwe.",
      Sh: "Watu wengi kila mmoja analipa amount ndogo inavumilika ili wachache wanapatwa na kitu kibaya warudishwe.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Most riders describe insurance the same way: \"I paid for three years and got nothing back.\" That sentence is the whole misunderstanding, and it is worth taking seriously rather than dismissing.\n\nInsurance is not savings. You are not meant to get it back. What you bought was the certainty that one bad afternoon could not end your business — and for three years, you got exactly that.\n\nThink of it as the stage. Every rider contributes to the stage fund. Most never draw on it. But when one rider is knocked down on Thika Road, the fund is there, and the reason it is there is that everyone paid while nothing was wrong. Insurance is the same arrangement, at national scale, with the arithmetic written down.",
        },
        {
          kind: "points",
          heading: "The idea, broken down",
          points: [
            {
              title: "Pooling turns a ruinous loss into a survivable cost",
              detail:
                "One rider cannot absorb a KSh 400,000 third-party claim. Ten thousand riders paying KSh 500 a month can absorb several of them a year without any single person being harmed.",
            },
            {
              title: "The premium is priced on the chance of the event, not on you",
              detail:
                "Insurers count how often a thing happens across thousands of riders and divide. That is why boda cover costs more than private car cover — the arithmetic says so, not the insurer's opinion of you.",
            },
            {
              title: "Not claiming is the good outcome",
              detail:
                "A year where you pay the premium and nothing happens is the year you wanted. Judging insurance by whether you claimed is like judging a helmet by whether you crashed.",
            },
            {
              title: "The excess is your share of every claim",
              detail:
                "Most policies make you pay the first slice — often KSh 5,000 to KSh 20,000. It keeps premiums down and it means very small damage is not worth claiming for. Know your excess before you need it.",
            },
          ],
        },
        {
          kind: "example",
          heading: "A pool of 1,000 riders, one year",
          ledger: [
            { label: "Each rider pays per month", value: "KSh 500" },
            { label: "Collected across the year", value: "KSh 6,000,000" },
            { label: "Serious claims in the year — 14 riders", value: "− KSh 4,200,000" },
            { label: "Administration and reinsurance", value: "− KSh 1,500,000" },
            { label: "Left in the pool", value: "KSh 300,000", total: true },
          ],
          note: "986 riders paid KSh 6,000 and claimed nothing. 14 riders faced an average KSh 300,000 loss and did not lose the bike, the business or the house. Every one of the 986 bought that same protection — they simply did not need to use it.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Premium",
              definition:
                "What you pay, monthly or yearly, to stay covered. Stop paying and the cover stops — usually immediately, not at the end of the year.",
            },
            {
              term: "Excess",
              definition:
                "The first part of any claim that you pay yourself. A higher excess means a lower premium, and the opposite.",
            },
            {
              term: "Sum insured",
              definition:
                "The maximum the insurer will pay. If your bike is insured for KSh 120,000 and is written off, that is the ceiling — not what you paid for it.",
            },
            {
              term: "Exclusion",
              definition:
                "A situation the policy does not cover: riding without a valid licence, carrying more passengers than permitted, riding under the influence. Read these before you need them, never after.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Letting a policy lapse for one month to free up cash, and riding anyway. Cover does not pause — it ends. An accident in that month is uninsured in full, and because riding uninsured is also an offence, you face the claim and a penalty at the same time.\n\nIf the premium is genuinely unaffordable, reduce the cover or raise the excess with the insurer. Both keep you legal and protected. Silence does neither.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Find your policy document — paper or SMS — and write down three things: expiry date, excess, and sum insured.",
            "Set a reminder two weeks before expiry. Lapses almost always happen because nobody remembered, not because nobody could pay.",
            "Read the exclusions section once, slowly. It is the shortest and most valuable page in the document.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "You are not buying a refund — you are buying the certainty that one bad afternoon cannot end the business.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Waendeshaji wengi hueleza bima kwa njia ile ile: \"Nililipa miaka mitatu na sikupata chochote.\" Sentensi hiyo ndiyo kutoelewana kote, na inastahili kuchukuliwa kwa uzito badala ya kupuuzwa.\n\nBima si akiba. Haikusudiwi kuirudisha. Ulichonunua ni uhakika kwamba mchana mmoja mbaya hauwezi kumaliza biashara yako — na kwa miaka mitatu, ulipata hasa hivyo.\n\nFikiria kama kituo. Kila mwendeshaji anachangia mfuko wa kituo. Wengi hawatumii kamwe. Lakini mwendeshaji mmoja anapogongwa Thika Road, mfuko upo, na sababu upo ni kwamba kila mtu alilipa wakati hakuna tatizo. Bima ni mpango ule ule, kwa kiwango cha kitaifa, na hesabu zimeandikwa.",
        },
        {
          kind: "points",
          heading: "Wazo, limegawanywa",
          points: [
            {
              title: "Kuchangia pamoja kunageuza hasara mbaya kuwa gharama inayovumilika",
              detail:
                "Mwendeshaji mmoja hawezi kubeba dai la mtu wa tatu la KSh 400,000. Waendeshaji elfu kumi wanaolipa KSh 500 kwa mwezi wanaweza kubeba madai kadhaa kwa mwaka bila mtu yeyote kudhurika.",
            },
            {
              title: "Malipo yanapangwa kwa nafasi ya tukio, si kwako",
              detail:
                "Kampuni za bima huhesabu mara ngapi jambo hutokea kwa maelfu ya waendeshaji na kugawanya. Ndiyo sababu bima ya boda inagharimu zaidi ya bima ya gari binafsi — hesabu ndiyo inasema hivyo, si maoni ya kampuni kukuhusu.",
            },
            {
              title: "Kutodai ndiyo matokeo mazuri",
              detail:
                "Mwaka unaolipa malipo na hakuna kinachotokea ndio mwaka uliotaka. Kuhukumu bima kwa kama ulidai ni kama kuhukumu kofia ya chuma kwa kama uliangukia.",
            },
            {
              title: "Kiasi cha kwanza ni sehemu yako ya kila dai",
              detail:
                "Sera nyingi zinakufanya ulipe kipande cha kwanza — mara nyingi KSh 5,000 hadi KSh 20,000. Hupunguza malipo na inamaanisha uharibifu mdogo sana haustahili kudaiwa. Jua kiasi chako cha kwanza kabla hujakihitaji.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Kundi la waendeshaji 1,000, mwaka mmoja",
          ledger: [
            { label: "Kila mwendeshaji hulipa kwa mwezi", value: "KSh 500" },
            { label: "Zilizokusanywa mwaka mzima", value: "KSh 6,000,000" },
            { label: "Madai makubwa mwakani — waendeshaji 14", value: "− KSh 4,200,000" },
            { label: "Uendeshaji na bima ya ziada", value: "− KSh 1,500,000" },
            { label: "Zilizobaki kwenye mfuko", value: "KSh 300,000", total: true },
          ],
          note: "Waendeshaji 986 walilipa KSh 6,000 na hawakudai chochote. Waendeshaji 14 walikabiliwa na hasara ya wastani ya KSh 300,000 na hawakupoteza pikipiki, biashara wala nyumba. Kila mmoja wa hao 986 alinunua ulinzi ule ule — hawakuhitaji kuutumia tu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Malipo ya bima (premium)",
              definition:
                "Unacholipa, kila mwezi au mwaka, ili ubaki na bima. Ukiacha kulipa bima inasimama — mara nyingi papo hapo, si mwisho wa mwaka.",
            },
            {
              term: "Kiasi cha kwanza (excess)",
              definition:
                "Sehemu ya kwanza ya dai lolote unayolipa mwenyewe. Kiasi kikubwa cha kwanza kinamaanisha malipo madogo, na kinyume chake.",
            },
            {
              term: "Kiasi kilicholindwa",
              definition:
                "Kikomo cha juu kampuni itakacholipa. Pikipiki yako ikiwa imelindwa kwa KSh 120,000 na ikaharibika kabisa, hicho ndicho kikomo — si ulicholipia.",
            },
            {
              term: "Vizuizi (exclusion)",
              definition:
                "Hali ambayo sera hailindi: kuendesha bila leseni halali, kubeba abiria zaidi ya ruhusa, kuendesha ukiwa umelewa. Soma hivi kabla hujavihitaji, kamwe si baadaye.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kuacha sera iishe kwa mwezi mmoja ili kupata pesa, kisha kuendesha hata hivyo. Bima haisimami kwa muda — inaisha. Ajali mwezi huo haina bima hata kidogo, na kwa sababu kuendesha bila bima pia ni kosa, unakabiliwa na dai na adhabu kwa pamoja.\n\nIkiwa malipo hayamudiki kweli, punguza kiwango cha bima au ongeza kiasi cha kwanza na kampuni. Vyote vinakuweka kihalali na ukilindwa. Ukimya haufanyi lolote kati ya hayo.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Tafuta hati yako ya bima — karatasi au ujumbe — na uandike vitu vitatu: tarehe ya kuisha, kiasi cha kwanza, na kiasi kilicholindwa.",
            "Weka kikumbusho wiki mbili kabla ya kuisha. Bima huisha karibu kila wakati kwa sababu hakuna aliyekumbuka, si kwa sababu hakuna angeweza kulipa.",
            "Soma sehemu ya vizuizi mara moja, polepole. Ndiyo ukurasa mfupi zaidi na wenye thamani zaidi kwenye hati.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Hununui marejesho — unanunua uhakika kwamba mchana mmoja mbaya hauwezi kumaliza biashara.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Madere wengi wanaexplain bima kwa njia ile ile: \"Nililipa miaka mitatu na sikupata kitu.\" Hiyo sentence ndio misunderstanding yote, na inastahili kuchukuliwa seriously badala ya kudismissiwa.\n\nBima si savings. Haitakiwi kuirudisha. Ulinunua ni certainty ati mchana mmoja mbaya hauwezi kumaliza biz yako — na kwa miaka mitatu, ulipata exactly hiyo.\n\nFikiria kama base. Kila dere anachangia base fund. Wengi hawaitumii kamwe. Lakini dere mmoja akigongwa Thika Road, fund iko, na reason iko ni ati kila mtu alilipa wakati hakuna shida. Bima ni arrangement ile ile, kwa level ya national, na hesabu zimeandikwa.",
        },
        {
          kind: "points",
          heading: "Idea, imebreak down",
          points: [
            {
              title: "Kuchangia pamoja inageuza loss mbaya ikue cost inavumilika",
              detail:
                "Dere mmoja hawezi kubeba third-party claim ya KSh 400,000. Madere elfu kumi wanalipa KSh 500 kwa mwezi wanaweza kubeba claims kadhaa kwa year bila mtu yeyote kudhurika.",
            },
            {
              title: "Premium inapricewa kwa chance ya tukio, si kwako",
              detail:
                "Insurers wanacount mara ngapi kitu kinafanyika kwa maelfu ya madere na kudivide. Ndio maana boda cover inacost zaidi ya private car cover — hesabu ndio inasema, si opinion ya insurer kukuhusu.",
            },
            {
              title: "Kutoclaim ndio outcome poa",
              detail:
                "Year unalipa premium na hakuna kinafanyika ndio year ulitaka. Kujudge bima kwa kama uliclaim ni kama kujudge helmet kwa kama ulicrash.",
            },
            {
              title: "Excess ni share yako ya kila claim",
              detail:
                "Policies nyingi zinakufanya ulipe slice ya kwanza — mara nyingi KSh 5,000 hadi KSh 20,000. Inapunguza premium na inamaanisha damage ndogo sana haistahili kuclaimiwa. Jua excess yako kabla uihitaji.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Pool ya madere 1,000, year moja",
          ledger: [
            { label: "Kila dere analipa kwa mwezi", value: "KSh 500" },
            { label: "Imecollectiwa year nzima", value: "KSh 6,000,000" },
            { label: "Claims kubwa year hii — madere 14", value: "− KSh 4,200,000" },
            { label: "Admin na reinsurance", value: "− KSh 1,500,000" },
            { label: "Imebaki kwa pool", value: "KSh 300,000", total: true },
          ],
          note: "Madere 986 walilipa KSh 6,000 na hawakuclaim kitu. Madere 14 walikabiliwa na loss ya average KSh 300,000 na hawakupoteza pikipiki, biz ama nyumba. Kila mmoja wa hao 986 alinunua protection ile ile — hawakuhitaji kuitumia tu.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Premium",
              definition:
                "Unacholipa, kila mwezi ama year, ili ubaki covered. Ukiacha kulipa cover inasimama — mara nyingi papo hapo, si mwisho wa year.",
            },
            {
              term: "Excess",
              definition:
                "Sehemu ya kwanza ya claim yoyote unalipa mwenyewe. Excess kubwa inamaanisha premium ndogo, na kinyume chake.",
            },
            {
              term: "Sum insured",
              definition:
                "Maximum insurer italipa. Pikipiki yako ikiwa insured kwa KSh 120,000 na iharibike kabisa, hiyo ndio ceiling — si ulilipia ngapi.",
            },
            {
              term: "Exclusion",
              definition:
                "Hali ambayo policy haicover: kuride bila licence halali, kubeba abiria zaidi ya ruhusa, kuride umelewa. Soma hizi kabla uzihitaji, si baadaye kamwe.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kuacha policy ilapse kwa mwezi mmoja ili upate cash, halafu uride bado. Cover haipause — inaisha. Ajali hiyo month haina bima kabisa, na juu kuride bila bima pia ni kosa, unakabiliwa na claim na penalty kwa pamoja.\n\nKama premium haimudiki kwa ukweli, punguza cover ama ongeza excess na insurer. Zote zinakuweka legal na protected. Ukimya haufanyi yoyote kati ya hizo.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Tafuta policy document yako — karatasi ama SMS — na uandike vitu vitatu: expiry date, excess, na sum insured.",
            "Weka reminder wiki mbili kabla ya expiry. Lapses karibu kila time zinafanyika juu hakuna alikumbuka, si juu hakuna angeweza kulipa.",
            "Soma section ya exclusions mara moja, polepole. Ndio page fupi zaidi na ina thamani zaidi kwa document.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Hununui refund — unanunua certainty ati mchana mmoja mbaya hauwezi kumaliza biz.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── INS-2 ──
  {
    code: "INS-2",
    durationMin: 7,
    summary: {
      En: "Third-party first because the law and the biggest losses demand it, then health, then income protection, then the bike itself.",
      Sw: "Bima ya mtu wa tatu kwanza kwa sababu sheria na hasara kubwa zinadai, kisha afya, kisha ulinzi wa kipato, kisha pikipiki yenyewe.",
      Sh: "Third-party kwanza juu sheria na losses kubwa zinadai, halafu health, halafu income protection, halafu pikipiki yenyewe.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "Riders are sold insurance in the wrong order. The product that gets pushed hardest is cover for the bike, because it is easy to explain and easy to picture. But the bike is worth KSh 120,000 and a third-party injury claim can be KSh 500,000 or more.\n\nThe right order is not the order of what you can imagine losing. It is the order of what would actually destroy you.\n\nWork down this list and stop when the money runs out. Everything above the line you reach is protecting something worth more than everything below it.",
        },
        {
          kind: "points",
          heading: "The order, and why",
          points: [
            {
              title: "First — third-party liability, which is also the law",
              detail:
                "Covers injury or death you cause to another person, and damage to their property. Riding without it is an offence, and it is the only exposure large enough to follow you for life. A judgment against you does not end when the bike is sold.",
            },
            {
              title: "Second — health cover for the household, through SHA",
              detail:
                "An inpatient admission wipes out savings faster than any accident. Registration with the Social Health Authority covers your household, and contributions are far below what one night in a ward costs.",
            },
            {
              title: "Third — personal accident, which replaces income",
              detail:
                "The cover almost nobody buys and almost every rider needs. If you break an arm, the bike is fine, the passenger is fine, and you earn nothing for three months. This pays a daily or weekly amount while you cannot ride.",
            },
            {
              title: "Fourth — the bike itself, comprehensive or theft-only",
              detail:
                "Worth having once the three above are in place. If the budget is tight, theft-only costs far less than comprehensive and covers the loss that is most likely and most total.",
            },
          ],
        },
        {
          kind: "example",
          heading: "What each one costs, and what it stands between you and",
          ledger: [
            { label: "Third-party liability — annual", value: "KSh 7,500" },
            { label: "— protects against a claim of", value: "up to KSh 3,000,000" },
            { label: "SHA household contribution — monthly", value: "from KSh 300" },
            { label: "— protects against an admission costing", value: "KSh 80,000+" },
            { label: "Personal accident — annual", value: "KSh 3,000" },
            { label: "— replaces income of about", value: "KSh 1,000/day while off the road" },
            { label: "Comprehensive bike cover — annual", value: "KSh 18,000" },
            { label: "Total for all four, per month", value: "about KSh 2,700", total: true },
          ],
          note: "KSh 2,700 a month is roughly KSh 90 a day — less than a third of what the bike burns in fuel. The first two alone, at about KSh 925 a month, remove the two risks that actually end riding careers.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Third-party only",
              definition:
                "Covers harm you cause to others, nothing of yours. The legal minimum and the cheapest cover there is.",
            },
            {
              term: "Comprehensive",
              definition:
                "Third-party plus damage to your own bike, including when the accident was your fault. Several times the price, and worth it only once the essentials are covered.",
            },
            {
              term: "Personal accident cover",
              definition:
                "Pays you a fixed amount for injury, disability or death — regardless of who was at fault. The closest thing a self-employed rider has to sick pay.",
            },
            {
              term: "SHA",
              definition:
                "The Social Health Authority, Kenya's national health insurance scheme, which replaced NHIF. Registration covers your whole household, not just you.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Buying comprehensive cover for the bike while riding on expired third-party, because comprehensive \"sounds better\". It is the exact inversion of the right order: you have protected an asset worth KSh 120,000 and left yourself exposed to a claim of several million.\n\nIf you can afford only one thing, it is third-party. If you can afford two, it is third-party and SHA. The bike comes last because the bike is the cheapest thing on the list to replace.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Check the expiry date on your third-party cover. If it is within a month, deal with it before anything else on this list.",
            "Confirm whether your household is registered with SHA, and that the details are current.",
            "Ask your SACCO whether it offers a group personal-accident scheme. Group rates through a SACCO are usually far below what you would pay alone.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Insure the claim that could ruin you before the asset you can replace: third-party, then health, then your income, then the bike.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Waendeshaji huuziwa bima kwa mpangilio usio sahihi. Bidhaa inayosukumwa zaidi ni bima ya pikipiki, kwa sababu ni rahisi kueleza na rahisi kuwazia. Lakini pikipiki ina thamani ya KSh 120,000 na dai la jeraha la mtu wa tatu linaweza kuwa KSh 500,000 au zaidi.\n\nMpangilio sahihi si mpangilio wa unachoweza kuwazia kupoteza. Ni mpangilio wa kile kingekuangamiza kweli.\n\nShuka kwenye orodha hii na usimame pesa zikiisha. Kila kilicho juu ya mstari uliofikia kinalinda kitu chenye thamani zaidi ya vyote vilivyo chini yake.",
        },
        {
          kind: "points",
          heading: "Mpangilio, na kwa nini",
          points: [
            {
              title: "Kwanza — dhima ya mtu wa tatu, ambayo pia ni sheria",
              detail:
                "Inalinda jeraha au kifo unachosababisha kwa mtu mwingine, na uharibifu wa mali yake. Kuendesha bila hii ni kosa, na ndiyo hatari pekee kubwa vya kutosha kukufuata maisha yote. Hukumu dhidi yako haiishi pikipiki inapouzwa.",
            },
            {
              title: "Pili — bima ya afya ya familia, kupitia SHA",
              detail:
                "Kulazwa hospitalini kunamaliza akiba haraka kuliko ajali yoyote. Kujiandikisha na Mamlaka ya Afya ya Jamii kunalinda familia yako, na michango iko chini sana ya gharama ya usiku mmoja wodini.",
            },
            {
              title: "Tatu — bima ya ajali binafsi, inayobadilisha kipato",
              detail:
                "Bima ambayo karibu hakuna anayeinunua na karibu kila mwendeshaji anaihitaji. Ukivunjika mkono, pikipiki iko sawa, abiria yuko sawa, nawe hupati chochote kwa miezi mitatu. Hii inalipa kiasi cha kila siku au wiki wakati huwezi kuendesha.",
            },
            {
              title: "Nne — pikipiki yenyewe, kamili au ya wizi pekee",
              detail:
                "Inastahili kuwa nayo mara tatu zilizo juu zikiwa zimewekwa. Bajeti ikiwa ngumu, ya wizi pekee inagharimu kidogo zaidi kuliko kamili na inalinda hasara inayowezekana zaidi na kamili zaidi.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Kila moja inagharimu nini, na inakukinga na nini",
          ledger: [
            { label: "Dhima ya mtu wa tatu — kwa mwaka", value: "KSh 7,500" },
            { label: "— inalinda dhidi ya dai la", value: "hadi KSh 3,000,000" },
            { label: "Mchango wa SHA wa familia — kwa mwezi", value: "kuanzia KSh 300" },
            { label: "— inalinda dhidi ya kulazwa kunakogharimu", value: "KSh 80,000+" },
            { label: "Ajali binafsi — kwa mwaka", value: "KSh 3,000" },
            { label: "— inabadilisha kipato cha takriban", value: "KSh 1,000/siku ukiwa nje ya barabara" },
            { label: "Bima kamili ya pikipiki — kwa mwaka", value: "KSh 18,000" },
            { label: "Jumla ya zote nne, kwa mwezi", value: "takriban KSh 2,700", total: true },
          ],
          note: "KSh 2,700 kwa mwezi ni takriban KSh 90 kwa siku — chini ya theluthi ya kile pikipiki inachoteketeza kwa mafuta. Mbili za kwanza pekee, kwa takriban KSh 925 kwa mwezi, zinaondoa hatari mbili zinazomaliza taaluma za kuendesha.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Mtu wa tatu pekee",
              definition:
                "Inalinda madhara unayosababisha kwa wengine, si chochote chako. Kiwango cha chini cha kisheria na bima rahisi zaidi iliyopo.",
            },
            {
              term: "Bima kamili",
              definition:
                "Mtu wa tatu pamoja na uharibifu wa pikipiki yako, hata ajali ikiwa kosa lako. Mara kadhaa ya bei, na inafaa tu mambo ya msingi yakiwa yamelindwa.",
            },
            {
              term: "Bima ya ajali binafsi",
              definition:
                "Inakulipa kiasi maalum kwa jeraha, ulemavu au kifo — bila kujali nani alikosea. Ndicho kitu cha karibu zaidi na malipo ya ugonjwa kwa mwendeshaji wa kujiajiri.",
            },
            {
              term: "SHA",
              definition:
                "Mamlaka ya Afya ya Jamii, mpango wa taifa wa bima ya afya nchini Kenya, uliochukua nafasi ya NHIF. Kujiandikisha kunalinda familia yako yote, si wewe pekee.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kununua bima kamili ya pikipiki wakati unaendesha na bima ya mtu wa tatu iliyoisha, kwa sababu kamili \"inasikika bora\". Ni ubadilishaji kamili wa mpangilio sahihi: umelinda mali yenye thamani ya KSh 120,000 na umejiacha wazi kwa dai la mamilioni kadhaa.\n\nUkiweza kumudu kitu kimoja tu, ni mtu wa tatu. Ukiweza kumudu viwili, ni mtu wa tatu na SHA. Pikipiki inakuja mwisho kwa sababu pikipiki ndicho kitu cha bei nafuu zaidi kwenye orodha kubadilisha.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Angalia tarehe ya kuisha kwa bima yako ya mtu wa tatu. Ikiwa ni ndani ya mwezi, ishughulikie kabla ya kitu kingine chochote kwenye orodha hii.",
            "Thibitisha kama familia yako imesajiliwa na SHA, na kwamba taarifa ni za sasa.",
            "Uliza SACCO yako kama inatoa mpango wa kikundi wa ajali binafsi. Viwango vya kikundi kupitia SACCO mara nyingi viko chini sana ya ungelipa peke yako.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Linda dai lingekuangamiza kabla ya mali unayoweza kubadilisha: mtu wa tatu, kisha afya, kisha kipato chako, kisha pikipiki.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Madere wanauziwa bima kwa order si sahihi. Product inapushwa zaidi ni cover ya pikipiki, juu ni rahisi kuexplain na rahisi kupicture. Lakini pikipiki ina thamani ya KSh 120,000 na third-party injury claim inaweza kuwa KSh 500,000 ama zaidi.\n\nOrder sahihi si order ya unachoweza kuimagine kupoteza. Ni order ya kitu kingekuangamiza kwa ukweli.\n\nShuka kwa list hii na usimame doo ikiisha. Kila kiko juu ya line umefika kinaprotect kitu kina thamani zaidi ya vyote viko chini yake.",
        },
        {
          kind: "points",
          heading: "Order, na kwa nini",
          points: [
            {
              title: "Kwanza — third-party liability, ambayo pia ni sheria",
              detail:
                "Inacover injury ama kifo unasababisha kwa mtu mwingine, na damage ya mali yake. Kuride bila hii ni kosa, na ndio exposure pekee kubwa vya kutosha kukufuata maisha yote. Judgment against wewe haiishi pikipiki ikiuzwa.",
            },
            {
              title: "Pili — health cover ya nyumbani, through SHA",
              detail:
                "Kulazwa hospital inamaliza savings haraka kuliko ajali yoyote. Kuregister na Social Health Authority inacover household yako, na contributions ziko chini sana ya cost ya usiku mmoja ward.",
            },
            {
              title: "Tatu — personal accident, inareplace income",
              detail:
                "Cover karibu hakuna anainunua na karibu kila dere anaihitaji. Ukivunjika mkono, pikipiki iko poa, abiria yuko poa, na wewe hupati kitu kwa miezi mitatu. Hii inalipa amount ya kila siku ama wiki wakati huwezi kuride.",
            },
            {
              title: "Nne — pikipiki yenyewe, comprehensive ama theft-only",
              detail:
                "Inastahili kuwa nayo tatu ziko juu zikiwa ziko. Budget ikiwa ngumu, theft-only inacost kidogo zaidi kuliko comprehensive na inacover loss inawezekana zaidi na total zaidi.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Kila moja inacost ngapi, na inakukinga na nini",
          ledger: [
            { label: "Third-party liability — kwa year", value: "KSh 7,500" },
            { label: "— inaprotect against claim ya", value: "hadi KSh 3,000,000" },
            { label: "SHA household contribution — kwa mwezi", value: "kuanzia KSh 300" },
            { label: "— inaprotect against admission inacost", value: "KSh 80,000+" },
            { label: "Personal accident — kwa year", value: "KSh 3,000" },
            { label: "— inareplace income ya kama", value: "KSh 1,000/siku ukiwa off road" },
            { label: "Comprehensive bike cover — kwa year", value: "KSh 18,000" },
            { label: "Total ya zote nne, kwa mwezi", value: "kama KSh 2,700", total: true },
          ],
          note: "KSh 2,700 kwa mwezi ni kama KSh 90 kwa siku — chini ya third ya inachochoma pikipiki kwa fuel. Mbili za kwanza pekee, kwa kama KSh 925 kwa mwezi, zinaondoa risks mbili zinamaliza careers za kuride.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Third-party only",
              definition:
                "Inacover harm unasababisha kwa wengine, hakuna chako. Legal minimum na cover cheap zaidi iko.",
            },
            {
              term: "Comprehensive",
              definition:
                "Third-party plus damage ya pikipiki yako, hata ajali ikiwa fault yako. Mara kadhaa ya bei, na inafaa tu essentials zikiwa covered.",
            },
            {
              term: "Personal accident cover",
              definition:
                "Inakulipa amount fixed kwa injury, disability ama kifo — bila kujali nani alikosea. Kitu cha karibu zaidi na sick pay kwa dere wa self-employed.",
            },
            {
              term: "SHA",
              definition:
                "Social Health Authority, scheme ya national ya health insurance Kenya, ilichukua nafasi ya NHIF. Kuregister inacover household yako yote, si wewe pekee.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kununua comprehensive cover ya pikipiki wakati unaride na third-party imeexpire, juu comprehensive \"inasikika poa\". Ni inversion exact ya order sahihi: umeprotect asset ina thamani ya KSh 120,000 na umejiacha exposed kwa claim ya milioni kadhaa.\n\nKama unaweza afford kitu kimoja tu, ni third-party. Kama unaweza afford viwili, ni third-party na SHA. Pikipiki inakuja mwisho juu pikipiki ndio kitu cheap zaidi kwa list kureplace.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Check expiry date ya third-party cover yako. Kama iko ndani ya mwezi, ideal nayo kabla ya kitu kingine chochote kwa list hii.",
            "Confirm kama household yako imeregistered na SHA, na ati details ziko current.",
            "Uliza SACCO yako kama inaoffer group personal-accident scheme. Group rates through SACCO mara nyingi ziko chini sana ya ungelipa peke yako.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Insure claim ingekuruin kabla ya asset unaweza kureplace: third-party, halafu health, halafu income yako, halafu pikipiki.",
        },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────── INS-3 ──
  {
    code: "INS-3",
    durationMin: 7,
    summary: {
      En: "Claims are paid on evidence gathered in the first hour and a report filed within the deadline. Almost every refusal traces back to one of those two.",
      Sw: "Madai hulipwa kwa ushahidi uliokusanywa saa ya kwanza na ripoti iliyowasilishwa ndani ya muda. Karibu kila kukataliwa kunatokana na mojawapo ya hayo mawili.",
      Sh: "Claims zinalipwa kwa evidence imecollectiwa hour ya kwanza na report imefiliwa ndani ya deadline. Karibu kila refusal inatoka kwa moja ya hizo mbili.",
    },
    sections: {
      En: [
        {
          kind: "intro",
          heading: "Why this matters",
          body: "A rider who has paid every premium for four years can still be refused — not because the insurer cheated, but because the accident was reported eleven days later, there were no photographs, and the police abstract named a different registration number.\n\nInsurers do not refuse claims out of malice. They refuse them because the file does not prove what happened. Your job, in the hour after an accident, is to build that file while the evidence still exists.\n\nThis is the most practical lesson in the whole curriculum. Read it before you need it, because you will not be reading anything on the day you do.",
        },
        {
          kind: "points",
          heading: "The first hour, in order",
          points: [
            {
              title: "People first, and get the injured treated",
              detail:
                "Nothing in a policy outranks this, and no insurer has ever refused a claim because you helped someone before taking a photograph. Treatment records also become part of your evidence.",
            },
            {
              title: "Photograph everything before anything moves",
              detail:
                "Both vehicles from four sides, the registration plates, the position on the road, skid marks, damage close up, and the wider scene showing junctions or signs. Twenty photographs cost nothing and settle most disputes.",
            },
            {
              title: "Collect names, numbers and the other policy",
              detail:
                "The other rider or driver's name, phone number, registration number, insurer and policy number. Also at least one independent witness with a phone number — a witness found a week later is a witness who cannot be reached.",
            },
            {
              title: "Report to the police and get an abstract",
              detail:
                "Report at the nearest station the same day. The abstract is the document your insurer will ask for first, and some policies will not open a file without it.",
            },
            {
              title: "Notify the insurer within the deadline, in writing",
              detail:
                "Most policies require notification within 48 hours to 7 days. Phone, then follow up by message or email so there is a timestamp. Late notification is the single commonest reason a valid claim is refused.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Two identical accidents, two outcomes",
          ledger: [
            { label: "Rider A — photographs taken, abstract day one, insurer told in 24 hours", value: "" },
            { label: "Claim settled in", value: "3 weeks" },
            { label: "Paid", value: "KSh 180,000" },
            { label: "Rider B — no photographs, abstract after 9 days, insurer told in week two", value: "" },
            { label: "Claim status", value: "repudiated — late notification" },
            { label: "Paid", value: "KSh 0", total: true },
          ],
          note: "Same accident, same damage, same insurer, same premiums paid. The only difference was an hour of work on the day and a phone call inside the deadline.",
        },
        {
          kind: "terms",
          heading: "Words you will meet",
          terms: [
            {
              term: "Police abstract",
              definition:
                "The official police record of a reported accident. Obtained from the station where you reported, usually for a small fee. Your insurer will ask for it.",
            },
            {
              term: "Repudiation",
              definition:
                "The insurer formally declining a claim. You are entitled to the reason in writing — and entitled to challenge it.",
            },
            {
              term: "Assessor",
              definition:
                "The independent expert the insurer sends to inspect the damage and price it. Do not repair the bike before the assessor has seen it; repairing first can void the claim.",
            },
            {
              term: "Insurance Regulatory Authority (IRA)",
              definition:
                "The body that supervises insurers in Kenya and takes complaints from policyholders. Free to use, and insurers respond to it.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "The mistake that undoes this",
          body: "Agreeing a cash settlement at the roadside and not reporting the accident at all. It feels faster and avoids the station. Then an injury appears a week later, the other party claims against you, and you have no abstract, no photographs and no notification — so your own insurer is entitled to refuse.\n\nTake the photographs and report it even when you have settled on the spot and even when the damage looks trivial. Reporting costs an hour. Not reporting can cost the bike.",
        },
        {
          kind: "do",
          heading: "Do this today",
          steps: [
            "Save your insurer's claims line in your phone now, under a name you will find while shaking — \"BIMA CLAIM\".",
            "Photograph your policy document, logbook, licence and ID, and keep them in your phone. Originals get lost in exactly the situations where you need them.",
            "Find your policy's notification deadline — 48 hours, 72 hours, 7 days — and write it next to that saved contact.",
          ],
        },
        {
          kind: "recap",
          heading: "In one line",
          body: "Photographs on the day, abstract on the day, insurer inside the deadline — that is the whole difference between paid and refused.",
        },
      ],
      Sw: [
        {
          kind: "intro",
          heading: "Kwa nini hili ni muhimu",
          body: "Mwendeshaji aliyelipa kila malipo kwa miaka minne bado anaweza kukataliwa — si kwa sababu kampuni ilidanganya, bali kwa sababu ajali iliripotiwa siku kumi na moja baadaye, hakukuwa na picha, na muhtasari wa polisi ulitaja namba tofauti ya usajili.\n\nKampuni za bima hazikatai madai kwa uovu. Zinakataa kwa sababu faili halithibitishi kilichotokea. Kazi yako, saa moja baada ya ajali, ni kujenga faili hilo wakati ushahidi bado upo.\n\nHili ndilo somo la vitendo zaidi katika mtaala mzima. Lisome kabla hujalihitaji, kwa sababu hutasoma chochote siku utakapolihitaji.",
        },
        {
          kind: "points",
          heading: "Saa ya kwanza, kwa mpangilio",
          points: [
            {
              title: "Watu kwanza, na wajeruhiwa watibiwe",
              detail:
                "Hakuna kilicho kwenye sera kinachozidi hili, na hakuna kampuni iliyowahi kukataa dai kwa sababu ulimsaidia mtu kabla ya kupiga picha. Rekodi za matibabu pia huwa sehemu ya ushahidi wako.",
            },
            {
              title: "Piga picha kila kitu kabla chochote hakijasogezwa",
              detail:
                "Vyombo vyote viwili kutoka pande nne, namba za usajili, mahali barabarani, alama za breki, uharibifu kwa karibu, na eneo pana likionyesha makutano au alama. Picha ishirini hazigharimu kitu na humaliza mabishano mengi.",
            },
            {
              title: "Kusanya majina, namba na bima ya mwenzako",
              detail:
                "Jina la mwendeshaji au dereva mwingine, namba ya simu, namba ya usajili, kampuni ya bima na namba ya sera. Pia angalau shahidi mmoja huru mwenye namba ya simu — shahidi anayepatikana wiki moja baadaye ni shahidi asiyeweza kufikiwa.",
            },
            {
              title: "Ripoti polisi na upate muhtasari",
              detail:
                "Ripoti kituo cha karibu zaidi siku ile ile. Muhtasari ndiyo hati kampuni yako itakayoomba kwanza, na sera zingine hazifungui faili bila huo.",
            },
            {
              title: "Arifu kampuni ndani ya muda, kwa maandishi",
              detail:
                "Sera nyingi zinahitaji taarifa ndani ya saa 48 hadi siku 7. Piga simu, kisha fuatilia kwa ujumbe au barua pepe ili kuwe na alama ya wakati. Taarifa ya kuchelewa ndiyo sababu ya kawaida zaidi dai halali kukataliwa.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Ajali mbili zinazofanana, matokeo mawili",
          ledger: [
            { label: "Mwendeshaji A — picha zilipigwa, muhtasari siku ya kwanza, kampuni iliarifiwa saa 24", value: "" },
            { label: "Dai lilimalizwa ndani ya", value: "wiki 3" },
            { label: "Alilipwa", value: "KSh 180,000" },
            { label: "Mwendeshaji B — hakuna picha, muhtasari baada ya siku 9, kampuni iliarifiwa wiki ya pili", value: "" },
            { label: "Hali ya dai", value: "limekataliwa — taarifa ya kuchelewa" },
            { label: "Alilipwa", value: "KSh 0", total: true },
          ],
          note: "Ajali ile ile, uharibifu ule ule, kampuni ile ile, malipo yale yale. Tofauti pekee ilikuwa saa moja ya kazi siku hiyo na simu moja ndani ya muda.",
        },
        {
          kind: "terms",
          heading: "Maneno utakayokutana nayo",
          terms: [
            {
              term: "Muhtasari wa polisi",
              definition:
                "Rekodi rasmi ya polisi ya ajali iliyoripotiwa. Hupatikana kutoka kituo ulikoripoti, mara nyingi kwa ada ndogo. Kampuni yako ya bima itaiomba.",
            },
            {
              term: "Kukataa dai",
              definition:
                "Kampuni kukataa dai rasmi. Una haki ya kupata sababu kwa maandishi — na una haki ya kupinga.",
            },
            {
              term: "Mkadiriaji (assessor)",
              definition:
                "Mtaalamu huru kampuni inayemtuma kukagua uharibifu na kuupanga bei. Usitengeneze pikipiki kabla mkadiriaji hajaiona; kutengeneza kwanza kunaweza kubatilisha dai.",
            },
            {
              term: "Mamlaka ya Udhibiti wa Bima (IRA)",
              definition:
                "Taasisi inayosimamia kampuni za bima nchini Kenya na inayopokea malalamiko kutoka kwa wenye sera. Ni bure kutumia, na kampuni hujibu.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Kosa linaloharibu hili",
          body: "Kukubaliana malipo ya taslimu barabarani na kutoripoti ajali kabisa. Inahisi haraka zaidi na inaepuka kituo. Kisha jeraha linatokea wiki moja baadaye, upande mwingine unakudai, nawe huna muhtasari, huna picha na huna taarifa — hivyo kampuni yako mwenyewe ina haki ya kukataa.\n\nPiga picha na uripoti hata ukiwa umemaliza papo hapo na hata uharibifu ukionekana mdogo. Kuripoti kunagharimu saa moja. Kutoripoti kunaweza kugharimu pikipiki.",
        },
        {
          kind: "do",
          heading: "Fanya hivi leo",
          steps: [
            "Hifadhi namba ya madai ya kampuni yako kwenye simu sasa, kwa jina utakaloliona ukitetemeka — \"BIMA CLAIM\".",
            "Piga picha hati yako ya bima, logbook, leseni na kitambulisho, na uziweke kwenye simu. Nakala halisi hupotea katika hali hasa unapozihitaji.",
            "Tafuta muda wa taarifa wa sera yako — saa 48, saa 72, siku 7 — na uuandike kando ya anwani hiyo uliyohifadhi.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa mstari mmoja",
          body: "Picha siku hiyo, muhtasari siku hiyo, kampuni ndani ya muda — hiyo ndiyo tofauti yote kati ya kulipwa na kukataliwa.",
        },
      ],
      Sh: [
        {
          kind: "intro",
          heading: "Kwa nini hii ni muhimu",
          body: "Dere amelipa kila premium kwa miaka minne bado anaweza kukataliwa — si juu insurer alicheat, ni juu ajali ilireportiwa siku kumi na moja baadaye, hakukuwa na picha, na police abstract ilitaja registration number tofauti.\n\nInsurers hawakatai claims kwa uovu. Wanakataa juu file haithibitishi kilichofanyika. Kazi yako, hour moja baada ya ajali, ni kujenga hiyo file wakati evidence bado iko.\n\nHii ndio lesson ya practical zaidi kwa curriculum nzima. Isome kabla uihitaji, juu hutasoma kitu siku utakapoihitaji.",
        },
        {
          kind: "points",
          heading: "Hour ya kwanza, kwa order",
          points: [
            {
              title: "Watu kwanza, na wajeruhiwa watibiwe",
              detail:
                "Hakuna kitu kwa policy kinazidi hii, na hakuna insurer amewahi kukataa claim juu ulisaidia mtu kabla ya kupiga picha. Treatment records pia zinakuwa sehemu ya evidence yako.",
            },
            {
              title: "Piga picha kila kitu kabla chochote kisogezwe",
              detail:
                "Vyombo vyote viwili kutoka pande nne, number plates, position barabarani, skid marks, damage close up, na scene pana inaonyesha junction ama signs. Picha ishirini hazicost kitu na zinamaliza disputes nyingi.",
            },
            {
              title: "Collect majina, numbers na policy ya mwenzako",
              detail:
                "Jina la dere ama driver mwingine, number ya simu, registration number, insurer na policy number. Pia at least witness mmoja independent na number ya simu — witness unapata wiki moja baadaye ni witness hawezi kureachiwa.",
            },
            {
              title: "Report kwa polisi na upate abstract",
              detail:
                "Report station ya karibu zaidi siku hiyo hiyo. Abstract ndio document insurer yako itaomba kwanza, na policies zingine hazifungui file bila hiyo.",
            },
            {
              title: "Notify insurer ndani ya deadline, kwa maandishi",
              detail:
                "Policies nyingi zinahitaji notification ndani ya hours 48 hadi siku 7. Piga simu, halafu follow up kwa message ama email ili kuwe na timestamp. Late notification ndio reason ya kawaida zaidi claim halali inakataliwa.",
            },
          ],
        },
        {
          kind: "example",
          heading: "Ajali mbili zinafanana, outcomes mbili",
          ledger: [
            { label: "Dere A — picha zilipigwa, abstract siku ya kwanza, insurer aliambiwa hours 24", value: "" },
            { label: "Claim ilisettlewa ndani ya", value: "wiki 3" },
            { label: "Alilipwa", value: "KSh 180,000" },
            { label: "Dere B — hakuna picha, abstract baada ya siku 9, insurer aliambiwa wiki ya pili", value: "" },
            { label: "Status ya claim", value: "imekataliwa — late notification" },
            { label: "Alilipwa", value: "KSh 0", total: true },
          ],
          note: "Ajali ile ile, damage ile ile, insurer yule yule, premiums zile zile. Tofauti pekee ilikuwa hour moja ya kazi siku hiyo na simu moja ndani ya deadline.",
        },
        {
          kind: "terms",
          heading: "Maneno utakutana nayo",
          terms: [
            {
              term: "Police abstract",
              definition:
                "Record official ya polisi ya ajali imereportiwa. Inapatikana kutoka station ulireport, mara nyingi kwa fee ndogo. Insurer yako itaiomba.",
            },
            {
              term: "Repudiation",
              definition:
                "Insurer kukataa claim officially. Una haki ya reason kwa maandishi — na una haki ya kuchallenge.",
            },
            {
              term: "Assessor",
              definition:
                "Expert independent insurer anamtuma kuinspect damage na kuiprice. Usirepair pikipiki kabla assessor aione; kurepair kwanza inaweza kuvoid claim.",
            },
            {
              term: "Insurance Regulatory Authority (IRA)",
              definition:
                "Body inasupervise insurers Kenya na inachukua complaints kutoka kwa policyholders. Ni bure kutumia, na insurers wanarespond.",
            },
          ],
        },
        {
          kind: "warn",
          heading: "Mistake inaharibu hii",
          body: "Kuagree cash settlement barabarani na kutoreport ajali kabisa. Inafeel haraka zaidi na inaepuka station. Halafu injury inaonekana wiki moja baadaye, upande mwingine unakuclaim, na huna abstract, huna picha na huna notification — kwa hivyo insurer yako mwenyewe ina haki ya kukataa.\n\nPiga picha na ureport hata ukiwa umesettle hapo hapo na hata damage ionekane ndogo. Kureport inacost hour moja. Kutoreport inaweza kucost pikipiki.",
        },
        {
          kind: "do",
          heading: "Fanya hii leo",
          steps: [
            "Save claims line ya insurer yako kwa simu saa hii, kwa jina utakaliona ukitetemeka — \"BIMA CLAIM\".",
            "Piga picha policy document yako, logbook, licence na ID, na uziweke kwa simu. Originals zinapotea exactly kwa situations unazohitaji.",
            "Tafuta notification deadline ya policy yako — hours 48, hours 72, siku 7 — na uiandike kando ya hiyo contact umesave.",
          ],
        },
        {
          kind: "recap",
          heading: "Kwa line moja",
          body: "Picha siku hiyo, abstract siku hiyo, insurer ndani ya deadline — hiyo ndio tofauti yote kati ya kulipwa na kukataliwa.",
        },
      ],
    },
  },
];
