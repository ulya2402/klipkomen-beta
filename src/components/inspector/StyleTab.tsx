import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shuffle } from 'lucide-react';
import type {
  AvatarShapeId,
  BorderStyleId,
  CardStyleCategory,
  CardThemeId,
  FontFamilyId,
  ShadowStyleId,
  StudioConfig,
  TextAlignId
} from '../../types';
import {
  AESTHETIC_CARD_STYLE_IDS,
  CARD_STYLE_IDS,
  DECORATION_IDS,
  LAYOUT_MODE_IDS,
  SOCIAL_CARD_STYLE_IDS
} from '../../constants/presets';
import { useI18n } from '../../hooks/useI18n';

interface StyleTabProps {
  config: StudioConfig;
  onUpdateConfig: <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => void;
  onApplyRandomTilt: () => void;
  onClearIndividualTilts: (angle: number) => void;
}

export function StyleTab({
  config,
  onUpdateConfig,
  onApplyRandomTilt,
  onClearIndividualTilts
}: StyleTabProps) {
  const { t } = useI18n();
  const [styleCategory, setStyleCategory] = useState<CardStyleCategory>('all');

  const visibleStyles =
    styleCategory === 'social'
      ? SOCIAL_CARD_STYLE_IDS
      : styleCategory === 'aesthetic'
      ? AESTHETIC_CARD_STYLE_IDS
      : CARD_STYLE_IDS;

  const palettes: { id: CardThemeId; swatch: string }[] = [
    { id: 'light', swatch: 'bg-white border-slate-200' },
    { id: 'dark', swatch: 'bg-[#161920] border-slate-700' },
    { id: 'warm', swatch: 'bg-[#FAF6EE] border-[#E6DEC8]' },
    { id: 'glass', swatch: 'bg-slate-900/80 border-white/25' }
  ];

  return (
    <motion.div
      key="tab-style"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16 }}
      className="divide-y divide-slate-200 dark:divide-slate-800"
    >
      {/* Card Styles with Minimalist Category Pills */}
      <section className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t('style.cardStylesTitle')} ({visibleStyles.length})
          </h2>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
            {t(`style.cardStyles.${config.cardStyle}.name`)}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0E1014]">
          {(['all', 'social', 'aesthetic'] as CardStyleCategory[]).map((cat) => {
            const active = styleCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setStyleCategory(cat)}
                className={`flex-1 h-7 rounded-md text-[11px] transition-all ${
                  active
                    ? 'bg-white dark:bg-[#1E222B] text-slate-900 dark:text-white font-semibold shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t(`style.categories.${cat}`)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-[250px] overflow-y-auto pr-0.5">
          {visibleStyles.map((id) => {
            const active = config.cardStyle === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateConfig('cardStyle', id)}
                className={`text-left p-2.5 rounded-xl border transition-all active:scale-[0.98] ${
                  active
                    ? 'border-blue-600 bg-blue-600/8 dark:bg-blue-500/15'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-slate-400'
                }`}
              >
                <div className="text-xs font-semibold truncate">
                  {t(`style.cardStyles.${id}.name`)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {t(`style.cardStyles.${id}.desc`)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Aesthetic Effects & Tilt */}
      <section className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('style.aestheticTitle')}</span>
          </h2>
          <button
            type="button"
            onClick={onApplyRandomTilt}
            className="h-7 px-2.5 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
            <span>{t('style.randomTilt')}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t('style.tiltLabel')}</span>
            <div className="flex items-center gap-1">
              {[
                { label: '-3°', val: -3 },
                { label: '0°', val: 0 },
                { label: '+3°', val: 3 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onClearIndividualTilts(preset.val)}
                  className="px-1.5 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700 hover:border-blue-500"
                >
                  {preset.label}
                </button>
              ))}
              <span className="tabular-nums font-semibold text-blue-600 dark:text-blue-400 w-9 text-right">
                {config.tiltAngle}°
              </span>
            </div>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={config.tiltAngle}
            onChange={(e) => onClearIndividualTilts(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5">{t('style.decorationLabel')}</label>
          <div className="grid grid-cols-4 gap-1.5">
            {DECORATION_IDS.map((id) => {
              const active = config.decoration === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdateConfig('decoration', id)}
                  className={`h-8 px-1.5 rounded-lg border text-[11px] font-medium truncate transition-all ${
                    active
                      ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  {t(`style.decorations.${id}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{t('style.stackDepthLabel')}</span>
          <div className="flex items-center gap-1">
            {[
              { val: 0, labelKey: 'style.stackSingle' },
              { val: 1, labelKey: 'style.stackOne' },
              { val: 2, labelKey: 'style.stackTwo' }
            ].map((st) => (
              <button
                key={st.val}
                type="button"
                onClick={() => onUpdateConfig('stackDepth', st.val)}
                className={`h-7 px-2.5 rounded-md border text-[11px] font-medium transition-all ${
                  config.stackDepth === st.val
                    ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {t(st.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Comment Layout */}
      <section className="p-4 sm:p-5 space-y-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('style.layoutTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {LAYOUT_MODE_IDS.map((id) => {
            const active = config.layoutMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onUpdateConfig('layoutMode', id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-600/8 dark:bg-blue-500/15'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50'
                }`}
              >
                <div className="text-xs font-semibold">{t(`style.layouts.${id}.name`)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {t(`style.layouts.${id}.desc`)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Palette & Accent */}
      <section className="p-4 sm:p-5 space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('style.paletteTitle')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {palettes.map((pal) => {
            const active = config.cardTheme === pal.id;
            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => onUpdateConfig('cardTheme', pal.id)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-600/8'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className={`block w-full h-5 rounded border mb-1.5 ${pal.swatch}`} />
                <span className="text-xs font-medium">{t(`style.palettes.${pal.id}`)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium">{t('style.accentColor')}</span>
          <div className="flex items-center gap-1.5">
            {['#2563EB', '#E11D48', '#059669', '#D97706', '#111318'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => onUpdateConfig('accentColor', col)}
                className={`w-6 h-6 rounded-full border transition-transform ${
                  config.accentColor === col
                    ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 border-white'
                    : 'border-black/15'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => onUpdateConfig('accentColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              title={t('style.customColor')}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{t('style.cardOpacity')}</span>
            <span className="tabular-nums text-slate-500">{config.cardOpacity}%</span>
          </div>
          <input
            type="range"
            min={55}
            max={100}
            step={5}
            value={config.cardOpacity}
            onChange={(e) => onUpdateConfig('cardOpacity', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600"
          />
        </div>
      </section>

      {/* Proportions, Shadow & Typography */}
      <section className="p-4 sm:p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('style.proportionsTitle')}
        </h2>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t('style.borderRadius')}</span>
            <div className="flex items-center gap-1">
              {[0, 16, 28].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onUpdateConfig('borderRadius', r)}
                  className="px-1.5 py-0.5 rounded text-[11px] border border-slate-200 dark:border-slate-700 hover:border-blue-500"
                >
                  {r}px
                </button>
              ))}
              <span className="tabular-nums font-semibold text-blue-600 dark:text-blue-400 w-9 text-right">
                {config.borderRadius}px
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={36}
            step={2}
            value={config.borderRadius}
            onChange={(e) => onUpdateConfig('borderRadius', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{t('style.cardWidth')}</span>
            <span className="tabular-nums text-slate-500">{config.cardWidth}px</span>
          </div>
          <input
            type="range"
            min={280}
            max={560}
            step={10}
            value={config.cardWidth}
            onChange={(e) => onUpdateConfig('cardWidth', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{t('style.cardPadding')}</span>
              <span className="tabular-nums text-slate-500">{config.cardPadding}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={28}
              step={2}
              value={config.cardPadding}
              onChange={(e) => onUpdateConfig('cardPadding', parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{t('style.cardGap')}</span>
              <span className="tabular-nums text-slate-500">{config.gap}px</span>
            </div>
            <input
              type="range"
              min={4}
              max={32}
              step={2}
              value={config.gap}
              onChange={(e) => onUpdateConfig('gap', parseInt(e.target.value, 10))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{t('style.fontScale')}</span>
            <span className="tabular-nums text-slate-500">{config.fontScale}%</span>
          </div>
          <input
            type="range"
            min={85}
            max={125}
            step={5}
            value={config.fontScale}
            onChange={(e) => onUpdateConfig('fontScale', parseInt(e.target.value, 10))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.avatarSize')}
            </label>
            <select
              value={config.avatarSize}
              onChange={(e) => onUpdateConfig('avatarSize', parseInt(e.target.value, 10))}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value={28}>{t('style.avatarSmall')}</option>
              <option value={36}>{t('style.avatarNormal')}</option>
              <option value={46}>{t('style.avatarLarge')}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.avatarShape')}
            </label>
            <select
              value={config.avatarShape}
              onChange={(e) => onUpdateConfig('avatarShape', e.target.value as AvatarShapeId)}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="circle">{t('style.shapeCircle')}</option>
              <option value="squircle">{t('style.shapeSquircle')}</option>
              <option value="badge">{t('style.shapeBadge')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.fontFamily')}
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => onUpdateConfig('fontFamily', e.target.value as FontFamilyId)}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="inter">{t('style.fontInter')}</option>
              <option value="sans">{t('style.fontSans')}</option>
              <option value="dm-sans">{t('style.fontDmSans')}</option>
              <option value="lora">{t('style.fontLora')}</option>
              <option value="serif">{t('style.fontSerif')}</option>
              <option value="mono">{t('style.fontMono')}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.borderStyle')}
            </label>
            <select
              value={config.borderStyle}
              onChange={(e) => onUpdateConfig('borderStyle', e.target.value as BorderStyleId)}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="none">{t('style.borderNone')}</option>
              <option value="thin">{t('style.borderThin')}</option>
              <option value="bold">{t('style.borderBold')}</option>
              <option value="dashed">{t('style.borderDashed')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.shadowStyle')}
            </label>
            <select
              value={config.shadow}
              onChange={(e) => onUpdateConfig('shadow', e.target.value as ShadowStyleId)}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="none">{t('style.shadowNone')}</option>
              <option value="soft">{t('style.shadowSoft')}</option>
              <option value="deep">{t('style.shadowDeep')}</option>
              <option value="hard">{t('style.shadowHard')}</option>
              <option value="glow">{t('style.shadowGlow')}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('style.textAlign')}
            </label>
            <select
              value={config.textAlign}
              onChange={(e) => onUpdateConfig('textAlign', e.target.value as TextAlignId)}
              className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="left">{t('style.alignLeft')}</option>
              <option value="center">{t('style.alignCenter')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Card Elements & Badges */}
      <section className="p-4 sm:p-5 space-y-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('style.elementsTitle')}
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <span className="text-xs font-medium">{t('style.showReplyTag')}</span>
            <input
              type="checkbox"
              checked={config.showReplyTag}
              onChange={(e) => onUpdateConfig('showReplyTag', e.target.checked)}
              className="accent-blue-600 w-4 h-4 rounded"
            />
          </label>

          {config.showReplyTag && (
            <div className="py-2.5">
              <label className="block text-[11px] text-slate-500 mb-1">
                {t('style.customBadgeLabel')}
              </label>
              <input
                type="text"
                value={config.customBadgeText}
                placeholder={t('style.customBadgePlaceholder')}
                onChange={(e) => onUpdateConfig('customBadgeText', e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <span className="text-xs font-medium">{t('style.showAvatar')}</span>
            <input
              type="checkbox"
              checked={config.showAvatar}
              onChange={(e) => onUpdateConfig('showAvatar', e.target.checked)}
              className="accent-blue-600 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <span className="text-xs font-medium">{t('style.showHandle')}</span>
            <input
              type="checkbox"
              checked={config.showHandle}
              onChange={(e) => onUpdateConfig('showHandle', e.target.checked)}
              className="accent-blue-600 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <span className="text-xs font-medium">{t('style.showMetrics')}</span>
            <input
              type="checkbox"
              checked={config.showMetrics}
              onChange={(e) => onUpdateConfig('showMetrics', e.target.checked)}
              className="accent-blue-600 w-4 h-4 rounded"
            />
          </label>

          <label className="flex items-center justify-between py-2.5 cursor-pointer">
            <span className="text-xs font-medium">{t('style.showTimestamp')}</span>
            <input
              type="checkbox"
              checked={config.showTimestamp}
              onChange={(e) => onUpdateConfig('showTimestamp', e.target.checked)}
              className="accent-blue-600 w-4 h-4 rounded"
            />
          </label>
        </div>
      </section>
    </motion.div>
  );
}
