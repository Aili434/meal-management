import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  Utensils,
  Dumbbell,
  UserCheck,
  Sparkles,
  Plus,
  Trash2,
  Droplets,
  Flame,
  Scale,
} from 'lucide-react';
import './App.css';

type TabType = 'home' | 'meal' | 'workout' | 'body';
type MealCategory = '朝食' | '昼食' | '夕食' | '間食';
type GoalMode = 'ボディメイク減量' | '筋肥大バルク' | '健康維持';

interface MealLog {
  id: string;
  category: MealCategory;
  name: string;
  kcal: number;
  p: number; // Protein (g)
  f: number; // Fat (g)
  c: number; // Carbs (g)
}

interface WorkoutLog {
  id: string;
  part: string;
  exercise: string;
  weight: number; // kg (0 for bodyweight)
  reps: number;
  sets: number;
  burnedKcal: number;
}

const MEAL_PRESETS: Omit<MealLog, 'id' | 'category'>[] = [
  { name: '鶏むね肉のグリル＆玄米セット', kcal: 460, p: 42, f: 8, c: 54 },
  { name: 'プロテイン＋バナナ', kcal: 210, p: 24, f: 2, c: 25 },
  { name: '鮭おにぎり2個＋ゆで卵', kcal: 430, p: 19, f: 8, c: 70 },
  { name: 'オートミール卵雑炊', kcal: 310, p: 17, f: 9, c: 39 },
  { name: '牛赤身ステーキ200g＋サラダ', kcal: 440, p: 44, f: 22, c: 12 },
  { name: 'ギリシャヨーグルト＋ベリー', kcal: 145, p: 13, f: 1, c: 20 },
  { name: 'サバ塩焼き定食（ごはん小）', kcal: 560, p: 32, f: 24, c: 52 },
];

const WORKOUT_PRESETS = [
  { part: '胸', exercise: 'ベンチプレス', weight: 50, reps: 10, sets: 3, burnedKcal: 85 },
  { part: '脚', exercise: 'バーベルスクワット', weight: 60, reps: 10, sets: 3, burnedKcal: 110 },
  { part: '背中', exercise: 'ラットプルダウン', weight: 40, reps: 12, sets: 3, burnedKcal: 75 },
  { part: '肩', exercise: 'ダンベルショルダープレス', weight: 12, reps: 12, sets: 3, burnedKcal: 65 },
  { part: '体幹', exercise: 'プランク＆クランチ', weight: 0, reps: 15, sets: 3, burnedKcal: 45 },
  { part: '有酸素', exercise: '傾斜ウォーキング20分', weight: 0, reps: 20, sets: 1, burnedKcal: 130 },
];

