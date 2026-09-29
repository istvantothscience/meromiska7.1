import React, { useState, useId } from 'react';
import {
  Scale,
  FlaskConical,
  Sparkles,
  ArrowRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Info,
  CheckCircle2,
  Waves,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../lib/sound';

export interface MaterialDef {
  id: string;
  name: string;
  density: number; // in g/cm3
  color: string;
  textColor: string;
  bgColor: string;
  borderCol: string;
  textureLabel: string;
  defaultMass: number; // in g
  defaultVolume: number; // in cm3
  description: string;
}

export const PRESET_MATERIALS: MaterialDef[] = [
  {
    id: 'vas',
    name: 'Vas (hasáb)',
    density: 7.8,
    color: 'from-slate-700 via-zinc-600 to-slate-800',
    textColor: 'text-slate-800',
    bgColor: 'bg-slate-100',
    borderCol: 'border-slate-400',
    textureLabel: 'Nehéz, szürke fém',
    defaultMass: 78,
    defaultVolume: 10,
    description: 'A vas sűrűsége 7,8 g/cm³. Minden egyes cm³ vas tömege 7,8 g.',
  },
  {
    id: 'aluminium',
    name: 'Alumínium',
    density: 2.7,
    color: 'from-slate-300 via-gray-200 to-slate-400',
    textColor: 'text-slate-700',
    bgColor: 'bg-zinc-100',
    borderCol: 'border-slate-300',
    textureLabel: 'Könnyű ezüstös fém',
    defaultMass: 27,
    defaultVolume: 10,
    description: 'Az alumínium sűrűsége 2,7 g/cm³. Közel harmada a vasénak!',
  },
  {
    id: 'tolgyfa',
    name: 'Tölgyfa',
    density: 0.7,
    color: 'from-amber-700 via-yellow-800 to-amber-900',
    textColor: 'text-amber-900',
    bgColor: 'bg-amber-50',
    borderCol: 'border-amber-400',
    textureLabel: 'Könnyű faerezett test',
    defaultMass: 14,
    defaultVolume: 20,
    description: 'A száraz tölgyfa sűrűsége kb. 0,7 g/cm³. Kisebb a vízénél, ezért úszik a vízen!',
  },
  {
    id: 'viz',
    name: 'Tiszta víz',
    density: 1.0,
    color: 'from-sky-400 via-blue-400 to-cyan-500',
    textColor: 'text-blue-800',
    bgColor: 'bg-blue-50',
    borderCol: 'border-blue-300',
    textureLabel: 'Folyadék alapegység',
    defaultMass: 50,
    defaultVolume: 50,
    description: 'A 4 °C-os tiszta víz sűrűsége pontosan 1,0 g/cm³ = 1000 kg/m³.',
  },
  {
    id: 'bor',
    name: 'Révész vörösbora',
    density: 0.99,
    color: 'from-rose-800 via-red-900 to-amber-950',
    textColor: 'text-rose-950',
    bgColor: 'bg-rose-50',
    borderCol: 'border-rose-400',
    textureLabel: 'Alkoholtartalmú bor',
    defaultMass: 99,
    defaultVolume: 100,
    description: 'A révész hordóiban lévő bor sűrűsége kb. 0,99 g/cm³, kissé könnyebb a víznél az alkohol miatt!',
  },
  {
    id: 'arany',
    name: 'Tiszta arany',
    density: 19.3,
    color: 'from-amber-400 via-yellow-300 to-amber-500',
    textColor: 'text-amber-900',
    bgColor: 'bg-amber-50',
    borderCol: 'border-amber-400',
    textureLabel: 'Rendkívül nehéz nemesfém',
    defaultMass: 193,
    defaultVolume: 10,
    description: 'Az arany rendkívül sűrű fém: 19,3 g/cm³. Egy maroknyi arany meglepően nehéz!',
  },
];

interface SimulationData {
  m1: number;
  v1: number;
  q1: number;
  m2: number;
  v2: number;
  q2: number;
  m3: number;
  v3: number;
  q3: number;
  materialName: string;
}

interface Props {
  onApplyToTask?: (data: SimulationData) => void;
  isApplied?: boolean;
}

export const DensitySimulation: React.FC<Props> = ({ onApplyToTask, isApplied }) => {
  const [activeTab, setActiveTab] = useState<'sim' | 'series' | 'theory'>('sim');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('vas');
  const [isCustomMaterial, setIsCustomMaterial] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('Különleges kő');

  // Direct user-entered numbers
  const [massInput, setMassInput] = useState<string>('78');
  const [volumeInput, setVolumeInput] = useState<string>('10');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [liquidType, setLiquidType] = useState<'water' | 'wine'>('water');

  // Multiplier for 3-block series experiment
  const [seriesMaterial, setSeriesMaterial] = useState<string>('vas');

  const currentPreset = PRESET_MATERIALS.find((m) => m.id === selectedMaterial) || PRESET_MATERIALS[0];

  const parseNum = (val: string): number => {
    const clean = val.trim().replace(',', '.');
    const n = parseFloat(clean);
    return isNaN(n) ? 0 : n;
  };

  const massNum = parseNum(massInput);
  const volumeNum = parseNum(volumeInput);

  // Computed density rho = m / V
  const computedDensity = volumeNum > 0 ? massNum / volumeNum : 0;
  const computedKgM3 = computedDensity * 1000;

  // Liquid density for buoyancy comparison
  const liquidDensity = liquidType === 'water' ? 1.0 : 0.99;

  // Buoyancy status: float, hover, sink
  let buoyancyStatus: 'float' | 'hover' | 'sink' = 'sink';
  if (computedDensity === 0) {
    buoyancyStatus = 'hover';
  } else if (Math.abs(computedDensity - liquidDensity) < 0.03) {
    buoyancyStatus = 'hover';
  } else if (computedDensity < liquidDensity) {
    buoyancyStatus = 'float';
  } else {
    buoyancyStatus = 'sink';
  }

  // Handle Preset Selection
  const handleSelectPreset = (matId: string) => {
    soundFx.playWoodTap();
    setIsCustomMaterial(false);
    setSelectedMaterial(matId);
    const found = PRESET_MATERIALS.find((m) => m.id === matId);
    if (found) {
      setMassInput(String(found.defaultMass));
      setVolumeInput(String(found.defaultVolume));
    }
  };

  const handleCustomMode = () => {
    soundFx.playWoodTap();
    setIsCustomMaterial(true);
  };

  // Generate 3 sample blocks for the series experiment
  const getSeriesData = (matId: string): SimulationData => {
    const mat = PRESET_MATERIALS.find((m) => m.id === matId) || PRESET_MATERIALS[0];
    const rho = mat.density;
    const v1 = 10;
    const m1 = Math.round(v1 * rho * 10) / 10;
    const q1 = Math.round((m1 / v1) * 100) / 100;

    const v2 = 25;
    const m2 = Math.round(v2 * rho * 10) / 10;
    const q2 = Math.round((m2 / v2) * 100) / 100;

    const v3 = 50;
    const m3 = Math.round(v3 * rho * 10) / 10;
    const q3 = Math.round((m3 / v3) * 100) / 100;

    return {
      m1,
      v1,
      q1,
      m2,
      v2,
      q2,
      m3,
      v3,
      q3,
      materialName: mat.name,
    };
  };

  const currentSeries = getSeriesData(seriesMaterial);

  const handleTransferToTask = () => {
    soundFx.playSuccess();
    if (onApplyToTask) {
      onApplyToTask(currentSeries);
    }
  };

  // Dynamic visual sizing for the block (clamped between 28px and 90px)
  const blockScale = Math.min(Math.max(28 + Math.sqrt(Math.max(volumeNum, 1)) * 7, 30), 85);

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 text-[#2E1B14] select-text">
      <div>
        {/* Header with Title and Mode Switcher */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#B85042] text-white text-[10px] sm:text-xs font-serif uppercase tracking-widest px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <FlaskConical className="w-3 h-3" />
              Sűrűség-szimuláció
            </span>
            <span className="text-[10px] font-mono text-[#8C6D58] bg-[#EAE2D0] px-1.5 py-0.5 rounded">
              ρ = m ÷ V
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsModalOpen(true)}
              title="Kinyitás teljes nézetben"
              className="p-1 rounded bg-[#EFE7D2] hover:bg-[#DFCDB3] text-[#8B261D] text-xs transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[#E8DCB8]/60 rounded-lg mb-2 text-xs font-serif">
          <button
            onClick={() => setActiveTab('sim')}
            className={`flex-1 py-1 px-2 rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'sim'
                ? 'bg-white text-[#8B261D] shadow-xs'
                : 'text-[#6A5342] hover:bg-white/50'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>Mérő-labor</span>
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`flex-1 py-1 px-2 rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'series'
                ? 'bg-white text-[#8B261D] shadow-xs'
                : 'text-[#6A5342] hover:bg-white/50'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>3 Hasáb Kísérlet</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex-1 py-1 px-2 rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'theory'
                ? 'bg-white text-[#8B261D] shadow-xs'
                : 'text-[#6A5342] hover:bg-white/50'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Anyagtáblázat</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE MEASURING LAB */}
        {activeTab === 'sim' && (
          <div className="space-y-2.5">
            {/* Quick Material Selector Pills */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#5A4232] mb-1">
                <span>Válassz anyagot vagy írj be egyéni számokat:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {PRESET_MATERIALS.map((mat) => {
                  const isSel = !isCustomMaterial && selectedMaterial === mat.id;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => handleSelectPreset(mat.id)}
                      className={`text-[10px] sm:text-xs font-serif px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                        isSel
                          ? 'bg-[#B85042] text-white border-[#8B261D] shadow-xs font-bold'
                          : 'bg-white/80 text-[#4A382D] border-[#C8B89E] hover:bg-[#FAF4E5]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          mat.id === 'vas'
                            ? 'bg-slate-700'
                            : mat.id === 'tolgyfa'
                            ? 'bg-amber-800'
                            : mat.id === 'viz'
                            ? 'bg-blue-400'
                            : mat.id === 'bor'
                            ? 'bg-rose-800'
                            : mat.id === 'arany'
                            ? 'bg-yellow-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {mat.name.split(' ')[0]}
                    </button>
                  );
                })}
                <button
                  onClick={handleCustomMode}
                  className={`text-[10px] sm:text-xs font-serif px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    isCustomMaterial
                      ? 'bg-[#8B261D] text-white border-[#6A1C15] shadow-xs font-bold'
                      : 'bg-white/80 text-[#6A5342] border-dashed border-[#B85042] hover:bg-[#FAF4E5]'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Egyéni számok
                </button>
              </div>
            </div>

            {/* Input Card: Enter Mass and Volume */}
            <div className="p-2.5 bg-white/85 rounded-xl border border-[#C8B89E] shadow-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Mass input */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#4A382D] mb-0.5">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3 text-[#B85042]" />
                      Tömeg (m):
                    </span>
                    <span className="text-[10px] text-[#8C6D58] font-mono">gramm [g]</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={massInput}
                      onChange={(e) => {
                        setMassInput(e.target.value);
                        setIsCustomMaterial(true);
                      }}
                      placeholder="pl. 78"
                      className="w-full px-2 py-1 text-xs sm:text-sm font-mono font-bold bg-[#FFFDF7] border border-[#C8B89E] rounded focus:ring-1 focus:ring-[#B85042] focus:border-[#B85042] text-center"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    step="1"
                    value={Math.min(Math.max(massNum, 1), 500)}
                    onChange={(e) => {
                      setMassInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full accent-[#B85042] h-1.5 bg-[#DFCDB3] rounded-lg cursor-pointer mt-1"
                  />
                </div>

                {/* Volume input */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#4A382D] mb-0.5">
                    <span className="flex items-center gap-1">
                      <FlaskConical className="w-3 h-3 text-[#3B82F6]" />
                      Térfogat (V):
                    </span>
                    <span className="text-[10px] text-[#8C6D58] font-mono">[cm³] vagy [ml]</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={volumeInput}
                      onChange={(e) => {
                        setVolumeInput(e.target.value);
                        setIsCustomMaterial(true);
                      }}
                      placeholder="pl. 10"
                      className="w-full px-2 py-1 text-xs sm:text-sm font-mono font-bold bg-[#FFFDF7] border border-[#C8B89E] rounded focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] text-center"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="200"
                    step="1"
                    value={Math.min(Math.max(volumeNum, 1), 200)}
                    onChange={(e) => {
                      setVolumeInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full accent-[#3B82F6] h-1.5 bg-[#DFCDB3] rounded-lg cursor-pointer mt-1"
                  />
                </div>
              </div>

              {/* Instant Density Formula Display */}
              <div className="pt-1.5 border-t border-[#DFCDB3] flex flex-col sm:flex-row items-center justify-between gap-1 bg-[#FAF4E5] p-2 rounded-lg text-xs">
                <div className="font-mono text-[#2E1B14] flex items-center gap-1 font-semibold">
                  <span className="text-[#8B261D] font-bold">ρ</span> ={' '}
                  <span className="text-[#8B261D]">{massNum > 0 ? massNum : 'm'} g</span> ÷{' '}
                  <span className="text-[#3B82F6]">{volumeNum > 0 ? volumeNum : 'V'} cm³</span> =
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-base font-extrabold text-[#8B261D] bg-white px-2 py-0.5 rounded border border-[#E5B842] shadow-xs">
                    {volumeNum > 0 ? computedDensity.toFixed(2).replace('.', ',') : '—'} g/cm³
                  </span>
                  <span className="text-[10px] text-[#6A5342] font-mono">
                    ({volumeNum > 0 ? Math.round(computedKgM3) : '—'} kg/m³)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Physics Stage (Scale + Block + Immersion Cylinder) */}
            <div className="grid grid-cols-12 gap-2 p-2.5 bg-[#F5ECE0] rounded-xl border border-[#DFCDB3] shadow-inner items-center">
              {/* Left: 3D Block representation */}
              <div className="col-span-5 flex flex-col items-center justify-center p-2 bg-white/70 rounded-lg border border-[#DFCDB3] min-h-[90px]">
                <span className="text-[10px] font-serif text-[#6A5342] mb-1 font-semibold">
                  {isCustomMaterial ? 'Egyéni test' : currentPreset.name}
                </span>
                <div
                  style={{
                    width: `${blockScale}px`,
                    height: `${blockScale * 0.8}px`,
                  }}
                  className={`rounded border-2 shadow-md transition-all duration-300 flex items-center justify-center text-center p-1 relative overflow-hidden ${
                    selectedMaterial === 'vas' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-slate-600 via-zinc-400 to-slate-800 border-slate-700 text-white'
                      : selectedMaterial === 'aluminium' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 border-slate-400 text-slate-800'
                      : selectedMaterial === 'tolgyfa' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-amber-700 via-yellow-700 to-amber-900 border-amber-900 text-amber-100'
                      : selectedMaterial === 'viz' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-500 border-blue-500 text-white'
                      : selectedMaterial === 'bor' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-rose-800 via-red-900 to-amber-950 border-rose-950 text-rose-100'
                      : selectedMaterial === 'arany' && !isCustomMaterial
                      ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 border-yellow-600 text-amber-950 font-bold'
                      : 'bg-gradient-to-br from-[#B85042] via-[#DFCDB3] to-[#8B261D] border-[#8B261D] text-white'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold drop-shadow">
                    {volumeNum} cm³
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#8C6D58] mt-1">m = {massNum} g</span>
              </div>

              {/* Right: Buoyancy Immersion Tank (Float vs Sink) */}
              <div className="col-span-7 flex flex-col p-2 bg-white/70 rounded-lg border border-[#DFCDB3]">
                <div className="flex items-center justify-between text-[10px] font-serif text-[#6A5342] mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Waves className="w-3 h-3 text-sky-600" />
                    Úszás vagy elmerülés?
                  </span>
                  <button
                    onClick={() => setLiquidType(liquidType === 'water' ? 'wine' : 'water')}
                    className="text-[9px] text-[#8B261D] underline cursor-pointer"
                  >
                    Folyadék: {liquidType === 'water' ? 'Víz (1 g/cm³)' : 'Bor (0,99 g/cm³)'}
                  </button>
                </div>

                {/* Animated Water Vessel */}
                <div className="relative w-full h-16 bg-sky-50 rounded border-2 border-sky-400 overflow-hidden flex flex-col justify-end">
                  {/* Liquid fill */}
                  <div
                    className={`absolute inset-x-0 bottom-0 top-3 transition-colors duration-500 ${
                      liquidType === 'water' ? 'bg-sky-400/40' : 'bg-rose-700/40'
                    }`}
                  >
                    {/* Water waves effect */}
                    <div className="w-full h-1 bg-sky-300/80 absolute top-0" />
                  </div>

                  {/* Submerged body position */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 flex items-center justify-center rounded px-1.5 py-0.5 text-[8px] font-bold shadow ${
                      buoyancyStatus === 'float'
                        ? 'top-2 bg-amber-200 text-amber-900 border border-amber-400'
                        : buoyancyStatus === 'hover'
                        ? 'top-7 bg-blue-200 text-blue-900 border border-blue-400'
                        : 'bottom-1 bg-slate-300 text-slate-900 border border-slate-500'
                    }`}
                  >
                    {buoyancyStatus === 'float'
                      ? 'ÚSZIK A FELSZÍNEN'
                      : buoyancyStatus === 'hover'
                      ? 'LEBEG'
                      : 'LEMERÜL AZ ALJÁRA'}
                  </div>
                </div>

                <div className="text-[10px] text-[#4A382D] font-serif mt-1 text-center">
                  {buoyancyStatus === 'float' ? (
                    <span className="text-emerald-800 font-bold">
                      ✓ A test sűrűsége ({computedDensity.toFixed(2)}) kisebb a folyadéknál, ezért úszik!
                    </span>
                  ) : buoyancyStatus === 'hover' ? (
                    <span className="text-blue-800 font-bold">
                      ≈ A test sűrűsége közel azonos a folyadékkal, így lebeg.
                    </span>
                  ) : (
                    <span className="text-amber-900 font-bold">
                      ↓ A test sűrűsége ({computedDensity.toFixed(2)}) nagyobb a folyadéknál, ezért elmerül!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3-BLOCK SERIES EXPERIMENT (FOR THE OPPOSITE PAGE TASK) */}
        {activeTab === 'series' && (
          <div className="space-y-2.5">
            <div className="p-2.5 bg-[#FAF4E5] rounded-xl border border-[#C8B89E] text-xs text-[#4A382D]">
              <div className="font-serif font-bold text-[#8B261D] mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#B85042]" />
                Miska kísérlete: 3 különböző méretű hasáb ugyanabból az anyagból
              </div>
              <p className="text-[11px] leading-relaxed">
                Válassz egy anyagot, és figyeld meg, hogy hiába nagyobb a tömeg és a térfogat, a hányadosuk (m ÷ V) <strong>mindig pontosan ugyanaz</strong> marad!
              </p>
            </div>

            {/* Choose material for the 3 blocks */}
            <div className="flex items-center gap-1">
              <span className="text-xs font-serif font-bold text-[#5A4232]">Anyag kiválasztása:</span>
              <select
                value={seriesMaterial}
                onChange={(e) => setSeriesMaterial(e.target.value)}
                className="px-2 py-1 text-xs font-serif bg-white border border-[#C8B89E] rounded-md font-bold text-[#8B261D] cursor-pointer"
              >
                <option value="vas">Vas (7,8 g/cm³)</option>
                <option value="aluminium">Alumínium (2,7 g/cm³)</option>
                <option value="tolgyfa">Tölgyfa (0,7 g/cm³)</option>
                <option value="arany">Arany (19,3 g/cm³)</option>
              </select>
            </div>

            {/* 3 blocks table */}
            <div className="bg-white/80 rounded-xl border border-[#DFCDB3] overflow-hidden shadow-xs text-xs">
              <div className="grid grid-cols-12 gap-1 p-2 bg-[#EFE7D2] font-serif font-bold text-[#4A382D] text-[11px]">
                <div className="col-span-3">Test mérete</div>
                <div className="col-span-3 text-center">Tömeg (m)</div>
                <div className="col-span-3 text-center">Térfogat (V)</div>
                <div className="col-span-3 text-center text-[#8B261D]">m ÷ V hányados</div>
              </div>

              {/* Row 1 */}
              <div className="grid grid-cols-12 gap-1 p-2 border-b border-[#DFCDB3] items-center">
                <div className="col-span-3 font-serif font-bold text-[#2E1B14] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  1. Kis hasáb
                </div>
                <div className="col-span-3 text-center font-mono font-bold text-[#2E1B14]">
                  {currentSeries.m1} g
                </div>
                <div className="col-span-3 text-center font-mono text-[#3B82F6]">
                  {currentSeries.v1} cm³
                </div>
                <div className="col-span-3 text-center font-mono font-extrabold text-[#8B261D] bg-[#FFF9ED] py-0.5 rounded">
                  {currentSeries.q1} g/cm³
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-1 p-2 border-b border-[#DFCDB3] items-center">
                <div className="col-span-3 font-serif font-bold text-[#2E1B14] flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  2. Közepes
                </div>
                <div className="col-span-3 text-center font-mono font-bold text-[#2E1B14]">
                  {currentSeries.m2} g
                </div>
                <div className="col-span-3 text-center font-mono text-[#3B82F6]">
                  {currentSeries.v2} cm³
                </div>
                <div className="col-span-3 text-center font-mono font-extrabold text-[#8B261D] bg-[#FFF9ED] py-0.5 rounded">
                  {currentSeries.q2} g/cm³
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-12 gap-1 p-2 items-center">
                <div className="col-span-3 font-serif font-bold text-[#2E1B14] flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                  3. Nagy hasáb
                </div>
                <div className="col-span-3 text-center font-mono font-bold text-[#2E1B14]">
                  {currentSeries.m3} g
                </div>
                <div className="col-span-3 text-center font-mono text-[#3B82F6]">
                  {currentSeries.v3} cm³
                </div>
                <div className="col-span-3 text-center font-mono font-extrabold text-[#8B261D] bg-[#FFF9ED] py-0.5 rounded">
                  {currentSeries.q3} g/cm³
                </div>
              </div>
            </div>

            {/* Transfer button to 2. Próba */}
            {onApplyToTask && (
              <button
                type="button"
                onClick={handleTransferToTask}
                className="w-full py-2 px-3 bg-gradient-to-r from-[#B85042] via-[#8B261D] to-[#B85042] hover:brightness-110 text-white font-serif font-bold text-xs rounded-lg border border-[#E5B842] shadow flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFF2B2]" />
                <span>Adatok átvitele a szemközti 2. Próbához (Jobb oldal) →</span>
              </button>
            )}

            {isApplied && (
              <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-800 font-serif font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Az adatok sikeresen bekerültek a jobb oldali feladatba!
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STANDARD DENSITIES REFERENCE TABLE */}
        {activeTab === 'theory' && (
          <div className="space-y-2 text-xs">
            <div className="p-2 bg-[#FAF4E5] rounded-lg border border-[#C8B89E] text-[11px] text-[#4A382D]">
              <strong>Gyakori anyagok sűrűsége (7. osztályos fizika):</strong>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_MATERIALS.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => {
                    handleSelectPreset(mat.id);
                    setActiveTab('sim');
                  }}
                  className="p-2 bg-white/80 rounded-lg border border-[#DFCDB3] hover:border-[#B85042] cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="font-serif font-bold text-[#8B261D]">{mat.name}</div>
                    <div className="text-[10px] text-[#6A5342]">{mat.textureLabel}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#2E1B14] bg-[#FAF4E5] px-1.5 py-0.5 rounded border border-[#DFCDB3]">
                      {mat.density.toString().replace('.', ',')} g/cm³
                    </span>
                    <div className="text-[9px] font-mono text-[#8C6D58]">
                      {mat.density * 1000} kg/m³
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 bg-[#E7E8D1] border border-[#A7BEAE] rounded-lg text-[11px] text-[#2E1B14] mt-1">
              <strong>Fontos átváltási szabály:</strong> 1 g/cm³ = 1000 kg/m³. Vagyis ha a sűrűség g/cm³-ben van megadva, ezerrel kell szorozni az SI alapegységhez (kg/m³)!
            </div>
          </div>
        )}
      </div>

      {/* Footer Quote from Story */}
      <div className="pt-2 border-t border-[#DFCDB3] flex items-center justify-between text-[11px] text-[#8C6D58] font-serif italic">
        <span>„Ha valóban tele lenne borral...”</span>
        <span className="font-sans font-bold text-[#8B261D]">ρ = m ÷ V</span>
      </div>

      {/* Fullscreen Expansion Modal for Smartboard / Deep Inspection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FBF7EE] border-4 border-[#C6923C] rounded-2xl p-6 shadow-2xl text-[#2E1B14]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFCDB3] mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#B85042] text-white rounded-lg shadow-sm">
                  <FlaskConical className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#8B261D]">
                    Mérő Miska Nagy Sűrűség-Laboratóriuma
                  </h2>
                  <p className="text-xs text-[#6A5342]">
                    Interaktív szimuláció a tömeg, térfogat és sűrűség összefüggésének vizsgálatához
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#EAE2D0] hover:bg-[#DFCDB3] text-[#8B261D] font-bold text-sm cursor-pointer"
              >
                Bezárás ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <span className="text-xs font-serif font-bold text-[#5A4232] block mb-1">
                  Válassz egy anyagot:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {PRESET_MATERIALS.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => handleSelectPreset(mat.id)}
                      className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                        !isCustomMaterial && selectedMaterial === mat.id
                          ? 'bg-[#B85042] text-white border-[#8B261D] shadow-md font-bold'
                          : 'bg-white text-[#4A382D] border-[#C8B89E] hover:bg-[#FAF4E5]'
                      }`}
                    >
                      <div className="text-xs font-serif font-bold">{mat.name}</div>
                      <div className="text-[11px] font-mono mt-0.5">
                        {mat.density.toString().replace('.', ',')} g/cm³
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Input Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-[#C8B89E]">
                {/* Mass */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-sm text-[#8B261D] flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> Test tömege (m):
                    </label>
                    <span className="font-mono text-sm font-bold text-[#2E1B14] bg-[#FAF4E5] px-2 py-0.5 rounded border border-[#DFCDB3]">
                      {massNum} g
                    </span>
                  </div>
                  <input
                    type="text"
                    value={massInput}
                    onChange={(e) => {
                      setMassInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full px-3 py-1.5 font-mono text-lg font-bold border border-[#C8B89E] rounded text-center"
                  />
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    step="1"
                    value={Math.min(Math.max(massNum, 1), 1000)}
                    onChange={(e) => {
                      setMassInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full accent-[#B85042] cursor-pointer"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-serif font-bold text-sm text-[#3B82F6] flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4" /> Test térfogata (V):
                    </label>
                    <span className="font-mono text-sm font-bold text-[#2E1B14] bg-[#FAF4E5] px-2 py-0.5 rounded border border-[#DFCDB3]">
                      {volumeNum} cm³
                    </span>
                  </div>
                  <input
                    type="text"
                    value={volumeInput}
                    onChange={(e) => {
                      setVolumeInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full px-3 py-1.5 font-mono text-lg font-bold border border-[#C8B89E] rounded text-center"
                  />
                  <input
                    type="range"
                    min="1"
                    max="500"
                    step="1"
                    value={Math.min(Math.max(volumeNum, 1), 500)}
                    onChange={(e) => {
                      setVolumeInput(e.target.value);
                      setIsCustomMaterial(true);
                    }}
                    className="w-full accent-[#3B82F6] cursor-pointer"
                  />
                </div>
              </div>

              {/* Large Result Banner */}
              <div className="p-4 bg-gradient-to-r from-[#FAF4E5] via-[#FFF9ED] to-[#FAF4E5] rounded-xl border-2 border-[#E5B842] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-serif tracking-wider text-[#8C6D58] font-bold">
                    Számított sűrűség:
                  </span>
                  <div className="font-mono text-lg font-bold text-[#2E1B14]">
                    ρ = <span className="text-[#8B261D]">{massNum} g</span> ÷{' '}
                    <span className="text-[#3B82F6]">{volumeNum} cm³</span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="font-mono text-3xl font-extrabold text-[#8B261D]">
                    {volumeNum > 0 ? computedDensity.toFixed(2).replace('.', ',') : '—'} g/cm³
                  </div>
                  <div className="text-xs font-mono text-[#6A5342]">
                    = {volumeNum > 0 ? Math.round(computedKgM3) : '—'} kg/m³
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#B85042] text-white font-serif font-bold rounded-xl shadow cursor-pointer hover:bg-[#A34335]"
                >
                  Vissza a könyvhöz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
