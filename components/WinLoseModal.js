import * as React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/system';



function WinLoseModal(props) {
  const { onClose, isWin, open } = props;

  const handleClose = () => {
    onClose();
  };

  const CustomDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialog-paperScrollPaper": {
      borderRadius: '48px',
      marginTop: '110px'
    }
  }));

  return (
    <CustomDialog onClose={handleClose} open={open}>
      <DialogTitle sx={{ background: isWin ? 'rgb(45, 211, 191)' : 'rgb(243, 71, 102)', color: 'white', borderRadius: '48px', padding: '12px 29px', zIndex: '9999', textAlign: 'center', fontSize: '22px', }}> {isWin ? 'YOU WON' : 'YOU LOSE'}</DialogTitle>
    </CustomDialog>
  );
}

WinLoseModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default WinLoseModal
