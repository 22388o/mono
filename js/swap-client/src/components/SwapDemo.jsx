import { useEffect, useState } from "react";
import { Button, Card, Container, Table } from "semantic-ui-react";
import { useAppSelector } from "../hooks.js";
import { clearSwapInfo, setSwapState } from "../slices/swapSlice.js";
import { SwapCreate } from './SwapCreate.jsx'
import { SwapForm } from './SwapForm.jsx'
import { useAppDispatch } from "../hooks.js";
import { addSwapItem, updateLatestSwapStatus } from "../slices/historySlice.js";

export const SwapDemo = () => {
	const dispatch = useAppDispatch();
	const swapHistory = useAppSelector(state => state.history.history);
	const amountBase = useAppSelector(state => state.swap.amountBase);
	const amountQuote = useAppSelector(state => state.swap.amountQuote);
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
	console.log(swapHistory);
	const [alice, setAlice] = useState({
		state: {
			isSecretHolder: false,
			left: {
				client: 'ln-client',
				node: 'lnd',
				request: null,
				clientInfo: {
						cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a434341637967417749424167495166584a723641307a373567365678794d4a364c636354414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a5441650a467730794d7a41784d4459774d6a49354e544a61467730794e44417a4d4449774d6a49354e544a614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d544257467361574e6c4d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a304441516344516741454d6f3743494d586554574a384e78597137715a5a6b546553536974656576644a486b6558335746734958714376576e780a76336b7646577978483548484e563241786173374b4e65735033473843444b6a4c5165476d714f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a46675155427a766a495a532b6b31464b31666961626953773939386b50533077617759445652305242475177596f4946595778705932574343577876593246730a6147397a644949465957787059325743446e4276624746794c57347a4c57467361574e6c67675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373456741464d416f4743437147534d343942414d430a413067414d4555434951433077336f32337450695936494b764c30453478364a2f7237632b6f6943567034654538386c4738764a414149674170336a726b594a0a793244354c35356e64587668576d34716e6d646f4579664a426a4d7274747651766b593d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
						adminMacaroon: '0201036c6e6402f801030a10a36e7bf39225ac2de92e5704e7e12d031201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006205125fc9997ed7274a5d683e6033f0a15a47f496be2695bbe7ef8a7e83e379c27',
						invoiceMacaroon: '0201036c6e640258030a10a16e7bf39225ac2de92e5704e7e12d031201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620254903185efd910f6604501fb724944edf42848e63e89277e468c7c3245dcaab',
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
						cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a7a43434163326741774942416749524149486a4b4d747674314f45424f4162364936572f434977436759494b6f5a497a6a3045417749774d5445660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a575167593256796444454f4d4177474131554541784d4659577870593255770a4868634e4d6a4d774d5441324d44497a4e5449775768634e4d6a51774d7a41794d44497a4e544977576a41784d523877485159445651514b45785a73626d51670a595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566862476c6a5a54425a4d424d4742797147534d3439416745470a43437147534d3439417745484130494142463645357a6853794955534966336c4179706b736d666b4b32586b413166664e7a7a384c502b354953334c326d36490a5547565969587a6d56326c50536735563959426b674675664d6e5735456b52735a2f31654971616a676355776763497744675944565230504151482f424151440a41674b6b4d424d47413155644a51514d4d416f47434373474151554642774d424d41384741315564457745422f7751464d414d4241663877485159445652304f0a42425945464c4a474a63777755576777484d5a7a52454539726571376a4647434d477347413155644551526b4d474b434257467361574e6c67676c7362324e680a62476876633353434257467361574e6c6767357762327868636931754e43316862476c6a5a594945645735706549494b64573570654842685932746c644949480a596e566d59323975626f6345667741414159635141414141414141414141414141414141414141414159634572424d414254414b42676771686b6a4f505151440a41674e494144424641694154726936474c5257337450374c6b49776f4373623732686550494f4530703077322f2f492f5038455854774968414c5a54486444410a64764c72746c2f6f6743744b6771336a6a327261787748616553463658746333442f6d430a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
						adminMacaroon: '0201036c6e6402f801030a10e311bb1e704294f805b20da79e61d2141201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062039e063e5d4a1ea23817ed88acdd6db0708fd6bbbd6a58f5b7a0d4c3f1b22ed53',
						invoiceMacaroon: '0201036c6e640258030a10e111bb1e704294f805b20da79e61d2141201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e120472656164000006208d82f153282947f38f720d887e960d01a9b71f79fc52c82ebdcb36f548ad226c',
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
						cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a4343416379674177494241674951615330764871617359436d365838377873734833476a414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566a59584a76624441650a467730794d7a41784d4459774d6a49354e544661467730794e44417a4d4449774d6a49354e5446614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d5442574e68636d39734d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a304441516344516741454a31514a74544963345a58686a66544857555364304b6659397a696742334e474a3463754c384f3630446251426931660a376f7a784878734a61737a397635454a6e6e557053726d4b69623853785a472f77784f56744b4f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a466751557a3136455356626e41362f4c7750624651593049492f446f31356377617759445652305242475177596f4946593246796232794343577876593246730a6147397a644949465932467962327943446e4276624746794c57347a4c574e68636d397367675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373456741434d416f4743437147534d343942414d430a413067414d4555434951436e39774b586f757861655555774261626b61434a7579704e4c6f7134736c584a4a4c4b68364f382f54556749675568706b44464f760a324d5875576d35566376314b42563075686c744f713153686c6e535341696c6f57786b3d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
						adminMacaroon: '0201036c6e6402f801030a10a52acd5e1211fd0ce9ea6e8a493de73b1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620298d0d422059f5ef1fd85810eef21998d0013c0fb514bad4d58f9b0b32993aa1',
						invoiceMacaroon: '0201036c6e640258030a10a32acd5e1211fd0ce9ea6e8a493de73b1201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e120472656164000006206b3595ca06a22e53f9571829e9ddf7c95cbe316be1bbf3d694bfb1d961a31505',
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
								cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d4949434a6a434341637967417749424167495156716a7765715654554c32504d4d646b52327264377a414b42676771686b6a4f50515144416a41784d5238770a485159445651514b45785a73626d5167595856306232646c626d56795958526c5a43426a5a584a304d51347744415944565151444577566a59584a76624441650a467730794d7a41784d4459774d6a4d314d6a4261467730794e44417a4d4449774d6a4d314d6a42614d444578487a416442674e5642416f54466d78755a4342680a645852765a3256755a584a686447566b49474e6c636e5178446a414d42674e5642414d5442574e68636d39734d466b77457759484b6f5a497a6a3043415159490a4b6f5a497a6a30444151634451674145685072536a53476c4d6e6c437a49794b446665575730316c2f6a796d4266394d79756f30446c784773362b77694b34700a75303179413751355061514f492b682f76726c76576478437845686d61325753322b4b4f31614f4278544342776a414f42674e56485138424166384542414d430a41715177457759445652306c42417777436759494b775942425155484177457744775944565230544151482f42415577417745422f7a416442674e56485134450a466751553768375249713230573056434f362f42446e414779434a37394c3877617759445652305242475177596f4946593246796232794343577876593246730a6147397a644949465932467962327943446e4276624746794c5734304c574e68636d397367675231626d6c3467677031626d6c346347466a61325630676764690a64575a6a623235756877522f4141414268784141414141414141414141414141414141414141414268775373457741444d416f4743437147534d343942414d430a413067414d45554349514346486a456571614d435a717376504365756477516b5367514c77337954734b586b793851337767726e31674967437a7776314e5a330a5735616549435a7362674e6b414b6e6f4b496550425144524d7872305978474f724c553d0a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
								adminMacaroon: '0201036c6e6402f801030a1002dedbf9140137e9da540de40aa2da241201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062028c3f6faa1ffd4e2052450aa92951ed04920cb7d1a2f61f6c13650cc7187412a',
								invoiceMacaroon: '0201036c6e640258030a1000dedbf9140137e9da540de40aa2da241201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620ea9b87d0c9bd0359dc471e138f204673903aa33c005c76c335f64f4471e80e31',
								socket: 'localhost:10006'
						},
						lnd: {
								admin: null,
								invoice: null
						}
				}
		}
	})
	useEffect(() => {
		if(!swapState && swapHash) {
			dispatch(setSwapState(1));
			dispatch(updateLatestSwapStatus('Created'));
		}
		if(swapState === 1 && ((request1 && !request2) || (!request1 && request2))) {
			dispatch(setSwapState(2));
			dispatch(updateLatestSwapStatus('Opening'));
		}
		if(swapState === 2 && request1 && request2){
			dispatch(setSwapState(3));
			dispatch(updateLatestSwapStatus('Opened'));
		}
		if(swapState === 3 && commit1 && !commit2){
			dispatch(setSwapState(4));
			dispatch(updateLatestSwapStatus('Committing'));
		}
		if(swapState === 4 && commit1 && commit2){
			dispatch(setSwapState(5));
			dispatch(updateLatestSwapStatus('Completed'));
		}
		// if() setSwapState(6)
	}, [swapHash, request1, request2, commit1, commit2, swapState]);

	useEffect(() => {
		if(swapState === 5) alert('Swap confirmed and secret hash revealed!');
	}, [swapState]);

	const onClearSwap = () => {
		dispatch(clearSwapInfo());
	};

	return (
		<>
			{(swapId == null) 
				? <SwapCreate /> 
				: <Card.Group className="flex-nowrap" centered>
						<Card fluid>
							<Card.Content>
								<Card.Header>
									Swap Info
								</Card.Header>
								<Card.Description>
									<Table style={{ border: "0px solid rgba(0,0,0,0)" }}>
										<Table.Body>
											<Table.Row>
												<Table.Cell>
													baseAmount: 
												</Table.Cell>
												<Table.Cell>
													<Container style={{ wordWrap: "break-word" }}>
														{amountBase}
													</Container>
												</Table.Cell>
											</Table.Row>
											<Table.Row>
												<Table.Cell>
													quoteAmount: 
												</Table.Cell>
												<Table.Cell>
													<Container style={{ wordWrap: "break-word" }}>
														{amountQuote}
													</Container>
												</Table.Cell>
											</Table.Row>
											<Table.Row>
												<Table.Cell>
													swapId: 
												</Table.Cell>
												<Table.Cell>
													<Container style={{ wordWrap: "break-word" }}>
														{swapId}
													</Container>
												</Table.Cell>
											</Table.Row>
											<Table.Row>
												<Table.Cell>
													invoice1: 
												</Table.Cell>
												<Table.Cell>
													<Container style={{ wordWrap: "break-word" }}>
														{request1}
													</Container>
												</Table.Cell>
											</Table.Row>
											<Table.Row>
												<Table.Cell>
													invoice2:
												</Table.Cell>
												<Table.Cell>
													<Container style={{ wordWrap: "break-word" }}>
														{request2}
													</Container>
												</Table.Cell>
											</Table.Row>
										</Table.Body>
									</Table>
									<Button onClick={onClearSwap}>
									{(swapState<5) ? "Cancel Swap" : "New Swap"}</Button>
								</Card.Description>
							</Card.Content>
						</Card>
					</Card.Group>    
			}
			{(swapId != null) 
				? <Card.Group widths='equal' className="flex-nowrap">
						<Card className="user-swap">
							<Card.Content>
								<SwapForm firstParty={true} participant={alice} id={secretSeekerId} />
							</Card.Content>
						</Card>
						<Card className="user-swap">
							<Card.Content>
								<SwapForm firstParty={false} participant={carol} id={secretHolderId} />
							</Card.Content>
						</Card>
					</Card.Group>
				: (<br/>)
			}
		</>
	);
}
