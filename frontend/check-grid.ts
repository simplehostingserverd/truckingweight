import { Grid } from '@mui/material';

// Test Grid component with size prop
const TestGrid = () => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        Content
      </Grid>
    </Grid>
  );
};

export default TestGrid;
