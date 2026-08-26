/**
 * Flux Hybrid Forecasting Engine — TypeScript port of fluxCode.py
 *
 * Original Python pipeline:
 *   NeuralProphet (trend + weekly seasonality + IN holidays, 80% CI quantiles)
 *   + XGBoost residual boosting on (day_of_week, is_weekend, y_roll_7)
 *
 * This TS port replicates the *behavior* using:
 *   - Linear-trend + Fourier weekly seasonality for the base model (proxy for NeuralProphet)
 *   - A small gradient-boosted-decision-tree ensemble built from scratch for residual correction
 *     (proxy for XGBoost with n_estimators=100, max_depth=4, lr=0.05)
 *   - 80% confidence bands from residual std (≈ quantiles 0.10/0.90)
 *   - Honest MAPE on an 80/20 hold-out
 *   - Vault CFO logic: surplus → deposit 40%, deficit → withdraw up to balance
 *
 * No external ML deps required — pure TS, runs in the Next.js API layer.
 */

export interface ForecastInputRow {
  date: string; // ISO yyyy-mm-dd
  netIncome: number;
  fuel: number;
  loan: number;
  emergency: number;
}

export interface ForecastDayOut {
  date: string;
  baseYhat: number;
  finalY: number;
  lowBand: number;
  highBand: number;
  isFuture: boolean;
}

export interface VaultHistoryEntry {
  run: number;
  projectedIncome: number;
  essentialCosts: number;
  surplusDeficit: number;
  vaultBalance: number;
}

export interface ForecastResult {
  horizon: number;
  historical: { date: string; y: number; npYhat: number; residual: number }[];
  future: ForecastDayOut[];
  projectedIncome: number;
  essentialExpenses: number;
  surplus: number;
  coverageRatio: number;
  baseMape: number;
  hybridMape: number;
  improvementPct: number;
  vaultAction: "deposit" | "withdraw";
  vaultDelta: number;
  vaultBalanceAfter: number;
  vaultHistory: VaultHistoryEntry[];
  runNumber: number;
  residualStd: number;
}

/* ─────────────────────────────────────────────────────────────
   Small math helpers
   ───────────────────────────────────────────────────────────── */

function mean(a: number[]): number {
  if (!a.length) return 0;
  return a.reduce((s, x) => s + x, 0) / a.length;
}

function std(a: number[]): number {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
}

function calcMape(actual: number[], predicted: number[]): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] > 0) {
      sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
      n++;
    }
  }
  return n ? (sum / n) * 100 : 0;
}

/* ─────────────────────────────────────────────────────────────
   Base model: linear trend + weekly Fourier seasonality
   (deterministic analogue of NeuralProphet's trend + weekly_seasonality)
   ───────────────────────────────────────────────────────────── */

interface BaseModel {
  intercept: number;
  slope: number;
  // weekly Fourier coefficients (2 harmonics: sin/cos for k=1, k=2)
  coefs: number[]; // length 4
  predict: (t: number, dow: number) => number;
}

function fitBaseModel(ys: number[], dows: number[]): BaseModel {
  const n = ys.length;
  if (n < 4) {
    const m = mean(ys);
    return { intercept: m, slope: 0, coefs: [0, 0, 0, 0], predict: () => m };
  }
  // Design matrix columns: [1, t, sin(2pi dow/7), cos(2pi dow/7), sin(4pi dow/7), cos(4pi dow/7)]
  const X: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = i;
    const dow = dows[i];
    const s1 = Math.sin((2 * Math.PI * dow) / 7);
    const c1 = Math.cos((2 * Math.PI * dow) / 7);
    const s2 = Math.sin((4 * Math.PI * dow) / 7);
    const c2 = Math.cos((4 * Math.PI * dow) / 7);
    X.push([1, t, s1, c1, s2, c2]);
  }
  const coefs = leastSquares(X, ys);
  const predict = (t: number, dow: number) => {
    const s1 = Math.sin((2 * Math.PI * dow) / 7);
    const c1 = Math.cos((2 * Math.PI * dow) / 7);
    const s2 = Math.sin((4 * Math.PI * dow) / 7);
    const c2 = Math.cos((4 * Math.PI * dow) / 7);
    return coefs[0] + coefs[1] * t + coefs[2] * s1 + coefs[3] * c1 + coefs[4] * s2 + coefs[5] * c2;
  };
  return {
    intercept: coefs[0],
    slope: coefs[1],
    coefs: [coefs[2], coefs[3], coefs[4], coefs[5]],
    predict,
  };
}

