import { useCallback, useState, useSyncExternalStore } from "react";
import { Button, Divider, Stack, Typography } from "@mui/material"
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

import styles from "../../styles/WalletInfoContainer.module.css";
import { SWAP_STATUS, getStringFromDate } from "../../utils/helpers";
import { walletStore } from "../../syncstore/walletstore";
import { activitiesStore } from "../../syncstore/activitiesstore";

export const ActivityTab = () => {
  const activities = useSyncExternalStore(activitiesStore.subscribe, () => activitiesStore.currentState);

  /**
   * Handler to cancel swap
   */
  const onCancelSwap = useCallback((e, activity) => {
    e.stopPropagation();
    if(activity.baseAsset === 'BTC') walletStore.dispatch({ type: 'ADD_NODE_BALANCE', payload: activity.baseQuantity });
    else if(activity.baseAsset === 'ETH') walletStore.dispatch({ type: 'ADD_WALLET_BALANCE', payload: activity.baseQuantity });
    console.log(activity, activities);
    activitiesStore.dispatch({ type: 'CANCEL_SWAP', payload: { secretHash: activity.hash } });
  }, [walletStore, activities]);

  /**
   * Component Render Function
   * @param {object} activity 
   * @returns Component for activity
   */
  const renderActivity = (activity) => {
    return (
      <Stack className={`${styles['activity-item']} activity-item panelActivity`} direction='row'>
        <Stack direction='row' gap={2}>
          <ArrowOutwardIcon sx={{color:'#6A6A6A', borderRadius: '50%', backgroundColor:'#101010', fontSize: '15px', padding: '5px' }} />
          <Stack sx={{alignItems:'flex-start'}}>
            <Typography>{ SWAP_STATUS[activity.status] }</Typography>
            <Typography sx={{fontSize: '14px', color: '#6A6A6A'}}>{ getStringFromDate(activity.createdDate) }</Typography>
            {/* <Typography sx={{fontSize:'12px'}}>{ activity.status === 5 && activity.hash.slice(0, 20) + '...'  }</Typography> */}
          </Stack>
        </Stack>
        <Stack>
          <Stack direction='row' gap={1}>
            <Typography>- {activity.baseQuantity.toFixed(5).replace(/[.,]0+$/ , "")}</Typography>
            <Typography sx={{color: '#6A6A6A'}}>{activity.baseAsset}</Typography>
          </Stack>
          <Stack direction='row' gap={1}>
            <Typography sx={{color: '#6A6A6A'}}>+ {activity.quoteQuantity.toFixed(5).replace(/[.,]0+$/ , "")}</Typography>
            <Typography sx={{color: '#6A6A6A'}}>{activity.quoteAsset}</Typography>
          </Stack>
          { activity.status < 11 && <span><Button onClick={(e) => onCancelSwap(e, activity)} className={`${styles['cancel-btn']} cancel-btn`}>
            Cancel
          </Button></span> }
        </Stack>
      </Stack>
    )
  }

  /**
   * Divider Render
   */
  const renderDivider = () => <Divider sx={{borderColor: '#2A2A2A!important', margin: '15px 0px'}} />

  return (
    <Stack className={styles['activities-container']}>
      { [...activities].reverse().map((activity, index) =>
          <div key={index}>
            {index > 0 && renderDivider() }
            { renderActivity(activity) }
          </div>
        )
      }

      { activities.length === 0 && <Typography sx={{ color: '#555555', fontSize: '20px', marginTop: '100px' }}>No Activities</Typography>}
    </Stack>
  )
}
