import React from 'react'
// mui import
import { Grid, Stack, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

export const AssetItem = ({ asset, handleClick }) => {
  return (
    <Stack 
      direction='row' 
      onClick={e => handleClick(asset)} style={{ cursor: 'pointer' }}
      className='asset-item'
      sx={{ justifyContent: 'space-between' }}
    >
      <Stack direction='row' spacing={0.5} sx={{alignItems:'center'}}>
        <img width={32} height={32} src={asset.img_url} />
        <Stack>
          <Typography>{ asset.short }</Typography>
          {asset.type && <h5 style={{ fontSize: '0.8em', color: 'grey' }}>{asset.type}</h5>}
        </Stack>
      </Stack>
      <Stack direction='row' alignItems='center' gap={0.5}>
        { asset.amount }
        <span style={{ color: 'grey', fontSize: '0.7em' }}>{asset.type && asset.type.toUpperCase()}</span>
        <NavigateNextIcon />
      </Stack>
    </Stack>
  )
}