/* Ordinary least squares via normal equations with ridge regularization */
function leastSquares(X: number[][], y: number[], ridge = 1e-6): number[] {
  const n = X.length;
  const p = X[0].length;
  // XtX + ridge*I
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < p; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < p; b++) {
        XtX[a][b] += X[i][a] * X[i][b];
      }
    }
  }
  for (let a = 0; a < p; a++) XtX[a][a] += ridge;
  // solve via Gaussian elimination
  return solveLinear(XtX, Xty);
}

function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // pivot
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    if (Math.abs(M[col][col]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = 0; i < n; i++) x[i] = M[i][n] / (M[i][i] || 1);
  return x;
}

/* ─────────────────────────────────────────────────────────────
   Gradient-boosted regression trees (XGBoost proxy)
   - Squared-error loss, regression trees with max_depth=4
   - n_estimators=100, learning_rate=0.05
   - Features: [day_of_week (one-hot ish via sin/cos), is_weekend, y_roll_7]
   ───────────────────────────────────────────────────────────── */

interface TreeNode {
  leaf: boolean;
  value?: number;
  feat?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

function buildTree(rows: number[][], grads: number[], depth: number, maxDepth: number): TreeNode {
  const n = rows.length;
  if (n < 4 || depth >= maxDepth) {
    return { leaf: true, value: mean(grads) };
  }
  const nFeat = rows[0].length;
  let bestGain = -Infinity;
  let bestFeat = 0;
  let bestThr = 0;
  const parentVar = grads.length ? std(grads) : 0;
  for (let f = 0; f < nFeat; f++) {
    const vals = rows.map((r) => r[f]).sort((a, b) => a - b);
    for (let i = 1; i < vals.length; i++) {
      const thr = (vals[i - 1] + vals[i]) / 2;
      const leftG: number[] = [];
      const rightG: number[] = [];
      for (let r = 0; r < n; r++) {
        if (rows[r][f] <= thr) leftG.push(grads[r]);
        else rightG.push(grads[r]);
      }
      if (!leftG.length || !rightG.length) continue;
      const wVar =
        (leftG.length * std(leftG) ** 2 + rightG.length * std(rightG) ** 2) / n;
      const gain = parentVar - Math.sqrt(wVar);
      if (gain > bestGain) {
        bestGain = gain;
        bestFeat = f;
        bestThr = thr;
      }
    }
  }
  if (bestGain <= 0) return { leaf: true, value: mean(grads) };
  const leftRows: number[][] = [];
  const leftG: number[] = [];
  const rightRows: number[][] = [];
  const rightG: number[] = [];
  for (let r = 0; r < n; r++) {
    if (rows[r][bestFeat] <= bestThr) {
      leftRows.push(rows[r]);
      leftG.push(grads[r]);
    } else {
      rightRows.push(rows[r]);
      rightG.push(grads[r]);
    }
  }
  return {
    leaf: false,
    feat: bestFeat,
    threshold: bestThr,
    left: buildTree(leftRows, leftG, depth + 1, maxDepth),
    right: buildTree(rightRows, rightG, depth + 1, maxDepth),
  };
}

function predictTree(node: TreeNode, row: number[]): number {
  if (node.leaf) return node.value ?? 0;
  if (row[node.feat!] <= node.threshold!) return predictTree(node.left!, row);
  return predictTree(node.right!, row);
}

interface GBM {
  trees: TreeNode[];
  init: number;
  lr: number;
  predict: (row: number[]) => number;
}

function fitGBM(features: number[][], targets: number[], opts?: { nEst?: number; lr?: number; maxDepth?: number }): GBM {
  const nEst = opts?.nEst ?? 80;
  const lr = opts?.lr ?? 0.08;
  const maxDepth = opts?.maxDepth ?? 4;
  const init = mean(targets);
  const trees: TreeNode[] = [];
  const residual = targets.slice();
  for (let k = 0; k < nEst; k++) {
    const tree = buildTree(features, residual, 0, maxDepth);
    trees.push(tree);
    for (let i = 0; i < residual.length; i++) {
      residual[i] -= lr * predictTree(tree, features[i]);
    }
  }
  const predict = (row: number[]) => {
    let v = init;
    for (const t of trees) v += lr * predictTree(t, row);
    return v;
  };
  return { trees, init, lr, predict };
}

/* Feature engineering for residual model */
function residualFeatures(dow: number, roll7: number): number[] {
  const isWeekend = dow >= 5 ? 1 : 0;
  const sinDow = Math.sin((2 * Math.PI * dow) / 7);
  const cosDow = Math.cos((2 * Math.PI * dow) / 7);
  return [sinDow, cosDow, isWeekend, roll7];
}

/* ─────────────────────────────────────────────────────────────
   Public: run forecast
   ───────────────────────────────────────────────────────────── */

export interface VaultState {
  balance: number;
  totalRuns: number;
  history: VaultHistoryEntry[];
}

export function runForecast(
  rows: ForecastInputRow[],
  vaultState: VaultState,
  horizon = 30
): ForecastResult {
  if (rows.length < 30) {
    throw new Error(`Need at least 30 rows of data for forecasting. Provided ${rows.length}.`);
  }

  // 1. Feature engineering — daily values (CSV columns are monthly totals / 30, like the Python)
  const dates = rows.map((r) => new Date(r.date));
  const y = rows.map((r) => r.netIncome / 30);
  const fuel = rows.map((r) => r.fuel / 30);
  const loan = rows.map((r) => r.loan / 30);
  const emerg = rows.map((r) => r.emergency / 30);
  const dows = dates.map((d) => d.getDay());

  const essentialExpenses =
    (mean(fuel) + mean(loan) + mean(emerg)) * 30;

  // 2. 80/20 split
  const splitIdx = Math.floor(rows.length * 0.8);
  const trainY = y.slice(0, splitIdx);
  const trainDow = dows.slice(0, splitIdx);

  // 3. Base model (trend + weekly seasonality) — fit on train only
  const base = fitBaseModel(trainY, trainDow);

  // Predict on full set
  const npYhat = y.map((_, i) => base.predict(i, dows[i]));
  const residual = y.map((v, i) => v - npYhat[i]);

  // 4. Residual features + GBM — train only on train portion (with rolling mean)
  const roll7: number[] = new Array(y.length).fill(0);
  for (let i = 1; i < y.length; i++) {
    const start = Math.max(0, i - 7);
    roll7[i] = mean(y.slice(start, i));
  }
  const featMat = dows.map((d, i) => residualFeatures(d, roll7[i]));

  const trainFeatRows: number[][] = [];
  const trainResid: number[] = [];
  for (let i = 6; i < splitIdx; i++) {
    // skip first few where roll7 is unstable
    trainFeatRows.push(featMat[i]);
    trainResid.push(residual[i]);
  }
  const gbm = fitGBM(trainFeatRows, trainResid);

  // 5. Honest MAPE on held-out test
  const testIdx: number[] = [];
  for (let i = splitIdx; i < y.length; i++) testIdx.push(i);
  const basePred = testIdx.map((i) => npYhat[i]);
  const hybridPred = testIdx.map((i) => npYhat[i] + gbm.predict(featMat[i]));
  const actualTest = testIdx.map((i) => y[i]);
  const baseMape = calcMape(actualTest, basePred);
  const hybridMape = calcMape(actualTest, hybridPred);

  // residual std for CI bands (from train residuals after GBM fit)
  const trainResidPred = trainFeatRows.map((r) => gbm.predict(r));
  const trainResidAfter = trainResid.map((v, i) => v - trainResidPred[i]);
  const residualStd = Math.max(std(trainResidAfter), 1);
  // 80% CI ≈ ±1.2816σ
  const ciMul = 1.2816;

  // 6. Future forecast (horizon days)
  const historyY = y.slice();
  const future: ForecastDayOut[] = [];
  const lastDate = dates[dates.length - 1];
  for (let h = 1; h <= horizon; h++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + h);
    const t = y.length + h - 1; // continuous time index
    const dow = d.getDay();
    const basePredFuture = base.predict(t, dow);
    const roll = mean(historyY.slice(-7));
    const feat = residualFeatures(dow, roll);
    const resid = gbm.predict(feat);
    const finalY = basePredFuture + resid;
    historyY.push(finalY);
    future.push({
      date: d.toISOString().slice(0, 10),
      baseYhat: basePredFuture,
      finalY,
      lowBand: finalY - ciMul * residualStd,
      highBand: finalY + ciMul * residualStd,
      isFuture: true,
    });
  }

