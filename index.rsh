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
            // const informTimeout = () => {
            //     Auctioneer.only(() => {
            //         interact.informTimeout();
            //     });
            //     Attendee.only(() => {
            //         interact.informTimeout();
            //     });
            // };

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

            // Auctioneer.only(() => {
            //     interact.initialPotAmount(potAmount);
            // });
            // Auctioneer.pay(potAmount);
            // commit();

            const [ auctionRunning, winnerAddress ] =
                parallel_reduce([ true, potAddress ])
                .invariant()
                .while(auctionRunning)
                .case(Attendee, (() => ({
                        when: declassify(interact.mayBet()),
                    })),
                    (() => (potAmount / 100)),
                    ((bet) => {
                        const address = this;
                        Attendee.only(() => interact
                            .placedBet(address, 
                            (potAmount / 100)));
                        return [ true, address ];
                    }))
                .timeout(deadline, () => {
                    auctionEnds();
                    return [ false, winnerAddress ];
                    });

            // Auctioneer.only(() => {
            //     interact.initialPotAmount(potAmount);
            // });
            // Auctioneer.pay(potAmount);
            // commit();

            // Attendee.only(() => {
            //     const bet = potAmount / 100;
            //     interact.submitBet(bet);
            // });
            // Attendee.publish(bet)
            //     .pay(bet)
            //     .timeout(TIMEOUT, () => closeTo(Auctioneer, informTimeout));

            transfer(balance()).to(Auctioneer);
            commit();
            auctionEnds();
        }
    );