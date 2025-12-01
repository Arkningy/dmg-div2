import { Box, TextField, Slider } from '@mui/material';

export const SliderInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1,
  valueFormatter = (val) => val
}) => {
  return (
    <Box>
      <TextField
        label={label}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        slotProps={{
          htmlInput: { min, max, step }
        }}
      />
      <Slider
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        marks={[
          { value: min, label: valueFormatter(min) },
          { value: max, label: valueFormatter(max) },
        ]}
        valueLabelDisplay="auto"
        valueLabelFormat={valueFormatter}
      />
    </Box>
  );
};