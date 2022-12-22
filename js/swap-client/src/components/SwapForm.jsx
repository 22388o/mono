import { useState } from "react";
import { Button, Card, Container, Table, TableRow } from "semantic-ui-react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { commitSwap, openSwap } from "../utils/apis";
import { setRequest1, setRequest2, setCommit1, setCommit2 } from "../slices/swapSlice";

export const SwapForm = ({firstParty, participant, id}) => {
	const dispatch = useAppDispatch();
	const swapId = useAppSelector(state => state.swap.swapId);
	const swapHash = useAppSelector(state => state.swap.swapHash);
	const swapState = useAppSelector(state => state.swap.swapState);
	const secret = useAppSelector(state => state.swap.secret);

	const [openedSwap, setOpenedSwap] = useState(null)
	const [committedSwap, setCommittedSwap] = useState(null)
	const [data, setData] = useState({
		data: {
			uid: swapId,
			state: participant.state
		}
	});

	const onClickOpen = async () => {
		openSwap({participant, swapId, id, secret})
		.then(res => {
			return res.json()
		})
		.then(data => {
			console.log(JSON.stringify(data))
			console.log(`request: ${data.publicInfo.request}`)
			setOpenedSwap(true)
			if(firstParty) 	dispatch(setRequest1(data.publicInfo.request));
			else						dispatch(setRequest2(data.publicInfo.request));
		})
		.catch(err => console.log(err));
	}

	const onClickCommit = async () => {
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

	return (
		<Card fluid>
			<Card.Content>
				<Card.Header>
					Swap UI ({id})
				</Card.Header>
				<Card.Description>
					<Table style={{ border: "0px solid rgba(0,0,0,0)" }}>
						<Table.Body>
							<Table.Row>
								<Table.Cell>
									swapHash: 
								</Table.Cell>
								<Table.Cell>
									<Container style={{ wordWrap: "break-word" }}>
										{swapHash}
									</Container>
								</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell>
									swapSecret:
								</Table.Cell>
								<Table.Cell>
									<Container style={{ wordWrap: "break-word" }}>
										{secret}
									</Container>
								</Table.Cell>
							</Table.Row>
						</Table.Body>
					</Table>
				</Card.Description>
				{swapState < 3
					? openedSwap == null
						? <Button onClick={onClickOpen}>Open Swap</Button>
						: <Button disabled>Waiting for counter party</Button>
					: swapState === 3
						? firstParty 
							? <Button onClick={onClickCommit}>Commit Swap</Button>
							: <Button disabled>Waiting for first user to commit swap</Button>
						: swapState === 4
							? firstParty
								? <Button disabled>Waiting for second user to finalize & commit swap</Button>
								: <Button onClick={onClickCommit}>Commit Swap</Button>
							: <Button onClick={onClickCommit}>Done</Button>
				}
			</Card.Content>
		</Card>
	);
}