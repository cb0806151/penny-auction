'reach 0.1';

const Defaults = {
    auctionEnds: Fun([], Null),
};

const TIMEOUT = 10;

export const main =
    Reach.App(
        {},
        [['Auctioneer',
        {   ...Defaults,
            initialPotAmount: Fun([UInt], Null),
            getParams: Fun([], Object({
                                        deadline: UInt,
                                        potAmount: UInt,
                                        potAddress: Address,
                                    })) }],
        ['class', 'Attendee',{
            ...Defaults,
            submitBet: Fun([UInt], Null),
            placedBet: Fun([Address, UInt], Null),
            mayBet: Fun([], Bool),
        }],
        ],
        (Auctioneer, Attendee) => {
            const auctionEnds = () => {
                Auctioneer.only(() => {
                    interact.auctionEnds();
                });
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
                parallel_reduce([ 10, true, potAddress ])
                .invariant(balance() == currentPot)
                .while(auctionRunning)
                .case(Attendee, (() => ({
                        when: declassify(interact.mayBet()),
                    })),
                    (() => (balance() / 100)),
                    ((bet) => {
                        const address = this;
                        const betValue = (balance() / 100);
                        Attendee.only(() => interact
                            .placedBet(address, betValue));
                        return [ currentPot + betValue, true, address ];
                    }))
                .timeout(deadline, () => {
                    Auctioneer.publish();
                    auctionEnds();
                    return [ currentPot, false, winnerAddress ];
                    });

            transfer(balance()).to(winnerAddress);
            commit();
            auctionEnds();
        }
    );