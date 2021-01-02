'reach 0.1';

const Defaults = {
    informTimeout: Fun([], Null),
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
                                    })) }],
        ['Attendee',{
            ...Defaults,
            submitBet: Fun([UInt], Null),
        }],
        ],
        (Auctioneer, Attendee) => {
            const informTimeout = () => {
                Auctioneer.only(() => {
                    interact.informTimeout();
                });
                Attendee.only(() => {
                    interact.informTimeout();
                });
            };

            Auctioneer.only(() => {
                const { deadline, potAmount } =
                  declassify(interact.getParams());
            });
            Auctioneer.publish(deadline, potAmount);
            commit();

            Auctioneer.only(() => {
                interact.initialPotAmount(potAmount);
            });
            Auctioneer.pay(potAmount);
            commit();

            Attendee.only(() => {
                const bet = potAmount / 100;
                interact.submitBet(bet);
            });
            Attendee.publish(bet)
                .pay(bet)
                .timeout(TIMEOUT, () => closeTo(Auctioneer, informTimeout));

            transfer(balance()).to(Attendee);
            commit();
        }
    );