import React, { useState } from "react";
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
} from "@mui/material";
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
  chd: 45, // 25 base + 20 from watch
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

  const [combatScenario, setCombatScenario] = useState({
    targetType: "armor",
    targetInCover: false,
  });

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

  const calculateBulletDamage = (hitType = "body") => {
    const coreAttr2Type = CORE_ATTRIBUTE_2_BY_CATEGORY[weapon.category].type;

    let awd = BASE_STATS.awd + weapon.expertise;
    let swd = weapon.coreAttribute1;

    let chd = BASE_STATS.chd;
    if (coreAttr2Type === "CHD") chd += weapon.coreAttribute2;
    if (weapon.attribute.type === "CHD") chd += weapon.attribute.value;

    let hsd = BASE_STATS.hsd + weapon.baseHSD;
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
    let chc = BASE_STATS.chc;
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

    let magSize = weapon.magSize;
    if (weapon.attribute.type === "Mag Size") {
      magSize *= 1 + weapon.attribute.value / 100;
    }
    magSize = Math.round(magSize);

    let reloadSpeed = BASE_STATS.reloadSpeed;
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
        DPS Calculator
      </Typography>

      <Grid container spacing={3}>
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

        <Grid item xs={12} md={6}>
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
                value={combatScenario.targetInCover}
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
                {/* <MenuItem value={false}>No (Out of Cover)</MenuItem>
                <MenuItem value={true}>Yes (In Cover)</MenuItem> */}
              </TextField>
            </Box>
          </Paper>

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
            crit chance (capped at 60%).
          </Alert>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
