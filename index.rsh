'reach 0.1';



const TIMEOUT = 10;

export const main =
    Reach.App(
        {},
        [['Auctioneer',
        {   auctionEnds: Fun([UInt], Null),
            initialPotAmount: Fun([UInt], Null),
            getParams: Fun([], Object({
                                        deadline: UInt,
                                        potAmount: UInt,
                                        potAddress: Address,
                                    })) }],
        ['class', 'Attendee',{
            placedBet: Fun([Address, UInt], Null),
            mayBet: Fun([UInt], Bool),
        }],
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
            commit();

            Auctioneer.only(() => {
                interact.initialPotAmount(potAmount);
            });
            Auctioneer.pay(potAmount);

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
            // transfer(balance()).to(Auctioneer);
            commit();
        }
    );