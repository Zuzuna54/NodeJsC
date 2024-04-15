import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import './Loading.scss';

export default function Loading() {
  return (
    <Box data-testid='loading' className='loading-container'>
      <div style={{ marginBottom: '32px' }}>
        <CircularProgress />
      </div>
      <div>Loading, please wait ...</div>
    </Box>
  );
}
