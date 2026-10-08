import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Send,
  ArrowRight,
  Flame,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { submitTaskScore } from '../../lib/supabase';
import { soundFx } from '../../lib/sound';
import type { UserProfile } from '../../types';

export type PracticeCategory = 'length' | 'mass' | 'area' | 'volume';

export interface ConversionExercise {
  id: string;
  pdfLabel: string; // e.g. 'a)', 'f)'
  promptValue: string; // e.g. '5 m', '7,7 km'
  targetUnit: string; // e.g. 'cm', 'm²', 'l'
  answer: number;
  answerDisplay: string; // e.g. '500', '0,000053'
  hint: string; // e.g. '1 m = 100 cm (×100)'
}

interface CategoryConfig {
  id: PracticeCategory;
  itemCode: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  cheatSheet: string[];
  easy: ConversionExercise[];
  hard: ConversionExercise[];
}

export const PDF_PRACTICE_DATA: Record<PracticeCategory, CategoryConfig> = {
  length: {
    id: 'length',
    itemCode: 'l3_gyak_hosszusag',
    badgeLabel: '1. Gyakorló · Hosszúság',
    title: 'Hosszúságok átváltása',
    subtitle: 'Váltsd át a megadott hosszúságokat! Tizedesvessző és tizedespont is használható.',
    cheatSheet: [
      '1 km = 1000 m = 10 000 dm = 100 000 cm',
      '1 m = 10 dm = 100 cm = 1000 mm',
      '1 dm = 10 cm = 100 mm · 1 cm = 10 mm',
    ],
    easy: [
      { id: 'len_a', pdfLabel: 'a)', promptValue: '5 m', targetUnit: 'cm', answer: 500, answerDisplay: '500', hint: '1 m = 100 cm → 5 · 100 = 500' },
      { id: 'len_b', pdfLabel: 'b)', promptValue: '7 dm', targetUnit: 'cm', answer: 70, answerDisplay: '70', hint: '1 dm = 10 cm → 7 · 10 = 70' },
      { id: 'len_c', pdfLabel: 'c)', promptValue: '3 km', targetUnit: 'm', answer: 3000, answerDisplay: '3000', hint: '1 km = 1000 m → 3 · 1000 = 3000' },
      { id: 'len_g', pdfLabel: 'g)', promptValue: '3,2 m', targetUnit: 'dm', answer: 32, answerDisplay: '32', hint: '1 m = 10 dm → 3,2 · 10 = 32' },

      { id: 'len_d', pdfLabel: 'd)', promptValue: '7 cm', targetUnit: 'm', answer: 0.07, answerDisplay: '0,07', hint: '1 m = 100 cm → 7 : 100 = 0,07' },
      { id: 'len_e', pdfLabel: 'e)', promptValue: '3,2 m', targetUnit: 'mm', answer: 3200, answerDisplay: '3200', hint: '1 m = 1000 mm → 3,2 · 1000 = 3200' },
      { id: 'len_j', pdfLabel: 'j)', promptValue: '0,004 km', targetUnit: 'm', answer: 4, answerDisplay: '4', hint: '1 km = 1000 m → 0,004 · 1000 = 4' },
      { id: 'len_n', pdfLabel: 'n)', promptValue: '0,03 m', targetUnit: 'cm', answer: 3, answerDisplay: '3', hint: '1 m = 100 cm → 0,03 · 100 = 3' },

      { id: 'len_m', pdfLabel: 'm)', promptValue: '0,05 cm', targetUnit: 'mm', answer: 0.5, answerDisplay: '0,5', hint: '1 cm = 10 mm → 0,05 · 10 = 0,5' },
      { id: 'len_s', pdfLabel: 's)', promptValue: '3,57 km', targetUnit: 'm', answer: 3570, answerDisplay: '3570', hint: '1 km = 1000 m → 3,57 · 1000 = 3570' },
      { id: 'len_i', pdfLabel: 'i)', promptValue: '0,002 km', targetUnit: 'dm', answer: 20, answerDisplay: '20', hint: '1 km = 10 000 dm → 0,002 · 10 000 = 20' },
      { id: 'len_k', pdfLabel: 'k)', promptValue: '0,007 km', targetUnit: 'cm', answer: 700, answerDisplay: '700', hint: '1 km = 100 000 cm → 0,007 · 100 000 = 700' },
    ],
    hard: [
      { id: 'len_f', pdfLabel: 'f)', promptValue: '7,7 km', targetUnit: 'cm', answer: 770000, answerDisplay: '770 000', hint: '1 km = 100 000 cm → 7,7 · 100 000 = 770 000' },
      { id: 'len_o', pdfLabel: 'o)', promptValue: '7,056 km', targetUnit: 'dm', answer: 70560, answerDisplay: '70 560', hint: '1 km = 10 000 dm → 7,056 · 10 000 = 70 560' },
      { id: 'len_p', pdfLabel: 'p)', promptValue: '30,27 m', targetUnit: 'km', answer: 0.03027, answerDisplay: '0,03027', hint: '1 km = 1000 m → 30,27 : 1000 = 0,03027' },
      { id: 'len_q', pdfLabel: 'q)', promptValue: '30,27 m', targetUnit: 'mm', answer: 30270, answerDisplay: '30 270', hint: '1 m = 1000 mm → 30,27 · 1000 = 30 270' },

      { id: 'len_l', pdfLabel: 'l)', promptValue: '0,02 mm', targetUnit: 'cm', answer: 0.002, answerDisplay: '0,002', hint: '1 cm = 10 mm → 0,02 : 10 = 0,002' },
      { id: 'len_r', pdfLabel: 'r)', promptValue: '7,009 cm', targetUnit: 'm', answer: 0.07009, answerDisplay: '0,07009', hint: '1 m = 100 cm → 7,009 : 100 = 0,07009' },
      { id: 'len_t', pdfLabel: 't)', promptValue: '3,0503 km', targetUnit: 'm', answer: 3050.3, answerDisplay: '3050,3', hint: '1 km = 1000 m → 3,0503 · 1000 = 3050,3' },
      { id: 'len_u', pdfLabel: 'u)', promptValue: '93,027 cm', targetUnit: 'm', answer: 0.93027, answerDisplay: '0,93027', hint: '1 m = 100 cm → 93,027 : 100 = 0,93027' },

      { id: 'len_v', pdfLabel: 'v)', promptValue: '0,0037 m', targetUnit: 'mm', answer: 3.7, answerDisplay: '3,7', hint: '1 m = 1000 mm → 0,0037 · 1000 = 3,7' },
      { id: 'len_w', pdfLabel: 'w)', promptValue: '32,027 mm', targetUnit: 'm', answer: 0.032027, answerDisplay: '0,032027', hint: '1 m = 1000 mm → 32,027 : 1000 = 0,032027' },
      { id: 'len_x', pdfLabel: 'x)', promptValue: '3,27 mm', targetUnit: 'dm', answer: 0.0327, answerDisplay: '0,0327', hint: '1 dm = 100 mm → 3,27 : 100 = 0,0327' },
      { id: 'len_h', pdfLabel: 'h)', promptValue: '5,3 cm', targetUnit: 'km', answer: 0.000053, answerDisplay: '0,000053', hint: '1 km = 100 000 cm → 5,3 : 100 000 = 0,000053' },
    ],
  },

  mass: {
    id: 'mass',
    itemCode: 'l3_gyak_tomeg',
    badgeLabel: '2. Gyakorló · Tömeg',
    title: 'Tömegek átváltása',
    subtitle: 'Gyakorold a g, dkg, kg, mázsa (q) és tonna (t) közötti átváltásokat!',
    cheatSheet: [
      '1 t = 10 q = 1000 kg · 1 q (mázsa) = 100 kg = 10 000 dkg',
      '1 kg = 100 dkg = 1000 g · 1 dkg = 10 g',
    ],
    easy: [
      { id: 'mass_a', pdfLabel: 'a)', promptValue: '3,6 kg', targetUnit: 'dkg', answer: 360, answerDisplay: '360', hint: '1 kg = 100 dkg → 3,6 · 100 = 360' },
      { id: 'mass_b', pdfLabel: 'b)', promptValue: '72,3 dkg', targetUnit: 'g', answer: 723, answerDisplay: '723', hint: '1 dkg = 10 g → 72,3 · 10 = 723' },
      { id: 'mass_d', pdfLabel: 'd)', promptValue: '37,23 kg', targetUnit: 'dkg', answer: 3723, answerDisplay: '3723', hint: '1 kg = 100 dkg → 37,23 · 100 = 3723' },
      { id: 'mass_p', pdfLabel: 'p)', promptValue: '793 dkg', targetUnit: 'g', answer: 7930, answerDisplay: '7930', hint: '1 dkg = 10 g → 793 · 10 = 7930' },

      { id: 'mass_c', pdfLabel: 'c)', promptValue: '98,23 g', targetUnit: 'dkg', answer: 9.823, answerDisplay: '9,823', hint: '1 dkg = 10 g → 98,23 : 10 = 9,823' },
      { id: 'mass_f', pdfLabel: 'f)', promptValue: '37,23 t', targetUnit: 'q', answer: 372.3, answerDisplay: '372,3', hint: '1 t = 10 q → 37,23 · 10 = 372,3' },
      { id: 'mass_h', pdfLabel: 'h)', promptValue: '230 g', targetUnit: 'kg', answer: 0.23, answerDisplay: '0,23', hint: '1 kg = 1000 g → 230 : 1000 = 0,23' },
      { id: 'mass_o', pdfLabel: 'o)', promptValue: '793 g', targetUnit: 'dkg', answer: 79.3, answerDisplay: '79,3', hint: '1 dkg = 10 g → 793 : 10 = 79,3' },

      { id: 'mass_n', pdfLabel: 'n)', promptValue: '793 g', targetUnit: 'kg', answer: 0.793, answerDisplay: '0,793', hint: '1 kg = 1000 g → 793 : 1000 = 0,793' },
      { id: 'mass_k', pdfLabel: 'k)', promptValue: '3,002 kg', targetUnit: 'dkg', answer: 300.2, answerDisplay: '300,2', hint: '1 kg = 100 dkg → 3,002 · 100 = 300,2' },
      { id: 'mass_u', pdfLabel: 'u)', promptValue: '32,27 q', targetUnit: 't', answer: 3.227, answerDisplay: '3,227', hint: '1 t = 10 q → 32,27 : 10 = 3,227' },
      { id: 'mass_x', pdfLabel: 'x)', promptValue: '33,02 q', targetUnit: 'kg', answer: 3302, answerDisplay: '3302', hint: '1 q = 100 kg → 33,02 · 100 = 3302' },
    ],
    hard: [
      { id: 'mass_e', pdfLabel: 'e)', promptValue: '37,23 kg', targetUnit: 'q', answer: 0.3723, answerDisplay: '0,3723', hint: '1 q = 100 kg → 37,23 : 100 = 0,3723' },
      { id: 'mass_g', pdfLabel: 'g)', promptValue: '39,33 q', targetUnit: 'dkg', answer: 393300, answerDisplay: '393 300', hint: '1 q = 100 kg = 10 000 dkg → 39,33 · 10 000 = 393 300' },
      { id: 'mass_j', pdfLabel: 'j)', promptValue: '37,23 dkg', targetUnit: 'kg', answer: 0.3723, answerDisplay: '0,3723', hint: '1 kg = 100 dkg → 37,23 : 100 = 0,3723' },
      { id: 'mass_l', pdfLabel: 'l)', promptValue: '27,032 g', targetUnit: 'dkg', answer: 2.7032, answerDisplay: '2,7032', hint: '1 dkg = 10 g → 27,032 : 10 = 2,7032' },

      { id: 'mass_q', pdfLabel: 'q)', promptValue: '387,23 kg', targetUnit: 'dkg', answer: 38723, answerDisplay: '38 723', hint: '1 kg = 100 dkg → 387,23 · 100 = 38 723' },
      { id: 'mass_r', pdfLabel: 'r)', promptValue: '0,0033 kg', targetUnit: 'dkg', answer: 0.33, answerDisplay: '0,33', hint: '1 kg = 100 dkg → 0,0033 · 100 = 0,33' },
      { id: 'mass_s', pdfLabel: 's)', promptValue: '0,0207 t', targetUnit: 'kg', answer: 20.7, answerDisplay: '20,7', hint: '1 t = 1000 kg → 0,0207 · 1000 = 20,7' },
      { id: 'mass_t', pdfLabel: 't)', promptValue: '0,0402 t', targetUnit: 'dkg', answer: 4020, answerDisplay: '4020', hint: '1 t = 100 000 dkg → 0,0402 · 100 000 = 4020' },

      { id: 'mass_v', pdfLabel: 'v)', promptValue: '12,023 t', targetUnit: 'kg', answer: 12023, answerDisplay: '12 023', hint: '1 t = 1000 kg → 12,023 · 1000 = 12 023' },
      { id: 'mass_w', pdfLabel: 'w)', promptValue: '57,023 kg', targetUnit: 'dkg', answer: 5702.3, answerDisplay: '5702,3', hint: '1 kg = 100 dkg → 57,023 · 100 = 5702,3' },
      { id: 'mass_i', pdfLabel: 'i)', promptValue: '289 dkg', targetUnit: 't', answer: 0.00289, answerDisplay: '0,00289', hint: '1 t = 100 000 dkg → 289 : 100 000 = 0,00289' },
      { id: 'mass_m', pdfLabel: 'm)', promptValue: '330,0026 kg', targetUnit: 'q', answer: 3.300026, answerDisplay: '3,300026', hint: '1 q = 100 kg → 330,0026 : 100 = 3,300026' },
    ],
  },

  area: {
    id: 'area',
    itemCode: 'l3_gyak_terulet',
    badgeLabel: '3. Gyakorló · Terület',
    title: 'Területek átváltása',
    subtitle: 'Figyelj: területnél a szomszédos egységek váltószáma 100 (km² → m² esetén 1 000 000)!',
    cheatSheet: [
      '1 km² = 1 000 000 m² · 1 m² = 100 dm² = 10 000 cm² = 1 000 000 mm²',
      '1 dm² = 100 cm² = 10 000 mm² · 1 cm² = 100 mm²',
    ],
    easy: [
      { id: 'area_a', pdfLabel: 'a)', promptValue: '3 m²', targetUnit: 'cm²', answer: 30000, answerDisplay: '30 000', hint: '1 m² = 10 000 cm² → 3 · 10 000 = 30 000' },
      { id: 'area_i', pdfLabel: 'i)', promptValue: '83 dm²', targetUnit: 'm²', answer: 0.83, answerDisplay: '0,83', hint: '1 m² = 100 dm² → 83 : 100 = 0,83' },
      { id: 'area_q', pdfLabel: 'q)', promptValue: '38,23 m²', targetUnit: 'dm²', answer: 3823, answerDisplay: '3823', hint: '1 m² = 100 dm² → 38,23 · 100 = 3823' },
      { id: 'area_x', pdfLabel: 'x)', promptValue: '125,79 m²', targetUnit: 'dm²', answer: 12579, answerDisplay: '12 579', hint: '1 m² = 100 dm² → 125,79 · 100 = 12 579' },

      { id: 'area_b', pdfLabel: 'b)', promptValue: '7,23 dm²', targetUnit: 'm²', answer: 0.0723, answerDisplay: '0,0723', hint: '1 m² = 100 dm² → 7,23 : 100 = 0,0723' },
      { id: 'area_c', pdfLabel: 'c)', promptValue: '23,56 cm²', targetUnit: 'dm²', answer: 0.2356, answerDisplay: '0,2356', hint: '1 dm² = 100 cm² → 23,56 : 100 = 0,2356' },
      { id: 'area_n', pdfLabel: 'n)', promptValue: '3,78 m²', targetUnit: 'cm²', answer: 37800, answerDisplay: '37 800', hint: '1 m² = 10 000 cm² → 3,78 · 10 000 = 37 800' },
      { id: 'area_p', pdfLabel: 'p)', promptValue: '91,28 cm²', targetUnit: 'dm²', answer: 0.9128, answerDisplay: '0,9128', hint: '1 dm² = 100 cm² → 91,28 : 100 = 0,9128' },

      { id: 'area_g', pdfLabel: 'g)', promptValue: '3,73 mm²', targetUnit: 'cm²', answer: 0.0373, answerDisplay: '0,0373', hint: '1 cm² = 100 mm² → 3,73 : 100 = 0,0373' },
      { id: 'area_m', pdfLabel: 'm)', promptValue: '378 cm²', targetUnit: 'm²', answer: 0.0378, answerDisplay: '0,0378', hint: '1 m² = 10 000 cm² → 378 : 10 000 = 0,0378' },
      { id: 'area_s', pdfLabel: 's)', promptValue: '33,02 cm²', targetUnit: 'dm²', answer: 0.3302, answerDisplay: '0,3302', hint: '1 dm² = 100 cm² → 33,02 : 100 = 0,3302' },
      { id: 'area_t', pdfLabel: 't)', promptValue: '9,12 m²', targetUnit: 'cm²', answer: 91200, answerDisplay: '91 200', hint: '1 m² = 10 000 cm² → 9,12 · 10 000 = 91 200' },
    ],
    hard: [
      { id: 'area_d', pdfLabel: 'd)', promptValue: '2378,2 cm²', targetUnit: 'm²', answer: 0.23782, answerDisplay: '0,23782', hint: '1 m² = 10 000 cm² → 2378,2 : 10 000 = 0,23782' },
      { id: 'area_e', pdfLabel: 'e)', promptValue: '3,78 km²', targetUnit: 'm²', answer: 3780000, answerDisplay: '3 780 000', hint: '1 km² = 1 000 000 m² → 3,78 · 1 000 000 = 3 780 000' },
      { id: 'area_f', pdfLabel: 'f)', promptValue: '0,003 km²', targetUnit: 'dm²', answer: 300000, answerDisplay: '300 000', hint: '0,003 km² = 3000 m² = 300 000 dm²' },
      { id: 'area_h', pdfLabel: 'h)', promptValue: '270 mm²', targetUnit: 'dm²', answer: 0.027, answerDisplay: '0,027', hint: '1 dm² = 10 000 mm² → 270 : 10 000 = 0,027' },

      { id: 'area_j', pdfLabel: 'j)', promptValue: '937 cm²', targetUnit: 'm²', answer: 0.0937, answerDisplay: '0,0937', hint: '1 m² = 10 000 cm² → 937 : 10 000 = 0,0937' },
      { id: 'area_k', pdfLabel: 'k)', promptValue: '0,00683 m²', targetUnit: 'cm²', answer: 68.3, answerDisplay: '68,3', hint: '1 m² = 10 000 cm² → 0,00683 · 10 000 = 68,3' },
      { id: 'area_l', pdfLabel: 'l)', promptValue: '0,00037 km²', targetUnit: 'dm²', answer: 37000, answerDisplay: '37 000', hint: '0,00037 km² = 370 m² = 37 000 dm²' },
      { id: 'area_o', pdfLabel: 'o)', promptValue: '0,00719 m²', targetUnit: 'mm²', answer: 7190, answerDisplay: '7190', hint: '1 m² = 1 000 000 mm² → 0,00719 · 1 000 000 = 7190' },

      { id: 'area_r', pdfLabel: 'r)', promptValue: '0,00023 dm²', targetUnit: 'mm²', answer: 2.3, answerDisplay: '2,3', hint: '1 dm² = 10 000 mm² → 0,00023 · 10 000 = 2,3' },
      { id: 'area_u', pdfLabel: 'u)', promptValue: '783,12 cm²', targetUnit: 'm²', answer: 0.078312, answerDisplay: '0,078312', hint: '1 m² = 10 000 cm² → 783,12 : 10 000 = 0,078312' },
      { id: 'area_v', pdfLabel: 'v)', promptValue: '0,12 dm²', targetUnit: 'm²', answer: 0.0012, answerDisplay: '0,0012', hint: '1 m² = 100 dm² → 0,12 : 100 = 0,0012' },
      { id: 'area_w', pdfLabel: 'w)', promptValue: '0,0029 m²', targetUnit: 'mm²', answer: 2900, answerDisplay: '2900', hint: '1 m² = 1 000 000 mm² → 0,0029 · 1 000 000 = 2900' },
    ],
  },

  volume: {
    id: 'volume',
    itemCode: 'l3_gyak_terfogat',
    badgeLabel: '4. Gyakorló · Térfogat & Űrmérték',
    title: 'Térfogatok átváltása',
    subtitle: 'Köbös egységek (váltószám: 1000) és űrmértékek (1 dm³ = 1 l, 1 cm³ = 1 ml, 1 hl = 100 l).',
    cheatSheet: [
      '1 m³ = 1000 dm³ = 1000 l = 10 hl · 1 hl = 100 l = 100 dm³',
      '1 dm³ = 1 l = 10 dl = 100 cl = 1000 ml = 1000 cm³ · 1 cm³ = 1 ml = 1000 mm³',
    ],
    easy: [
      { id: 'vol_a', pdfLabel: 'a)', promptValue: '2,37 dm³', targetUnit: 'l', answer: 2.37, answerDisplay: '2,37', hint: '1 dm³ = 1 l → 2,37 dm³ = 2,37 l' },
      { id: 'vol_f', pdfLabel: 'f)', promptValue: '5,23 cm³', targetUnit: 'ml', answer: 5.23, answerDisplay: '5,23', hint: '1 cm³ = 1 ml → 5,23 cm³ = 5,23 ml' },
      { id: 'vol_w', pdfLabel: 'w)', promptValue: '12 cm³', targetUnit: 'ml', answer: 12, answerDisplay: '12', hint: '1 cm³ = 1 ml → 12 cm³ = 12 ml' },
      { id: 'vol_s', pdfLabel: 's)', promptValue: '3 m³', targetUnit: 'hl', answer: 30, answerDisplay: '30', hint: '1 m³ = 1000 l = 10 hl → 3 · 10 = 30 hl' },

      { id: 'vol_c', pdfLabel: 'c)', promptValue: '2,12 m³', targetUnit: 'l', answer: 2120, answerDisplay: '2120', hint: '1 m³ = 1000 l → 2,12 · 1000 = 2120 l' },
      { id: 'vol_j', pdfLabel: 'j)', promptValue: '3,278 dm³', targetUnit: 'l', answer: 3.278, answerDisplay: '3,278', hint: '1 dm³ = 1 l → 3,278 l' },
      { id: 'vol_l', pdfLabel: 'l)', promptValue: '27,39 cl', targetUnit: 'dl', answer: 2.739, answerDisplay: '2,739', hint: '1 dl = 10 cl → 27,39 : 10 = 2,739 dl' },
      { id: 'vol_m', pdfLabel: 'm)', promptValue: '98,12 dl', targetUnit: 'l', answer: 9.812, answerDisplay: '9,812', hint: '1 l = 10 dl → 98,12 : 10 = 9,812 l' },

      { id: 'vol_o', pdfLabel: 'o)', promptValue: '3,28 hl', targetUnit: 'dm³', answer: 328, answerDisplay: '328', hint: '1 hl = 100 l = 100 dm³ → 3,28 · 100 = 328' },
      { id: 'vol_u', pdfLabel: 'u)', promptValue: '9,12 hl', targetUnit: 'dm³', answer: 912, answerDisplay: '912', hint: '1 hl = 100 dm³ → 9,12 · 100 = 912' },
      { id: 'vol_g', pdfLabel: 'g)', promptValue: '23 hl', targetUnit: 'm³', answer: 2.3, answerDisplay: '2,3', hint: '1 m³ = 10 hl → 23 : 10 = 2,3 m³' },
      { id: 'vol_x', pdfLabel: 'x)', promptValue: '93 dm³', targetUnit: 'hl', answer: 0.93, answerDisplay: '0,93', hint: '1 hl = 100 dm³ → 93 : 100 = 0,93 hl' },
    ],
    hard: [
      { id: 'vol_b', pdfLabel: 'b)', promptValue: '0,0978 m³', targetUnit: 'l', answer: 97.8, answerDisplay: '97,8', hint: '1 m³ = 1000 l → 0,0978 · 1000 = 97,8 l' },
      { id: 'vol_d', pdfLabel: 'd)', promptValue: '5,23 cm³', targetUnit: 'dl', answer: 0.0523, answerDisplay: '0,0523', hint: '1 dl = 100 ml = 100 cm³ → 5,23 : 100 = 0,0523 dl' },
      { id: 'vol_h', pdfLabel: 'h)', promptValue: '0,0012 m³', targetUnit: 'cm³', answer: 1200, answerDisplay: '1200', hint: '1 m³ = 1 000 000 cm³ → 0,0012 · 1 000 000 = 1200' },
      { id: 'vol_i', pdfLabel: 'i)', promptValue: '9964,3 cm³', targetUnit: 'dm³', answer: 9.9643, answerDisplay: '9,9643', hint: '1 dm³ = 1000 cm³ → 9964,3 : 1000 = 9,9643' },

      { id: 'vol_k', pdfLabel: 'k)', promptValue: '98,21 cm³', targetUnit: 'l', answer: 0.09821, answerDisplay: '0,09821', hint: '1 l = 1000 cm³ → 98,21 : 1000 = 0,09821 l' },
      { id: 'vol_n', pdfLabel: 'n)', promptValue: '132,29 cl', targetUnit: 'dm³', answer: 1.3229, answerDisplay: '1,3229', hint: '1 dm³ = 1 l = 100 cl → 132,29 : 100 = 1,3229' },
      { id: 'vol_p', pdfLabel: 'p)', promptValue: '0,12 m³', targetUnit: 'dl', answer: 1200, answerDisplay: '1200', hint: '0,12 m³ = 120 l = 1200 dl' },
      { id: 'vol_q', pdfLabel: 'q)', promptValue: '8432 mm³', targetUnit: 'cm³', answer: 8.432, answerDisplay: '8,432', hint: '1 cm³ = 1000 mm³ → 8432 : 1000 = 8,432' },

      { id: 'vol_r', pdfLabel: 'r)', promptValue: '39,23 cm³', targetUnit: 'mm³', answer: 39230, answerDisplay: '39 230', hint: '1 cm³ = 1000 mm³ → 39,23 · 1000 = 39 230' },
      { id: 'vol_t', pdfLabel: 't)', promptValue: '25,3 cl', targetUnit: 'cm³', answer: 253, answerDisplay: '253', hint: '1 cl = 10 ml = 10 cm³ → 25,3 · 10 = 253' },
      { id: 'vol_v', pdfLabel: 'v)', promptValue: '12 mm³', targetUnit: 'cm³', answer: 0.012, answerDisplay: '0,012', hint: '1 cm³ = 1000 mm³ → 12 : 1000 = 0,012' },
      { id: 'vol_e', pdfLabel: 'e)', promptValue: '5,23 mm³', targetUnit: 'cl', answer: 0.000523, answerDisplay: '0,000523', hint: '1 cl = 10 cm³ = 10 000 mm³ → 5,23 : 10 000 = 0,000523' },
    ],
  },
};

