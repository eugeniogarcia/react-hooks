import React from "react";
import {animated} from "react-spring";

import {useSlide} from "./bookingsHooks";

import BookingsGrid from "./BookingsGrid";

export default function BookingsGridSlide (props) {
  const {week, bookable, booking, setBooking} = props;

  //EGSM. react-spring con react v18
  /*const transitions = useSlide(bookable, week);

  return (
    <div className="grid-wrapper">
      {transitions.map(({item, props, key}) => (
        <animated.div
          className="grid"
          style={{...props}}
          key={key}
        >
          <BookingsGrid
            week={item.week}
            bookable={item.bookable}
            booking={booking}
            setBooking={setBooking}
          />
        </animated.div>
      ))}
    </div>
  );
  */

  return (
    <div className="grid-wrapper">
        <div className="grid">
          <BookingsGrid
            week={week}
            bookable={bookable}
            booking={booking}
            setBooking={setBooking}
          />
        </div>
    </div>
  );
  //EGSM. react-spring con react v18
}