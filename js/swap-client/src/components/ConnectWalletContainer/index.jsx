import { Container, Divider, Stack, Typography } from "@mui/material"
import styles from '../../styles/ConnectWalletContainer.module.css';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

export const ConnectWalletContainer = ({ show }) => {
  return (
    <Container className={styles.container} style={{display: show ? 'block' : 'none'}}>
      <Stack>
        <Stack direction='row' className={styles.header}>
          <Typography className={styles['header-font']}>Connect Wallet</Typography>
          <KeyboardDoubleArrowRightIcon className={styles['header-font']} />
        </Stack>
        <Stack className={styles['item-container']}>
          <Stack direction='row' className={styles['wallet-item']}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMJyiAlYerxZx6dsXo5Pzv5gLdCrHKJ-5gnEs9RTGQ70RNCHoICMQ8&usqp=CAE&s' />
            <Typography className={styles['wallet-title']}>Metamask</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Alby</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Unisat</Typography>
          </Stack>
          <Divider className={styles['divider']} />
          <Stack direction='row' className={styles['wallet-item']}>
            <img style={{ borderRadius: '5px' }} width={32} src='https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png' />
            <Typography className={styles['wallet-title']}>Xverse</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}