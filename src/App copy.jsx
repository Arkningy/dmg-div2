import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Grid,
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function App() {
  // Weapon selection
  const [weaponType, setWeaponType] = useState('rifles');
  const [weaponCoreAttribute, setWeaponCoreAttribute] = useState(15);
  const [weaponExpertise, setWeaponExpertise] = useState(0);
  
  // Specialization
  const [specTier, setSpecTier] = useState(3);
  const [weaponAffectedBySpec, setWeaponAffectedBySpec] = useState(true);
  
  // Watch (AWD)
  const [watchTier, setWatchTier] = useState(50);
  
  // Seasonal bonus
  const [seasonalAWD, setSeasonalAWD] = useState(0);
  
  // Gear pieces (6 max)
  const [gear1AWD, setGear1AWD] = useState(0);
  const [gear2AWD, setGear2AWD] = useState(0);
  const [gear3AWD, setGear3AWD] = useState(0);
  const [gear4AWD, setGear4AWD] = useState(0);
  const [gear5AWD, setGear5AWD] = useState(0);
  const [gear6AWD, setGear6AWD] = useState(0);
  
  // Striker Gear Set
  const [strikerStacks, setStrikerStacks] = useState(0);
  const [hasStrikerChest, setHasStrikerChest] = useState(false);
  const [hasStrikerBackpack, setHasStrikerBackpack] = useState(false);
  
  // Other stats
  const [base, setBase] = useState(100);
  const [twd, setTwd] = useState(0);
  const [chd, setChd] = useState(0);
  const [hsd, setHsd] = useState(0);
  const [dta, setDta] = useState(0);
  const [dth, setDth] = useState(0);
  const [dttooc, setDttooc] = useState(0);
  const [other, setOther] = useState(0);
  const [damageType, setDamageType] = useState('dta');

  const weaponTypes = [
    'Rifles',
    'Assault Rifles',
    'Marksman Rifles',
    'Shotguns',
    'SMGs',
    'LMGs',
    'Pistols'
  ];

  // Calculate values
  const totalGearAWD = gear1AWD + gear2AWD + gear3AWD + gear4AWD + gear5AWD + gear6AWD;
  const awd = (watchTier * 0.2) + seasonalAWD + totalGearAWD;
  const swd = weaponCoreAttribute + weaponExpertise + (weaponAffectedBySpec ? specTier * 5 : 0);
  
  // Striker calculation
  const strikerStackValue = hasStrikerBackpack ? 0.9 : 0.65;
  const maxStrikerStacks = hasStrikerChest ? 200 : 100;
  const strikerTWD = strikerStacks * strikerStackValue;
  const totalTWD = twd + strikerTWD;

  const calculateResult = () => {
    const factor1 = 1 + (awd + swd) / 100;
    const factor2 = 1 + totalTWD / 100;
    const factor3 = 1 + (chd + hsd) / 100;
    const factor4 = 1 + (damageType === 'dta' ? dta : dth) / 100;
    const factor5 = 1 + dttooc / 100;
    const factor6 = 1 + other / 100;
    
    return base * factor1 * factor2 * factor3 * factor4 * factor5 * factor6;
  };

  const result = calculateResult();

  const gearSetters = [setGear1AWD, setGear2AWD, setGear3AWD, setGear4AWD, setGear5AWD, setGear6AWD];
  const gearValues = [gear1AWD, gear2AWD, gear3AWD, gear4AWD, gear5AWD, gear6AWD];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <CalculateIcon sx={{ fontSize: 40, color: '#e94560' }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              The Division 2 - Calculateur de Dégâts
            </Typography>
          </Box>

          {/* Weapon Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">🔫 Arme</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="BASE Damage"
                    type="number"
                    value={base}
                    onChange={(e) => setBase(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type d'arme</InputLabel>
                    <Select
                      value={weaponType}
                      label="Type d'arme"
                      onChange={(e) => setWeaponType(e.target.value)}
                    >
                      {weaponTypes.map((type) => (
                        <MenuItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>
                      Core Attribute (Weapon Damage): {weaponCoreAttribute}%
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={weaponCoreAttribute}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 1 && value <= 15) {
                          setWeaponCoreAttribute(value);
                        } else if (e.target.value === '') {
                          setWeaponCoreAttribute(1);
                        }
                      }}
                      inputProps={{ 
                        min: 1, 
                        max: 15, 
                        step: 0.1,
                        style: { width: '80px' }
                      }}
                      sx={{ width: '120px' }}
                    />
                  </Box>
                  <Slider
                    value={weaponCoreAttribute}
                    onChange={(e, value) => setWeaponCoreAttribute(value)}
                    min={1}
                    max={15}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>
                      Expertise: {weaponExpertise} (+{weaponExpertise}% SWD)
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={weaponExpertise}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 30) {
                          setWeaponExpertise(value);
                        } else if (e.target.value === '') {
                          setWeaponExpertise(0);
                        }
                      }}
                      inputProps={{ 
                        min: 0, 
                        max: 30, 
                        step: 1,
                        style: { width: '80px' }
                      }}
                      sx={{ width: '120px' }}
                    />
                  </Box>
                  <Slider
                    value={weaponExpertise}
                    onChange={(e, value) => setWeaponExpertise(value)}
                    min={0}
                    max={30}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 10, label: '10' },
                      { value: 20, label: '20' },
                      { value: 30, label: '30' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Specialization Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">⭐ Spécialisation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography>
                      Cette arme est affectée par la spécialisation ?
                    </Typography>
                    <ToggleButtonGroup
                      value={weaponAffectedBySpec}
                      exclusive
                      onChange={(e, value) => value !== null && setWeaponAffectedBySpec(value)}
                      color="primary"
                    >
                      <ToggleButton value={true}>Oui</ToggleButton>
                      <ToggleButton value={false}>Non</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Palier de spécialisation: {specTier}/3 ({specTier * 5}% bonus)
                  </Typography>
                  <Slider
                    value={specTier}
                    onChange={(e, value) => setSpecTier(value)}
                    min={0}
                    max={3}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 1, label: '1 (5%)' },
                      { value: 2, label: '2 (10%)' },
                      { value: 3, label: '3 (15%)' },
                    ]}
                    valueLabelDisplay="auto"
                    disabled={!weaponAffectedBySpec}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Watch Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">⌚ Montre (All Weapon Damage)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography gutterBottom>
                    Palier de la montre: {watchTier}/50 ({(watchTier * 0.2).toFixed(1)}% AWD)
                  </Typography>
                  <Slider
                    value={watchTier}
                    onChange={(e, value) => setWatchTier(value)}
                    min={0}
                    max={50}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 25, label: '25 (5%)' },
                      { value: 50, label: '50 (10%)' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Seasonal Bonus Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">🎯 Bonus de Saison (AWD)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="AWD Bonus de Saison (%)"
                    type="number"
                    value={seasonalAWD}
                    onChange={(e) => setSeasonalAWD(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Bonus d'All Weapon Damage de la saison en cours"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Gear Pieces Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">🎽 Équipement (Core Attributes)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Core Attribute AWD de chaque pièce d'équipement (6 max)
                  </Typography>
                </Grid>
                
                {[1, 2, 3, 4, 5, 6].map((num, index) => (
                  <Grid item xs={12} sm={6} md={4} key={num}>
                    <TextField
                      fullWidth
                      label={`Pièce ${num} - AWD (%)`}
                      type="number"
                      value={gearValues[index]}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        gearSetters[index](value);
                      }}
                      variant="outlined"
                      inputProps={{ min: 0, max: 15, step: 0.1 }}
                    />
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="body2">
                      Total AWD de l'équipement: <strong>{totalGearAWD.toFixed(1)}%</strong>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Striker Gear Set Section */}
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">💥 Striker Gear Set</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Le set Striker augmente le TWD de {strikerStackValue}% par stack
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Striker Chest équipé ?
                    </Typography>
                    <ToggleButtonGroup
                      value={hasStrikerChest}
                      exclusive
                      onChange={(e, value) => {
                        if (value !== null) {
                          setHasStrikerChest(value);
                          // Reset stacks if exceeding new max
                          if (!value && strikerStacks > 100) {
                            setStrikerStacks(100);
                          }
                        }
                      }}
                      fullWidth
                      color="primary"
                    >
                      <ToggleButton value={true}>Oui (Max 200)</ToggleButton>
                      <ToggleButton value={false}>Non (Max 100)</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Striker Backpack équipé ?
                    </Typography>
                    <ToggleButtonGroup
                      value={hasStrikerBackpack}
                      exclusive
                      onChange={(e, value) => value !== null && setHasStrikerBackpack(value)}
                      fullWidth
                      color="primary"
                    >
                      <ToggleButton value={true}>Oui (0.9%)</ToggleButton>
                      <ToggleButton value={false}>Non (0.65%)</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>
                      Stacks Striker: {strikerStacks}/{maxStrikerStacks} ({strikerTWD.toFixed(1)}% TWD)
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={strikerStacks}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= maxStrikerStacks) {
                          setStrikerStacks(value);
                        }
                      }}
                      inputProps={{ 
                        min: 0, 
                        max: maxStrikerStacks, 
                        step: 1,
                        style: { width: '80px' }
                      }}
                      sx={{ width: '120px' }}
                    />
                  </Box>
                  <Slider
                    value={strikerStacks}
                    onChange={(e, value) => setStrikerStacks(value)}
                    min={0}
                    max={maxStrikerStacks}
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                      ...(hasStrikerChest ? [
                        { value: 150, label: '150' },
                        { value: 200, label: '200' }
                      ] : [])
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      📉 Perte de stacks par seconde :
                    </Typography>
                    <Typography variant="body2">
                      • 0-50 stacks: -1 stack/s
                    </Typography>
                    <Typography variant="body2">
                      • 50-100 stacks: -2 stacks/s
                    </Typography>
                    {hasStrikerChest && (
                      <Typography variant="body2">
                        • 100-200 stacks: -3 stacks/s
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                    <Typography variant="body2">
                      <strong>TWD Striker: {strikerTWD.toFixed(1)}%</strong> ({strikerStacks} stacks × {strikerStackValue}%)
                    </Typography>
                    <Typography variant="body2">
                      <strong>TWD Total: {totalTWD.toFixed(1)}%</strong> (Base: {twd}% + Striker: {strikerTWD.toFixed(1)}%)
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Other Stats Section */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">📊 Autres Stats</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="TWD Base (%)"
                    type="number"
                    value={twd}
                    onChange={(e) => setTwd(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Total Weapon Damage (hors Striker)"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="CHD (%)"
                    type="number"
                    value={chd}
                    onChange={(e) => setChd(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Critical Hit Damage"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="HSD (%)"
                    type="number"
                    value={hsd}
                    onChange={(e) => setHsd(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Headshot Damage"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Type de dégâts
                    </Typography>
                    <ToggleButtonGroup
                      value={damageType}
                      exclusive
                      onChange={(e, newValue) => newValue && setDamageType(newValue)}
                      fullWidth
                      color="primary"
                    >
                      <ToggleButton value="dta">DTA</ToggleButton>
                      <ToggleButton value="dth">DTH</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label={damageType === 'dta' ? "DTA (%)" : "DTH (%)"}
                    type="number"
                    value={damageType === 'dta' ? dta : dth}
                    onChange={(e) => damageType === 'dta' ? setDta(parseFloat(e.target.value) || 0) : setDth(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText={damageType === 'dta' ? "Damage to Armor" : "Damage to Health"}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="DTTOOC (%)"
                    type="number"
                    value={dttooc}
                    onChange={(e) => setDttooc(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Damage to Target Out of Cover"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Autres Multiplicateurs (%)"
                    type="number"
                    value={other}
                    onChange={(e) => setOther(parseFloat(e.target.value) || 0)}
                    variant="outlined"
                    helperText="Autres modificateurs"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Summary Card */}
          <Card sx={{ 
            background: 'linear-gradient(135deg, #e94560 0%, #c72c48 100%)',
            color: 'white',
            mb: 3
          }}>
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                Dégâts Totaux
              </Typography>
              <Typography variant="h2" component="div" fontWeight="bold">
                {result.toFixed(2)}
              </Typography>
              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" display="block">AWD Total</Typography>
                  <Typography variant="h6">{awd.toFixed(1)}%</Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Montre: {(watchTier * 0.2).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Saison: {seasonalAWD.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Équipement: {totalGearAWD.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">SWD Total</Typography>
                  <Typography variant="h6">{swd.toFixed(1)}%</Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Core: {weaponCoreAttribute}%
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Expertise: {weaponExpertise}%
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Spec: {weaponAffectedBySpec ? specTier * 5 : 0}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">TWD Total</Typography>
                  <Typography variant="h6">{totalTWD.toFixed(1)}%</Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Base: {twd}%
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                    Striker: {strikerTWD.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" display="block">Multiplicateur Global</Typography>
                  <Typography variant="h6">×{((1 + (awd + swd) / 100) * (1 + totalTWD / 100)).toFixed(3)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              <strong>Formule :</strong> BASE × (1 + (AWD+SWD)/100) × (1 + TWD/100) × (1 + (CHD+HSD)/100) × (1 + {damageType === 'dta' ? 'DTA' : 'DTH'}/100) × (1 + DTTOOC/100) × (1 + Autres/100)
            </Typography>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
}