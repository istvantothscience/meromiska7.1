import React, { useState } from 'react';
import { X, Copy, Check, Image as ImageIcon, Sparkles, Download, ExternalLink, BookOpen } from 'lucide-react';
import { resolveSceneImage } from '../content/lessons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeLessonId?: string;
}

interface ScenePromptData {
  n: number;
  title: string;
  imageFileName: string;
  prompt: string;
}

const STYLE_ANCHOR = `Kézzel festett AKVARELL (vízfesték) mesekönyv-illusztráció stílusban: jól látható, textúrás ecsetvonások, helyenként enyhén szétfolyó, áztatott színátmenetek, a merített papír textúrája finoman átüt a felületen. Visszafogott, meleg, földszínű paletta: okker, terrakotta, mohazöld, halvány égszínkék, mély barna árnyékok. Lágy, festői körvonalak — NE legyen kemény, digitális tusvonal vagy fekete kontúr. Semmiképp ne legyen fotórealisztikus, 3D-render vagy digitális 'airbrush' hatású. Gyerekbarát, 12-13 éveseknek szóló (7. osztályos) mesekönyv-illusztráció hangulata. Álló (portré) vagy 4:5 arányú kompozíció. Ne legyen a képen semmilyen szöveg, felirat vagy vízjel.`;

const L3_SCENE_PROMPTS: ScenePromptData[] = [
  {
    n: 1,
    title: 'A vásártér',
    imageFileName: '01_a_vasarter.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. Hajnali derengésben nyüzsgő, zsúfolt régi vásártér: színes ponyvás sátrak, fakordék, kiabáló kalmárok, füst és fáklyafény. A táblák és cégérek NEM tartalmaznak olvasható feliratot (csak elmosódott jelek, rajzolt mérlegek, szövetek, zsákok). A legkisebb fiú (16-17 éves fiú, sötétbarna kócos haj, barna szem, vászoning, barna mellény, vászontarisznya, övén régi mérőzsinór) a vásártér kapujában áll, egyik keze a válláról lógó tarisznyát szorítja, tanácstalanul és éberen pásztázza a tömeget. A háttérben halványan a város tornyai. Zaj, tolongás, kissé feszült hangulat; szürkéskék hajnali fény, narancsos fáklyafény.`,
  },
  {
    n: 2,
    title: 'A gyógyító lány',
    imageFileName: '02_a_gyogyito_lany.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. Egy kis, zöld ponyvás gyógyító-sátor bejáratánál a gyógyító lány (20-as évei elején járó fiatal nő, barna, hátul copfba font haj, zöld fejkendő, egyszerű mohazöld vászonruha köténnyel, nyakában szárított fűcsokrok, meleg, fáradt de éber tekintet) mosolyogva átveszi a fiútól az agyagkorsót; a másik kezében egy kis fatáblácskát tart (felirat nélkül, csak apró rovátkákkal). A legkisebb fiú tisztelettel nyújtja át a korsót. A háttérben beteg emberek állnak sorban, a sátor asztalán szárított füvek és agyagedények. Meleg, megkönnyebbült, mégis sürgető hangulat, kora reggeli fény.`,
  },
  {
    n: 3,
    title: 'A három sátor',
    imageFileName: '03_a_harom_sator.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. Három szomszédos vásári sátor egymás mellett, középen a legkisebb fiú áll, kezében a tekert mérőzsinór. Balra a posztós (kövér, bajszos, vigyorgó-ravasz képű férfi, tarka mellényben, karján vászoncsíkok és zsinegek) feszít ki egy zsineget a pultján; középen a gyógyfűárus (sovány, horgas hátú, hosszú orrú férfi, kalapban, körülötte szárított fűcsokrok és zacskók) rázogatja a zacskóját; jobbra az italmérő (csuklyás, sötét köpenyes, rejtőzködő alak, körülötte agyagkancsók és -poharak) előrenyújtja az agyagkancsóját. Mindhárom kalmár egyszerre kiabál, a fiú nyugodtan, elgondolkodva nézi őket. Élénk, de földszínű paletta, reggeli fény.`,
  },
  {
    n: 4,
    title: 'A leleplezés',
    imageFileName: '04_a_leleplezes.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. Közelebbi kép egy vásári pultnál: a legkisebb fiú a pulton kifeszíti a zsineget a saját mérőzsinórja mellé, és összehasonlítja a hosszukat, közben komolyan figyel. A posztós (kövér, bajszos, vigyorgó-ravasz képű férfi, tarka mellényben, karján vászoncsíkok és zsinegek) zavartan, izzadtan néz. Az asztalon egy kis mérleg és egy átlátszó üvegedény mérővonalakkal (felirat nélkül), mellette a fiú pergamenjén apró jegyzetek (nem olvasható). A háttérben kíváncsi vásározók gyűlnek köréjük. Lágy, oldalról érkező reggeli fény.`,
  },
  {
    n: 5,
    title: 'Győzelem',
    imageFileName: '05_gyozelem.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. A vásárbíró (középkorú, hetyke, hegyes szakállú férfi, vörösesbarna hivatali köpenyben és tollas kalapban, kezében pecsétes pergamentekercs) két pribék (egyenruhás őr) kíséretében átveszi a legkisebb fiútól a pergamen jegyzőkönyvet; a fiú szerényen, de magabiztosan áll. A háttérben lehajtott fővel áll a posztós és az italmérő, mellettük a gyógyító lány (20-as évei elején járó fiatal nő, zöld fejkendő, mohazöld ruha) mosolyogva figyeli a jelenetet. Ünnepélyes, megkönnyebbült hangulat, reggeli napfény.`,
  },
  {
    n: 6,
    title: 'A fordulat',
    imageFileName: '06_a_fordulat.png',
    prompt: `${STYLE_ANCHOR} A feltöltött referenciaképen látható fiú (ugyanaz a külső, ruházat, mérőzsinór) szerepel a jeleneten. Reggeli fényben az erdő széle: a legkisebb fiú megtorpan az ösvényen, egyik kezében a mérőzsinór. Egy vén tölgy mögül a manó (kicsi, ráncos, hamiskás-csúfondáros képű, hegyes barna-zöld sapkás, mohazöld-barna ruhás lény) kukucskál ki, két kezében két egyformának látszó, kerek, csillogó rögöt tart (az egyik meleg aranysárga, a másik kissé halványabb sárga). A háttérben, halványan elmosódva, a vásártér sátrai és tornyai. Rejtélyes, kíváncsi, kissé feszült hangulat.`,
  },
];

