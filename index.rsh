'reach 0.1';



const TIMEOUT = 10;

const Auc = {   
        auctionEnds: Fun([UInt], Null),
        getParams: Fun([], Object({
                                deadline: UInt,
                                potAmount: UInt,
                                potAddress: Address,
                            })) 
                        }

const Att = {
        placedBet: Fun([Address, UInt], Null),
        mayBet: Fun([UInt], Bool),
}

export const main =
    Reach.App(
        {},
        [
            ['Auctioneer', Auc],
            ['class', 'Attendee', Att],
        ],
        (Auctioneer, Attendee) => {
            const auctionEnds = (potBalance) => {
                Auctioneer.only(() => {
                    interact.auctionEnds(potBalance);
                });
            };

            const getBet = (potBalance) => {
                return potBalance / 100;
            };

            Auctioneer.only(() => {
                const { deadline, potAmount, potAddress } =
                  declassify(interact.getParams());
            });
            Auctioneer.publish(deadline, potAmount, potAddress);

            const [ currentPot, auctionRunning, winnerAddress ] =
                parallel_reduce([ potAmount, true, potAddress ])
                .invariant(balance() == currentPot)
                .while(auctionRunning)
                .case(Attendee, (() => ({
                        when: declassify(interact.mayBet(getBet(currentPot))),
                    })),
                    (() => getBet(currentPot)),
                    (() => {
                        const address = this;
                        const betValue = getBet(currentPot);
                        Attendee.only(() => interact.placedBet(address, betValue));
                        return [ currentPot + betValue, true, address ];
                    }))
                .timeout(deadline, () => {
                    Auctioneer.publish();
                    return [ currentPot, false, winnerAddress ];
                    });

            auctionEnds(currentPot);
            transfer(balance()).to(winnerAddress);
            commit();
        }
    );