  // 7. Vault logic
  const projectedIncome = future.reduce((s, f) => s + f.finalY, 0);
  const surplus = projectedIncome - essentialExpenses;
  const coverageRatio = essentialExpenses > 0 ? projectedIncome / essentialExpenses : 0;

  let vaultDelta = 0;
  let vaultAction: "deposit" | "withdraw" = "deposit";
  let balanceAfter = vaultState.balance;
  if (surplus > 0) {
    vaultDelta = surplus * 0.4;
    balanceAfter = vaultState.balance + vaultDelta;
    vaultAction = "deposit";
  } else {
    vaultDelta = Math.min(vaultState.balance, Math.abs(surplus));
    balanceAfter = vaultState.balance - vaultDelta;
    vaultAction = "withdraw";
  }

  const runNumber = vaultState.totalRuns + 1;
  const historyEntry: VaultHistoryEntry = {
    run: runNumber,
    projectedIncome: round2(projectedIncome),
    essentialCosts: round2(essentialExpenses),
    surplusDeficit: round2(surplus),
    vaultBalance: round2(balanceAfter),
  };
  const newHistory = [...vaultState.history, historyEntry];

  // historical array (for charting)
  const historical = y.map((v, i) => ({
    date: dates[i].toISOString().slice(0, 10),
    y: v,
    npYhat: npYhat[i],
    residual: residual[i],
  }));

