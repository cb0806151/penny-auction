import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

const N = 10;

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);
    
    const accPot = await stdlib.newTestAccount(startingBalance);
    const accAttendee_arr = await Promise.all( Array.from({length: N}, () => stdlib.newTestAccount(startingBalance)) );

    const accAuctioneer = await stdlib.newTestAccount(startingBalance);
    const ctcAuctioneer = accAuctioneer.deploy(backend);
    const ctcInfo = ctcAuctioneer.getInfo();

    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    const bet = Math.floor(Math.random() * 10);

    await Promise.all([
        backend.Auctioneer(ctcAuctioneer, {
            getParams: () => ({
                betPrice: stdlib.parseCurrency(5),
                deadline: 10,
                potAddr: accPot,
                potAmount: stdlib.parseCurrency(5)
            }),
        }),
        backend.Attendee(accAttendee_arr[0].attach(backend, ctcInfo), {
          getBet: (() => stdlib.parseCurrency(5)),
            AttendeeWas: ((AttendeeAddr) => {
              if ( stdlib.addressEq(AttendeeAddr, accAttendee) ) {
                console.log(`${AttendeeAddr} bet: ${bet}`);
              }}) 
        })
    ]
    // .concat(
    //     accAttendee_arr.map((accAttendee, i) => {
    //       const ctcAttendee = accAttendee.attach(backend, ctcInfo);
    //       const bet = Math.floor(Math.random() * 10);

    //       return backend.Attendee(ctcAttendee, {
    //         postBet: (() => bet),
    //         AttendeeWas: ((AttendeeAddr) => {
    //           if ( stdlib.addressEq(AttendeeAddr, accAttendee) ) {
    //             console.log(`${AttendeeAddr} bet: ${bet}`);
    //           } } )}); 
    //     } )
    //   )
      );

    let total = await getBalance(accAttendee_arr[0]);
    console.log(total)

    const potTotal = await getBalance(accPot);
    console.log(`The final price of the pot is ${potTotal}`);
})();