import {
    box, disc, oval, arch, gothic, ring, spokes, grid, steppedGable,
    pediment, bellGable, dormer, hexagram, blobField, cityBlock, crescent, starField,
} from './cityscape.js'

export const VIEW = { w: 1600, h: 660 }
export const CURB = 612

export const SKY = {
    moon: crescent(214, 118, 34),
    stars: starField({
        seed: 31, count: 26, from: 40, to: 1560, top: 48, bottom: 300,
        avoid: [[580, 1000, 40]],
    }),
}

export const BACKDROP = {
    haze: cityBlock({ seed: 7, base: 498, from: -40, to: 1640, minW: 30, maxW: 66, minH: 62, maxH: 152, tight: 0.66, detail: false }),
    far: cityBlock({ seed: 21, base: 532, from: -40, to: 1640, minW: 38, maxW: 84, minH: 84, maxH: 188, tight: 0.68, floorStep: 17 }),
    mid: cityBlock({ seed: 53, base: 566, from: -40, to: 1640, minW: 50, maxW: 104, minH: 96, maxH: 206, tight: 0.7, floorStep: 18 }),
}

const figure = (flip = false) => {
    const s = flip ? -1 : 1
    const p = (x) => x * s
    return [
        disc(p(0), -23, 3.6),
        `M${p(-4)} -19.6 Q${p(0)} -21.4 ${p(4)} -19.6 L${p(5)} -9 L${p(-5)} -9 Z`,
        `M${p(-4.2)} -9 L${p(-1.2)} -9 L${p(-3)} 0 L${p(-5.6)} 0 Z`,
        `M${p(1.2)} -9 L${p(4.2)} -9 L${p(6)} 0 L${p(3.4)} 0 Z`,
        `M${p(3.6)} -18.6 L${p(6.2)} -12 L${p(4.4)} -11.2 L${p(2.2)} -17.6 Z`,
    ].join(' ')
}

const tree = (h) => {
    const t = (v) => Math.round(v * h * 10) / 10
    return [
        `M-2.6 0 L-1.6 ${t(-0.44)} H1.6 L2.6 0 Z`,
        `M0 ${t(-0.3)}`
        + ` C${t(-0.3)} ${t(-0.32)} ${t(-0.36)} ${t(-0.6)} ${t(-0.17)} ${t(-0.71)}`
        + ` C${t(-0.13)} ${t(-0.93)} ${t(0.13)} ${t(-0.96)} ${t(0.18)} ${t(-0.72)}`
        + ` C${t(0.37)} ${t(-0.61)} ${t(0.31)} ${t(-0.33)} 0 ${t(-0.3)} Z`,
    ].join(' ')
}

const lamp = (h) => [
    box(-1.6, 0, 3.2, h),
    `M-9 ${-h} Q0 ${-h - 9} 9 ${-h} Z`,
    box(-3.4, 0, 6.8, 4),
].join(' ')

const finial = (x, h, ball = 4) => `${box(x - 1.6, -h + ball * 2, 3.2, 18)} ${disc(x, -h, ball)}`

