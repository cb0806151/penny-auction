'reach 0.1';


export const main = 
    Reach.App(
        {},
        [['Auctioneer',
        { getParams: Fun([], Object({ betPrice: UInt,
                                        deadline: UInt,
                                        potAddr: Address})) }],
        ['class', 'Attendee',
        { getBet: Fun([], UInt),
            AttendeeWas: Fun([Address], Null),
        } ],
        ],
        (Auctioneer, Attendee) => {
            exit();
        }
    );