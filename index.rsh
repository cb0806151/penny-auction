'reach 0.1';

const Defaults = {
    informTimeout: Fun([], Null),
};

const TIMEOUT = 10;

export const main =
    Reach.App(
        {},
        [['Pot',
        {   ...Defaults,
            postPotAmount: Fun([UInt], Null),
            getParams: Fun([], Object({
                                        deadline: UInt,
                                        potAmount: UInt,
                                    })) }],
        ['Attendee',{
            ...Defaults,
            submitBet: Fun([UInt], Null),
        }],
        ],
        (Pot, Attendee) => {
            const informTimeout = () => {
                
                Pot.only(() => {
                    interact.informTimeout();
                    const potCount = balance();
                    interact.postPotAmount(potCount);
                });
                Attendee.only(() => {
                    interact.informTimeout();
                });
            };

            Pot.only(() => {
                const { deadline, potAmount } =
                  declassify(interact.getParams());
            });
            Pot.publish(deadline, potAmount);
            commit();

            Pot.pay(potAmount);
            commit();

            Attendee.only(() => {
                const bet = potAmount / 100;
                interact.submitBet(bet);
            });
            Attendee.publish(bet)
                .pay(bet)
                .timeout(TIMEOUT, () => closeTo(Pot, informTimeout));
            commit();

            Pot.only(() => {
                const potCount = balance();
                interact.postPotAmount(potCount);
            });
            Pot.publish(potCount);

            transfer(balance()).to(Attendee);
            commit();
        }
    );