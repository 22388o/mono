import React, { useSyncExternalStore } from 'react';
import { Box, Grid, Stack, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ActivityItem } from './ActivityItem';
import { useState } from 'react';
import styles from '../../styles/SwapActivity.module.css';
import { SWAP_STATUS } from '../../utils/helpers';
import { ActivityDetailModal } from './ActivityDetailModal';
import { activitiesStore } from '../../syncstore/activitiesstore';

export const SwapActivity = () => {
  const activities = useSyncExternalStore(activitiesStore.subscribe, () => activitiesStore.currentState);
  const [showIndex, setShowIndex] = useState(-1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const onShowDetails = (index) => {
    setShowIndex(index);
    setOpen(true);
    console.log("this is activities item : " + showIndex);
  };
  
  const onItemClick = (index) => {
    setSelectedActivity(activities[index]);
    setDetailModalOpen(true);
  }
  
  return (
    <>
      <Box className={styles.activitiesContainer}>
        <Stack spacing={3}>
          <Grid className={styles.activitiesHeader}>
            <h3>Activity</h3>
          </Grid>
          { 
            [...activities].reverse().map((row, index) => 
              <>
                { index > 0 && <Divider style={{borderColor:'grey',margin:'1em'}}/> }
                <ActivityItem activity={row} index={index} onShowDetails={onShowDetails} handleClick={() => onItemClick(index)} />
              </>)
          }
          {
            activities.length === 0 && <div className={styles.blankMessage}>No activity yet</div>
          }
        </Stack>
        { selectedActivity && <ActivityDetailModal activity={selectedActivity} open={detailModalOpen} handleClose={() => setDetailModalOpen(false)} /> } 
      </Box>
    </>
  );
}