  return {
    horizon,
    historical,
    future,
    projectedIncome: round2(projectedIncome),
    essentialExpenses: round2(essentialExpenses),
    surplus: round2(surplus),
    coverageRatio: round2(coverageRatio),
    baseMape: round2(baseMape),
    hybridMape: round2(hybridMape),
    improvementPct: round2(baseMape - hybridMape),
    vaultAction,
    vaultDelta: round2(vaultDelta),
    vaultBalanceAfter: round2(balanceAfter),
    vaultHistory: newHistory,
    runNumber,
    residualStd: round2(residualStd),
  };
}

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

/* ─────────────────────────────────────────────────────────────
   Synthetic data generator — produces realistic gig income
   (used when no CSV is uploaded; mirrors the demo dataset)
   ───────────────────────────────────────────────────────────── */

export function generateSyntheticHistory(days = 90): ForecastInputRow[] {
  const rows: ForecastInputRow[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // weekly seasonality — weekends higher for gig work
    const weekly = 1 + 0.35 * Math.sin((2 * Math.PI * dow) / 7) + (dow >= 5 ? 0.4 : -0.1);
    // slow upward trend
    const trend = 1500 + (days - i) * 18;
    // noise
    const noise = (Math.random() - 0.5) * 800;
    const dailyIncome = Math.max(200, Math.round(trend * weekly + noise));
    const fuel = 4200 + Math.round(Math.random() * 400);
    const loan = 3000;
    const emerg = Math.random() < 0.12 ? Math.round(800 + Math.random() * 1400) : 0;
    rows.push({
      date: d.toISOString().slice(0, 10),
      netIncome: dailyIncome * 30, // store as monthly total per row (matches Python CSV convention)
      fuel,
      loan,
      emergency: emerg,
    });
  }
  return rows;
}

