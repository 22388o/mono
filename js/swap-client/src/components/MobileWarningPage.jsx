import { Container, Divider, Stack, Typography } from "@mui/material";
import PhonelinkEraseOutlinedIcon from '@mui/icons-material/PhonelinkEraseOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

export const MobileWarningPage = () => {
  return (
    <Container 
      sx={{
        backgroundColor:'#101010', 
        display: 'flex', 
        justifyContent:'center', 
        padding: 0
      }}
    >
      <Stack sx={{width:'100%', alignItems: 'center'}}>
        <Stack direction='row' sx={{alignItems:'center', padding: '10px'}}>
          <Typography sx={{fontSize: '50px'}}>P</Typography>
          <img src='circle.png' width={50} height={50} />
          <Typography sx={{fontSize: '50px'}}>RTAL</Typography>
        </Stack>
        <Divider sx={{width:'100vw', left: 0, marginBottom: '100px'}} />
        <Stack sx={{alignItems:'center', width:'400px'}}>
          <PhonelinkEraseOutlinedIcon sx={{color:'#6A6A6A', fontSize: '80px' }}/>
          <Typography sx={{fontSize: '25px', fontFamily:'NotoBold'}}>The Portal DEX is not available on mobile, yet</Typography>
          <Typography sx={{color:'#8A8A8A', fontSize: '20px', fontFamily:'NotoBold'}}>Please use a desktop web browser to access the app.</Typography>
        </Stack>
        <Stack sx={{bottom:0, position:'absolute'}}>
          <Divider sx={{width:'100vw', left: 0}} />
          <Typography sx={{
            color: '#8A8A8A', 
            fontFamily:'NotoBold', 
            marginTop:'20px', 
            marginBottom:'20px', 
            fontSize:'20px', 
            alignItems:'center', 
            display:'flex', 
            justifyContent:'center',
            textDecoration: 'underline'
          }}>
            <HelpOutlineOutlinedIcon sx={{
              color:'#8A8A8A', 
              fontSize:'30px' 
            }}/>
            Contact US
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
