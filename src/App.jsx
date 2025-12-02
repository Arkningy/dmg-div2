import React, { useState, useMemo } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Divider,
  Card,
  CardContent,
  Alert,
  Slider,
  Chip,
} from "@mui/material";
import weaponsData from "./weapon.json";
import weaponModsData from "./weaponMods.json";
import { SliderInput } from "./Slider";

// Constants
const WEAPON_CATEGORIES = [
  "Assault Rifle",
  "LMG",
  "Marksman Rifle",
  "Pistol",
  "Rifle",
  "SMG",
  "Shotgun",
];

const BASE_STATS = {
  awd: 10,
  hsd: 20,
  chc: 10,
  chd: 45,
  reloadSpeed: 10,
};

const CORE_ATTRIBUTE_2_BY_CATEGORY = {
  Rifle: { type: "CHD", max: 17 },
  "Assault Rifle": { type: "DTH", max: 21 },
  "Marksman Rifle": { type: "HSD", max: 111 },
  Shotgun: { type: "DTA", max: 12 },
  SMG: { type: "CHC", max: 21 },
  LMG: { type: "DTTOOC", max: 12 },
  Pistol: { type: "None", max: 0 },
};

const AVAILABLE_ATTRIBUTES = [
  { type: "DTA", max: 6 },
  { type: "CHC", max: 9.5 },
  { type: "DTH", max: 9.5 },
  { type: "DTTOOC", max: 10 },
  { type: "HSD", max: 10 },
  { type: "Reload Speed", max: 12 },
  { type: "Optimal Range", max: 24 },
  { type: "Mag Size", max: 12.5 },
  { type: "Rate of Fire", max: 5 },
  { type: "CHD", max: 10 },
];