export const IllustrationPromptsModal: React.FC<Props> = ({ isOpen, onClose, activeLessonId = 'l3' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAnchor, setCopiedAnchor] = useState(false);

  if (!isOpen) return null;

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopyAnchor = () => {
    navigator.clipboard.writeText(STYLE_ANCHOR);
    setCopiedAnchor(true);
    setTimeout(() => setCopiedAnchor(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#FAF8F2] rounded-3xl shadow-2xl border-2 border-[#C6923C]/50 flex flex-col overflow-hidden text-[#2E1B14]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#24140D] text-[#FAF6EC] flex items-center justify-between border-b border-[#C6923C]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#B85042] text-white flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-amber-100">
                Képgenerálási promptok & Illusztrációk
              </h2>
              <p className="text-xs text-amber-200/70">
                3. óra: A vásár csalói — Akvarell stílusú jelenet-képek és PPTX illusztrációk
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Style Anchor Card */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B85042]" />
                <h4 className="font-serif font-bold text-sm text-[#8B261D]">
                  Közös Stílus-anchor (Minden prompt elejére)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopyAnchor}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B85042] hover:bg-[#A34335] text-white text-xs font-serif font-bold transition-all shadow-xs cursor-pointer"
              >
                {copiedAnchor ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAnchor ? 'Másolva!' : 'Anchor másolása'}</span>
              </button>
            </div>
            <p className="text-xs text-[#4A382D] leading-relaxed italic bg-white/80 p-3 rounded-xl border border-[#E0D4BE]">
              „{STYLE_ANCHOR}”
            </p>
          </div>

          {/* 6 Scenes Grid */}
          <div className="space-y-4">
            <h3 className="font-serif text-base font-bold text-[#8B261D] flex items-center justify-between">
              <span>A 6 jelenet illusztrációja és másolható promptja:</span>
              <span className="text-xs font-normal text-[#8C6D58]">
                Mese_vetites_3_ora.pptx diasorhoz kész képek
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {L3_SCENE_PROMPTS.map((scene, idx) => {
                const imgUrl = resolveSceneImage('l3', scene.imageFileName);
                const isCopied = copiedIndex === idx;

                return (
                  <div
                    key={scene.n}
                    className="p-3.5 rounded-2xl bg-white border border-[#DFCDB3] shadow-xs flex flex-col justify-between gap-3 hover:border-[#C6923C] transition-all"
                  >
                    <div>
                      {/* Image Preview & Title */}
                      <div className="flex gap-3 mb-2.5">
                        <div className="w-24 h-32 rounded-xl overflow-hidden border border-[#C6923C] bg-stone-100 shrink-0 relative group">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={scene.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                              Kép
                            </div>
                          )}
                          {imgUrl && (
                            <a
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                              title="Megnyitás teljes méretben"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#B85042]">
                            {scene.n}. Jelenet
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#2E1B14] truncate mb-1">
                            {scene.title}
                          </h4>
                          <span className="inline-block font-mono text-[10px] text-[#8C6D58] bg-[#F4EEDF] px-1.5 py-0.5 rounded border border-[#E0D4BE] mb-2">
                            {scene.imageFileName}
                          </span>
                          <p className="text-[11px] text-[#5A4232] line-clamp-3 leading-snug">
                            {scene.prompt.slice(0, 160)}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE1]">
                      {imgUrl ? (
                        <a
                          href={imgUrl}
                          download={`0${scene.n}_${scene.imageFileName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-serif font-bold text-[#7A4E38] hover:text-[#B85042]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Kép letöltése</span>
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(scene.prompt, idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#B85042] hover:bg-[#A34335] text-white'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Prompt kimásolva!' : 'Prompt másolása'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#F4EEDF] border-t border-[#DFCDB3] flex items-center justify-between text-xs text-[#7A4E38] shrink-0 font-serif">
          <span>Készült a 7. osztályos fizika tananyaghoz • „A vásár csalói”</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2E1B14] hover:bg-[#43271d] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
