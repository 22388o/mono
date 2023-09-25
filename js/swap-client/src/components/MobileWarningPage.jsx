import { Container, Typography } from "@mui/material";

export const MobileWarningPage = () => {
  return (
    <Container 
      sx={{
        backgroundColor:'#242424', 
        display: 'flex', 
        justifyContent:'center', 
        marginTop:'200px'
      }}
    >
      <Typography 
        sx={{
          fontSize:'40px', 
          maxWidth: '500px'
        }}
      >
        Apologies, mobile is currently unsupported.
        Please visit this website on a desktop.
      </Typography>
    </Container>
  );
}