function App() {
  const [selectedWeaponName, setSelectedWeaponName] = useState("");

  const [weapon, setWeapon] = useState({
    category: "LMG",
    baseDamage: 49480,
    rpm: 750,
    magSize: 200,
    baseHSD: 65,
    optimalRange: 35,
    reloadTime: 3.63,
    expertise: 0,
    coreAttribute1: 15,
    coreAttribute2: 12,
    attribute: { type: "CHC", value: 9.5 },
  });

  const [weaponMods, setWeaponMods] = useState({
    magazine: null,
    muzzle: null,
    optic: null,
    underBarrel: null,
  });

  const [combatScenario, setCombatScenario] = useState({
    targetType: "armor",
    targetInCover: false,
  });

  // Get current weapon data from JSON
  const currentWeaponData = useMemo(() => {
    if (!selectedWeaponName) return null;
    return weaponsData.data.find((w) => w.Name === selectedWeaponName);
  }, [selectedWeaponName]);

  // Filter available mods based on selected weapon
  const availableMods = useMemo(() => {
    if (!currentWeaponData) {
      return {
        magazine: [],
        muzzle: [],
        optic: [],
        underBarrel: [],
      };
    }

    const mods = weaponModsData.data;

    return {
      magazine: mods.filter(
        (mod) =>
          mod.Slot === "Magazine" &&
          (mod.Type === currentWeaponData.Magazine ||
            mod.Type === currentWeaponData.Name)
      ),
      muzzle: mods.filter(
        (mod) =>
          mod.Slot === "Muzzle" &&
          (mod.Type === currentWeaponData.Muzzle ||
            mod.Type === currentWeaponData.Name)
      ),
      optic: mods.filter(
        (mod) =>
          mod.Slot === "Optic" &&
          (mod.Type === currentWeaponData.Optics ||
            currentWeaponData.Optics?.includes(mod.Type) ||
            mod.Type === currentWeaponData.Name)
      ),
      underBarrel: mods.filter(
        (mod) =>
          mod.Slot === "Under Barrel" &&
          (mod.Type === currentWeaponData["Under Barrel"] ||
            currentWeaponData["Under Barrel"]?.includes(mod.Type) ||
            mod.Type === currentWeaponData.Name)
      ),
    };
  }, [currentWeaponData]);

  const handleWeaponSelect = (weaponName) => {
    const weaponData = weaponsData.data.find((w) => w.Name === weaponName);
    if (!weaponData) return;

    setSelectedWeaponName(weaponName);

    const coreAttr2 = CORE_ATTRIBUTE_2_BY_CATEGORY[weaponData["Weapon Type"]];

    setWeapon({
      category: weaponData["Weapon Type"],
      baseDamage: parseFloat(weaponData["Base Damage"]) || 0,
      rpm: parseInt(weaponData.RPM) || 0,
      magSize: parseInt(weaponData["Mag Size"]) || 0,
      baseHSD: parseInt(weaponData.HSD) || 0,
      optimalRange: parseInt(weaponData["Optimal Range"]) || 0,
      reloadTime: parseFloat(weaponData["Reload Speed (ms)"]) / 1000 || 0,
      expertise: 0,
      coreAttribute1: parseFloat(weaponData["Core 1 Max"]) || 15,
      coreAttribute2: parseFloat(weaponData["Core 2 Max"]) || coreAttr2.max,
      attribute: { type: "CHC", value: 9.5 },
    });

    // Reset mods when weapon changes
    setWeaponMods({
      magazine: null,
      muzzle: null,
      optic: null,
      underBarrel: null,
    });
  };

  const handleWeaponChange = (field, value) => {
    if (field === "category") {
      const coreAttr2 = CORE_ATTRIBUTE_2_BY_CATEGORY[value];
      setWeapon((prev) => ({
        ...prev,
        category: value,
        coreAttribute2: coreAttr2.max,
        attribute: { type: "CHC", value: 9.5 },
      }));
    } else if (field === "attributeType") {
      const attr = AVAILABLE_ATTRIBUTES.find((a) => a.type === value);
      setWeapon((prev) => ({
        ...prev,
        attribute: { type: value, value: attr.max },
      }));
    } else if (field === "attributeValue") {
      setWeapon((prev) => ({
        ...prev,
        attribute: { ...prev.attribute, value: parseFloat(value) || 0 },
      }));
    } else {
      setWeapon((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  const handleModChange = (slot, modIndex) => {
    const modList = availableMods[slot];
    const selectedMod = modIndex === "" ? null : modList[parseInt(modIndex)];

    setWeaponMods((prev) => ({
      ...prev,
      [slot]: selectedMod,
    }));
  };

  // Calculate total mod bonuses
  const modBonuses = useMemo(() => {
    const bonuses = {
      chd: 0,
      hsd: 0,
      chc: 0,
      reloadSpeed: 0,
      optimalRange: 0,
      magSize: 0,
      rateOfFire: 0,
      stability: 0,
      accuracy: 0,
      weaponHandling: 0,
      extraRounds: 0,
    };

    Object.values(weaponMods).forEach((mod) => {
      if (!mod) return;

      const posValue = parseFloat(mod.valPos) || 0;
      const negValue = parseFloat(mod.valNeg) || 0;

      // Positive bonus
      if (mod.pos) {
        switch (mod.pos) {
          case "Critical Hit Damage":
            bonuses.chd += posValue;
            break;
          case "Headshot Damage":
            bonuses.hsd += posValue;
            break;
          case "Critical Hit Chance":
            bonuses.chc += posValue;
            break;
          case "Reload Speed":
            bonuses.reloadSpeed += posValue;
            break;
          case "Optimal Range":
            bonuses.optimalRange += posValue;
            break;
          case "Mag Size":
            bonuses.magSize += posValue;
            break;
          case "Rate of Fire":
            bonuses.rateOfFire += posValue;
            break;
          case "Stability":
            bonuses.stability += posValue;
            break;
          case "Accuracy":
            bonuses.accuracy += posValue;
            break;
          case "Weapon Handling":
            bonuses.weaponHandling += posValue;
            bonuses.reloadSpeed += posValue; // Convert to reload speed
            break;
          case "Extra Rounds":
            bonuses.extraRounds += posValue;
            break;
        }
      }

      // Negative bonus
      if (mod.neg) {
        switch (mod.neg) {
          case "Critical Hit Damage":
            bonuses.chd += negValue; // negValue is already negative
            break;
          case "Headshot Damage":
            bonuses.hsd += negValue;
            break;
          case "Critical Hit Chance":
            bonuses.chc += negValue;
            break;
          case "Reload Speed":
            bonuses.reloadSpeed += negValue;
            break;
          case "Optimal Range":
            bonuses.optimalRange += negValue;
            break;
        }
      }
    });

    return bonuses;
  }, [weaponMods]);

  const calculateBulletDamage = (hitType = "body") => {
    const coreAttr2Type = CORE_ATTRIBUTE_2_BY_CATEGORY[weapon.category].type;

    let awd = BASE_STATS.awd + weapon.expertise;
    let swd = weapon.coreAttribute1;

    let chd = BASE_STATS.chd + modBonuses.chd;
    if (coreAttr2Type === "CHD") chd += weapon.coreAttribute2;
    if (weapon.attribute.type === "CHD") chd += weapon.attribute.value;

    let hsd = BASE_STATS.hsd + weapon.baseHSD + modBonuses.hsd;
    if (coreAttr2Type === "HSD") hsd += weapon.coreAttribute2;
    if (weapon.attribute.type === "HSD") hsd += weapon.attribute.value;

    let dtaOrDth = 0;
    if (combatScenario.targetType === "armor") {
      if (coreAttr2Type === "DTA") dtaOrDth += weapon.coreAttribute2;
      if (weapon.attribute.type === "DTA") dtaOrDth += weapon.attribute.value;
    } else {
      if (coreAttr2Type === "DTH") dtaOrDth += weapon.coreAttribute2;
      if (weapon.attribute.type === "DTH") dtaOrDth += weapon.attribute.value;
    }

    let dttooc = 0;
    if (!combatScenario.targetInCover) {
      if (coreAttr2Type === "DTTOOC") dttooc += weapon.coreAttribute2;
      if (weapon.attribute.type === "DTTOOC") dttooc += weapon.attribute.value;
    }

    let damage = weapon.baseDamage * (1 + (awd + swd) / 100);

    if (hitType === "bodyCrit") {
      damage *= 1 + chd / 100;
    } else if (hitType === "headshot") {
      damage *= 1 + hsd / 100;
    } else if (hitType === "headshotCrit") {
      damage *= 1 + (chd + hsd) / 100;
    }

    damage *= 1 + dtaOrDth / 100;
    damage *= 1 + dttooc / 100;

    return Math.round(damage);
  };

  const calculateDPS = () => {
    let chc = BASE_STATS.chc + modBonuses.chc;
    if (CORE_ATTRIBUTE_2_BY_CATEGORY[weapon.category].type === "CHC") {
      chc += weapon.coreAttribute2;
    }
    if (weapon.attribute.type === "CHC") {
      chc += weapon.attribute.value;
    }
    chc = Math.min(chc, 60);

    let rpm = weapon.rpm;
    if (weapon.attribute.type === "Rate of Fire") {
      rpm *= 1 + weapon.attribute.value / 100;
    }
    rpm *= 1 + modBonuses.rateOfFire / 100;

    let magSize = weapon.magSize;
    if (weapon.attribute.type === "Mag Size") {
      magSize *= 1 + weapon.attribute.value / 100;
    }
    magSize *= 1 + modBonuses.magSize / 100;
    magSize += modBonuses.extraRounds;
    magSize = Math.round(magSize);

    let reloadSpeed = BASE_STATS.reloadSpeed + modBonuses.reloadSpeed;
    if (weapon.attribute.type === "Reload Speed") {
      reloadSpeed += weapon.attribute.value;
    }

    const effectiveReloadTime = weapon.reloadTime * (1 - reloadSpeed / 100);
    const timePerMag = (magSize / rpm) * 60 + effectiveReloadTime;
    const effectiveRPM = (magSize / timePerMag) * 60;

    const bodyDamage = calculateBulletDamage("body");
    const bodyCritDamage = calculateBulletDamage("bodyCrit");
    const headshotDamage = calculateBulletDamage("headshot");
    const headshotCritDamage = calculateBulletDamage("headshotCrit");

    const avgDamage =
      bodyDamage * (1 - chc / 100) + bodyCritDamage * (chc / 100);
    const dps = (avgDamage * effectiveRPM) / 60;

    return {
      dps: Math.round(dps),
      bodyDamage,
      bodyCritDamage,
      headshotDamage,
      headshotCritDamage,
      avgDamage: Math.round(avgDamage),
      effectiveRPM: Math.round(effectiveRPM),
      effectiveMagSize: magSize,
      effectiveReloadTime: effectiveReloadTime.toFixed(2),
      critChance: chc.toFixed(1),
    };
  };

  const stats = calculateDPS();
  const coreAttr2 = CORE_ATTRIBUTE_2_BY_CATEGORY[weapon.category];

  const availableAttributes = AVAILABLE_ATTRIBUTES.filter(
    (attr) => attr.type !== coreAttr2.type
  );

  // Get unique weapon names sorted alphabetically
  const weaponNames = useMemo(() => {
    return [...new Set(weaponsData.data.map((w) => w.Name))].sort();
  }, []);

  const renderModBonus = (mod) => {
    if (!mod) return null;

    const bonuses = [];

    if (mod.pos && mod.valPos) {
      bonuses.push(
        <Chip
          key="pos"
          label={`+${mod.valPos}% ${mod.pos}`}
          color="success"
          size="small"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      );
    }

    if (mod.neg && mod.valNeg) {
      bonuses.push(
        <Chip
          key="neg"
          label={`${mod.valNeg}% ${mod.neg}`}
          color="error"
          size="small"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      );
    }

    return bonuses.length > 0 ? <Box sx={{ mt: 1 }}>{bonuses}</Box> : null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        DPS Calculator
      </Typography>

      <Grid container spacing={3}>
        {/* Weapon Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Select Weapon
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              select
              label="Weapon"
              value={selectedWeaponName}
              onChange={(e) => handleWeaponSelect(e.target.value)}
              fullWidth
            >
              <MenuItem value="">
                <em>Select a weapon...</em>
              </MenuItem>
              {weaponNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Paper>
        </Grid>

        {/* Weapon Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Weapon Stats
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                select
                label="Weapon Category"
                value={weapon.category}
                onChange={(e) => handleWeaponChange("category", e.target.value)}
                fullWidth
              >
                {WEAPON_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Base Damage"
                type="number"
                value={weapon.baseDamage}
                onChange={(e) =>
                  handleWeaponChange("baseDamage", e.target.value)
                }
                fullWidth
              />

              <TextField
                label="RPM"
                type="number"
                value={weapon.rpm}
                onChange={(e) => handleWeaponChange("rpm", e.target.value)}
                fullWidth
              />
              {/* MagSize */}
              <SliderInput
                label="Magazine Size"
                value={weapon.magSize}
                onChange={(val) => handleWeaponChange("magSize", val)}
                min={0}
                max={1000}
                step={1}
              />
              {/* Reload Time */}
              <SliderInput
                label="Reload Time"
                value={weapon.reloadTime}
                onChange={(val) => handleWeaponChange("reloadTime", val)}
                min={0}
                max={10}
                step={0.01}
                valueFormatter={(val) => `${val.toFixed(2)}s`}
              />
              {/* Base HSD */}
              <SliderInput
                label="Base HSD"
                value={weapon.baseHSD}
                onChange={(val) => handleWeaponChange("baseHSD", val)}
                min={0}
                max={150}
                step={1}
                valueFormatter={(val) => `${val}%`}
              />
              {/* Expertise */}
              <SliderInput
                label="Expertise"
                value={weapon.expertise}
                onChange={(val) => handleWeaponChange("expertise", val)}
                min={0}
                max={30}
                step={1}
                valueFormatter={(val) => `${val.toFixed(1)}%`}
              />
              {/* Core Attribute 1 */}
              <SliderInput
                label="Core Attribute 1"
                value={weapon.coreAttribute1}
                onChange={(val) => handleWeaponChange("coreAttribute1", val)}
                min={0}
                max={15}
                step={1}
                valueFormatter={(val) => `${val.toFixed(1)}%`}
              />
              {/* Core Attribute 2 */}
              {weapon.category !== "Pistol" && (
                <SliderInput
                  label={`Core Attribute 2 (${coreAttr2.type})`}
                  value={weapon.coreAttribute2}
                  onChange={(val) => handleWeaponChange("coreAttribute2", val)}
                  min={0}
                  max={coreAttr2.max}
                  step={0.1}
                  valueFormatter={(val) => `${val.toFixed(1)}%`}
                />
              )}
              {/* Attribute */}
              <TextField
                select
                label="Weapon Attribute Type"
                value={weapon.attribute.type}
                onChange={(e) =>
                  handleWeaponChange("attributeType", e.target.value)
                }
                fullWidth
              >
                {availableAttributes.map((attr) => (
                  <MenuItem key={attr.type} value={attr.type}>
                    {attr.type} (max: {attr.max}%)
                  </MenuItem>
                ))}
              </TextField>
              <SliderInput
                label={`Attribute Value (${weapon.attribute.type})`}
                value={weapon.attribute.value}
                onChange={(val) => handleWeaponChange("attributeValue", val)}
                min={0}
                max={
                  availableAttributes.find(
                    (a) => a.type === weapon.attribute.type
                  )?.max || 0
                }
                step={0.1}
                valueFormatter={(val) => `${val.toFixed(1)}%`}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Weapon Mods & Combat Scenario & Results */}
        <Grid item xs={12} md={6}>
          {/* Weapon Mods */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Weapon Mods
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!selectedWeaponName ? (
              <Alert severity="info">
                Please select a weapon first to see available mods
              </Alert>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Magazine */}
                <Box>
                  <TextField
                    select
                    label={`Magazine (${availableMods.magazine.length} available)`}
                    value={
                      weaponMods.magazine
                        ? availableMods.magazine.indexOf(weaponMods.magazine)
                        : ""
                    }
                    onChange={(e) =>
                      handleModChange("magazine", e.target.value)
                    }
                    fullWidth
                    disabled={availableMods.magazine.length === 0}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableMods.magazine.map((mod, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {mod.Name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderModBonus(weaponMods.magazine)}
                </Box>

                {/* Muzzle */}
                <Box>
                  <TextField
                    select
                    label={`Muzzle (${availableMods.muzzle.length} available)`}
                    value={
                      weaponMods.muzzle
                        ? availableMods.muzzle.indexOf(weaponMods.muzzle)
                        : ""
                    }
                    onChange={(e) => handleModChange("muzzle", e.target.value)}
                    fullWidth
                    disabled={availableMods.muzzle.length === 0}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableMods.muzzle.map((mod, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {mod.Name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderModBonus(weaponMods.muzzle)}
                </Box>
                {/* Optic */}
                <Box>
                  <TextField
                    select
                    label={`Optic (${availableMods.optic.length} available)`}
                    value={
                      weaponMods.optic
                        ? availableMods.optic.indexOf(weaponMods.optic)
                        : ""
                    }
                    onChange={(e) => handleModChange("optic", e.target.value)}
                    fullWidth
                    disabled={availableMods.optic.length === 0}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableMods.optic.map((mod, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {mod.Name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderModBonus(weaponMods.optic)}
                </Box>

                {/* Under Barrel */}
                <Box>
                  <TextField
                    select
                    label={`Under Barrel (${availableMods.underBarrel.length} available)`}
                    value={
                      weaponMods.underBarrel
                        ? availableMods.underBarrel.indexOf(
                            weaponMods.underBarrel
                          )
                        : ""
                    }
                    onChange={(e) =>
                      handleModChange("underBarrel", e.target.value)
                    }
                    fullWidth
                    disabled={availableMods.underBarrel.length === 0}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {availableMods.underBarrel.map((mod, idx) => (
                      <MenuItem key={idx} value={idx}>
                        {mod.Name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderModBonus(weaponMods.underBarrel)}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Combat Scenario */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Combat Scenario
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                select
                label="Target Type"
                value={combatScenario.targetType}
                onChange={(e) =>
                  setCombatScenario((prev) => ({
                    ...prev,
                    targetType: e.target.value,
                  }))
                }
                fullWidth
              >
                <MenuItem value="armor">Armor</MenuItem>
                <MenuItem value="health">Health</MenuItem>
              </TextField>

              <TextField
                select
                label="Target in Cover"
                value={combatScenario.targetInCover.toString()}
                onChange={(e) =>
                  setCombatScenario((prev) => ({
                    ...prev,
                    targetInCover: e.target.value === "true",
                  }))
                }
                fullWidth
              >
                <MenuItem value="false">No (Out of Cover)</MenuItem>
                <MenuItem value="true">Yes (In Cover)</MenuItem>
              </TextField>
            </Box>
          </Paper>

          {/* DPS Results */}
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                DPS: {stats.dps.toLocaleString()}
              </Typography>
              <Divider sx={{ my: 2, bgcolor: "white" }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Body Shot
                  </Typography>
                  <Typography variant="h6">
                    {stats.bodyDamage.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Body Shot (Crit)
                  </Typography>
                  <Typography variant="h6">
                    {stats.bodyCritDamage.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Headshot
                  </Typography>
                  <Typography variant="h6">
                    {stats.headshotDamage.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Headshot (Crit)
                  </Typography>
                  <Typography variant="h6">
                    {stats.headshotCritDamage.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.3)" }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Average Damage:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.avgDamage.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Effective RPM:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.effectiveRPM}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Effective Mag Size:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.effectiveMagSize}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Reload Time:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.effectiveReloadTime}s
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Crit Chance:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.critChance}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Note:</strong> DPS calculation uses average damage based on
            crit chance (capped at 60%). Weapon mods bonuses are applied to
            final stats.
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
}
export default App;
