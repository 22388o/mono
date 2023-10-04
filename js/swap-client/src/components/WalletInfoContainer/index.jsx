import { useState } from "react";

// mui imports
import { Button, Container, IconButton, Stack, Typography } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

//proj imports
import styles from "../../styles/WalletInfoContainer.module.css";
import { AssetsTab } from "./AssetsTab";
import { ActivityTab } from "./ActivityTab";

export const WalletInfoContainer = ({ show, setIsMinimized }) => {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <Container
      className={styles.container}
      style={{ display: show ? "block" : "none" }}
    >
      <Stack sx={{height:'100%'}}>
        <Stack direction="row" className={styles.header}>
          <Stack direction='row' gap={0.5}>
            <Typography className={[styles["tab-item"], activeTab === 'assets' && styles['active-tab']]} onClick={() => setActiveTab('assets')}>
              Assets
            </Typography>
            <Typography className={[styles["tab-item"], activeTab === 'activity' && styles['active-tab']]} onClick={() => setActiveTab('activity')}>
              Activity
            </Typography>
          </Stack>
          <IconButton onClick={() => setIsMinimized(true)}>
            <KeyboardDoubleArrowRightIcon className={styles["tab-item"]} />
          </IconButton>
        </Stack>
        { activeTab === 'assets' && <AssetsTab /> }
        { activeTab !== 'assets' && <ActivityTab /> }
      </Stack>
    </Container>
  );
};
