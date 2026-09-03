import React, { useState } from 'react';
import {
  Palette,
  Eye,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Monitor,
  Layout,
  Compass,
  Layers,
  Check,
  Shield,
  Radio,
  Flame,
  Bell,
  Sliders,
  Smartphone,
  Maximize2,
} from 'lucide-react';
import { useTheme, THEME_OPTIONS, ThemeStyle, UiDensity, MapStylePreference } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nContext';

export const ViewSettingsTab: React.FC = () => {
  const { language } = useI18n();
  const isAf = language === 'af';

  const {
    themeStyle,
    uiDensity,
    mapStyle,
    setThemeStyle,
    setUiDensity,
    setMapStyle,
    activeThemeOption,
  } = useTheme();

  const [notificationPreview, setNotificationPreview] = useState(false);

  const handleSelectTheme = (id: ThemeStyle) => {
    setThemeStyle(id);
    setNotificationPreview(true);
    setTimeout(() => setNotificationPreview(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{isAf ? 'Voorkoms, Styl & Tema Instellings' : 'View, Appearance & Theme Settings'}</span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
                5 MODES
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isAf
                ? 'Pas die visuele tema, kleurskema, digtheid en kaartstyl aan vir optimale sigbaarheid in die beheerkamer, nagpatrollies of vir kleurblinde operateurs.'
                : 'Customize the visual theme, color palette, UI density, monochrome accessibility and map styles for optimal visibility across all operating conditions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-between sm:justify-start">
          <span className="text-[11px] text-slate-400 font-medium">
            {isAf ? 'Aktiewe Tema:' : 'Active Theme:'}
          </span>
          <span className="font-bold text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {isAf ? activeThemeOption.nameAf : activeThemeOption.name}
          </span>
        </div>
      </div>

      {notificationPreview && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2 font-bold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            {isAf
              ? `Tema suksesvol gewissel na: ${activeThemeOption.nameAf}`
              : `Theme successfully applied: ${activeThemeOption.name}`}
          </span>
        </div>
      )}

      {/* 5 THEME / STYLE OPTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-white text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>{isAf ? 'Kies Visuele Tema & Styl (5 Opsies)' : 'Choose Visual Theme & Style (5 Options)'}</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            {isAf ? 'Klik enige tema om dadelik toe te pas' : 'Click any theme card for instant preview'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themeStyle === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectTheme(opt.id)}
                className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer border flex flex-col justify-between gap-3 shadow-lg ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/40 bg-slate-900 shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/90 hover:bg-slate-900'
                }`}
              >
                {/* Header of Theme Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">
                        {isAf ? opt.nameAf : opt.name}
                      </span>
                      {opt.category === 'dark' ? (
                        <span className="p-1 rounded bg-slate-800 text-slate-300" title="Dark Canvas">
                          <Moon className="w-3 h-3 text-indigo-400" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-amber-500/20 text-amber-300" title="Light Canvas">
                          <Sun className="w-3 h-3 text-amber-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {isAf ? opt.descriptionAf : opt.description}
                    </p>
                  </div>

                  {/* Active Radio Badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md'
                        : 'border-slate-700 bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Theme Mockup Visual Palette Bar */}
                <div
                  className="rounded-xl p-3 border space-y-2"
                  style={{
                    backgroundColor: opt.previewColors.bg,
                    borderColor: opt.previewColors.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: opt.previewColors.accent }}
                    >
                      {opt.id.toUpperCase()} PREVIEW
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: opt.previewColors.accent }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: opt.previewColors.badgeText }}
                      />
                    </div>
                  </div>

                  {/* Miniature Card Mockup */}
                  <div
                    className="p-2 rounded-lg border flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: opt.previewColors.card,
                      borderColor: opt.previewColors.border,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px]"
                        style={{
                          backgroundColor: opt.previewColors.badgeBg,
                          color: opt.previewColors.badgeText,
                        }}
                      >
                        SOS
                      </div>
                      <div>
                        <div
                          className="font-bold text-[11px]"
                          style={{ color: opt.previewColors.text }}
                        >
                          Sektor 3 Reaksie
                        </div>
                        <div
                          className="text-[9px] opacity-75"
                          style={{ color: opt.previewColors.text }}
                        >
                          Status: Aktief &amp; Gereed
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2 py-1 rounded text-[10px] font-bold shadow-sm"
                      style={{
                        backgroundColor: opt.previewColors.accent,
                        color: opt.id === 'daylight' ? '#ffffff' : '#0f172a',
                      }}
                    >
                      Versend
                    </button>
                  </div>
                </div>

                {/* Recommended Use Tag */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {isAf ? 'Aanbeveel vir:' : 'Recommended for:'}
                  </span>
                  <span className="text-amber-300 font-medium">
                    {isAf ? opt.recommendedForAf : opt.recommendedFor}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADDITIONAL VIEW OPTIONS: UI DENSITY & MAP STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* UI Density Controls */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-cyan-400" />
            <h4 className="font-black text-white text-sm">
              {isAf ? 'Koppelvlak Digtheid (UI Density)' : 'UI Layout Density'}
            </h4>
          </div>
          <p className="text-slate-400 text-xs">
            {isAf
              ? 'Pas die spasiëring en padding van kaarte en tabelle aan volgens jou skermgrootte.'
              : 'Adjust padding and spacing of cards and panels to fit your screen resolution.'}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setUiDensity('compact')}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                uiDensity === 'compact'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="font-bold">{isAf ? 'Kompak' : 'Compact'}</div>
              <div className="text-[9px] opacity-80 mt-0.5">Maksimum Data</div>
            </button>

            <button
              onClick={() => setUiDensity('standard')}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                uiDensity === 'standard'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="font-bold">{isAf ? 'Standaard' : 'Standard'}</div>
              <div className="text-[9px] opacity-80 mt-0.5">Gebalanseerd</div>
            </button>

            <button
              onClick={() => setUiDensity('comfortable')}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                uiDensity === 'comfortable'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="font-bold">{isAf ? 'Ruim' : 'Comfortable'}</div>
              <div className="text-[9px] opacity-80 mt-0.5">Groot Skerwe</div>
            </button>
          </div>
        </div>

        {/* Tactical Map Style Preference */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h4 className="font-black text-white text-sm">
              {isAf ? 'Taktiese Kaart Voorkeurstyl' : 'Tactical Map Style Preference'}
            </h4>
          </div>
          <p className="text-slate-400 text-xs">
            {isAf
              ? 'Verstek styl vir die Hartbeesfontein GPS Operasionele Kaart.'
              : 'Default layer and contrast preset for the Hartbeesfontein Operations Map.'}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setMapStyle('tactical-dark')}
              className={`p-2 rounded-xl border text-left font-bold text-xs transition flex items-center justify-between ${
                mapStyle === 'tactical-dark'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{isAf ? 'Takties Donker' : 'Tactical Dark'}</span>
              {mapStyle === 'tactical-dark' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setMapStyle('satellite')}
              className={`p-2 rounded-xl border text-left font-bold text-xs transition flex items-center justify-between ${
                mapStyle === 'satellite'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{isAf ? 'Satelliet Beeld' : 'Satellite Imagery'}</span>
              {mapStyle === 'satellite' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setMapStyle('terrain')}
              className={`p-2 rounded-xl border text-left font-bold text-xs transition flex items-center justify-between ${
                mapStyle === 'terrain'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{isAf ? 'Terrein & Hoogte' : 'Terrain Contours'}</span>
              {mapStyle === 'terrain' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setMapStyle('amber-night')}
              className={`p-2 rounded-xl border text-left font-bold text-xs transition flex items-center justify-between ${
                mapStyle === 'amber-night'
                  ? 'bg-amber-600 border-amber-500 text-slate-950 font-black shadow-lg shadow-amber-600/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{isAf ? 'Amber Nagstyl' : 'Amber Night'}</span>
              {mapStyle === 'amber-night' && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setMapStyle('monochrome')}
              className={`p-2 rounded-xl border text-left font-bold text-xs transition flex items-center justify-between col-span-2 ${
                mapStyle === 'monochrome'
                  ? 'bg-white border-white text-black font-black shadow-lg shadow-white/20'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{isAf ? 'Monochroom S&W (Kleurblind Hoë-Kontras)' : 'Monochrome B&W (Color-Blind High-Contrast)'}</span>
              {mapStyle === 'monochrome' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
