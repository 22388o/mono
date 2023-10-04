import React from 'react'
import { Box, Modal } from '@mui/material'

export const MyModal = ({ classme, children, open, handleClose = () => {} }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='parent-modal-title'
      aria-describedby='parent-modal-description'
      sx={{ width: 'fit-content', display: 'flex', margin: 'auto' }}
    >
      <Box className={`${classme} modal-container`}>
        {children}
      </Box>
    </Modal>
  )
}
