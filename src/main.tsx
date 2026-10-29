import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  Dumbbell,
  BookOpen,
  Calculator,
  ClipboardList,
  ChevronDown,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import "./style.css";
type Poster = {
  id: string;
  title: string;
  src: string;
  filename: string;
  description: string;
};
type Case = {
  id: number;
  name: string;
  age: number;
  active: boolean;
  debt: boolean;
  tenure: number;
  student: boolean;
  family: boolean;
  holderActive: boolean;
  holderTenure: number;
  plan: number;
  capacity: boolean;
  attendance: number;
};
const example: Case = {
  id: 1,
  name: "Caso A · Socio regular",
  age: 25,
  active: true,
  debt: false,
  tenure: 2,
  student: false,
  family: false,
  holderActive: true,
  holderTenure: 8,
  plan: 30,
  capacity: true,
  attendance: 10,
};
const presets: Case[] = [
  example,
  { ...example, id: 2, name: "Caso B · Estudiante", student: true, plan: 5 },
  { ...example, id: 3, name: "Caso C · Antigüedad", tenure: 8 },
  { ...example, id: 4, name: "Caso D · Deuda", debt: true },
  { ...example, id: 5, name: "Caso E · Edad inválida", age: 81 },
  { ...example, id: 6, name: "Caso F · Sin cupo", capacity: false },
  {
    ...example,
    id: 7,
    name: "Caso G · Familiar",
    family: true,
    holderTenure: 8,
  },
];
const posters: Poster[] = [
  {
    id: "abp",
    title: "PÓSTER 01 | VERSIÓN ABP",
    src: "/gym-manager-ABP.jpeg",
    filename: "gym-manager-ABP.jpeg",
    description:
      "Póster académico original del proyecto, elaborado siguiendo la estructura del Aprendizaje Basado en Proyectos.",
  },
  {
    id: "academico",
    title: "PÓSTER 02 | VERSIÓN ACADÉMICA MEJORADA",
    src: "/gym-manager-FTK.png",
    filename: "gym-manager-FTK.png",
    description:
      "Presentación visual renovada de los contenidos, objetivos, fundamentos y resultados del proyecto.",
  },
];
const prices: Record<number, number> = { 3: 12000, 5: 24000, 30: 50000 };
const money = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
const yn = (b: boolean) => (b ? "V" : "F");
function evaluate(c: Case) {
  const errors: string[] = [];
  if (!Number.isInteger(c.age) || c.age < 12 || c.age > 80)
    errors.push("La edad debe ser un entero entre 12 y 80 años.");
  if (![3, 5, 30].includes(c.plan) && !c.family)
    errors.push("El plan debe pertenecer al conjunto {3, 5, 30}.");
  if (!Number.isInteger(c.tenure) || c.tenure < 0)
    errors.push("La antigüedad debe ser un entero no negativo.");
  if (!Number.isInteger(c.holderTenure) || c.holderTenure < 0)
    errors.push("La antigüedad del titular debe ser un entero no negativo.");
  if (!Number.isInteger(c.attendance) || c.attendance < 0 || c.attendance > 30)
    errors.push("Las asistencias deben estar entre 0 y 30.");
  const access = c.active && !c.debt;
  const classAccess = access && c.capacity;
  const eligibleFamily = c.holderActive && c.holderTenure > 6;
  const discount = c.student ? 0.5 : c.tenure > 6 ? 0.1 : 0;
  const base = c.family ? 25000 : prices[c.plan];
  const charge =
    errors.length || !access || (c.family && !eligibleFamily)
      ? null
      : c.family
        ? 25000
        : base * (1 - discount);
  const status = errors.length
    ? "inválido"
    : !access
      ? "bloqueado"
      : c.family && !eligibleFamily
        ? "promoción no habilitada"
        : "válido";
  const nth = c.attendance ? 10 + (c.attendance - 1) * 5 : 0;
  const points = c.attendance ? (c.attendance * (10 + nth)) / 2 : 0;
  return {
    errors,
    access,
    classAccess,
    eligibleFamily,
    discount,
    base,
    charge,
    status,
    nth,
    points,
  };
}
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [tab, setTab] = useState("inicio");
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(null);
  const [posterZoom, setPosterZoom] = useState(1);
  const [c, setC] = useState<Case>(example);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [records, setRecords] = useState<
    (Case & { status: string; charge: number | null })[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("gym-records") || "[]");
    } catch {
      return [];
    }
  });
  const [step, setStep] = useState(0);
  const [fin, setFin] = useState({
    rent: 350000,
    clean: 40000,
    repair: 20000,
    kwh: 1200,
    kwhRate: 80,
    water: 50,
    waterRate: 300,
    machines: 20,
    maintenance: 2500,
    equipment: 2,
    equipmentPrice: 12000,
    regular3: 10,
    regular5: 10,
    regular30: 10,
    students3: 3,
    students5: 3,
    students30: 3,
    family: 2,
    days: 30,
    visits: 600,
  });
  useEffect(
    () => localStorage.setItem("gym-records", JSON.stringify(records)),
    [records],
  );
  useEffect(() => {
    if (!selectedPoster) return;
    const scrollPosition = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPoster(null);
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = "100%";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollPosition);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPoster]);
  const r = evaluate(c);
  const costs =
    fin.rent +
    fin.clean +
    fin.repair +
    fin.kwh * fin.kwhRate +
    fin.water * fin.waterRate +
    fin.machines * fin.maintenance +
    fin.equipment * fin.equipmentPrice;
  const revenue =
    fin.regular3 * 12000 +
    fin.regular5 * 24000 +
    fin.regular30 * 50000 +
    fin.students3 * 6000 +
    fin.students5 * 12000 +
    fin.students30 * 25000 +
    fin.family * 25000;
  const count =
    fin.regular3 +
    fin.regular5 +
    fin.regular30 +
    fin.students3 +
    fin.students5 +
    fin.students30 +
    fin.family;
  const change = (k: keyof Case, v: any) => setC((x) => ({ ...x, [k]: v }));
  const toggle = (k: string) =>
    setExpanded((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  const save = () =>
    setRecords((x) => [
      {
        ...c,
        id: Date.now(),
        name: c.name,
        status: r.status,
        charge: r.charge,
      },
      ...x,
    ]);
  const csv = () => {
    const cols = [
      "name",
      "age",
      "active",
      "debt",
      "tenure",
      "student",
      "family",
      "holderActive",
      "holderTenure",
      "plan",
      "capacity",
      "attendance",
      "status",
      "charge",
    ];
    const text = [
      cols.join(";"),
      ...records.map((rec) =>
        cols
          .map((k) =>
            String((rec as any)[k] ?? "")
              .split(";")
              .join(","),
          )
          .join(";"),
      ),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "gym-master-casos.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const field = (label: string, key: keyof Case, min = 0, max = 999) => (
    <label className="field">
      {label}
      <input
        type="number"
        value={c[key] as number}
        min={min}
        max={max}
        onChange={(e) =>
          change(key, e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </label>
  );
  const flag = (label: string, key: keyof Case) => (
    <label className="flag">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={Boolean(c[key])}
        onChange={(e) => change(key, e.target.checked)}
      />
    </label>
  );
  const detail = (
    key: string,
    title: string,
    formula: string,
    desc: string,
  ) => (
    <div className="detail">
      <button onClick={() => toggle(key)}>
        <span>
          <b>{title}</b>
          <code>{formula}</code>
        </span>
        <ChevronDown
          size={18}
          className={expanded.includes(key) ? "flip" : ""}
        />
      </button>
      {expanded.includes(key) && <p>{desc}</p>}
    </div>
  );
  const nav = (x: string) => setTab(x);
  const openPoster = (poster: Poster) => {
    setPosterZoom(1);
    setSelectedPoster(poster);
  };
  const changePosterZoom = (amount: number) =>
    setPosterZoom((current) => Math.min(2.5, Math.max(0.75, current + amount)));
  const enterSimulator = () => {
    setC(example);
    setTab("simulador");
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <main className="welcome">
        <div className="welcome-stripes" aria-hidden="true" />
        <div className="welcome-content">
          <div className="welcome-mark" aria-hidden="true">
            <Dumbbell />
          </div>
          <h1>
            <span>GYM</span> MANAGER
          </h1>
          <p>SIMULADOR DE GESTIÓN Y LÓGICA MATEMÁTICA</p>
          <button className="welcome-button" onClick={enterSimulator}>
            INGRESAR AL SIMULADOR <ArrowRight size={20} />
          </button>
        </div>
        <small className="welcome-credit">
          ISPC · GRUPO 22 · CTRL+E · 2026
        </small>
      </main>
    );
  }

  return (
    <>
      <header>
        <div className="brand" onClick={() => nav("inicio")}>
          <Dumbbell size={25} />
          <span>
            GYM<span className="red">MASTER</span>
          </span>
        </div>
        <nav>
          {[
            ["inicio", "INICIO"],
            ["simulador", "SIMULADOR"],
            ["laboratorio", "LABORATORIO"],
            ["pruebas", "PRUEBAS"],
            ["proyecto", "PROYECTO"],
            ["poster", "PÓSTER"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "selected" : ""}
              onClick={() => nav(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <small>ISPC · GRUPO 22 · CTRL+E</small>
      </header>
      <main>
        {tab === "inicio" ? (
          <section className="hero">
            <div className="eyebrow">ISPC / MATEMÁTICA Y LÓGICA / ABP 2026</div>
            <h1>
              EL GIMNASIO
              <br />
              EN <em>NÚMEROS.</em>
            </h1>
            <p>
              Una simulación interactiva de membresías, lógica proposicional,
              progresiones aritméticas y gestión financiera. Cada decisión tiene
              una explicación matemática.
            </p>
            <button className="primary" onClick={() => nav("simulador")}>
              INICIAR SIMULADOR <ArrowRight size={20} />
            </button>
            <div className="hero-bottom">
              <span>01 / REGLAS</span>
              <span>02 / FÓRMULAS</span>
              <span>03 / RESULTADOS</span>
            </div>
          </section>
        ) : null}
        {tab === "simulador" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  MÓDULO 01 / OPERACIÓN + MATEMÁTICA
                </div>
                <h2>
                  SIMULADOR <span>EN VIVO</span>
                </h2>
              </div>
              <button className="outline" onClick={save}>
                <Plus size={17} /> GUARDAR CASO
              </button>
            </div>
            <div className="sim-grid">
              <section className="panel">
                <div className="panel-title">01 / CONFIGURACIÓN DEL SOCIO</div>
                <label className="field">
                  Nombre del caso
                  <input
                    value={c.name}
                    onChange={(e) => change("name", e.target.value)}
                  />
                </label>
                <div className="two">
                  {field("Edad (años)", "age", 12, 80)}
                  {field("Antigüedad (meses)", "tenure")}
                </div>
                {flag("Membresía activa", "active")}
                {flag("Deuda pendiente", "debt")}
                <div className="panel-title space">02 / MODALIDAD</div>
                <div className="choice">
                  <button
                    className={!c.family ? "on" : ""}
                    onClick={() => change("family", false)}
                  >
                    PLAN REGULAR
                  </button>
                  <button
                    className={c.family ? "on" : ""}
                    onClick={() => change("family", true)}
                  >
                    PROMO FAMILIAR
                  </button>
                </div>
                {c.family ? (
                  <>
                    <div className="info">
                      Tarifa fija $25.000 / 30 días. No admite descuentos
                      adicionales.
                    </div>
                    {flag("Titular con membresía activa", "holderActive")}
                    {field("Antigüedad del titular (meses)", "holderTenure")}
                  </>
                ) : (
                  <>
                    <label className="field">
                      Frecuencia del plan
                      <select
                        value={c.plan}
                        onChange={(e) => change("plan", Number(e.target.value))}
                      >
                        <option value={3}>3 días · $12.000</option>
                        <option value={5}>5 días · $24.000</option>
                        <option value={30}>30 días · $50.000</option>
                      </select>
                    </label>
                    {flag("Estudiante acreditado", "student")}
                  </>
                )}
                <div className="panel-title space">03 / CLASE Y ASISTENCIA</div>
                {flag("Cupo disponible en la clase", "capacity")}
                {field("Días asistidos este mes", "attendance", 0, 30)}
              </section>
              <section className="panel results">
                <div className="panel-title">
                  RESULTADOS / EVALUACIÓN AUTOMÁTICA
                </div>
                <div
                  className={
                    "status " +
                    (r.status === "válido"
                      ? "ok"
                      : r.status === "inválido"
                        ? "warn"
                        : "bad")
                  }
                >
                  <span>
                    {r.status === "válido" ? (
                      <CheckCircle2 />
                    ) : (
                      <AlertTriangle />
                    )}
                    {r.status.toUpperCase()}
                  </span>
                  <small>
                    {r.errors.length
                      ? r.errors.join(" ")
                      : r.access
                        ? "Membresía habilitada"
                        : "No se autoriza el acceso al gimnasio."}
                  </small>
                </div>
                <div className="metrics">
                  <div>
                    <small>ACCESO AL GIMNASIO</small>
                    <strong>
                      {r.access && !r.errors.length ? "PERMITIDO" : "DENEGADO"}
                    </strong>
                  </div>
                  <div>
                    <small>INGRESO A CLASE</small>
                    <strong>
                      {r.classAccess && !r.errors.length
                        ? "PERMITIDO"
                        : "DENEGADO"}
                    </strong>
                  </div>
                  <div>
                    <small>IMPORTE FINAL</small>
                    <strong>
                      {r.charge === null ? "SIN COBRO" : money(r.charge)}
                    </strong>
                  </div>
                  <div>
                    <small>PUNTOS DE FIDELIDAD</small>
                    <strong>{r.errors.length ? "—" : r.points}</strong>
                  </div>
                </div>
                {detail(
                  "logic",
                  "LÓGICA DE ACCESO",
                  `p ∧ ¬t = ${yn(c.active)} ∧ ${yn(!c.debt)} = ${yn(r.access)}`,
                  "p: membresía activa. t: deuda pendiente. El acceso se permite solo cuando p es verdadero y t es falso.",
                )}
                {detail(
                  "class",
                  "INGRESO A CLASE",
                  `A ∧ s = ${yn(r.access)} ∧ ${yn(c.capacity)} = ${yn(r.classAccess)}`,
                  "A: acceso al gimnasio. s: cupo disponible. Sin cupo no hay ingreso a clase, aunque el socio tenga acceso al gimnasio.",
                )}
                {detail(
                  "fee",
                  "FUNCIÓN DE PRECIO",
                  r.charge === null
                    ? "C = sin cobro"
                    : c.family
                      ? "C = $25.000 (tarifa fija)"
                      : `C = ${money(r.base)} × (1 − ${r.discount}) = ${money(r.charge)}`,
                  c.family
                    ? "La promoción exige titular activo con antigüedad superior a seis meses. No se acumula con descuentos."
                    : "Estudiante: 50 %. Antigüedad superior a 6 meses: 10 %. Si coinciden, prevalece el 50 %. El cobro solo se calcula cuando hay acceso.",
                )}
                {detail(
                  "domain",
                  "DOMINIOS Y CONJUNTOS",
                  `E ∈ [12,80] ∩ ℕ; F ∈ {3,5,30}`,
                  "La validación didáctica muestra los errores de dominio sin procesar la entrada como válida. Antigüedad y asistencias se modelan con enteros no negativos.",
                )}
                {r.errors.length > 0 && (
                  <div className="error-list">
                    {r.errors.map((e) => (
                      <p key={e}>⚠ {e}</p>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : null}
        {tab === "laboratorio" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow">TEORÍA + APLICACIÓN</div>
                <h2>
                  LABORATORIO <span>MATEMÁTICO</span>
                </h2>
              </div>
            </div>
            <div className="lab-grid">
              <section className="panel">
                <div className="panel-title">01 / LÓGICA PROPOSICIONAL</div>
                <h3>Tablas de verdad</h3>
                <p className="muted">Acceso: A = p ∧ ¬t</p>
                <table>
                  <thead>
                    <tr>
                      <th>p</th>
                      <th>t</th>
                      <th>¬t</th>
                      <th>A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[true, false].flatMap((p) =>
                      [false, true].map((t) => (
                        <tr key={`${p}-${t}`}>
                          <td>{yn(p)}</td>
                          <td>{yn(t)}</td>
                          <td>{yn(!t)}</td>
                          <td className={p && !t ? "green" : "red"}>
                            {yn(p && !t)}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
                <p className="muted">
                  Ingreso a clase: C = A ∧ s. Descuento estudiante: D₅₀ = v ∧ A.
                  Antigüedad: D₁₀ = r ∧ A ∧ ¬v.
                </p>
              </section>
              <section className="panel">
                <div className="panel-title">02 / PROGRESIONES ARITMÉTICAS</div>
                <h3>Fidelización</h3>
                <p className="muted">
                  Primer día: 10 puntos. Incremento diario: 5 puntos.
                </p>
                <div className="formula">aₙ = 10 + (n − 1) × 5</div>
                <div className="formula">Sₙ = n × (10 + aₙ) / 2</div>
                <label className="field">
                  Días asistidos (0–30)
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={c.attendance}
                    onChange={(e) =>
                      change("attendance", Number(e.target.value))
                    }
                  />
                </label>
                <div className="big-number">
                  {Number.isInteger(c.attendance) &&
                  c.attendance >= 0 &&
                  c.attendance <= 30
                    ? r.points
                    : "INVÁLIDO"}{" "}
                  <small>PUNTOS</small>
                </div>
                <p className="muted">
                  Para 30 días: a₃₀ = 155 y S₃₀ = 2475 puntos.
                </p>
              </section>
            </div>
            <section className="panel finance">
              <div className="panel-title">03 / FINANZAS DEL GIMNASIO</div>
              <h3>Costos, ingresos y ganancias</h3>
              <p className="muted">
                Modificá las variables para demostrar el cálculo. Datos
                iniciales de ejemplo basados en el ABP.
              </p>
              <div className="finance-fields">
                {(
                  [
                    ["rent", "Alquiler ($)"],
                    ["clean", "Limpieza ($)"],
                    ["repair", "Reparaciones ($)"],
                    ["kwh", "Consumo eléctrico (kWh)"],
                    ["kwhRate", "Tarifa por kWh ($)"],
                    ["water", "Consumo de agua (m³)"],
                    ["waterRate", "Tarifa por m³ ($)"],
                    ["machines", "Máquinas"],
                    ["maintenance", "Mantenimiento por máquina ($)"],
                    ["equipment", "Equipamiento comprado"],
                    ["equipmentPrice", "Precio por unidad ($)"],
                    ["regular3", "Socios regulares 3 días"],
                    ["regular5", "Socios regulares 5 días"],
                    ["regular30", "Socios regulares 30 días"],
                    ["students3", "Estudiantes 3 días"],
                    ["students5", "Estudiantes 5 días"],
                    ["students30", "Estudiantes 30 días"],
                    ["family", "Promociones familiares"],
                    ["days", "Días del período"],
                    ["visits", "Asistencias totales"],
                  ] as [keyof typeof fin, string][]
                ).map(([k, label]) => (
                  <label className="field" key={k}>
                    {label}
                    <input
                      type="number"
                      min="0"
                      value={fin[k]}
                      onChange={(e) =>
                        setFin((x) => ({ ...x, [k]: Number(e.target.value) }))
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="metrics">
                <div>
                  <small>COSTOS TOTALES</small>
                  <strong>{money(costs)}</strong>
                </div>
                <div>
                  <small>INGRESOS TOTALES</small>
                  <strong>{money(revenue)}</strong>
                </div>
                <div>
                  <small>RESULTADO NETO</small>
                  <strong className={revenue - costs >= 0 ? "green" : "red"}>
                    {money(revenue - costs)}
                  </strong>
                </div>
                <div>
                  <small>ASISTENCIAS POR DÍA</small>
                  <strong>
                    {fin.days > 0 ? (fin.visits / fin.days).toFixed(1) : "—"}
                  </strong>
                </div>
                <div>
                  <small>INGRESO POR SOCIO</small>
                  <strong>{count ? money(revenue / count) : "—"}</strong>
                </div>
              </div>
              <div className="formula">
                Ganancia = ingresos totales − costos totales
              </div>
            </section>
          </>
        ) : null}
        {tab === "pruebas" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  CASOS PREDEFINIDOS + REGISTROS LOCALES
                </div>
                <h2>
                  MATRIZ DE <span>PRUEBAS</span>
                </h2>
              </div>
              <button
                className="outline"
                onClick={csv}
                disabled={!records.length}
              >
                <Download size={17} /> EXPORTAR CSV
              </button>
            </div>
            <section className="panel">
              <div className="panel-title">
                PRESENTACIÓN GUIADA · CASO {step + 1} DE {presets.length}
              </div>
              <h3>{presets[step].name}</h3>
              <p className="muted">
                Edad: {presets[step].age} · Plan:{" "}
                {presets[step].family
                  ? "Familiar"
                  : `${presets[step].plan} días`}{" "}
                · Membresía: {yn(presets[step].active)} · Deuda:{" "}
                {yn(presets[step].debt)}
              </p>
              <div className="status neutral">
                Resultado esperado:{" "}
                {evaluate(presets[step]).status.toUpperCase()} ·{" "}
                {evaluate(presets[step]).charge === null
                  ? "Sin cobro"
                  : money(evaluate(presets[step]).charge!)}
              </div>
              <div className="actions">
                <button
                  className="outline"
                  onClick={() => setStep((x) => Math.max(0, x - 1))}
                  disabled={step === 0}
                >
                  ANTERIOR
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    setC(presets[step]);
                    nav("simulador");
                  }}
                >
                  ABRIR EN SIMULADOR <ArrowRight size={17} />
                </button>
                <button
                  className="outline"
                  onClick={() =>
                    setStep((x) => Math.min(presets.length - 1, x + 1))
                  }
                  disabled={step === presets.length - 1}
                >
                  SIGUIENTE
                </button>
              </div>
            </section>
            <section className="panel">
              <div className="panel-title">
                CASOS REGISTRADOS · {records.length}
              </div>
              {records.length === 0 ? (
                <p className="muted">
                  Todavía no hay casos guardados. Desde Simulador podés
                  registrar escenarios válidos, bloqueados o inválidos.
                </p>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Caso</th>
                        <th>Estado</th>
                        <th>Importe</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((x) => (
                        <tr key={x.id}>
                          <td>{x.name}</td>
                          <td>{x.status}</td>
                          <td>
                            {x.charge === null ? "Sin cobro" : money(x.charge)}
                          </td>
                          <td>
                            <button
                              className="tiny"
                              onClick={() => {
                                setC(x);
                                nav("simulador");
                              }}
                            >
                              VER
                            </button>
                            <button
                              className="tiny"
                              onClick={() =>
                                setRecords((y) =>
                                  y.filter((z) => z.id !== x.id),
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
        {tab === "proyecto" ? (
          <>
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  ISPC / TECNICATURA SUPERIOR EN DESARROLLO DE SOFTWARE
                </div>
                <h2>
                  SOBRE EL <span>PROYECTO</span>
                </h2>
              </div>
            </div>
            <section className="panel project-panel">
              <div className="project-intro">
                <div>
                  <div className="eyebrow">PROYECTO ACADÉMICO</div>
                  <h3>
                    GYM <span>MASTER</span>
                  </h3>
                </div>
                <strong>MATEMÁTICA Y LÓGICA</strong>
              </div>
              <p className="project-summary">
                Proyecto de aprendizaje basado en problemas de Matemática y
                Lógica. Representa la administración de un gimnasio mediante
                intervalos, conjuntos, lógica proposicional, funciones,
                progresiones aritméticas y cálculos financieros.
              </p>
              <div className="project-icons">
                <span>
                  <Activity /> Lógica
                </span>
                <span>
                  <BookOpen /> Matemática
                </span>
                <span>
                  <Calculator /> Finanzas
                </span>
                <span>
                  <ClipboardList /> Pruebas
                </span>
              </div>
              <div className="institutional-block">
                <div className="institutional-heading">
                  <div className="eyebrow">DATOS INSTITUCIONALES</div>
                  <h3>Instituto Superior Politécnico Córdoba</h3>
                </div>
                <dl className="institutional-data">
                  <div>
                    <dt>Institución</dt>
                    <dd>Instituto Superior Politécnico Córdoba (ISPC)</dd>
                  </div>
                  <div>
                    <dt>Carrera</dt>
                    <dd>Tecnicatura Superior en Desarrollo de Software</dd>
                  </div>
                  <div>
                    <dt>Asignatura</dt>
                    <dd>Matemática y Lógica</dd>
                  </div>
                  <div>
                    <dt>Docente</dt>
                    <dd>Nahuel Pratta</dd>
                  </div>
                  <div>
                    <dt>Ciclo lectivo</dt>
                    <dd>2026</dd>
                  </div>
                  <div>
                    <dt>Comisión</dt>
                    <dd>A</dd>
                  </div>
                  <div>
                    <dt>Grupo</dt>
                    <dd>22 · Ctrl+E</dd>
                  </div>
                </dl>
                <div className="team-heading">
                  <div className="eyebrow">INTEGRANTES</div>
                  <span>ORDEN ALFABÉTICO POR APELLIDO</span>
                </div>
                <ul className="team-grid">
                  <li>
                    <span>01</span>Josefina Madai Alcaraz
                  </li>
                  <li>
                    <span>02</span>Fiorella Easdale Castillo
                  </li>
                  <li>
                    <span>03</span>Emmanuel Gillio
                  </li>
                  <li>
                    <span>04</span>Emilio Santiago Guzmán
                  </li>
                  <li>
                    <span>05</span>Federico Montoro
                  </li>
                  <li>
                    <span>06</span>Marcelo Nahuel Raspo
                  </li>
                </ul>
              </div>
              <p className="muted">
                Demostración académica: los datos son ficticios y se guardan
                localmente en el navegador. No es un sistema de cobro real.
              </p>
            </section>
          </>
        ) : null}
        {tab === "poster" ? (
          <>
            <div className="section-heading poster-heading">
              <div>
                <div className="eyebrow">
                  ISPC / MATEMÁTICA Y LÓGICA / GRUPO 22 · CTRL+E / 2026
                </div>
                <h2>
                  PÓSTERES <span>ACADÉMICOS</span>
                </h2>
                <p>
                  Explorá las dos presentaciones visuales del proyecto GYM
                  Master. Seleccioná una imagen para ampliarla o descargarla.
                </p>
              </div>
            </div>
            <section className="poster-grid" aria-label="Pósteres académicos">
              {posters.map((poster) => (
                <article className="poster-card" key={poster.id}>
                  <button
                    className="poster-preview"
                    onClick={() => openPoster(poster)}
                    aria-label={`Ampliar ${poster.title}`}
                  >
                    <img src={poster.src} alt={poster.title} />
                    <span>
                      <Maximize2 size={20} /> AMPLIAR
                    </span>
                  </button>
                  <div className="poster-card-content">
                    <div className="panel-title">{poster.title}</div>
                    <p>{poster.description}</p>
                    <div className="poster-actions">
                      <button
                        className="outline"
                        onClick={() => openPoster(poster)}
                      >
                        <Maximize2 size={17} /> VER PÓSTER
                      </button>
                      <a
                        className="outline"
                        href={poster.src}
                        download={poster.filename}
                      >
                        <Download size={17} /> DESCARGAR
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : null}
      </main>
      <footer>
        <a
          href="https://ftk-lab.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>DESARROLLADO POR FTK LAB 🤍❤️🤍</strong>
        </a>
        <small>ISPC · MATEMÁTICA Y LÓGICA · 2026</small>
      </footer>
      {selectedPoster ? (
        <div
          className="poster-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Visor de ${selectedPoster.title}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedPoster(null);
          }}
        >
          <div className="poster-modal-bar">
            <div>
              <div className="panel-title">{selectedPoster.title}</div>
              <small>{Math.round(posterZoom * 100)} %</small>
            </div>
            <div className="poster-modal-controls">
              <button
                onClick={() => changePosterZoom(-0.25)}
                disabled={posterZoom <= 0.75}
                aria-label="Reducir zoom"
                title="Reducir zoom"
              >
                <ZoomOut />
              </button>
              <button
                onClick={() => setPosterZoom(1)}
                disabled={posterZoom === 1}
                aria-label="Restablecer zoom"
                title="Restablecer zoom"
              >
                <RotateCcw />
              </button>
              <button
                onClick={() => changePosterZoom(0.25)}
                disabled={posterZoom >= 2.5}
                aria-label="Ampliar zoom"
                title="Ampliar zoom"
              >
                <ZoomIn />
              </button>
              <a
                href={selectedPoster.src}
                download={selectedPoster.filename}
                aria-label="Descargar imagen original"
                title="Descargar imagen original"
              >
                <Download />
              </a>
              <button
                className="poster-modal-close"
                onClick={() => setSelectedPoster(null)}
                aria-label="Cerrar visor"
                title="Cerrar visor"
                autoFocus
              >
                <X />
              </button>
            </div>
          </div>
          <div className="poster-modal-stage">
            <img
              src={selectedPoster.src}
              alt={selectedPoster.title}
              style={{ height: `${posterZoom * 78}vh` }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