/* ─────────────────────────────────────────────────────────────
   Break planner simulation
   ───────────────────────────────────────────────────────────── */

export interface BreakSimInput {
  currentRunwayMonths: number;
  breakDays: number;
  dailySpend: number;
  startInDays: number;
  useVault: boolean;
  vaultBalance: number;
  monthlyIncome: number;
  monthlySpending: number;
  baselineNeed: number; // monthly
}

export interface BreakSimResult {
  afterRunwayMonths: number;
  deltaMonths: number;
  lostIncome: number;
  breakCost: number;
  vaultUsed: number;
  cashAfter: number;
  projection: { day: number; cash: number; vault: number; label: string }[];
  verdict: "safe" | "tight" | "risky";
  recommendedWindow: { start: number; end: number };
}

export function simulateBreak(input: BreakSimInput): BreakSimResult {
  const {
    currentRunwayMonths,
    breakDays,
    dailySpend,
    startInDays,
    useVault,
    vaultBalance,
    monthlyIncome,
    monthlySpending,
    baselineNeed,
  } = input;

  const dailyIncome = monthlyIncome / 30;
  const dailyBaseline = baselineNeed / 30;
  const lostIncome = dailyIncome * breakDays;
  const breakCost = dailySpend * breakDays;

  // available cash ≈ (income - spending) over the runway horizon
  const monthlySavings = Math.max(0, monthlyIncome - monthlySpending);
  const cashNow = currentRunwayMonths * (monthlySpending || 1);
  const dailyBurn = dailyBaseline;

  let cash = cashNow;
  let vault = vaultBalance;
  const projection: BreakSimResult["projection"] = [];
  for (let d = 0; d <= breakDays + 5; d++) {
    let dayCash = cash;
    let dayVault = vault;
    if (d >= startInDays && d < startInDays + breakDays) {
      // during break: no income, spend dailySpend
      dayCash -= dailySpend;
      if (dayCash < 0) {
        if (useVault) {
          const draw = Math.min(dayVault, -dayCash);
          dayVault -= draw;
          dayCash += draw;
        } else {
          dayCash = 0;
        }
      }
    } else {
      // normal day: earn dailyIncome - dailyBurn
      dayCash += dailyIncome - dailyBurn;
    }
    cash = dayCash;
    vault = dayVault;
    projection.push({
      day: d,
      cash: round2(cash),
      vault: round2(vault),
      label: d === 0 ? "Today" : d === startInDays ? "Break start" : d === startInDays + breakDays - 1 ? "Break end" : `D${d}`,
    });
  }

  const totalDrain = lostIncome + breakCost;
  const vaultUsed = vaultBalance - vault;
  const cashAfter = projection[projection.length - 1].cash;
  const afterRunwayMonths = round2((cashAfter / (monthlySpending || 1)) || 0);
  const deltaMonths = round2(afterRunwayMonths - currentRunwayMonths);

  const verdict: BreakSimResult["verdict"] =
    afterRunwayMonths >= 2.0 ? "safe" : afterRunwayMonths >= 1.2 ? "tight" : "risky";

  // recommended window — next low-pressure window (heuristic)
  const recStart = 14;
  const recEnd = Math.min(21, recStart + Math.min(breakDays, 7));

  return {
    afterRunwayMonths,
    deltaMonths,
    lostIncome: round2(lostIncome),
    breakCost: round2(breakCost),
    vaultUsed: round2(vaultUsed),
    cashAfter: round2(cashAfter),
    projection,
    verdict,
    recommendedWindow: { start: recStart, end: recEnd },
  };
}

/* ─────────────────────────────────────────────────────────────
   What-If Simulator — projects runway/vault under user-defined
   income & spending changes over a horizon.
   ───────────────────────────────────────────────────────────── */

export interface WhatIfInput {
  currentIncome: number;
  currentSpending: number;
  vaultBalance: number;
  baselineNeed: number; // monthly essentials
  incomeChangePct: number; // e.g. +20 = +20%, -15 = -15%
  spendingChangePct: number;
  vaultContributionPct: number; // 0-100, % of surplus to vault
  horizonMonths: number; // 1-12
}

