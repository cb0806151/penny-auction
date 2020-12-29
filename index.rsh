'reach 0.1';


export const main =
    Reach.App(
        {},
        [['Auctioneer',
        { getParams: Fun([], Object({ betPrice: UInt,
                                        deadline: UInt,
                                        potAddr: Address,
                                        potAmount: UInt})) }],
        ['Attendee',
        { getBet: Fun([], UInt),
            AttendeeWas: Fun([Address], Null),
        } ],
        ],
        (Auctioneer, Attendee) => {
            Auctioneer.only(() => {
                const { betPrice, deadline, potAddr, potAmount } =
                  declassify(interact.getParams());
            });
            Auctioneer.publish(betPrice, deadline, potAddr, potAmount);
            commit();

            Auctioneer.pay(potAmount);
            commit();

            Attendee.only(() => {
                const bet = declassify(interact.getBet());
            });
            Attendee.publish(bet).pay(bet);

            const winner = potAddr;
            transfer(balance()).to(Attendee);
            commit();
        }
    );