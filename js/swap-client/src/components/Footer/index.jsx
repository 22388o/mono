// mui imports
import { Grid, Stack, Typography } from "@mui/material"
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import RectangleRoundedIcon from '@mui/icons-material/RectangleRounded';

// proj imports
import { version } from '../../../package.json';
import styles from '../../styles/Footer.module.css';

export const Footer = () => {
  return (
    <Grid container direction='row' sx={{justifyContent:'space-between'}} className={styles['footer-container']}>
      <Stack className="flex-middle" direction='row'>
        <Typography sx={{color:'#4A4A4A', marginRight: '30px'}}>v{version}</Typography>
        <Typography sx={{color:'#31DB6B', alignItems: 'center', display: 'flex'}}>
          <RectangleRoundedIcon /> All systems ok!
        </Typography>
      </Stack>
      <Stack className="flex-vh-center">
        <Typography sx={{ color: '#4A4A4A', fontFamily: 'NotoBold' }}>This is alpha software. Use it under your own risk.</Typography>
      </Stack>
      <Stack direction='row' sx={{display:'flex', justifyContent: 'flex-end'}}>
        <Typography className="flex-middle" sx={{color:'#EAEAEA', textDecoration:'underline'}}>
          <HelpOutlineOutlinedIcon sx={{
            fontSize:'30px',
          }}/>
          Help & Support
        </Typography>
      </Stack>
    </Grid>
  )
}