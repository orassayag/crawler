/* cSpell:disable */
const { SearchEngine, SearchEngineStatus } = require('../core/models/application');
const { SearchEngineType, SearchPlaceHolder } = require('../core/enums');

const searchEngineStatuses = [
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.ASK }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.BAIDU }),
    new SearchEngineStatus({ isActive: true, name: SearchEngineType.BING }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.DOGPILE }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.ECOSIA }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.EXALEAD }),
    new SearchEngineStatus({ isActive: true, name: SearchEngineType.GOOGLE }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.INFO }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.INFOSPACE }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.METACRAWLER }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.NAVER }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.STARTPAGE }),
    new SearchEngineStatus({ isActive: false, name: SearchEngineType.YANDEX })
];

const activeSearchEngineNames = searchEngineStatuses.filter(s => s.isActive).map(s => s.name);

const searchEngines = [
    // Ask.com
    new SearchEngine({
        name: SearchEngineType.ASK,
        baseURL: 'https://www.ask.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`web?o=0&l=dir&qo=pagination&q=${SearchPlaceHolder.QUERY}&qsrc=998&page=${SearchPlaceHolder.PAGER}`]
    }),

    // Baidu.com
    new SearchEngine({
        name: SearchEngineType.BAIDU,
        baseURL: 'https://www.baidu.com/',
        startIndex: 0,
        advanceBy: 10,
        templatesList: [`s?wd=${SearchPlaceHolder.QUERY}&pn=${SearchPlaceHolder.PAGER}&oq=${SearchPlaceHolder.QUERY}&ie=utf-8&rsv_idx=1&rsv_pq=99ae4b5e000440b3&rsv_t=6425vwQFWiYd3GCyuSrG4KMA1nNZb2RsGxoKzjKQNrjz1jX1I2zKg3%2FPDrc`]
    }),

    // Bing.com
    new SearchEngine({
        name: SearchEngineType.BING,
        baseURL: 'https://www.bing.com/',
        startIndex: 1,
        advanceBy: 10,
        templatesList: [
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-0&qs=n&sk=&cvid=F6A9A51C2A884A459B4C65332D7506E5&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-1&qs=n&sk=&cvid=93A55275D8274A4E8A430EE1C9F19E81&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-10&qs=n&sk=&cvid=18C2128B49394B1698C634B8FB48D49B&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&qs=n&sp=-1&pq=&sc=0-13&sk=&cvid=5A9B8073A60A4F4095BFB99091E938E1&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-8&sk=&cvid=7EC5F4F03E004E96A7358501B7ED6793&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-15&sk=&cvid=B8FCAF5185D44BEBA3B1B5CFF9800CD6&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&qs=n&sp=-1&pq=&sc=0-8&sk=&cvid=433DE9390F2C461EBBC03F6F0811FC23&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&qs=n&sp=-1&pq=&sc=0-10&sk=&cvid=D6508085B2F341B195ACB1E0050AB3EE&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&sp=-1&pq=&sc=0-7&qs=n&sk=&cvid=70C0B8E7EA864F338E37F75A34FFD035&first=${SearchPlaceHolder.PAGER}&FORM=PORE`,
            `search?q=${SearchPlaceHolder.QUERY}&qs=n&sp=-1&pq=&sc=1-15&sk=&cvid=DE92792ADAF24F11BA793D9DD64AA375&first=${SearchPlaceHolder.PAGER}&FORM=PORE`
        ]
    }),

    // Dogpile.com
    new SearchEngine({
        name: SearchEngineType.DOGPILE,
        baseURL: 'https://www.dogpile.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`serp?q=${SearchPlaceHolder.QUERY}&page=${SearchPlaceHolder.PAGER}&sc=wQ2mRrhOKmCZ_IRf6-0WGw5uYp-JUW0lKW9SlfOFG1Up2E18CE9djLdoaBpKCyKjuzUV8kcDx2ct99ZDwNU_DT4szzncuJLCGkan48P2l13M8kCHWsINir0rEtw10_xvGLJe1EQrLitcaycyC4G1kc02nhxGYQG4iHQ6qUwICO2srTLuMhBR3yi9nPdZpb81oA-E8IvML7_6TCVPEumRqGPvlB9w_UYIhj0JZK-uVIv5JcFWbIf0PXidkitYYZAjl7C31PNIu0i-v1DepxrJFcqUCKsgrwJv7G_faw4NzPqIMTYQISnJwhVXtJMXQAYuBnfmuddP3Nh4IteADbiQ9FvkxE8VIc2MpqWdLIO5Zi8DaODsU1BeewdU_uSfEorKcJdQZPM6rMZYfsYEdAaEAPT6eooK_O4Bny1R0i9rggSxWnP3mEKChp9N01sFQsIaSSzkwVtLRijuma_MiHd9hOanAUQyBxFJTIoeMj_W5Fcl328_a3ijSv3lPqafX-oOOlPhYCSbpGFodnFMcK5UplDXe-BZPPzGEg0O0OZ1dlvm9z6j9M4YusGLv3qrorlryF0W-12tQ8nmN3-crgE9lhD6H3Q_8o4v8E8Gw8OoxlsPGWdVOJTBYyuLEe8A44lMuc1HgyuuZVAaBzyZlmfATZZBDiyUPJoo-MqSytCG5smVdC1mw2gOxgg3c8MZYh8j9ZKjtiXgu04LGW0HxspwXhNrJcldmV4Lft87NJ4li31Vt1dhF1Aw30zm8wyZHAEgFvIDVH3Nv1xyQQKFGOGtn5TuJdsAlPn8CIpZl-IVbox5BnZXZJFTrdSya9DPILojTM5CwC46TwXzvQVzhRq0qsT8QGw6vKGtJWvaHeaHnTXZYAqyTMRlZ42gIu0gzRmvFDXg3JSuZE1mtpM0O5JbLnnyZM6qRgzMi3l5KZ9vcC15fvaL2VisX9YVJ86sBLY9QEEnxWvk9_MNhD_Y9KxbrB4VXElxW_FrQs8DKP1Nuj1gYw8LQBgE6GudpnvaYK6YvO-A3SsWrMtLsCw1mrflp86R92CyTCwVaFSU-eVimEWklMDwjYe-sJ1IPXoINb81Kqo6TIznX7k2Je827_OoL3Ra9-nsxto_m7WXU2vYCqht8ihRNMPepyC3GziogLFdnh8Gxn6zNmhcHDALLpbH6tHgWAyLFC66pttS3eA7w2V8yHKmXN9bkapE_miXgzW9WetBQC98fxW-qtpwnfVSugnhtLxhvk8m-7aSqq7-gVbLNrqHyl8ldy27RtmxEpmphq_1U1LjW57oTEj37i_bGlk7Cf0l4BBZTbhyqnQn2NOjvggcsakQ52OHIhQ-3r1gGUrgctMHc7O41Qs0NvChcIU70idcA50yhaq4VrMYebmJaiIPs2IINM7RpTe1P6PjQT0773PmiQyXHj1z-Le-lQvjMN9JdnyKxIlWKxXtprUT1h_G43JbdokhZ0S2OW-YEr-v_fL6Ay51GJHU1Zgm9ClKnqM5S0v7isFarn_CwRwZkAPQMmG6W_CDV59qjOfUZMoUOYmiJApuUNzo6vrpTbncYZNcws-ftykP-0pE5N9ro-_YDSGA5ei29KTBgTigThY1_T-EOU9Z2OKHhBcz_h1PNg6Iz4nNRUZZnpmGXnvCpdwjuKxz4w2xzVcz2R2TsdIg6iNgTuhebzXLJnpV3bq1jLXxHOZtg7KLlSMJiEyBP6RKwCo0SlAiyJS-j3YZPyFzobHzrl1ixjnamqp5G0iPBZ5AVtvfn_uAmJby_T_x62DgfqfS96WJgHwpmb4u0jcU4YpFO0NE5pJ8Ytqr15_o3_Xzaz3re-IYyJA7MGzBhaQ`]
    }),
    // Ecosia.org
    new SearchEngine({
        name: SearchEngineType.ECOSIA,
        baseURL: 'https://www.ecosia.org/',
        startIndex: 0,
        advanceBy: 1,
        templatesList: [`search?p=${SearchPlaceHolder.PAGER}&q=${SearchPlaceHolder.QUERY}`]
    }),

    // Exalead.com
    new SearchEngine({
        name: SearchEngineType.EXALEAD,
        baseURL: 'https://www.exalead.com/',
        startIndex: 0,
        advanceBy: 10,
        templatesList: [`search/web/results/?q=${SearchPlaceHolder.QUERY}&elements_per_page=10&start_index=${SearchPlaceHolder.PAGER}`]
    }),

    // Google.com
    new SearchEngine({
        name: SearchEngineType.GOOGLE,
        baseURL: 'https://www.google.com/',
        startIndex: 0,
        advanceBy: 10,
        templatesList: [
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk00pZsDz0iKJgXmkPDus2qzIp24C8g:1604435091632&ei=k7yhX9eTJqXF8gKR4rDwDg&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiXqc69mufsAhWlolwKHRExDO4Q8NMDegQIBRBD&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk020B0_Vktk9Z8F6gZDGCX3PqN_yQQ:1604763495158&ei=Z7-mX9GYCYag1fAP0N-K8Ac&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiR6M7w4fDsAhUGUBUIHdCvAn4Q8NMDegQIBhBA&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk03CIm1luLRLBuK3Zo-GAscGCWatrA:1604763509956&ei=db-mX8jxObKp1fAPmsGhuAo&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiIgNb34fDsAhWyVBUIHZpgCKcQ8NMDegQIBxBA&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk03Uozric0JTm3EhCv0yKdrKwu16EQ:1604763536316&ei=kL-mX8vkEsyE1fAP_b2KsAQ&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwjL7J6E4vDsAhVMQhUIHf2eAkYQ8NMDegQIBhBC&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk01TTD_U7wmSygdP-XmvJJDFfHQz5g:1604763551066&ei=n7-mX-7RA--i1fAP2MmCsAw&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiunaOL4vDsAhVvURUIHdikAMYQ8NMDegQIBhA8&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk03HjQwukWJvSovYG7moGvedqcfPaA:1604763561627&ei=qb-mX8vcJbXrxgPHqrTwCQ&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiL1aeQ4vDsAhW1tXEKHUcVDZ4Q8NMDegQIBhBA&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk01Wl187yvsDTFxs_aWwz8OZwYYmww:1604763574884&ei=tr-mX6q7NaaH1fAP9s-ekAY&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiq7tCW4vDsAhWmQxUIHfanB2IQ8NMDegQIBxA6&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk03lDiUko79b9dQYkE4z5ZKXNSGE-Q:1604763592992&ei=yL-mX66TPIHlxgP72Yv4Bw&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwiul6Kf4vDsAhWBsnEKHfvsAn8Q8NMDegQIBhBC&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk000XePujrV7Te1OwIPANjcZGscD5w:1604763609808&ei=2b-mX93cMIHlxgP72Yv4Bw&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwidraSn4vDsAhWBsnEKHfvsAn8Q8NMDegQIBRBC&biw=1920&bih=937`,
            `search?q=${SearchPlaceHolder.QUERY}&newwindow=1&rlz=1C1CHBF_enIL821IL821&sxsrf=ALeKk00IjsVN1Oalj-cdvfCK7jGmgBH6jA:1604763623777&ei=57-mX6aCL9ed1fAP_8iVkAg&start=${SearchPlaceHolder.PAGER}&sa=N&ved=2ahUKEwjmkfmt4vDsAhXXThUIHX9kBYIQ8NMDegQIBRBC&biw=1920&bih=937`
        ]
    }),

    // Info.com
    new SearchEngine({
        name: SearchEngineType.INFO,
        baseURL: 'https://www.info.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`serp?q=${SearchPlaceHolder.QUERY}&page=${SearchPlaceHolder.PAGER}&sc=1DrZTEqeVHY7URgEs2FYcTVPZ9aKBJ4A0dZLrw4DNMi7XTzsrbR8YhaePh8KBxbMNeOof1F86zx0pa37csj_LdgatTQzPZ_SgI5rVSUBK9IK-ks8f_Ye9A-fIe5-uua1fZu15NUMm1sLQdfWV5vkR2btHuTht42RaMMrsKqpFL8GeBxV0_UWsEzsYLA8XskvdaefeCOtJaTBkJH3aIh2rLh-pQ37S-nSO3c_ChwpSwSWnWkDA3iqTPTNoZ3nbKwqM7ck2mCELdARjBncJWYYHf4HuMSnC1JSUoo3ASWJzPMt_7ZMs9k1UblaYebbZNBim2l6jwFrUXponD9GRsQujjTl7s02ZfKm79U7ZRUDGJMo_5IUZOpaimszz2Tnre9HW7qsrtN5j7adVRfjWkAnmcemitTJPDXe_1hzpHaWinqf-xH59qbmMcKfQIa2Vewnvo7B79nBmm1RLaBWlk2LtWNCkVMsXMSW6NqlB17mGpk83AOilPkl2rJP8Et8VSg303YIf3VGu53_yR8GZwZ2Gap374hsyr83MfM1XXQaEgov9dFCq3x9-wjUJvftXwy2iUJpfm7Vd54_zVcPuoH1XYtyob0w4BBS1CqnHLqDRDIZAU-PF9enzRNAuQ-B10Pa7rAJtE38Q_uEg__MCxzKE8vXLp-7TFex29mJxaeiPNHWPIWpT2zs_Xwvyy6UxaO7KsOvbOYB4bED-v6Fu5K-SxzZabY4CTGh-e13-9-FVX8mvybdjNxgROlJmYcx2J5zM2Rzo6ZqFTtHa2Ng24txrEWhQ3L9TNg49roQxhtVWRqvvlKuu1niCiqF6WZO8pDAeGSeQfBOeJCnPXgrvX1WN4s3BxJDV6F0d8dlqZQngsjzEMwIyS6-_6aUwiRAfvreIdCIx5PWEWNjMbg7P6VsSl9KC-Uu85dks8q7hNC1J6FFu02QdtpzilivjVUH7JuXwudGCLaYQSREpV1R_JDhDXZO1jKnWwJLhyahWwYiy7VNMyFC8avjMVhNfFy36IKKQr7Jea-5L5KqlmVFQLXx6IietR6FDYwy18SdMAoFOILoopL9MdzSUOu-GJfbc6QWXSJ7k6HwMj2ad_xxDkbCG5ZSEiBjLzDwKjhyzl4BifL6HLII44_nKIuXg9vlXYyy76Mk1bHV4_Ny1ULSvwGrPgMcavNIHNhJPKqd8hiZwZWSaAWe0mZ9uE8vFuCpPS1FOPwgbfL56fmztaJDEG3kKQqKf3k-oEbcLQYaMbtfCwLcF4mC6ecMAEZahlRuo_qAZ5jTdQAoR3OrK6utJOrOhGNNLgSvT-jUgBhgHWK3U6WbimuEXxBTFaHjhYvpoKtMj7xpTYTjBk55Gm-5nCop_dKjXygzNNAC31f3krL9qsvT7wOibQBV3wn0m_NR9DoLJJNC0CRMYBLB_990V9GkUgErN7ANUl-Thrpdcbh0OUlLrUMlONwiVCOs3cYVwf2M5Gx7qprQKkKmcW9YNv63LvaXfqSlMBHsgsg9QsJ0iuasXA5qCVl1GWNXFzYBZdxTmdBBRoiYnHgYGGo55L7PwF4P8sS5YnG07KccRQ`]
    }),

    // InfoSpace.com
    new SearchEngine({
        name: SearchEngineType.INFOSPACE,
        baseURL: 'http://search.infospace.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`serp?q=${SearchPlaceHolder.QUERY}&page=${SearchPlaceHolder.PAGER}&sc=EqJ44cOqw37vI2CiXbBXa8KeOLYTF2imR-0KvKdTNEHMES0D1Hv0Dy94zk_59MaX76VCbfP8qqZgmuqu-PbSy98rqMcCPR0Id-59LQe9eFammGOqQrPDAaeN5wAfnQhi0tQCkA6zghvdYXqOAGJFrB8j4zHQhj9v7Lkrxd1_Zr1elz4Aawv5EKaAaRpS4fbH7YtujnlJcUVz03kPapa9Wgzmlt9JOYqfJ8LzUp7rG81QzrdBGu9SWN37nFrWkR9u0cUeujmvFiX2vAtZbfrHRLN0CtEfKb2k1FO6yR_fX74IKV0UpoRK48MTYLHj32VvJYtWcfd252DDnQKG5scUnldqkgXcBkSrGxVLkXyQ57MomnIrd0T2b1KI--tP2l73FLkCg5xShYVEq2bDts4WoXUW94IqqXv1DceVqnJu6iZzu7Li_VKXPXcnOUeMV4Y-gTPm57MlLuerC2ridf6yVB8DwAGdQwDGJW7xoyKTGtRKdHi9rSH2uAVyXWTKbJvNFlsPQs6XIIikGYuxpGjtJo_GcCe2BqimZgvg9CzODlGZiwo8LDQZmKBaH-SVmgK78TwIVIENxsu3L3uL_W33bLzbi1AIWI1uCr33xQFKDgi7wRFcvN6afwU2L8tkELZo1HpImxS9bU-N0XTp9yfmKNFa9VLRVi55vgLK5HY8blv8ycSgyO2kuByVNWopTwcxjV3PEZIBjTCqtbtJl3Ksao2JK4Ddb0RGlQKkbt6o6CWcIxxHfsxkADF46FnEZhFDX6IPuJtv1hQztOwkgKk4vs3fu7vP9fWfve-cJiMap-156B1fAWMnPsNntsAnq0ZxkuTtDKUUBBy3I03J0COsDp94nL3Zp7v0L8lM6EklQaTJz14PLdYmsT54VHrqZz4zqbCmjPanZPxqw1ZU6J_r5i0QDGKovJ2hOd5-luudu4O2m6AYHHWHK2smMJyO3J9XIrLL10eQ_wlthefJtPwPVtiAnkgosW0NgXbQjNUoGdYzQvv659S2CcfBwgJ4i5J-2aH6ni3dp9s6v7Fb6Wv1Bhz_v7VFIjK1F-H7KVWfUqlTvEoYT6cx6I_UNELmvRNc6Y7-6S-rpMuqLEhEsQ8iUXopceEqALPlzLiGCEVrwu5eZ2B4lYHJFaJpyDyvYpUalG8pxg4lE2yNcP7nAMKN63iupwZCHjS1ez0WWP6WndAe021qpfX90wNwXK52mXreYaICuqi90hD1SW-rkfOzaKDHSx0B_7rlquhIpRru7LFh6KLNJjq_MsKfHyOz33nU1uY90hXRsjhbYk2GNEaT1G-bNXEAedTF9vhkuFHqwbp0NtVnVjE`]
    }),

    // MetaCrawler.com
    new SearchEngine({
        name: SearchEngineType.METACRAWLER,
        baseURL: 'https://www.metacrawler.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`serp?q=${SearchPlaceHolder.QUERY}&page=${SearchPlaceHolder.PAGER}&sc=-nyJMwVSR058hFglmgkitsvwx0sO4Cck8EXHGFZQfomu8NyJRw9yTELSMvHWZTl3iCzMwjs4LzmoEfC9yG0rpakjxrPt5hNtfB0y1Rs60QGvu7_Z4yOYkq2YrBYR5h6jxGji-agnE97TfyHtJwOX0Ydz6l4nO89rb9V4l8TTmfDBJewZWbqZpun2EW2fZ3GCwsOhHRCg2I8y7ER2bsenMJhIkUVMjI5MEQdaZhd_I6cZWErKdUgGaOyB4Hpdb0JuKkkGvoW-adRt2wz0kJF0KQqYY1Hk3ankSJSZdaHQub-nz0oZlr-SedzP-jIKRGfH-oDd2wldgqyQJgTNPhg5bMig9dYXkdd-qcenUfp3mIrjmKuwMpzKZXSAx6CJ82CbkNKarfEq__9XEqGTsCHuFt2_XXroxBI6EikaLSbfzbZAUU7_nRTR1e97URYXHG00rrycGQmCCB2Q1emQf6mKSyhHJmRcZdabOgPwNZZkxi5Dh-ubUMZRYya8WOvvEgXV6ZFp-hmvYRtORcYWIKQkGuv_gaDadF9z7g1RtisnfIEDvDVVNNIHNGbhdZTcoEPG_8Wh_Y4FkRC5ctd7srjgzegc3MuxdBgqo7R6JZJ206VFbT2zZOPMNSxD4I-KxV3gGKh-dT6Di6YP6gTTZgReWXkiCt5rywg8oFu02RYDGMMxMm0ug54oIsR8TzxxbN5aaCMXHTNaW1Fgwg12xkIpJJ6UNvLCGtmbgFftK3YWlwz5XakdW4kcVgsVYVavNqG2l_vdaUL95ltTjSGF-tbgMkYwFCILg3aAyCpc3vPGeQdVZfp1yy5A6X5VnvtvlEF5DYNuiNAs6Dj8bQ_45Z2zFgEbwK3zcIO_rW87Go4upSSNJwLUimGnjgrNTZUf1XCvxvCRHwIfuE_ySQsczzBrOsVrWtcsWWFuwVOXrjd5Foxd7t5u2eMytQ60W0sEYwZciodlfSBQAggj4tRxx_yoAAtDj-hpqOJhBKuNv634kSGFyjsLuEyJuy1IfuTK1CtmJfBFs_6wTe3SbHrIjSTqCBYSiQzwmu9IyF6zB-e_4w9tkSq1yhw4dZXP0-hOh1CJXBJAZ-SCqkjC7WekaY2-VXYYVtx6S-ngX5TQLMGG8F6h8FyoMTWCiQcUxxHx4vy2xPGJ1QaCxFLfHBfAKm78fZD5Ll1e4FrpRarjmhWqR72LaV7AQ1XaXeOsTKuyzAgrrswQXm1_euuSXVproNF2N6zpbFxmXKDCUeLmyF2flXxU8LNKQW9GRTaKmZzCVqjT6zx6-NLMYhiRlB3xGjEXXRrc3rIsLHJXNHFh-H9giCDOojIDIveU31XR0QDgM9c3vpbJCwfOEZlaB9_q8hvzc8hKxib_FEosjsGCH2Cxi_DY5Ex8MGMRHTneWqS8yOIQcN2S0SiJiVKQSid3HsGJhrCL32rQsP5jf2ug2SJ6YYpy2eG9-BUDjWcAJz6eIr28XqSPhebiSbNuQkA7kOEQr1Bn3OIOnTa9zaIGGz5ENswqBdFtABmGiXRddAJtF3n4DO6elzR4cVPoqlGImDeMtjZm-WWziGhoIoW05OK1mFh2KSm1nTYu4kqM2b311vsxt1H9VV1pwFR2OeQrK2cjAb_qjcQjguEY7pxU3N9CZSJiROhRoOW16HHj6K1eazEWsNNbSr-I-jis8ST7voC_Y5CIDhg1ny4eOLqlcUygGQL-RdOdU4m538zDggoJdKM_naCapyacH14oFW7Eug`]
    }),

    // Naver.com
    new SearchEngine({
        name: SearchEngineType.NAVER,
        baseURL: 'https://search.naver.com/',
        startIndex: 1,
        advanceBy: 10,
        templatesList: [`search.naver?f=&fd=2&filetype=0&nso=so%3Ar%2Ca%3Aall%2Cp%3Aall&query=${SearchPlaceHolder.QUERY}&research_url=&sm=tab_pge&start=${SearchPlaceHolder.PAGER}&where=webkr`]
    }),

    // StartPage.com
    new SearchEngine({
        name: SearchEngineType.STARTPAGE,
        baseURL: 'https://www.startpage.com/',
        startIndex: 1,
        advanceBy: 1,
        templatesList: [`sp/search?language=english&lui=english&t=default&query=${SearchPlaceHolder.QUERY}&cat=web&page=${SearchPlaceHolder.PAGER}&sc=CzFATGXE3M2x00`]
    }),

    // Yandex.com
    new SearchEngine({
        name: SearchEngineType.YANDEX,
        baseURL: 'https://yandex.com/',
        startIndex: 0,
        advanceBy: 1,
        templatesList: [`search/?lr=131&text=${SearchPlaceHolder.QUERY}&p=${SearchPlaceHolder.PAGER}&redircnt=1580916510.1`]
    })
];

module.exports = { searchEngines, activeSearchEngineNames, searchEngineStatuses };