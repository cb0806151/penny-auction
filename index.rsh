'reach 0.1';


export const main =
    Reach.App(
        {},
        [['Pot',
        { getParams: Fun([], Object({
                                        deadline: UInt,
                                        potAmount: UInt,
                                    })) }],
        ['Attendee',{}],
        ],
        (Pot, Attendee) => {
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
            });
            Attendee.publish(bet).pay(bet);

            transfer(balance()).to(Pot);
            commit();
        }
    );