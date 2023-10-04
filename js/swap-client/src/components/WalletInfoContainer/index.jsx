import { useState } from "react";
import { Container, Stack, Typography } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

import styles from "../../styles/WalletInfoContainer.module.css";
import { AssetsTab } from "./AssetsTab";

export const WalletInfoContainer = ({ show }) => {
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
          <KeyboardDoubleArrowRightIcon className={styles["tab-item"]} />
        </Stack>
        { activeTab === 'assets' && <AssetsTab /> }
      </Stack>
    </Container>
  );
};