const GOAL_TARGETS: Record<GoalMode, { kcal: number; p: number; f: number; c: number }> = {
  ボディメイク減量: { kcal: 1750, p: 130, f: 48, c: 195 },
  筋肥大バルク: { kcal: 2450, p: 160, f: 68, c: 295 },
  健康維持: { kcal: 2000, p: 110, f: 56, c: 260 },
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [goalMode, setGoalMode] = useState<GoalMode>('ボディメイク減量');

  // Meals state
  const [meals, setMeals] = useState<MealLog[]>(() => {
    try {
      const saved = localStorage.getItem('fit_meals_v1');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'm1',
              category: '朝食',
              name: 'オートミール卵雑炊',
              kcal: 310,
              p: 17,
              f: 9,
              c: 39,
            },
            {
              id: 'm2',
              category: '昼食',
              name: '鶏むね肉のグリル＆玄米セット',
              kcal: 460,
              p: 42,
              f: 8,
              c: 54,
            },
          ];
    } catch {
      return [];
    }
  });

  // Workouts state
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    try {
      const saved = localStorage.getItem('fit_workouts_v1');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'w1',
              part: '脚',
              exercise: 'バーベルスクワット',
              weight: 60,
              reps: 10,
              sets: 3,
              burnedKcal: 110,
            },
          ];
    } catch {
      return [];
    }
  });

  // Body & Water state
  const [weightKg, setWeightKg] = useState<string>('54.2');
  const [bodyFat, setBodyFat] = useState<string>('22.5');
  const [waterCups, setWaterCups] = useState<number>(5);

  // Meal Form
  const [mealCat, setMealCat] = useState<MealCategory>('夕食');
  const [mealName, setMealName] = useState('');
  const [mealKcal, setMealKcal] = useState('');
  const [mealP, setMealP] = useState('');
  const [mealF, setMealF] = useState('');
  const [mealC, setMealC] = useState('');

  // Workout Form
  const [wPart, setWPart] = useState('胸');
  const [wExercise, setWExercise] = useState('');
  const [wWeight, setWWeight] = useState('40');
  const [wReps, setWReps] = useState('10');
  const [wSets, setWSets] = useState('3');
  const [wBurned, setWBurned] = useState('80');

  useEffect(() => {
    try {
      localStorage.setItem('fit_meals_v1', JSON.stringify(meals));
    } catch {
      // ignore
    }
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem('fit_workouts_v1', JSON.stringify(workouts));
    } catch {
      // ignore
    }
  }, [workouts]);

  const target = GOAL_TARGETS[goalMode];

  // Totals
  const totals = useMemo(() => {
    const intake = meals.reduce((acc, m) => acc + m.kcal, 0);
    const p = meals.reduce((acc, m) => acc + m.p, 0);
    const f = meals.reduce((acc, m) => acc + m.f, 0);
    const c = meals.reduce((acc, m) => acc + m.c, 0);
    const burned = workouts.reduce((acc, w) => acc + w.burnedKcal, 0);
    const totalVolume = workouts.reduce(
      (acc, w) => acc + (w.weight > 0 ? w.weight * w.reps * w.sets : w.reps * w.sets * 20),
      0
    );
    const totalSets = workouts.reduce((acc, w) => acc + w.sets, 0);

    // Dynamic calorie allowance includes workout burn
    const effectiveTargetKcal = target.kcal + burned;
    const remainingKcal = effectiveTargetKcal - intake;

    // Health + Fitness Score (0 - 100)
    const pScore = Math.min(35, (p / target.p) * 35);
    const calDiffRatio = Math.abs(intake - effectiveTargetKcal) / effectiveTargetKcal;
    const calScore = Math.max(0, 30 * (1 - calDiffRatio * 1.4));
    const workoutScore = workouts.length > 0 ? Math.min(25, 15 + workouts.length * 5) : 0;
    const waterScore = Math.min(10, (waterCups / 8) * 10);
    const totalScore = Math.round(pScore + calScore + workoutScore + waterScore);

    return {
      intake,
      p,
      f,
      c,
      burned,
      totalVolume,
      totalSets,
      effectiveTargetKcal,
      remainingKcal,
      totalScore,
    };
  }, [meals, workouts, target, waterCups]);

  // Smart Coach Advice (Asken++ style)
  const coachAdvice = useMemo(() => {
    const pRemain = Math.max(0, target.p - totals.p);
    if (workouts.length > 0 && pRemain > 25) {
      return `筋トレお疲れさまです！総負荷量 ${totals.totalVolume.toLocaleString()}kg を達成しました。筋合成を高めるため、残りタンパク質 ${Math.round(
        pRemain
      )}g を意識して摂りましょう。`;
    }
    if (totals.remainingKcal < 0) {
      return `目標カロリーを ${Math.abs(
        totals.remainingKcal
      )}kcal オーバーしています。明日は脂質を控えめにして、有酸素運動を15分プラスすると綺麗に調整できます。`;
    }
    if (pRemain <= 15 && workouts.length > 0) {
      return `素晴らしいPFCバランスとトレーニング内容です！水分をあと ${Math.max(
        0,
        8 - waterCups
      )}杯意識すると代謝がさらに安定します。`;
    }
    return `今日の残り摂取目安は ${totals.remainingKcal}kcal（タンパク質あと ${Math.round(
      pRemain
    )}g）です。夜は高タンパク・低脂質なメニューがおすすめです。`;
  }, [totals, target, workouts.length, waterCups]);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;
    const newMeal: MealLog = {
      id: Date.now().toString(),
      category: mealCat,
      name: mealName.trim(),
      kcal: Number(mealKcal) || 0,
      p: Number(mealP) || 0,
      f: Number(mealF) || 0,
      c: Number(mealC) || 0,
    };
    setMeals((prev) => [newMeal, ...prev]);
    setMealName('');
    setMealKcal('');
    setMealP('');
    setMealF('');
    setMealC('');
  };

  const handleQuickMeal = (preset: Omit<MealLog, 'id' | 'category'>) => {
    setMeals((prev) => [
      {
        id: Date.now().toString(),
        category: mealCat,
        ...preset,
      },
      ...prev,
    ]);
  };

  const handleAddWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wExercise.trim()) return;
    const newW: WorkoutLog = {
      id: Date.now().toString(),
      part: wPart,
      exercise: wExercise.trim(),
      weight: Number(wWeight) || 0,
      reps: Number(wReps) || 10,
      sets: Number(wSets) || 3,
      burnedKcal: Number(wBurned) || 60,
    };
    setWorkouts((prev) => [newW, ...prev]);
    setWExercise('');
  };

  const handleQuickWorkout = (preset: Omit<WorkoutLog, 'id'>) => {
    setWorkouts((prev) => [{ id: Date.now().toString(), ...preset }, ...prev]);
  };

  const ringDeg = Math.min(360, Math.round((totals.totalScore / 100) * 360));

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-badge">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="app-title">FitLog AI+</h1>
            <p className="app-date">筋トレ × 栄養スコア管理</p>
          </div>
        </div>
        <span className="goal-chip">{goalMode}</span>
      </header>

      <main className="main-content">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <>
            {/* Score & Calorie Summary */}
            <section className="card">
              <div className="hero-grid">
                <div
                  className="score-ring"
                  style={{
                    background: `conic-gradient(#4a7c66 ${ringDeg}deg, #ebe6de ${ringDeg}deg)`,
                  }}
                >
                  <div className="score-ring-inner">
                    <span className="score-label">総合スコア</span>
                    <span className="score-num">{totals.totalScore}</span>
                    <span className="score-unit">/ 100点</span>
                  </div>
                </div>

                <div className="cal-stats">
                  <div className="cal-remain-box">
                    <div className="cal-remain-label">あと食べられる目安</div>
                    <div className="cal-remain-val">
                      {totals.remainingKcal.toLocaleString()}
                      <span>kcal</span>
                    </div>
                  </div>
                  <div className="cal-breakdown">
                    <span>
                      摂取 <strong>{totals.intake}</strong>
                    </span>
                    <span>
                      運動 <strong>-{totals.burned}</strong>
                    </span>
                    <span>
                      目標 <strong>{totals.effectiveTargetKcal}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* PFC Balance */}
              <div className="pfc-list">
                <div>
                  <div className="pfc-row-top">
                    <span>タンパク質 (P)</span>
                    <span>
                      {totals.p}g / {target.p}g
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, (totals.p / target.p) * 100)}%`,
                        backgroundColor: '#4a7c66',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="pfc-row-top">
                    <span>脂質 (F)</span>
                    <span>
                      {totals.f}g / {target.f}g
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, (totals.f / target.f) * 100)}%`,
                        backgroundColor: '#d46a4e',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="pfc-row-top">
                    <span>炭水化物 (C)</span>
                    <span>
                      {totals.c}g / {target.c}g
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${Math.min(100, (totals.c / target.c) * 100)}%`,
                        backgroundColor: '#c98a2c',
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* AI Coach Advice */}
            <section className="coach-box">
              <div className="coach-avatar">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="coach-title">パーソナル栄養＆筋トレコーチ</h2>
                <p className="coach-text">{coachAdvice}</p>
              </div>
            </section>

            {/* Today's Activity Digest */}
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Flame size={16} color="#d46a4e" />
                  今日のトレーニング実績
                </h2>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#d46a4e' }}>
                  消費 {totals.burned} kcal
                </span>
              </div>
              {workouts.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#746d67', margin: 0 }}>
                  まだ筋トレ記録がありません。「筋トレ」タブから追加しましょう。
                </p>
              ) : (
                <div className="log-list">
                  {workouts.map((w) => (
                    <div key={w.id} className="log-item">
                      <div>
                        <span className="log-tag workout">{w.part}</span>
                        <p className="log-name">{w.exercise}</p>
                        <p className="log-meta">
                          {w.weight > 0 ? `${w.weight}kg × ` : '自重 '}
                          {w.reps}回 × {w.sets}セット（{w.burnedKcal}kcal）
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* MEAL TAB */}
        {activeTab === 'meal' && (
          <>
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Utensils size={16} color="#4a7c66" />
                  食事を記録する
                </h2>
              </div>

              <div className="segmented">
                {(['朝食', '昼食', '夕食', '間食'] as MealCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`seg-btn ${mealCat === cat ? 'active' : ''}`}
                    onClick={() => setMealCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="field-label">ワンタップ定番メニュー（{mealCat}に追加）</span>
              <div className="preset-chips">
                {MEAL_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="preset-chip"
                    onClick={() => handleQuickMeal(preset)}
                  >
                    + {preset.name} ({preset.kcal}kcal)
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddMeal}>
                <div className="input-grid">
                  <div className="input-full">
                    <label className="field-label">メニュー名</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="例：サラダチキンと玄米おにぎり"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">カロリー (kcal)</label>
                    <input
                      type="number"
                      className="text-input"
                      placeholder="350"
                      value={mealKcal}
                      onChange={(e) => setMealKcal(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">タンパク質 P (g)</label>
                    <input
                      type="number"
                      className="text-input"
                      placeholder="28"
                      value={mealP}
                      onChange={(e) => setMealP(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">脂質 F (g)</label>
                    <input
                      type="number"
                      className="text-input"
                      placeholder="6"
                      value={mealF}
                      onChange={(e) => setMealF(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">炭水化物 C (g)</label>
                    <input
                      type="number"
                      className="text-input"
                      placeholder="45"
                      value={mealC}
                      onChange={(e) => setMealC(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="primary-btn">
                  <Plus size={18} />
                  食事を追加する
                </button>
              </form>
            </section>

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">本日の食事履歴（計 {totals.intake} kcal）</h2>
              </div>
              <div className="log-list">
                {meals.map((m) => (
                  <div key={m.id} className="log-item">
                    <div>
                      <span className="log-tag meal">{m.category}</span>
                      <p className="log-name">{m.name}</p>
                      <p className="log-meta">
                        {m.kcal}kcal ｜ P:{m.p}g ・ F:{m.f}g ・ C:{m.c}g
                      </p>
                    </div>
                    <button
                      type="button"
                      className="del-btn"
                      onClick={() => setMeals((prev) => prev.filter((x) => x.id !== m.id))}
                      aria-label="削除"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <>
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Dumbbell size={16} color="#d46a4e" />
                  筋トレ・運動を記録
                </h2>
              </div>

              <div className="volume-banner">
                <div className="vol-cell">
                  <div className="vol-val">{totals.totalVolume.toLocaleString()}</div>
                  <div className="vol-lbl">総負荷量 (kg)</div>
                </div>
                <div className="vol-cell">
                  <div className="vol-val">{totals.totalSets}</div>
                  <div className="vol-lbl">合計セット数</div>
                </div>
                <div className="vol-cell">
                  <div className="vol-val">{totals.burned}</div>
                  <div className="vol-lbl">消費 (kcal)</div>
                </div>
              </div>

              <span className="field-label">クイック種目追加</span>
              <div className="preset-chips">
                {WORKOUT_PRESETS.map((wp) => (
                  <button
                    key={wp.exercise}
                    type="button"
                    className="preset-chip"
                    onClick={() => handleQuickWorkout(wp)}
                  >
                    + {wp.exercise} ({wp.burnedKcal}kcal)
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddWorkout}>
                <div className="input-grid">
                  <div>
                    <label className="field-label">部位</label>
                    <select
                      className="text-input"
                      value={wPart}
                      onChange={(e) => setWPart(e.target.value)}
                    >
                      <option value="胸">胸</option>
                      <option value="背中">背中</option>
                      <option value="脚">脚</option>
                      <option value="肩">肩</option>
                      <option value="腕">腕</option>
                      <option value="体幹">体幹</option>
                      <option value="有酸素">有酸素</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label">種目名</label>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="例：インクラインプレス"
                      value={wExercise}
                      onChange={(e) => setWExercise(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">重量 (kg / 自重は0)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={wWeight}
                      onChange={(e) => setWWeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">回数 (reps)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={wReps}
                      onChange={(e) => setWReps(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">セット数</label>
                    <input
                      type="number"
                      className="text-input"
                      value={wSets}
                      onChange={(e) => setWSets(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label">消費目安 (kcal)</label>
                    <input
                      type="number"
                      className="text-input"
                      value={wBurned}
                      onChange={(e) => setWBurned(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="primary-btn coral">
                  <Plus size={18} />
                  トレーニングを追加
                </button>
              </form>
            </section>

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">本日のワークアウト履歴</h2>
              </div>
              <div className="log-list">
                {workouts.map((w) => (
                  <div key={w.id} className="log-item">
                    <div>
                      <span className="log-tag workout">{w.part}</span>
                      <p className="log-name">{w.exercise}</p>
                      <p className="log-meta">
                        {w.weight > 0 ? `${w.weight}kg × ` : '自重 '}
                        {w.reps}回 × {w.sets}セット（-{w.burnedKcal}kcal）
                      </p>
                    </div>
                    <button
                      type="button"
                      className="del-btn"
                      onClick={() =>
                        setWorkouts((prev) => prev.filter((x) => x.id !== w.id))
                      }
                      aria-label="削除"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* BODY & GOAL TAB */}
        {activeTab === 'body' && (
          <>
            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Scale size={16} color="#4a7c66" />
                  目標モード設定
                </h2>
              </div>
              <div className="segmented">
                {(['ボディメイク減量', '筋肥大バルク', '健康維持'] as GoalMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`seg-btn ${goalMode === mode ? 'active' : ''}`}
                      onClick={() => setGoalMode(mode)}
                    >
                      {mode}
                    </button>
                  )
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#746d67', margin: 0 }}>
                基準目標：{target.kcal}kcal ／ P:{target.p}g ・ F:{target.f}g ・ C:{target.c}g
                （筋トレ消費分は自動加算されます）
              </p>
            </section>

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">体型・コンディション記録</h2>
              </div>
              <div className="input-grid">
                <div>
                  <label className="field-label">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="text-input"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">体脂肪率 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="text-input"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#4a7c66', fontWeight: 700, margin: '4px 0 0' }}>
                除脂肪体重（LBM）目安：
                {(
                  (Number(weightKg) || 0) *
                  (1 - (Number(bodyFat) || 0) / 100)
                ).toFixed(1)}{' '}
                kg
              </p>
            </section>

            <section className="card">
              <div className="water-row">
                <h2 className="card-title">
                  <Droplets size={16} color="#4b8ec2" />
                  水分摂取トラッカー（{waterCups * 250}ml / 2,000ml）
                </h2>
              </div>
              <div className="water-cups">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const filled = idx < waterCups;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`cup-btn ${filled ? 'filled' : ''}`}
                      onClick={() => setWaterCups(idx + 1 === waterCups ? idx : idx + 1)}
                      aria-label={`コップ${idx + 1}杯目`}
                    >
                      <Droplets size={16} />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          type="button"
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Activity size={20} />
          <span>ホーム</span>
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'meal' ? 'active' : ''}`}
          onClick={() => setActiveTab('meal')}
        >
          <Utensils size={20} />
          <span>食事記録</span>
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          <Dumbbell size={20} />
          <span>筋トレ</span>
        </button>
        <button
          type="button"
          className={`nav-btn ${activeTab === 'body' ? 'active' : ''}`}
          onClick={() => setActiveTab('body')}
        >
          <UserCheck size={20} />
          <span>体型・目標</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
コードで処理、分析しました
