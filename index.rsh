'reach 0.1';



const TIMEOUT = 10;

const Defaults = {
        auctionEnds: Fun([UInt], Null),
}

const Auc = {   
        ...Defaults,
        getParams: Fun([], Object({
                                deadline: UInt,
                                potAmount: UInt,
                                potAddress: Address,
                            })) 
                        }

const Att = {
        ...Defaults,    
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
                each([Auctioneer, Attendee], () => {
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
            Auctioneer.publish(deadline, potAmount, potAddress)
                    .pay(potAmount);

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