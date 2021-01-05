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
                const { deadline, potAmount } =
                  declassify(interact.getParams());
            });
            Auctioneer.publish(deadline, potAmount);

            // Auctioneer.only(() => {
            //     interact.initialPotAmount(potAmount);
            // });
            // Auctioneer.pay(potAmount);
            // commit();

            // const [ auctionRunning, winnerAddress ] =
            //     parallel_reduce([true, potAddress])
            //     .invariant()
            //     .while(auctionRunning)
            //     .case(Attendee, (() => ({

            //         })),
            //         ((bet) => {

            //         }))
            //     .timeout(deadline, () => {
            //         auctionEnds();
            //         return [ false, winnerAddress ];
            //         })
            // commit();

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