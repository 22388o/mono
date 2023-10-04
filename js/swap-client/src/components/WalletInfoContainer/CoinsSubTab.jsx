import { Divider, Stack, Typography } from "@mui/material"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from "../../styles/WalletInfoContainer.module.css";


export const CoinsSubTab = () => {
  return (
    <Stack>
      <Stack direction='row' className={styles['wallet-coin-item']}>
        <Stack direction='row' gap={1} sx={{alignItems:'flex-start', marginTop: '2px'}}>
          <img width={32} src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true" />
          <Typography className={styles['wallet-item-title']}>Bitcoin</Typography>
        </Stack>
        <Stack direction='row' gap={1} sx={{alignItems:'center'}}>
          <Stack>
            <Stack direction='row' sx={{alignItems:'flex-end'}} gap={0.5}>
              <Typography sx={{fontFamily:'NotoBold', color:'white', fontSize:'20px'}}>0.01</Typography>
              <Typography sx={{color:'#AAAAAA', marginBottom: '1px'}}>BTC</Typography>
            </Stack>
            <Stack direction='row' sx={{alignItems:'flex-end'}} gap={0.5}>
              <Typography sx={{color:'#6A6A6A', fontSize: '16px'}}>172.99</Typography>
              <Typography sx={{color:'#6A6A6A', fontSize: '12px', marginBottom: '1px'}}>USD</Typography>
            </Stack>
          </Stack>
          <KeyboardArrowRightIcon />
        </Stack>
      </Stack>
      <Divider />
      <Stack direction='row' className={styles['wallet-coin-item']}>
        <Stack direction='row' gap={1} sx={{alignItems:'flex-start', marginTop: '2px'}}>
          <img width={32} src="https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true" />
          <Typography className={styles['wallet-item-title']}>Ethereum</Typography>
        </Stack>
        <Stack direction='row' gap={1} sx={{alignItems:'center'}}>
          <Stack>
            <Stack direction='row' sx={{alignItems:'flex-end'}} gap={0.5}>
              <Typography sx={{fontFamily:'NotoBold', color:'white', fontSize:'20px'}}>0.01</Typography>
              <Typography sx={{color:'#AAAAAA', marginBottom: '1px'}}>BTC</Typography>
            </Stack>
            <Stack direction='row' sx={{alignItems:'flex-end'}} gap={0.5}>
              <Typography sx={{color:'#6A6A6A', fontSize: '16px'}}>172.99</Typography>
              <Typography sx={{color:'#6A6A6A', fontSize: '12px', marginBottom: '1px'}}>USD</Typography>
            </Stack>
          </Stack>
          <KeyboardArrowRightIcon />
        </Stack>
      </Stack>
      <Divider />
    </Stack>
  )
}