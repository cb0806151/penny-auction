'reach 0.1';


export const main =
    Reach.App(
        {},
        [['Pot',
        { getParams: Fun([], Object({
                                        deadline: UInt,
                                        potAmount: UInt})) }],
        ['Attendee',
        { getBet: Fun([], UInt),
            AttendeeWas: Fun([Address], Null),
        } ],
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
                const bet = declassify(interact.getBet());
            });
            Attendee.publish(bet).pay(bet);

            transfer(balance()).to(Attendee);
            commit();
        }
    );