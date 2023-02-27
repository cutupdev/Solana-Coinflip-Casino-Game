import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Stack,
  Typography,
  Button,
  TextField,
  Container,
  Fab
} from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import AutoModeIcon from '@mui/icons-material/AutoMode';
import PaidIcon from '@mui/icons-material/Paid';
import { styled } from '@mui/system';
import WinLoseModal from './WinLoseModal'
import Spinner from './Spinner';
import { useWallet } from "@solana/wallet-adapter-react";

import {
  initCoinFlipProgram,
  createTreasury,
  getUserTreasuryAccount,
  processGame,
  claimUserReward,
  claimPlatformReward,
  LAMPORTS_PER_SOL,
  depositToVault,
  isSuperOwner,
  getValutAmount
} from "../utils/integration"



export const Dashboard = ({ updateBalance, balance }) => {
  const wallet = useWallet();


  //State variables
  const [selected, setSelected] = useState('HEADS')
  const [betType, setBetType] = useState('HEADS')
  const [betAmount, setBetAmount] = useState(0.05)
  const [isWin, setIsWin] = useState(0)
  const [open, setOpen] = React.useState(false)
  const [spinCount, setSpinCount] = useState(0);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [isClaimable, setIsClaimable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaming, setIsClaming] = useState(false)
  const [depositWSolUIAmount, setDepositWSolUIAmount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [displayVaultBalance, setDisplayVaultBalance] = useState(0);

  useEffect(() => {
    const init = async () => {
      updateBalance();
      initCoinFlipProgram(wallet);

      const vaultBalance = await getValutAmount();
      setDisplayVaultBalance(vaultBalance.amount / (10 ** vaultBalance.decimals))

      const userTreasuryAccount = await getUserTreasuryAccount();
      if (!userTreasuryAccount) {
        setSpinCount(0);
        setClaimableAmount(0);
      }
      else {
        setSpinCount(userTreasuryAccount.spinWinCnt.toNumber() + userTreasuryAccount.spinLoseCnt.toNumber());
        setClaimableAmount(userTreasuryAccount.balance.toNumber());
      }
      const isOwnerVrf = await isSuperOwner();
      setIsOwner(isOwnerVrf);
    }
    init()
  })

  const startBet = () => {
    if (betAmount < 0.05) {
      alert('Bet amount should be at least 0.05 SOL!')
    }
    const isHead = selected === "HEADS" ? true : false;
    processGameUI(betAmount * 1000000000, isHead, false)
  }
  const freeSpin = () => {
    const isHead = selected === "HEADS" ? true : false;
    processGameUI(0, isHead, true)
  }

  const processGameUI = async (amount, isHead, isSpin) => {
    const oldUserTreasuryAccount = await getUserTreasuryAccount();

    console.log(oldUserTreasuryAccount)

    const res = await processGame(amount, isHead, isSpin);
    if (!res.success) {
      console.log(res.msg);
      return;
    }

    updateBalance();

    let newUserTreasuryAccount
    let isWin = 0;

    setIsLoading(true)
    while (1) {
      try {
        newUserTreasuryAccount = await getUserTreasuryAccount();
        setClaimableAmount(newUserTreasuryAccount.balance.toNumber());

        if (oldUserTreasuryAccount) {
          if (isSpin) {
            const oldWins = oldUserTreasuryAccount.spinWinCnt.toNumber();
            const oldLoses = oldUserTreasuryAccount.spinLoseCnt.toNumber();

            const newWins = newUserTreasuryAccount.spinWinCnt.toNumber();
            const newLoses = newUserTreasuryAccount.spinLoseCnt.toNumber();

            setSpinCount(newUserTreasuryAccount.spinWinCnt.toNumber() + newUserTreasuryAccount.spinLoseCnt.toNumber());

            if (oldWins === newWins && oldLoses < newLoses) {
              console.log('User Spin Lose');
              if (selected === "HEADS")
                setBetType("TAILS")
              else
                setBetType("HEADS")

              isWin = 0;

              break;
            } else if (oldWins < newWins && oldLoses === newLoses) {
              console.log('User Spin Win');
              if (selected === "HEADS")
                setBetType("HEADS")
              else
                setBetType("TAILS")

              isWin = 1;

              break;
            }
          } else {
            const oldWins = oldUserTreasuryAccount.generalWinCnt.toNumber();
            const oldLoses = oldUserTreasuryAccount.generalLoseCnt.toNumber();

            const newWins = newUserTreasuryAccount.generalWinCnt.toNumber();
            const newLoses = newUserTreasuryAccount.generalLoseCnt.toNumber();

            if (oldWins === newWins && oldLoses < newLoses) {
              console.log('User Coin Flip Lose');
              if (selected === "HEADS")
                setBetType("TAILS")
              else
                setBetType("HEADS")

              isWin = 0;

              break;
            } else if (oldWins < newWins && oldLoses === newLoses) {
              console.log('User Coin Flip Win');
              if (selected === "HEADS")
                setBetType("HEADS")
              else
                setBetType("TAILS")

              isWin = 1;
              break;
            }
          }
        } else {
          if (newUserTreasuryAccount) {
            const newWins = isSpin ? newUserTreasuryAccount.spinWinCnt.toNumber() : newUserTreasuryAccount.generalWinCnt.toNumber();

            if (newWins === 1) {
              console.log('User Wins');
              if (selected === "HEADS")
                setBetType("HEADS")
              else
                setBetType("TAILS")

              isWin = 1;
            }
            else {
              console.log('User lose');
              if (selected === "HEADS")
                setBetType("TAILS")
              else
                setBetType("HEADS")

              isWin = 0;
            }

            break;
          }
        }


      } catch (e) {
        console.log(e.message);
      }
    }
    setIsLoading(false)

    setIsWin(isWin);
    if (isWin)
      setIsClaimable(true)
    else
      setIsClaimable(false)

    handleClickOpen()
  }

  const claimReward = async () => {
    setIsClaming(true)

    const res = await claimUserReward();
    if (res.success == true) {
      setClaimableAmount(0);
    } else {
      console.log(res.msg);
    }
    setIsClaming(false)

    updateBalance();
  }

  const createTreasurySubmit = async () => {
    const res = await createTreasury();
    console.log(res.msg);
  }

  const withdraw = async () => {
    const res = await claimPlatformReward();
    updateBalance();
  }

  const deposit = async () => {
    if (depositWSolUIAmount < 0.1) {
      alert("You need to deposit more than 0.1 SOL");
      return;
    }
    const res = await depositToVault(depositWSolUIAmount * LAMPORTS_PER_SOL);
    console.log(res.message);
  }

  // ~~~~~~~~~~~~~~~~ Game Logic ~~~~~~~~~~~~~~
  // Set Heads or Tails
  const headsSelected = () => {
    setSelected('HEADS')
  }
  const tailsSelected = () => {
    setSelected('TAILS')
  }
  // Set Bet Amount
  const handleChange = (event) => {
    setBetAmount(event.target.value)
  }
  // Set Bet Min Value
  const setMinValue = () => {
    setBetAmount(0.05)
  }
  // Set Bet Max Value
  const setMaxValue = () => {
    setBetAmount(balance)
  }
  const MinButton = () => (
    <Button
      variant='contained'
      onClick={setMinValue}
      sx={{
        ml: 3,
      }}
    >
      Min
    </Button>
  )
  const MaxButton = () => (
    <Button
      variant='contained'
      disabled={(spinCount < 6 && spinCount >= 10) ?? true}
      onClick={setMaxValue}
      sx={{
        ml: 3,
      }}
    >
      Max
    </Button>
  )
  // Open and Close Win/Lose Modal
  const handleClickOpen = () => {
    setTimeout(() => setOpen(true), 1500)
  }
  // Custom color For Heads and Tails
  const HeadColor = styled(Typography)(({ theme }) => ({
    fontSize: '20px !important',
    textAlign: 'center',
    background:
      '-webkit-linear-gradient( #a44e01 15%, #e2a139 60%, #ffda6f 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }));
  const TailColor = styled(Typography)(({ theme }) => ({
    fontSize: '20px !important',
    textAlign: 'center',
    background:
      '-webkit-linear-gradient( #e2a139 15%, #a44e01 60%, #ffda6f 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }));
  const CustomTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ffda6f',
    },
    '& .MuiOutlinedInput-input': {
      color: '#e2a139',
    },
    width: '400px',
  }));

  return (

    <section className="landing">
      <div className="dark-overlay">
        <div className="container">
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              height: 'auto',
              width: '100%',
              p: 3,
            }}
          >
            {/* Game Logic */}
            <Container maxWidth="lg">
              {/* Set Coin Head or Tail */}
              <Container maxWidth="sm">
                <Stack
                  direction="row"
                  mt={5}
                  justifyContent={'space-between'}
                  flexWrap="wrap"
                  sx={{ width: '100%' }}
                >
                  {/* Select Heads Button */}
                  <Stack>
                    <Button
                      onClick={headsSelected}
                      sx={{
                        borderRadius: '12px',
                        background:
                          selected === 'HEADS'
                            ? 'linear-gradient(rgb(255, 230, 105) 15%, rgb(255, 140, 100) 46%, rgb(255, 100, 100) 67%)'
                            : '',
                      }}
                    >
                      <Stack
                        sx={{
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '20px 25px',
                        }}
                      >
                        <img
                          src="/assets/coin_head_new.png"
                          alt=".."
                          style={{ height: '65px' }}
                        />
                        <HeadColor> HEADs </HeadColor>
                        <HeadColor> 1.8x </HeadColor>
                      </Stack>
                    </Button>
                  </Stack>

                  {/* Displaying Coin */}
                  <Stack sx={{ height: '190px' }}>
                    {
                      isLoading ?
                        <Spinner /> :
                        <div id="coin" className={betType}>
                          <div className="side-a">
                            <img
                              src="/assets/coin_tails_new.png"
                              alt=".."
                              style={{ height: '190px' }}
                            />
                          </div>
                          <div className="side-b">
                            <img
                              src="/assets/coin_head_new.png"
                              alt=".."
                              style={{ height: '190px' }}
                            />
                          </div>
                        </div>
                    }

                    <WinLoseModal
                      open={open}
                      onClose={() => setOpen(false)}
                      isWin={isWin}
                    />
                  </Stack>

                  {/* Select Tails Button */}
                  <Stack>
                    <Button
                      onClick={tailsSelected}
                      sx={{
                        borderRadius: '12px',
                        background:
                          selected === 'TAILS'
                            ? 'linear-gradient(rgb(21, 241, 178) 15%, rgb(32, 226, 184) 46%, rgb(62, 186, 199) 60%, rgb(110, 123, 223) 100%, rgb(149, 71, 243) 100%)'
                            : '',
                      }}
                    >
                      <Stack
                        sx={{
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '20px 25px',
                        }}
                      >
                        <img
                          src="/assets/coin_tails_new.png"
                          alt=".."
                          style={{ height: '65px' }}
                        />
                        <TailColor> TAILS </TailColor>
                        <TailColor> 1.8x </TailColor>
                      </Stack>
                    </Button>
                  </Stack>
                </Stack>
              </Container>

              {/* Set Bet Amount */}
              <Grid
                item
                container
                xs={12}
                md={12}
                justifyContent="center"
                mt={3}
              >
                <Grid
                  item
                  container
                  xs={12}
                  md={12}
                  justifyContent="center"
                  mt={3}
                >
                  <HeadColor>Bet Amount</HeadColor>
                </Grid>
                <Grid
                  item
                  container
                  xs={12}
                  md={12}
                  justifyContent="center"
                  mt={3}
                >
                  <CustomTextField
                    id="bet-amount"
                    type="number"
                    value={betAmount}
                    // className={classes.root}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: <>
                        <MinButton />
                        <MaxButton />
                      </>
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              {/* Connect Wallet and Start Betting */}
              <Stack justifyContent={'center'} alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center" justifyContent={'center'} mt={3} mb={5}>
                  <Button
                    onClick={startBet}
                    variant="contained"
                    size="large"
                    startIcon={<CasinoIcon />}
                    sx={{
                      width: '250px',
                      height: 54,
                      borderRadius: '10px',
                      fontWight: 'bold',
                      background:
                        'linear-gradient(120deg , #dc2424 15%, #4a569d 80%)',
                      '&:hover': {
                        background:
                          'linear-gradient(120deg , #4a569d 15%, #dc2424 80%)'
                      }
                    }}
                  >
                    {' '}
                    Bet {selected}{' '}
                  </Button>

                  <Button
                    onClick={freeSpin}
                    variant="contained"
                    size="large"
                    startIcon={<AutoModeIcon />}
                    disabled={spinCount === 10 ?? true}
                    sx={{
                      width: '250px',
                      height: 54,
                      borderRadius: '10px',
                      fontWight: 'bold',
                      background:
                        'linear-gradient(120deg, #4a569d 15%, #dc2424 80%)',
                      '&:hover': {
                        background:
                          'linear-gradient(120deg , #dc2424 15%, #4a569d 80%)'
                      }
                    }}
                  >

                    {`Free Spin (${spinCount} / 10)`}
                  </Button>
                </Stack>
                {
                  claimableAmount > 0 && isClaimable ?
                    <Button
                      variant="contained"
                      onClick={claimReward}
                      startIcon={<PaidIcon />}
                      disabled={isClaming ?? true}
                      sx={{ width: '300px'}}
                    >
                      {
                        isClaming ?
                          "Claiming..." :
                          `Claim Reward (${(claimableAmount / 1000000000).toFixed(2)} Sol)`
                      }
                    </Button> : <></>
                }
              </Stack>
            </Container>
          </Box>
        </div>
      </div>

      <div>
        {
          isOwner ?
            <div>
              <button style={{ width: "200px", margin: '20px', borderRadius: '10px' }} onClick={createTreasurySubmit}>Create treasury</button>
              <input style={{ borderRadius: '10px' }} placeholder='Sol Amount' onChange={(e) => {setDepositWSolUIAmount(parseFloat(e.target.value))}}/>
              <button style={{ width: "200px", margin: '20px', borderRadius: '10px' }} onClick={deposit}>{`Deposit (Valance: ${displayVaultBalance})`}</button>
            </div> :
            <></>
        }
      </div>
    </section>
  );
}
