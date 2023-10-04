import { useState } from "react";
import { Divider, Stack, Typography } from "@mui/material"
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

import styles from "../../styles/WalletInfoContainer.module.css";

export const ActivityTab = () => {
  const [activeTab, setActiveTab] = useState('coins');

  const renderActivity = () => {
    return (
      <Stack className={styles['activity-item']} direction='row'>
        <Stack direction='row' gap={2}>
          <ArrowOutwardIcon sx={{color:'#6A6A6A', borderRadius: '50%', backgroundColor:'#101010', fontSize: '15px', padding: '5px' }} />
          <Stack sx={{alignItems:'flex-start'}}>
            <Typography>Sent BTC</Typography>
            <Typography sx={{fontSize: '14px', color: '#6A6A6A'}}>Oct 19, 22</Typography>
          </Stack>
        </Stack>
        <Stack>
          <Stack direction='row' gap={1}>
            <Typography>-0.002</Typography>
            <Typography sx={{color: '#6A6A6A'}}>BTC</Typography>
          </Stack>
          <Stack direction='row' gap={1}>
            <Typography sx={{color: '#6A6A6A'}}>+38.57</Typography>
            <Typography sx={{color: '#6A6A6A'}}>BTC</Typography>
          </Stack>
        </Stack>
      </Stack>
    )
  }

  const renderDivider = () => <Divider sx={{borderColor: '#2A2A2A!important', margin: '15px 0px'}} />

  return (
    <Stack className={styles['activities-container']}>
      { renderActivity() }
      { renderDivider() }
      { renderActivity() }
      { renderDivider() }
      { renderActivity() }
      { renderDivider() }
      { renderActivity() }
      { renderDivider() }
      { renderActivity() }
    </Stack>
  )
}