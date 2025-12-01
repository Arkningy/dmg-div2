import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Slider
} from "@mui/material";

// --- CONSTANTES ---

const SHD = {
  AWP: 10,
  HSD: 20,
  critChance: 10,
  critDamage: 20,
  reloadSpeed: 10,
};

const CORE2_OPTIONS = [
  "None",
  "AWP",
  "SWP",
  "HSD",
  "Crit chance",
  "Crit damage",
  "DTTOOC",
  "DTA",
  "DTH",
];

const ATTRIBUTE_OPTIONS = [
  "None",
  "DTTOOC",
  "DTA",
  "DTH",
  "HSD",
  "Crit damage",
  "Crit chance",
  "Rate of fire",
  "Reload speed",
  "Magazine size",
];

// =============================
//      COMPOSANT PRINCIPAL
// =============================

export default function WeaponDamageCalculator() {
  const [stats, setStats] = useState({
    base: 0,
    rpm: 600,
    mag: 30,

    expertise: 0,
    core1: 0,            // SWP
    core2: "None",       // variable
    attribute: "None",   // variable
  });

  const update = (name, value) => {
    setStats((s) => ({
      ...s,
      [name]: value,
    }));
  };

  // ===========================================================
  // ========== AGRÉGATION AUTOMATIQUE DES STATISTIQUES =========
  // ===========================================================
  const full = useMemo(() => {
    const {
      base,
      rpm,
      mag,
      expertise,
      core1,
      core2,
      attribute,
    } = stats;

    // AWD = SHD + expertise + core2 si AWP
    let AWD = SHD.AWP + expertise;

    if (core2 === "AWP") AWD += 15; // valeur standard d’un core rouge

    // SWD = core1 + éventuellement core2
    let SWD = core1;
    if (core2 === "SWP") SWD += 15;

    // CHD = SHD + attributs
    let CHD = SHD.critDamage;
    if (core2 === "Crit damage") CHD += 15;
    if (attribute === "Crit damage") CHD += 10;

    // HSD = SHD + attributs
    let HSD = SHD.HSD;
    if (core2 === "HSD") HSD += 15;
    if (attribute === "HSD") HSD += 10;

    // CRIT CHANCE (pas utilisé dans ta formule de base, mais présent)
    let CritChance = SHD.critChance;
    if (core2 === "Crit chance") CritChance += 15;
    if (attribute === "Crit chance") CritChance += 10;

    // DTTOOC
    let DTTOOC = 0;
    if (core2 === "DTTOOC") DTTOOC += 15;
    if (attribute === "DTTOOC") DTTOOC += 10;

    // DTA / DTH
    let DTA = 0;
    let DTH = 0;
    if (core2 === "DTA") DTA += 15;
    if (core2 === "DTH") DTH += 15;
    if (attribute === "DTA") DTA += 10;
    if (attribute === "DTH") DTH += 10;

    const dmgToTarget = Math.max(DTA, DTH);

    return {
      base,
      rpm,
      mag,
      AWD,
      SWD,
      TWD: 0,
      CHD,
      HSD,
      DTTOOC,
      dmgToTarget,
    };
  }, [stats]);

  // ==============================
  //  CALCUL DES DÉGÂTS (FORMULE)
  // ==============================
  const damagePerBullet = useMemo(() => {
    const {
      base,
      AWD,
      SWD,
      TWD,
      CHD,
      HSD,
      dmgToTarget,
      DTTOOC,
    } = full;

    if (!base) return 0;

    return (
      base *
      (1 + (AWD + SWD) / 100) *
      (1 + TWD / 100) *
      (1 + (CHD + HSD) / 100) *
      (1 + dmgToTarget / 100) *
      (1 + DTTOOC / 100)
    );
  }, [full]);

  const DPS = useMemo(() => (damagePerBullet * full.rpm) / 60, [damagePerBullet, full.rpm]);

  const critDPS = useMemo(() => {
    return DPS * (1 + full.CHD / 100);
  }, [DPS, full]);

  const headshotDPS = useMemo(() => {
    return DPS * (1 + full.HSD / 100);
  }, [DPS, full]);

  // ==============================
  //           AFFICHAGE
  // ==============================
  return (
    <Box sx={{ p: 3, maxWidth: 600, display: "grid", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>
        Weapon Damage Calculator — MUI Version
      </Typography>

      {/* BASE DAMAGE */}
      <TextField
        label="Base Damage"
        type="number"
        value={stats.base}
        onChange={(e) => update("base", Number(e.target.value))}
      />

      {/* RPM */}
      <TextField
        label="RPM"
        type="number"
        value={stats.rpm}
        onChange={(e) => update("rpm", Number(e.target.value))}
      />

      {/* MAGAZINE */}
      <TextField
        label="Mag Size"
        type="number"
        value={stats.mag}
        onChange={(e) => update("mag", Number(e.target.value))}
      />

      {/* EXPERTISE */}
      <TextField
        label="Expertise (1% per level)"
        type="number"
        value={stats.expertise}
        onChange={(e) => update("expertise", Number(e.target.value))}
      />

      {/* CORE 1 */}
      <Typography>Core Attribute 1 (SWP) — {stats.core1}%</Typography>
      <Slider
        value={stats.core1}
        min={0}
        max={15}
        valueLabelDisplay="auto"
        onChange={(e, v) => update("core1", v)}
      />

      {/* CORE 2 */}
      <FormControl fullWidth>
        <InputLabel>Core Attribute 2</InputLabel>
        <Select
          value={stats.core2}
          label="Core Attribute 2"
          onChange={(e) => update("core2", e.target.value)}
        >
          {CORE2_OPTIONS.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ATTRIBUTE */}
      <FormControl fullWidth>
        <InputLabel>Attribute</InputLabel>
        <Select
          value={stats.attribute}
          label="Attribute"
          onChange={(e) => update("attribute", e.target.value)}
        >
          {ATTRIBUTE_OPTIONS.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* RESULTS */}
      <Box sx={{ p: 2, bgcolor: "#202020", borderRadius: 2, color: "white" }}>
        <Typography variant="h6">Résultats :</Typography>

        <Typography>Dégâts par balle : {damagePerBullet.toFixed(2)}</Typography>
        <Typography>DPS : {DPS.toFixed(2)}</Typography>
        <Typography>DPS Critique : {critDPS.toFixed(2)}</Typography>
        <Typography>DPS Headshot : {headshotDPS.toFixed(2)}</Typography>

        <Typography mt={2} variant="h6">
          Détails Calculés :
        </Typography>
        <Typography>AWD total : {full.AWD}%</Typography>
        <Typography>SWD total : {full.SWD}%</Typography>
        <Typography>CHD total : {full.CHD}%</Typography>
        <Typography>HSD total : {full.HSD}%</Typography>
        <Typography>DTTOOC : {full.DTTOOC}%</Typography>
        <Typography>DTA/DTH utilisé : {full.dmgToTarget}%</Typography>
      </Box>
    </Box>
  );
}