export const LANDMARKS_ART = {
    techmania: {
        x: 6, base: 548, depth: 'far',
        mass: [
            box(0, 0, 96, 120),
            `M0 -120 A48 48 0 0 1 96 -120 Z`,
            box(-6, -48, 108, 8),
            box(100, 0, 162, 130),
            box(246, 0, 17, 208),
            box(242, -208, 25, 9),
        ].join(' '),
        roof: [
            box(-6, -166, 108, 7),
            `M94 -130 L120 -162 H240 L264 -130 Z`,
            box(-3, -120, 102, 5),
        ].join(' '),
        cuts: [
            arch(14, -54, 68, 60),
            disc(48, -140, 11),
            grid({ x: 6, y: -8, w: 84, h: 34, cols: 4, rows: 1, gapX: 6, gapY: 0, shape: arch }),
            grid({ x: 106, y: -80, w: 150, h: 46, cols: 1, rows: 7, gapX: 0, gapY: 3 }),
            grid({ x: 108, y: -16, w: 146, h: 50, cols: 6, rows: 2, gapX: 7, gapY: 8 }),
            box(160, 0, 22, 30),
        ].join(' '),
        trim: [dormer(140, -162, 14, 16), dormer(196, -162, 14, 16)].join(' '),
        lit: [
            arch(14, -54, 68, 60),
            box(160, 0, 22, 30),
            grid({ x: 108, y: -16, w: 146, h: 50, cols: 6, rows: 2, gapX: 7, gapY: 8 }),
        ].join(' '),
    },

    'nova-scena': {
        x: 880, base: 552, depth: 'far',
        mass: [
            box(0, 0, 150, 178),
            box(140, -70, 112, 24),
            box(170, 0, 130, 122),
            disc(160, -14, 13),
            box(154, -3, 12, 3),
        ].join(' '),
        roof: [
            box(-5, -178, 160, 9),
            box(166, -122, 138, 7),
        ].join(' '),
        cuts: [
            blobField({ seed: 5, x: 8, y: -12, w: 134, h: 158, cols: 7, rows: 8, min: 4.5, max: 9.5 }),
            grid({ x: 176, y: -18, w: 118, h: 42, cols: 7, rows: 2, gapX: 5, gapY: 6 }),
            grid({ x: 176, y: -74, w: 118, h: 38, cols: 7, rows: 2, gapX: 5, gapY: 6 }),
            grid({ x: 146, y: -74, w: 100, h: 14, cols: 8, rows: 1, gapX: 4, gapY: 0 }),
            box(196, 0, 26, 30),
        ].join(' '),
        trim: '',
        lit: [box(196, 0, 26, 30), grid({ x: 176, y: -18, w: 118, h: 42, cols: 7, rows: 2, gapX: 5, gapY: 6 })].join(' '),
    },

    synagoga: {
        x: 150, base: 570, depth: 'mid',
        mass: [
            box(0, 0, 40, 122),
            box(240, 0, 40, 122),
            box(40, 0, 60, 232),
            box(180, 0, 60, 232),
            box(34, -232, 72, 11),
            box(174, -232, 72, 11),
            `M40 -243 C40 -278 62 -282 70 -326 C78 -282 100 -278 100 -243 Z`,
            `M180 -243 C180 -278 202 -282 210 -326 C218 -282 240 -278 240 -243 Z`,
            box(68.4, -326, 3.2, 14),
            box(208.4, -326, 3.2, 14),
            box(100, 0, 80, 192),
            pediment(140, -192, 44, 58),
            box(132, -250, 16, 16),
            `M130 -266 A10 10 0 0 1 150 -266 Z`,
            box(138.4, -276, 3.2, 12),
            box(0, -122, 280, 8),
        ].join(' '),
        roof: [
            box(-3, -122, 46, 6),
            box(237, -122, 46, 6),
            `M100 -192 L140 -250 L180 -192 Z`,
        ].join(' '),
        cuts: [
            hexagram(140, -212, 17),
            arch(104, -64, 22, 66),
            arch(130, -64, 22, 66),
            arch(156, -64, 22, 66),
            disc(115, -118, 8),
            disc(141, -118, 8),
            disc(167, -118, 8),
            arch(106, 0, 20, 34),
            arch(132, 0, 20, 34),
            arch(158, 0, 20, 34),
            arch(52, -130, 36, 56),
            arch(192, -130, 36, 56),
            grid({ x: 46, y: -190, w: 48, h: 26, cols: 4, rows: 1, gapX: 5, gapY: 0, shape: arch }),
            grid({ x: 186, y: -190, w: 48, h: 26, cols: 4, rows: 1, gapX: 5, gapY: 0, shape: arch }),
            arch(8, -40, 16, 44),
            arch(256, -40, 16, 44),
            arch(10, 0, 14, 26),
            arch(256, 0, 14, 26),
        ].join(' '),
        trim: '',
        lit: [
            hexagram(140, -212, 16),
            arch(104, -64, 22, 66),
            arch(130, -64, 22, 66),
            arch(156, -64, 22, 66),
            arch(52, -130, 36, 56),
            arch(192, -130, 36, 56),
        ].join(' '),
    },

    katedrala: {
        x: 600, base: 570, depth: 'mid',
        mass: [
            box(30, 0, 80, 264),
            box(26, -264, 88, 10),
            disc(70, -512, 5),
            box(110, 0, 190, 202),
            box(116, 0, 9, 192), box(152, 0, 9, 192), box(188, 0, 9, 192),
            box(224, 0, 9, 192), box(260, 0, 9, 192),
            box(203, -264, 5, 10),
            disc(205, -324, 3.4),
            box(300, 0, 80, 172),
            box(150, 0, 42, 42),
            box(338, -216, 4, 8),
            disc(340, -250, 2.8),
        ].join(' '),
        roof: [
            `M26 -274 L70 -506 L114 -274 Z`,
            `M104 -202 L136 -266 H286 L306 -202 Z`,
            `M200 -274 L205 -322 L210 -274 Z`,
            `M294 -172 L318 -218 H366 L386 -172 Z`,
            `M336 -224 L340 -248 L344 -224 Z`,
            pediment(171, -42, 24, 26),
        ].join(' '),
        cuts: [
            disc(70, -196, 14),
            gothic(63, -150, 14, 42),
            box(66, -96, 8, 18),
            gothic(130, -44, 17, 138),
            gothic(166, -44, 17, 138),
            gothic(202, -44, 17, 138),
            gothic(238, -44, 17, 138),
            pediment(152, -230, 4.5, 11),
            pediment(187, -230, 4.5, 11),
            pediment(222, -230, 4.5, 11),
            pediment(257, -230, 4.5, 11),
            gothic(312, -34, 16, 116),
            gothic(344, -34, 16, 116),
            gothic(164, 0, 16, 28),
            box(110, -202, 190, 5),
        ].join(' '),
        trim: [
            ring(70, -196, 14, 10),
            box(69, -196, 2, 10),
            box(70, -197, 9, 2),
        ].join(' '),
        lit: [
            gothic(130, -44, 17, 138),
            gothic(166, -44, 17, 138),
            gothic(202, -44, 17, 138),
            gothic(238, -44, 17, 138),
        ].join(' '),
        litGlass: [gothic(312, -34, 16, 116), gothic(344, -34, 16, 116)].join(' '),
        litCool: [disc(70, -196, 13), gothic(63, -150, 14, 42)].join(' '),
    },

    prazdroj: {
        x: 1320, base: 584, depth: 'mid',
        mass: [
            box(0, 0, 62, 132),
            box(70, 0, 160, 122),
            box(62, -122, 176, 48),
            box(58, -170, 184, 9),
            `M126 -179 L148 -204 H172 L194 -179 Z`,
            box(165, -204, 4, 16),
            disc(167, -226, 6),
            box(64, -179, 12, 16), disc(70, -190, 7),
            box(224, -179, 12, 16), disc(230, -190, 7),
            box(240, 0, 60, 178),
            box(276, -244, 3, 12),
            disc(277.5, -256, 3),
            box(218, 0, 14, 250),
            box(215, -250, 20, 8),
        ].join(' '),
        roof: [
            `M-5 -132 L16 -156 H46 L67 -132 Z`,
            `M234 -178 L270 -222 L306 -178 Z`,
            box(213, -250, 24, 5),
        ].join(' '),
        cuts: [
            arch(84, 0, 52, 100),
            arch(164, 0, 52, 100),
            box(74, -156, 68, 22),
            box(158, -156, 68, 22),
            box(132, -130, 36, 12),
            disc(30, -92, 15),
            grid({ x: 12, y: -30, w: 38, h: 50, cols: 2, rows: 2, gapX: 6, gapY: 8 }),
            grid({ x: 252, y: -60, w: 36, h: 90, cols: 2, rows: 3, gapX: 6, gapY: 8 }),
            arch(258, 0, 24, 40),
        ].join(' '),
        trim: [ring(30, -92, 15, 11), box(29, -92, 2, 11), box(30, -93, 11, 2)].join(' '),
        lit: [
            arch(84, 0, 52, 100),
            arch(164, 0, 52, 100),
            grid({ x: 252, y: -60, w: 36, h: 90, cols: 2, rows: 3, gapX: 6, gapY: 8 }),
        ].join(' '),
    },

    radnice: {
        x: 400, base: 600, depth: 'near',
        mass: [
            box(0, 0, 210, 202),
            box(-6, -202, 222, 11),
            box(10, -213, 190, 46),
            bellGable(40, -259, 28, 28),
            bellGable(170, -259, 28, 28),
            box(86, -259, 38, 18),
            `M88 -277 A19 19 0 0 1 126 -277 Z`,
            box(105.4, -296, 3.2, 14),
            `M107 -310 L124 -305 L107 -300 Z`,
            finial(22, 272, 3.4), finial(62, 272, 3.4),
            finial(148, 272, 3.4), finial(188, 272, 3.4),
            box(38.4, -287, 3.2, 10), disc(40, -292, 3),
            box(168.4, -287, 3.2, 10), disc(170, -292, 3),
        ].join(' '),
        roof: [
            box(-8, -202, 226, 6),
            box(6, -259, 198, 6),
            `M88 -277 A19 19 0 0 1 126 -277 Z`,
            bellGable(40, -259, 28, 28),
            bellGable(170, -259, 28, 28),
        ].join(' '),
        cuts: [
            disc(105, -232, 15),
            arch(93, 0, 24, 36),
            grid({ x: 22, y: -48, w: 166, h: 46, cols: 5, rows: 1, gapX: 16, gapY: 0 }),
            grid({ x: 24, y: -108, w: 162, h: 24, cols: 5, rows: 1, gapX: 18, gapY: 0 }),
            grid({ x: 22, y: -148, w: 166, h: 42, cols: 5, rows: 1, gapX: 16, gapY: 0 }),
            box(16, 0, 14, 20), box(180, 0, 14, 20),
        ].join(' '),
        trim: [
            ring(105, -232, 15, 11),
            box(104, -232, 2, 11),
            box(105, -233, 10, 2),
            pediment(33, -94, 15, 12),
            pediment(69, -94, 15, 12),
            pediment(105, -94, 15, 12),
            pediment(141, -94, 15, 12),
            pediment(177, -94, 15, 12),
        ].join(' '),
        lit: [
            grid({ x: 22, y: -148, w: 166, h: 42, cols: 5, rows: 1, gapX: 16, gapY: 0 }),
            grid({ x: 22, y: -48, w: 166, h: 46, cols: 5, rows: 1, gapX: 16, gapY: 0 }),
            arch(93, 0, 24, 36),
        ].join(' '),
        flags: [
            { x: 30, d: `M0 -282 L22 -277 L0 -272 Z`, pole: box(-1.6, -264, 3.2, 20) },
            { x: 180, d: `M0 -282 L22 -277 L0 -272 Z`, pole: box(-1.6, -264, 3.2, 20) },
        ],
        walkers: [
            { x: 60, walk: '48px', dur: '5.2s', delay: '0s', flip: false },
            { x: 156, walk: '-42px', dur: '5.8s', delay: '-2.1s', flip: true },
        ],
    },

    depo: {
        x: 1040, base: 604, depth: 'near',
        mass: [
            box(0, 0, 88, 148),
            `M0 -148 A44 44 0 0 1 88 -148 Z`,
            box(88, 0, 116, 128),
            box(204, 0, 58, 138),
            `M204 -138 A29 29 0 0 1 262 -138 Z`,
            box(258, 0, 20, 176),
            box(255, -176, 26, 9),
            box(278, 0, 52, 132),
            `M278 -132 A26 26 0 0 1 330 -132 Z`,
            box(330, 0, 14, 116),
            box(327, -116, 20, 7),
        ].join(' '),
        roof: [
            `M82 -128 L108 -162 H186 L210 -128 Z`,
            box(-4, -148, 96, 6),
            box(200, -138, 66, 5),
            box(274, -132, 60, 5),
        ].join(' '),
        cuts: [
            arch(12, -62, 64, 76),
            grid({ x: 16, y: -14, w: 56, h: 40, cols: 4, rows: 2, gapX: 5, gapY: 6 }),
            grid({ x: 96, y: -16, w: 100, h: 44, cols: 5, rows: 2, gapX: 6, gapY: 7 }),
            grid({ x: 96, y: -76, w: 100, h: 34, cols: 5, rows: 1, gapX: 6, gapY: 0 }),
            arch(212, -56, 42, 68),
            grid({ x: 208, y: -14, w: 50, h: 16, cols: 4, rows: 1, gapX: 4, gapY: 0, shape: arch }),
            arch(286, -52, 36, 60),
            grid({ x: 282, y: -14, w: 44, h: 16, cols: 3, rows: 1, gapX: 4, gapY: 0, shape: arch }),
            box(262, -60, 12, 4),
            box(262, -110, 12, 4),
        ].join(' '),
        trim: [
            dormer(118, -162, 15, 18),
            dormer(158, -162, 15, 18),
        ].join(' '),
        lit: [
            arch(12, -62, 64, 76),
            arch(212, -56, 42, 68),
            arch(286, -52, 36, 60),
        ].join(' '),
        tram: {
            x: 30,
            mass: [
                `M0 0 V-30 Q0 -44 16 -44 H108 Q124 -44 124 -30 V0 Z`,
                disc(24, -2, 5.4),
                disc(100, -2, 5.4),
                box(58, -44, 5, 12),
            ].join(' '),
            cuts: [grid({ x: 8, y: -22, w: 108, h: 14, cols: 5, rows: 1, gapX: 5, gapY: 0 })].join(' '),
        },
    },
}

export const PAINT_ORDER = ['techmania', 'nova-scena', 'synagoga', 'katedrala', 'prazdroj', 'radnice', 'depo']

export const STREET = {
    baseline: 620,
    curb: [box(0, CURB + 4, 1600, 5)].join(' '),
    rails: [box(0, 642, 1600, 3), box(0, 654, 1600, 3)].join(' '),
    sleepers: Array.from({ length: 41 }, (_, i) => box(i * 40, 658, 14, 14)).join(' '),
    props: [
        { d: tree(58), x: 300 },
        { d: lamp(54), x: 480 },
        { d: tree(48), x: 672 },
        { d: lamp(54), x: 880 },
        { d: tree(62), x: 1058 },
        { d: lamp(54), x: 1262 },
        { d: tree(52), x: 1450 },
        { d: lamp(54), x: 1566 },
    ],
    walkers: [
        { x: 340, flip: false },
        { x: 712, flip: true },
        { x: 1100, flip: false },
        { x: 1416, flip: true },
    ],
}

export { figure }