interface Props {
  category: PracticeCategory;
  user: UserProfile | null;
  onPointsUpdated?: (newPoints: number) => void;
  onCompleted?: () => void;
  onNextPage?: () => void;
  nextPageLabel?: string;
}

export const TaskPdfPracticeL3: React.FC<Props> = ({
  category,
  onPointsUpdated,
  onCompleted,
  onNextPage,
  nextPageLabel,
}) => {
  const config = PDF_PRACTICE_DATA[category];

  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
  const [batchIndex, setBatchIndex] = useState<number>(0); // 0, 1, 2 (each batch has 4 exercises)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptedBatches, setAttemptedBatches] = useState<Record<string, boolean>>({});
  const [solvedBatches, setSolvedBatches] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'partial' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [scoreSubmittedOnce, setScoreSubmittedOnce] = useState<boolean>(false);

  const pool = difficulty === 'easy' ? config.easy : config.hard;
  const currentBatchKey = `${difficulty}_${batchIndex}`;
  const currentItems = pool.slice(batchIndex * 4, batchIndex * 4 + 4);
  const hasAttemptedCurrent = !!attemptedBatches[currentBatchKey];

  const parseVal = (str: string | undefined): number | null => {
    if (!str) return null;
    const clean = str.trim().replace(/\s+/g, '').replace(',', '.');
    if (!clean) return null;
    const num = Number(clean);
    return isNaN(num) ? null : num;
  };

  const isAnswerCorrect = (ex: ConversionExercise): boolean => {
    const val = parseVal(answers[ex.id]);
    if (val === null) return false;
    const tol = Math.max(Math.abs(ex.answer) * 1e-5, 1e-9);
    return Math.abs(val - ex.answer) <= tol;
  };

  const handleSelectDifficulty = (diff: 'easy' | 'hard') => {
    setDifficulty(diff);
    setBatchIndex(0);
    setMessage(null);
    setStatus('idle');
  };

  const handleSelectBatch = (idx: number) => {
    setBatchIndex(idx);
    setMessage(null);
    setStatus('idle');
  };

  const handleCheckAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allFilled = currentItems.every((item) => (answers[item.id] || '').trim().length > 0);
    if (!allFilled) {
      setMessage('Kérlek, töltsd ki mind a 4 mezőt az ellenőrzéshez!');
      setStatus('partial');
      return;
    }

    setAttemptedBatches((prev) => ({ ...prev, [currentBatchKey]: true }));

    const correctCount = currentItems.filter((item) => isAnswerCorrect(item)).length;

    if (correctCount < currentItems.length) {
      setStatus('partial');
      setMessage(
        `${correctCount}/${currentItems.length} válasz helyes ebben a csomagban. Javítsd a pirossal jelölt mezőket (kapcsold be a Segítséget a lépésekhez)!`
      );
      return;
    }

    // All 4 in current batch are correct!
    soundFx.playSuccess();
    setSolvedBatches((prev) => ({ ...prev, [currentBatchKey]: true }));

    if (!scoreSubmittedOnce) {
      setStatus('submitting');
      setMessage('Eredmények ellenőrzése és gyakorló pont beküldése...');

      const res = await submitTaskScore({
        item: config.itemCode,
        points: 1,
        note: `${config.title} (${difficulty === 'easy' ? 'Könnyebb' : 'Nehezebb'}) — 3. óra`,
        mode: 'once',
      });

      setScoreSubmittedOnce(true);

      if (res.success) {
        setStatus('success');
        setMessage(
          res.isMockDemo
            ? 'Hibátlan 4/4 átváltás! Válts a következő 4-es csomagra vagy a Nehezebb szintre további gyakorlásért!'
            : 'Hibátlan 4/4 átváltás! +1 gyakorló pont jóváírva a Pontkövetőben! Próbáld ki a többi csomagot is!'
        );
        if (res.totalPoints && onPointsUpdated) {
          onPointsUpdated(res.totalPoints);
        }
        if (onCompleted) {
          onCompleted();
        }
      } else {
        setStatus('error');
        setMessage(res.message || 'Hiba történt a pont beküldésekor.');
      }
    } else {
      setStatus('success');
      setMessage('Kiváló! Ez a 4-es csomag is 4/4 hibátlan! Válassz újabb csomagot vagy nehezebb szintet!');
    }
  };

  const handleResetBatch = () => {
    const nextAns = { ...answers };
    currentItems.forEach((it) => {
      delete nextAns[it.id];
    });
    setAnswers(nextAns);
    setAttemptedBatches((prev) => ({ ...prev, [currentBatchKey]: false }));
    setMessage(null);
    setStatus('idle');
  };

  const totalSolvedCount = Object.values(solvedBatches).filter(Boolean).length;

  return (
    <div className="w-full flex flex-col justify-between h-full text-[#2E1B14] pt-6 sm:pt-7 px-4 sm:px-6 pb-4 select-text overflow-y-auto">
      <div>
        {/* Top Metadata & Difficulty Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#7A4E38] font-serif">
            <span className="font-bold uppercase tracking-wider text-[#8B261D]">{config.badgeLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-[#8C6D58]">{totalSolvedCount}/6 csomag kész</span>
          </div>

          {/* Segmented Difficulty Filter */}
          <div className="flex items-center bg-[#E8DEC8] p-0.5 rounded-lg border border-[#DFCDB3]">
            <button
              type="button"
              onClick={() => handleSelectDifficulty('easy')}
              className={`px-2.5 py-0.5 text-[11px] font-serif font-bold rounded cursor-pointer transition-colors ${
                difficulty === 'easy'
                  ? 'bg-[#8B261D] text-white shadow-xs'
                  : 'text-[#5A4232] hover:text-[#2E1B14]'
              }`}
            >
              Könnyebb (12)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDifficulty('hard')}
              className={`px-2.5 py-0.5 text-[11px] font-serif font-bold rounded cursor-pointer transition-colors flex items-center gap-1 ${
                difficulty === 'hard'
                  ? 'bg-[#8B261D] text-white shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Nehezebb (12)</span>
            </button>
          </div>
        </div>

        {/* Title & Batch Selector */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#8B261D] leading-tight">
            {config.title}
          </h3>
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="text-[11px] font-serif text-[#8B261D] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHints ? 'Segédlet elrejtése' : 'Segédlet & Tippek'}</span>
          </button>
        </div>

        {/* Compact Cheat Sheet */}
        <div className="bg-[#FAF4E5] border border-[#DFCDB3] rounded-lg px-2.5 py-1.5 mb-2 text-[11px] font-mono text-[#5A4232] leading-snug">
          {config.cheatSheet.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Batch Tabs (3 sets of 4 problems per difficulty) */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1 flex-1">
            {[0, 1, 2].map((idx) => {
              const bKey = `${difficulty}_${idx}`;
              const isSolved = !!solvedBatches[bKey];
              const isActive = batchIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectBatch(idx)}
                  className={`flex-1 py-1 px-2 rounded-md text-[11px] font-serif font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-[#F4EEDF] border-[#8B261D] text-[#8B261D] shadow-xs'
                      : isSolved
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
                      : 'bg-white/60 border-[#DFCDB3] text-[#5A4232] hover:bg-white'
                  }`}
                >
                  <span>{idx + 1}. csomag</span>
                  {isSolved && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleResetBatch}
            className="p-1.5 rounded-md border border-[#DFCDB3] bg-white/70 hover:bg-white text-[#7A4E38] cursor-pointer"
            title="Jelenlegi 4 feladat törlése és újrakezdése"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Exercise Input Rows */}
        <form onSubmit={handleCheckAndSubmit} className="space-y-1.5 relative z-10">
          {currentItems.map((ex) => {
            const correct = isAnswerCorrect(ex);
            const val = answers[ex.id] || '';
            return (
              <div
                key={ex.id}
                onClick={(e) => {
                  const inp = (e.currentTarget as HTMLElement).querySelector('input');
                  inp?.focus();
                }}
                className={`border rounded-lg px-2.5 py-1.5 sm:py-2 transition-colors cursor-text ${
                  hasAttemptedCurrent
                    ? correct
                      ? 'bg-emerald-50/90 border-emerald-300'
                      : 'bg-rose-50/90 border-rose-300'
                    : 'bg-[#F4EEDF] border-[#DFCDB3] hover:border-[#B85042]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="font-serif text-xs sm:text-sm font-bold text-[#2E1B14] cursor-pointer flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#8B261D]">{ex.pdfLabel}</span>
                    <span>{ex.promptValue} =</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [ex.id]: e.target.value,
                        }))
                      }
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      placeholder="írj ide..."
                      className={`w-28 sm:w-32 h-8 sm:h-9 px-2 text-center font-mono font-bold text-xs sm:text-sm rounded-md border-2 bg-white transition-all select-text cursor-text ${
                        hasAttemptedCurrent && correct
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                          : hasAttemptedCurrent && !correct
                          ? 'border-rose-500 bg-rose-50 text-rose-900'
                          : 'border-[#8B261D]/40 text-[#2E1B14] focus:outline-none focus:border-[#8B261D] focus:ring-2 focus:ring-[#8B261D]/20'
                      }`}
                    />
                    <span className="font-serif font-bold text-xs text-[#5A4232] w-8">
                      {ex.targetUnit}
                    </span>
                    {hasAttemptedCurrent && (
                      correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )
                    )}
                  </div>
                </div>

                {/* Step-by-step hint if enabled or if wrong on attempt */}
                {(showHints || (hasAttemptedCurrent && !correct)) && (
                  <div className="mt-1 pt-1 border-t border-[#DFCDB3]/60 text-[10px] font-mono text-[#7A4E38] flex items-center justify-between">
                    <span>💡 {ex.hint}</span>
                    {hasAttemptedCurrent && !correct && (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setAnswers((prev) => ({ ...prev, [ex.id]: ex.answerDisplay }));
                        }}
                        className="text-[#8B261D] underline font-sans font-semibold ml-2 cursor-pointer"
                      >
                        Beilleszt ({ex.answerDisplay})
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Feedback Banner */}
          {message && (
            <div
              className={`p-2 rounded-lg border text-xs flex items-start gap-1.5 ${
                status === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : status === 'partial'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {status === 'success' ? (
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-serif text-[11px] leading-tight">{message}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex-1 py-2 px-3 rounded-lg font-serif font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm bg-[#B85042] hover:bg-[#A34335] text-white"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {status === 'submitting'
                  ? 'Ellenőrzés...'
                  : solvedBatches[currentBatchKey]
                  ? 'Újraellenőrzés'
                  : 'Csomag ellenőrzése (+1 pont)'}
              </span>
            </button>

            {solvedBatches[currentBatchKey] && batchIndex < 2 && (
              <button
                type="button"
                onClick={() => handleSelectBatch(batchIndex + 1)}
                className="py-2 px-3 rounded-lg font-serif font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>Következő 4</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Footer Link */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#8C6D58] font-serif border-t border-[#DFCDB3]/50">
        <span className="italic">Forrás: Mértékváltás feladatgyűjtemény (a–x)</span>
        {onNextPage && (
          <button
            type="button"
            onClick={onNextPage}
            className="text-[#8B261D] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{nextPageLabel || 'Következő oldal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
