import React, { useState, useEffect } from 'react';
import { Button, Header, Image, Grid, Menu, Modal, Form, TextArea } from 'semantic-ui-react';
import { SwapCreate } from './SwapCreate';
import { SwapActivity } from './SwapActivity/SwapActivity';
import { WalletComponent } from './Wallet/WalletComponent';
import styles from './styles/SwapHome.module.css';
import { useAppDispatch, useAppSelector } from "../hooks.js";
import { signIn, signOut } from '../slices/userSlice.js';
import { 
	setRequest1, 
	setRequest2, 
	setCommit1, 
	setCommit2,
	clearSwapInfo, 
	setSwapStatus 
} from "../slices/swapSlice";
import { 
	removeLatestSwap, 
	updateSwapStatus 
} from "../slices/historySlice.js";
import { 
  openSwap,
  commitSwap
} from "../utils/apis";

export const SwapHome = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
	const swapIndex = useAppSelector(state => state.swap.index);
	// const amountBase = useAppSelector(state => state.swap.amountBase);
	// const amountQuote = useAppSelector(state => state.swap.amountQuote);
	const swapState = useAppSelector(state => state.swap.swapState);
	const swapId = useAppSelector(state => state.swap.swapId);
	const swapHash = useAppSelector(state => state.swap.swapHash);
	const secretSeekerId = useAppSelector(state => state.swap.secretSeekerId);
	const secretHolderId = useAppSelector(state => state.swap.secretHolderId);
	const secret = useAppSelector(state => state.swap.secret);
	const request1 = useAppSelector(state => state.swap.request1);
	const request2 = useAppSelector(state => state.swap.request2);
	const commit1 = useAppSelector(state => state.swap.commit1);
	const commit2 = useAppSelector(state => state.swap.commit2);
  const [open, setOpen] = useState(false);

  
	const simulateOpen = async (participant, swapId, id, secret, firstParty) => {
    // console.log({participant, swapId, id, secret, firstParty});
		openSwap({participant, swapId, id, secret})
		.then(res => {
			return res.json()
		})
		.then(data => {
			//console.log(JSON.stringify(data))
			//console.log(`request: ${data.publicInfo.request}`)
			// setOpenedSwap(true)
			if(firstParty) 	dispatch(setRequest1(data.publicInfo.request));
			else						dispatch(setRequest2(data.publicInfo.request));
		})
		.catch(err => console.log(err));
	}

	const simulateCommit = async (participant, swapId, id, firstParty) => {
		commitSwap({swapId, id, participant})
		.then(res => {
			return res.json()
		})
		.then(data => {
			console.log(JSON.stringify(data));
			if(firstParty)	dispatch(setCommit1(true));
			else 						dispatch(setCommit2(true));
		})
		.catch(err => console.log(err));
	}

	useEffect(() => {
    // console.log("useEffect in SwapHome");
    // console.log({swapHash, request1, request2, commit1, commit2, swapState});
		if(swapState==1 && swapHash && (!request1 && !request2)) {
      setTimeout(() => {
        simulateOpen(alice, swapId, secretSeekerId, null, true);
        dispatch(setSwapStatus(1));
        dispatch(updateSwapStatus({index: swapIndex, status: 1}));
        console.log("alice opens the swap");
        }, 1000
      );
		}
		if(swapState === 1 && ((request1 && !request2) || (!request1 && request2))) {
      setTimeout(() => {
        console.log("carol opens the swap");
        simulateOpen(carol, swapId, secretHolderId, secret, false);
        dispatch(setSwapStatus(2));
        dispatch(updateSwapStatus({index: swapIndex, status: 2}));
        }, 1000
      );
		}
		if(swapState === 2 && request1 && request2){
      setTimeout(() => {
        console.log("alice commits the swap");
        simulateCommit(alice, swapId, secretSeekerId, true);
        dispatch(setSwapStatus(3));
        dispatch(updateSwapStatus({index: swapIndex, status: 3}));
        }, 1000
      );
		}
		if(swapState === 3 && commit1 && !commit2){
      setTimeout(() => {
        console.log("carol commits the swap");
        simulateCommit(carol, swapId, secretHolderId, false);
        dispatch(setSwapStatus(4));
        dispatch(updateSwapStatus({index: swapIndex, status: 4}));
        }, 1000
      );
		}
		if(swapState === 4 && commit1 && commit2){
      setTimeout(() => {
        dispatch(setSwapStatus(5));
        dispatch(updateSwapStatus({index: swapIndex, status: 5}));
        }, 1000
      );
		}
		// if() setSwapStatus(6)
	}, [
    // swapHash, 
    request1, request2, commit1, commit2, swapState]);

	// useEffect(() => {
	// 	if(swapState === 5) alert('Swap confirmed and secret hash revealed!');
	// }, [swapState]);


  const logIn = (data) => {
    dispatch(signIn(data));
    setOpen(false);
  }
  
  const signInAsAlice = () => {
    dispatch(signIn(alice));
    setOpen(false);
  }

  const signInAsCarol = () => {
    dispatch(signIn(carol));
    setOpen(false);
  }

  const logOut = () => {
    dispatch(signOut());
    setOpen(false);
  }
	const [alice, setAlice] = useState({
		state: {
			isSecretHolder: false,
			left: {
				client: 'ln-client',
				node: 'lnd',
				request: null,
				clientInfo: {
					cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a7a434341637967417749424167495164525836785a473672736755474a633944624557727a414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a5441650a467730794d7a41784d5463774e5449324d7a5661467730794e44417a4d544d774e5449324d7a56614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d544257467361574e6c4d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a3044415163445167414565306a55595267307849367a5a546f6e70624d386b5475754c65457236594155754772304e6c5578774942344f5149530a44443664666539616d41386169412f7353395a5a68495079547751616c3664797279736b34714f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a4667515556534a364170554d344d626567332b2b464b45314c4d706c47787777617759445652305242475177596f4946595778705932574343577876593246730a6147397a644949465957787059325743446e4276624746794c5734784c57467361574e6c67675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373466741464d416f4743437147534d343942414d430a41306b414d4559434951447846417373716c49652f414430492f6a68714b366456384938494c6b70305471764f6c55773641543856674968414b6e3466704c6d0a6436554b43304e646e6e2f3663705675466c516f3975666f4d57666c742f6566344b36740a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
					adminMacaroon: '0201036c6e6402f801030a10a0187837fed329e9fd735377a3164c781201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006209a7f47b660bfaa9e15bcac150fbe9c265cde9b1d79996033ff45b9c2f0e3f4e1',
					invoiceMacaroon: '0201036c6e640258030a109e187837fed329e9fd735377a3164c781201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620d5aca1fa2768ce84a11f3169cadd21abecedb4214a6c712345df44eef1f5e5cd',
					socket: 'localhost:10001'
				},
				lnd: {
					admin: null,
					invoice: null
				}
			},
			right: {
				client: 'ln-client',
				node: 'lnd',
				request: null,
				clientInfo: {
					cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a434341633267417749424167495241493061633266705a7752662b6f61353350542f31446377436759494b6f5a497a6a3045417749774d5445660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a575167593256796444454f4d4177474131554541784d4659577870593255770a4868634e4d6a4d774d5445334d4455794f4451795768634e4d6a51774d7a457a4d4455794f445179576a41784d523877485159445651514b45785a73626d51670a595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a54425a4d424d4742797147534d3439416745470a43437147534d34394177454841304941424645456c744b63593075732f50544b4b7973416d59474f4d7442535a35596e346c5353384f735071523147437034520a6d77467a697978794c464f7579697953644561545a426972784d556e546d70786452502f7831656a676355776763497744675944565230504151482f424151440a41674b6b4d424d47413155644a51514d4d416f47434373474151554642774d424d41384741315564457745422f7751464d414d4241663877485159445652304f0a42425945464c545a7866776b4a5933524d365059476e4673527775786e5231544d477347413155644551526b4d474b434257467361574e6c67676c7362324e680a62476876633353434257467361574e6c6767357762327868636931754d69316862476c6a5a594945645735706549494b64573570654842685932746c644949480a596e566d59323975626f6345667741414159635141414141414141414141414141414141414141414159634572426341416a414b42676771686b6a4f505151440a41674e4841444245416942695763523078585a304d7141707354484e41516863674f45323754554861654547574e4b6b555541666c674967514a53596c4961510a66556b497358544b662f504579396d45313872472f6f6e3437647479585965547358303d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
					adminMacaroon: '0201036c6e6402f801030a10d241a17bda31823556521ca0e34f877e1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062006f0ebbbf53ab8e9b04f5985ad5dc1c3403e0ad055805311237239578798a760',
					invoiceMacaroon: '0201036c6e640258030a10d041a17bda31823556521ca0e34f877e1201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e120472656164000006203629c0754d96cfddfb10d9fbfc72becd997194f7e46d4a014594fb3eb813b47e',
					socket: 'localhost:10004'
				},
				lnd: {
					admin: null,
					invoice: null
				}
			}
		}
	})
	const [carol, setCarol] = useState({
		state: {
				isSecretHolder: true,
				secret: secret,
				left: {
					client: 'ln-client',
					node: 'lnd',
					request: null,
					clientInfo: {
						cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a43434163796741774942416749514a734d6a3150766234726944384b4a36705a4844466a414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566a59584a76624441650a467730794d7a41784d5463774e5449324d7a5661467730794e44417a4d544d774e5449324d7a56614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d5442574e68636d39734d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a30444151634451674145486e73383372724445737259654357597a3752583943447047387759543733546e49632f5269595376656836596f73390a734471527652756b536250314a4a6366704f586c7a6958694768784e336262366178484a4f714f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a466751557a64724d74736274386e53534255384930666943553032657a346377617759445652305242475177596f4946593246796232794343577876593246730a6147397a644949465932467962327943446e4276624746794c5734784c574e68636d397367675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373466741444d416f4743437147534d343942414d430a413067414d4555434951436e4a3731476d66473547495844376b4d446b3978575557464554476c6766524554566454377678426d4e7749674344794a5654694b0a6466397563714e726d574b36744668706b7630754e6b6f4d4f73566d574d2b535a30453d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
						adminMacaroon: '0201036c6e6402f801030a1087fbf29a76377b1c21c3280a34c05ada1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006208b1456b06085bc30f2c5594f3ddb05f6d033b7c5f3d764ee17ece665b93a90e2',
						invoiceMacaroon: '0201036c6e640258030a1085fbf29a76377b1c21c3280a34c05ada1201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620c5e560e42d344947c269e310ee177c71215fb226eff1a389a1ddad5fae0ac52e',
						socket: 'localhost:10003'
					},
					lnd: {
						admin: null,
						invoice: null
					}
				},
				right: {
						client: 'ln-client',
						node: 'lnd',
						request: null,
						clientInfo: {
								cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a4343416332674177494241674952414e456264712b4370444a3934454c35774d436b30474d77436759494b6f5a497a6a3045417749774d5445660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a575167593256796444454f4d4177474131554541784d4659324679623277770a4868634e4d6a4d774d5445334d4455794f44517a5768634e4d6a51774d7a457a4d4455794f44517a576a41784d523877485159445651514b45785a73626d51670a595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566a59584a766244425a4d424d4742797147534d3439416745470a43437147534d343941774548413049414249466b5a766667453046725a586565716b447177735761597148716f525155666f4253695470434d65326c2f70466a0a636b79312b2b576c792f5a514232436968622f7250327375733738704b4f48484661786d3636796a676355776763497744675944565230504151482f424151440a41674b6b4d424d47413155644a51514d4d416f47434373474151554642774d424d41384741315564457745422f7751464d414d4241663877485159445652304f0a4242594546447263546666592f6a4d344743493249654553527a44376773412f4d477347413155644551526b4d474b4342574e68636d397367676c7362324e680a624768766333534342574e68636d39736767357762327868636931754d69316a59584a7662494945645735706549494b64573570654842685932746c644949480a596e566d59323975626f6345667741414159635141414141414141414141414141414141414141414159634572426341417a414b42676771686b6a4f505151440a41674e48414442454169426564736b31583676342f4e6c774e396e4a674e384937376561304b454d4941792b51384533444a4b715251496746383256344962450a684152382f4553305136612f4d49636c4f52727156576b763670386c503051446f2f6f3d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
								adminMacaroon: '0201036c6e6402f801030a10283419d44d226d4eb7abc1f8db12f1d11201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006207c3f61d12de538b330d272a482ad818a11c817e3da7b5a3ca754ee47bc341303',
								invoiceMacaroon: '0201036c6e640258030a10263419d44d226d4eb7abc1f8db12f1d11201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e120472656164000006206fb764bc746c0a35934e7850625a03739f135b2c289bd2b9448c4a7e5d724836',
								socket: 'localhost:10006'
						},
						lnd: {
								admin: null,
								invoice: null
						}
				}
		}
	})

  return (
    <>
      <Menu inverted borderless>
        { !user.isLoggedIn && 
          <Menu.Menu position='right' className={styles.signin}>
            <Menu.Item name='signin'>
              <Button primary onClick={() => setOpen(true)} className='gradient-btn'>Sign In</Button>
            </Menu.Item>
          </Menu.Menu>
        }
        { user.isLoggedIn && <>
          {user.user!=null && <Menu.Menu position='right'>
            <Menu.Item name='logout' onClick={() => console.log(user)}>
              Signed in as {JSON.stringify(user.user.state.left.clientInfo.adminMacaroon).slice(0, 18).replace(/['"]+/g, '')}
            </Menu.Item>
          </Menu.Menu>}
          <Menu.Menu position='right' className={styles.signin}>
            <Menu.Item name='logout'>
              <Button inverted color='red' onClick={e => logOut()}>Logout</Button>
            </Menu.Item>
          </Menu.Menu>
        </> }
      </Menu>
      <div>
        <Image
          centered
          circular
          size='large'
          src='https://pbs.twimg.com/profile_banners/1082726135941586949/1650477093/1500x500'
        />
        <Header as='h2' icon textAlign='center'>
          <Header.Content>Portal Lightning Swap Demo</Header.Content>
        </Header>
        <br />
      </div><br />
      <Grid className={styles.homeContainer} centered>
        <Grid.Column width={7} className={styles.walletHistoryContainer}>
          <Grid.Row centered className='mb-3'>
            <WalletComponent />
          </Grid.Row>
          <Grid.Row>
            <SwapActivity />
          </Grid.Row>
        </Grid.Column>
        <Grid.Column width={7}>
          <Grid.Row>
            <SwapCreate />
          </Grid.Row>
          {/* <Grid.Row>
            <OrdersList />
          </Grid.Row> */}
        </Grid.Column>
      </Grid>
      <Modal
        basic
        closeIcon
        dimmer={'blurring'}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        className={styles.signInModal}
      >
        <Modal.Header>Enter your credentials</Modal.Header>
        <Modal.Actions>
          
        <Form>
          <Form.Field>
            <label>Lightning Network Client Info</label>
            <TextArea placeholder="Input in JSON format: {
                isSecretHolder: true,
                secret: secret,
                left: {
                  client: 'ln-client',
                  node: 'lnd',
                  request: null,
                  clientInfo: {
                    cert: '',
                    adminMacaroon: '',
                    invoiceMacaroon: '',
                    socket: 'localhost:00000'
                  },
                  lnd: {
                    admin: null,
                    invoice: null
                  }
                },
                right: {
                    client: 'ln-client',
                    node: 'lnd',
                    request: null,
                    clientInfo: {
                        cert: '',
                        adminMacaroon: '',
                        invoiceMacaroon: '',
                        socket: 'localhost:00000'
                    },
                    lnd: {
                        admin: null,
                        invoice: null
                    }
                }
              }" />
          </Form.Field>
          <Form.Field>
            <label>Ethereum Private Key</label>
            <input placeholder='Ethereum Private Key' />
          </Form.Field>
          <Button onClick={signInAsAlice}>
            Sign in as Alice
          </Button>
          <Button onClick={signInAsCarol}>
            Sign in as Carol
          </Button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type='submit' onClick={(e) => {logIn(e.data)}} className='gradient-btn'>Sign In</Button>
        </Form>
        </Modal.Actions>
      </Modal>
    </>
  )
}