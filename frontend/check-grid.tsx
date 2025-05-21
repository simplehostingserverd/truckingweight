import { Grid } from '@mui/material';
import React from 'react';

export const CheckGrid: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        {/* Content goes here */}
      </Grid>
    </Grid>
  );
};