export interface WhatIfMonth {
  month: number;
  income: number;
  spending: number;
  surplus: number;
  vaultDeposit: number;
  vaultBalance: number;
  runwayMonths: number;
  cumulativeSaved: number;
}

export interface WhatIfResult {
  months: WhatIfMonth[];
  finalVault: number;
  finalRunway: number;
  totalSaved: number;
  totalVaultContrib: number;
  netWorthDelta: number;
  verdict: "improved" | "stable" | "risky";
  comparison: {
    baselineRunway: number;
    scenarioRunway: number;
    runwayDelta: number;
    baselineVault: number;
    scenarioVault: number;
    vaultDelta: number;
  };
}

export function simulateWhatIf(input: WhatIfInput): WhatIfResult {
  const {
    currentIncome,
    currentSpending,
    vaultBalance: startVault,
    baselineNeed,
    incomeChangePct,
    spendingChangePct,
    vaultContributionPct,
    horizonMonths,
  } = input;

  const newIncome = currentIncome * (1 + incomeChangePct / 100);
  const newSpending = currentSpending * (1 + spendingChangePct / 100);
  const monthlySurplus = newIncome - newSpending;
  const vaultRate = Math.max(0, Math.min(100, vaultContributionPct)) / 100;

  // baseline scenario (no changes)
  const baselineSurplus = currentIncome - currentSpending;
  let baselineVault = startVault;
  for (let m = 0; m < horizonMonths; m++) {
    baselineVault += Math.max(0, baselineSurplus) * 0.4; // default 40% rule
  }

  const months: WhatIfMonth[] = [];
  let vault = startVault;
  let totalSaved = 0;
  let totalVaultContrib = 0;

  for (let m = 1; m <= horizonMonths; m++) {
    const surplus = monthlySurplus;
    const vaultDeposit = surplus > 0 ? surplus * vaultRate : 0;
    // if deficit, pull from vault to cover shortfall (up to balance)
    const vaultWithdrawal = surplus < 0 ? Math.min(vault, Math.abs(surplus)) : 0;
    vault = vault + vaultDeposit - vaultWithdrawal;
    totalSaved += Math.max(0, surplus);
    totalVaultContrib += vaultDeposit - vaultWithdrawal;

    const burn = Math.max(1, newSpending);
    const runway = (vault + Math.max(0, surplus)) / burn;

    months.push({
      month: m,
      income: round2(newIncome),
      spending: round2(newSpending),
      surplus: round2(surplus),
      vaultDeposit: round2(vaultDeposit - vaultWithdrawal),
      vaultBalance: round2(vault),
      runwayMonths: round2(runway),
      cumulativeSaved: round2(totalSaved),
    });
  }

  const finalVault = vault;
  const finalRunway = months[months.length - 1].runwayMonths;
  const netWorthDelta = round2((finalVault - startVault) + totalSaved);

  const baselineRunway = (startVault + Math.max(0, baselineSurplus) * horizonMonths) / Math.max(1, currentSpending);
  const scenarioRunway = finalRunway;

  let verdict: WhatIfResult["verdict"] = "stable";
  if (scenarioRunway > baselineRunway + 0.3 && monthlySurplus > 0) verdict = "improved";
  else if (scenarioRunway < baselineRunway - 0.3 || finalVault < startVault * 0.7) verdict = "risky";

  return {
    months,
    finalVault: round2(finalVault),
    finalRunway: round2(finalRunway),
    totalSaved: round2(totalSaved),
    totalVaultContrib: round2(totalVaultContrib),
    netWorthDelta,
    verdict,
    comparison: {
      baselineRunway: round2(baselineRunway),
      scenarioRunway: round2(scenarioRunway),
      runwayDelta: round2(scenarioRunway - baselineRunway),
      baselineVault: round2(baselineVault),
      scenarioVault: round2(finalVault),
      vaultDelta: round2(finalVault - baselineVault),
    },
  };
}

