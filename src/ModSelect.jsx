import {
  Box,
  TextField,
  MenuItem,
} from "@mui/material";

export function ModSelect({ label, slot, availableMods, selectedMod, onChange, renderModBonus }) {
  const modList = availableMods[slot];
  const selectedIndex = selectedMod ? modList.indexOf(selectedMod) : "";

  return (
    <Box>
      <TextField
        select
        label={`${label} (${modList.length} available)`}
        value={selectedIndex}
        onChange={(e) => onChange(slot, e.target.value)}
        fullWidth
        disabled={modList.length === 0}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {modList.map((mod, idx) => (
          <MenuItem key={idx} value={idx}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <span>{mod.Name}</span>
              {renderModBonus(mod)}
            </Box>
          </MenuItem>
        ))}
      </TextField>
      {/* {renderModBonus(selectedMod)} */}
    </Box>
  );
}