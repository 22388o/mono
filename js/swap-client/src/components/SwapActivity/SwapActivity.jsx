import React, { useCallback, useSyncExternalStore } from 'react';
import { Box, Grid, Stack, Divider } from '@mui/material';
import { ActivityItem } from './ActivityItem';
import { useState } from 'react';
import styles from '../../styles/SwapActivity.module.css';
import { log } from '../../utils/helpers';
import { ActivityDetailModal } from './ActivityDetailModal';
import { IndexedDB } from '@portaldefi/sdk';

export const SwapActivity = () => {
  const [showIndex, setShowIndex] = useState(-1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const activities = useSyncExternalStore(IndexedDB.subscribe, IndexedDB.getAllActivities);

  const onShowDetails = useCallback((index) => {
    setShowIndex(index)
    setOpen(true)
    log('this is activities item : ', showIndex)
  }, [])

  const onItemClick = useCallback((index) => {
    setSelectedActivity(activities[index]);
    setDetailModalOpen(true);
  }, [activities]);

  return (
    <>
      <Box className={`${styles.activitiesContainer} activitiesContainer`}>
        <Stack spacing={2}>
          <Grid className={styles.activitiesHeader}>
            <h3>Activity</h3>
          </Grid>
          {
            [...activities].reverse().map((row, index) =>
              <div>
                {index > 0 && <Divider style={{ borderColor: 'grey', marginBottom: '1em' }} />}
                <ActivityItem activity={row} index={index} onShowDetails={onShowDetails} handleClick={() => onItemClick(index)} />
              </div>)
          }
          {
            activities.length === 0 && <div className={styles.blankMessage}>No activity yet</div>
          }
        </Stack>
        {selectedActivity && <ActivityDetailModal activity={selectedActivity} open={detailModalOpen} handleClose={() => setDetailModalOpen(false)} />}
      </Box>
    </>
  )
}
