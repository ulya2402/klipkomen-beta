import type {
  CardStyleId,
  DecorationId,
  LayoutModeId,
  StudioConfig,
  StudioData,
  CommentItem
} from '../types';

export const STORAGE_KEY = 'klipkomen_studio_react_v3';

export const AVATAR_COLORS = [
  '#2563EB',
  '#E11D48',
  '#059669',
  '#D97706',
  '#7C3AED',
  '#0F172A',
  '#DB2777',
  '#0891B2'
];

export const SAMPLE_ATTACHMENT_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#F4F5F7"/><stop offset="100%" stop-color="#E2E5EB"/>' +
      '</linearGradient></defs>' +
      '<rect width="800" height="450" fill="url(#g)"/>' +
      '<rect x="48" y="44" width="320" height="362" rx="18" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="2"/>' +
      '<rect x="76" y="76" width="110" height="14" rx="7" fill="#2563EB"/>' +
      '<rect x="76" y="108" width="264" height="24" rx="6" fill="#111318"/>' +
      '<rect x="76" y="144" width="220" height="16" rx="6" fill="#5A606E" opacity="0.45"/>' +
      '<rect x="76" y="184" width="264" height="140" rx="12" fill="#ECEEF2"/>' +
      '<circle cx="140" cy="240" r="24" fill="#2563EB" opacity="0.85"/>' +
      '<path d="M105 305 L165 245 L215 290 L255 255 L315 305 Z" fill="#111318" opacity="0.75"/>' +
      '<rect x="76" y="346" width="130" height="32" rx="8" fill="#111318"/>' +
      '<rect x="404" y="44" width="348" height="170" rx="18" fill="#111318"/>' +
      '<text x="436" y="102" font-family="sans-serif" font-size="22" font-weight="700" fill="#F3F4F6">Grid 4 Kolom + Kontras</text>' +
      '<text x="436" y="136" font-family="sans-serif" font-size="15" fill="#9CA3AF">Hierarki tipografi menjaga fokus mata</text>' +
      '<rect x="436" y="160" width="96" height="26" rx="13" fill="#2563EB"/>' +
      '<rect x="404" y="236" width="348" height="170" rx="18" fill="#FFFFFF" stroke="#D1D5DB" stroke-width="2"/>' +
      '<circle cx="456" cy="292" r="22" fill="#059669"/>' +
      '<rect x="494" y="276" width="180" height="14" rx="7" fill="#111318"/>' +
      '<rect x="494" y="300" width="130" height="12" rx="6" fill="#5A606E" opacity="0.5"/>' +
      '<rect x="436" y="338" width="284" height="38" rx="10" fill="#F4F5F7"/>' +
    '</svg>'
  );

export const CARD_STYLE_IDS: CardStyleId[] = [
  'tiktok',
  'threads',
  'youtube',
  'social-x',
  'ig-story',
  'chat-bubble',
  'editorial',
  'news-quote',
  'podcast-clip',
  'brutalist',
  'lower-third',
  'frosted'
];

export const LAYOUT_MODE_IDS: LayoutModeId[] = ['stack', 'thread', 'zigzag', 'collage'];

export const DECORATION_IDS: DecorationId[] = ['none', 'tape', 'pin', 'gloss'];

export const getDefaultData = (): StudioData => ({
  config: {
    cardStyle: 'tiktok',
    layoutMode: 'thread',
    cardTheme: 'light',
    accentColor: '#2563EB',
    borderRadius: 18,
    cardWidth: 390,
    cardPadding: 16,
    gap: 14,
    fontScale: 100,
    fontFamily: 'sans',
    borderStyle: 'thin',
    shadow: 'soft',
    textAlign: 'left',
    tiltAngle: 0,
    decoration: 'none',
    stackDepth: 0,
    cardOpacity: 100,
    avatarSize: 36,
    avatarShape: 'circle',
    customBadgeText: '',
    showAvatar: true,
    showHandle: true,
    showMetrics: true,
    showTimestamp: true,
    showReplyTag: true,
    transparentExport: true,
    solidBgColor: '#F4F5F7',
    exportScale: 2,
    exportPadding: 28
  },
  comments: [
    {
      id: 'c-1',
      name: 'Nadia Kusuma',
      handle: 'nadia.dsgn',
      text: 'Kak, **spill cara bikin layout poster** yang informasinya padat tapi mata audiens ==nggak capek bacanya== dong! #desain #tipografi',
      time: '2j',
      likes: '1,4 rb',
      verified: false,
      isReply: false,
      replyTo: '',
      customTilt: null,
      avatarColor: '#2563EB',
      avatarImage: null,
      attachmentImage: null,
      attachmentAspect: 'auto'
    },
    {
      id: 'c-2',
      name: 'Raka Pratama',
      handle: 'studio.raka',
      text: 'Kuncinya pakai **grid 4 kolom** dan bedakan kontras ukuran judul utama vs teks pendukung @nadia.dsgn, ini contoh penerapannya:',
      time: '1j',
      likes: '842',
      verified: true,
      isReply: true,
      replyTo: 'nadia.dsgn',
      customTilt: null,
      avatarColor: '#0F172A',
      avatarImage: null,
      attachmentImage: SAMPLE_ATTACHMENT_SVG,
      attachmentAspect: 'wide'
    }
  ]
});

export function getPresetByKey(
  key: string
): { cfg: Partial<StudioConfig>; list: CommentItem[] } | null {
  const now = Date.now();
  const presets: Record<string, { cfg: Partial<StudioConfig>; list: CommentItem[] }> = {
    'tiktok-qa': {
      cfg: {
        cardStyle: 'tiktok',
        layoutMode: 'stack',
        cardTheme: 'light',
        borderRadius: 18,
        shadow: 'soft',
        borderStyle: 'none',
        fontFamily: 'sans',
        tiltAngle: -1.5,
        decoration: 'none',
        stackDepth: 0
      },
      list: [
        {
          id: `p-${now}`,
          name: 'Nadia Kusuma',
          handle: 'nadia.dsgn',
          text: 'Kak, **spill cara bikin layout poster** yang informasinya padat tapi mata audiens ==nggak capek bacanya== dong!',
          time: '2j',
          likes: '1,4 rb',
          verified: false,
          isReply: false,
          replyTo: 'nadia.dsgn',
          customTilt: null,
          avatarColor: '#2563EB',
          avatarImage: null,
          attachmentImage: null,
          attachmentAspect: 'auto'
        }
      ]
    },
    'threads-debate': {
      cfg: {
        cardStyle: 'threads',
        layoutMode: 'thread',
        cardTheme: 'light',
        borderRadius: 16,
        shadow: 'soft',
        borderStyle: 'thin',
        fontFamily: 'sans',
        tiltAngle: 0,
        decoration: 'none',
        stackDepth: 0
      },
      list: [
        {
          id: `p-a-${now}`,
          name: 'Bagas Wijaya',
          handle: 'bagas.ui',
          text: 'Jujur klien sering minta ukuran logo dibesarin, padahal yang bikin poster kebaca itu **ruang kosong (whitespace)** di sekitarnya.',
          time: '4j',
          likes: '518',
          verified: false,
          isReply: false,
          replyTo: '',
          customTilt: null,
          avatarColor: '#2563EB',
          avatarImage: null,
          attachmentImage: null,
          attachmentAspect: 'auto'
        },
        {
          id: `p-b-${now}`,
          name: 'Raka Pratama',
          handle: 'studio.raka',
          text: 'Valid @bagas.ui! Begitu margin dikasih napas 20%, elemen utamanya langsung menonjol tanpa dipaksa besar.',
          time: '3j',
          likes: '912',
          verified: true,
          isReply: true,
          replyTo: 'bagas.ui',
          customTilt: null,
          avatarColor: '#0F172A',
          avatarImage: null,
          attachmentImage: null,
          attachmentAspect: 'auto'
        }
      ]
    },
    'aesthetic-sticker': {
      cfg: {
        cardStyle: 'brutalist',
        layoutMode: 'stack',
        cardTheme: 'warm',
        borderRadius: 16,
        shadow: 'hard',
        borderStyle: 'bold',
        fontFamily: 'sans',
        tiltAngle: -2.5,
        decoration: 'tape',
        stackDepth: 1,
        showReplyTag: false
      },
      list: [
        {
          id: `p-s-${now}`,
          name: 'Tara Lestari',
          handle: 'taralestari',
          text: 'Simpan checklist ini sebelum upload konten: **Hook 2 detik**, kontras tinggi, dan satu pesan utama!',
          time: '5j',
          likes: '2,9 rb',
          verified: true,
          isReply: false,
          replyTo: '',
          customTilt: -2.5,
          avatarColor: '#E11D48',
          avatarImage: null,
          attachmentImage: null,
          attachmentAspect: 'auto'
        }
      ]
    },
    'visual-review': {
      cfg: {
        cardStyle: 'social-x',
        layoutMode: 'stack',
        cardTheme: 'light',
        borderRadius: 18,
        shadow: 'soft',
        borderStyle: 'thin',
        fontFamily: 'sans',
        tiltAngle: 0,
        decoration: 'none',
        stackDepth: 0
      },
      list: [
        {
          id: `p-v-${now}`,
          name: 'Raka Pratama',
          handle: 'studio.raka',
          text: 'Ini perbandingan sebelum dan sesudah pakai **grid 4 kolom** + hierarki kontras warna:',
          time: '1j',
          likes: '2,1 rb',
          verified: true,
          isReply: false,
          replyTo: '',
          customTilt: null,
          avatarColor: '#059669',
          avatarImage: null,
          attachmentImage: SAMPLE_ATTACHMENT_SVG,
          attachmentAspect: 'wide'
        }
      ]
    },
    'editorial-quote': {
      cfg: {
        cardStyle: 'editorial',
        layoutMode: 'stack',
        cardTheme: 'warm',
        borderRadius: 14,
        shadow: 'deep',
        borderStyle: 'thin',
        fontFamily: 'serif',
        tiltAngle: 1.5,
        decoration: 'pin',
        stackDepth: 2
      },
      list: [
        {
          id: `p-e-${now}`,
          name: 'Sari Dewi',
          handle: 'saridewi.co',
          text: 'Desain yang baik bukan soal seberapa banyak hiasan yang ditambah, tapi seberapa cepat ==pesan utamanya sampai== dalam 2 detik pertama.',
          time: '12j',
          likes: '3,4 rb',
          verified: true,
          isReply: false,
          replyTo: '',
          customTilt: null,
          avatarColor: '#D97706',
          avatarImage: null,
          attachmentImage: null,
          attachmentAspect: 'auto'
        }
      ]
    }
  };

  return presets[key] || null;
}
