import React from "react"; 
import {useQuery} from "react-query";

import {shortISO} from "../../utils/date-wrangler";
import {useBookingsParams} from "./bookingsHooks";
import getData from "../../utils/api";

import BookablesList from "../Bookables/BookablesList";
import Bookings from "./Bookings";

export default function BookingsPage () {
  //Obtiene todos los bookables
  //useQuery retorna un objeto con propiedades data, status, isError, isFetched, etc. 
  const {data: bookables = []} = useQuery("bookables",() => getData("http://localhost:3001/bookables"),
    {
      suspense: true // enable suspense mode
    }
  );

  //Obtiene los datos del query string. Si no hay query string, el hook hace que date valga el current ts, y bookableId undefined
  const {date, bookableId} = useBookingsParams();

  //Busca el booking con el id indicado, y en caso de no encontralo, toma el primer booking
  const bookable = bookables.find(b => b.id === bookableId) || bookables[0];

  //Obtiene el path para obtener los bookings
  function getUrl (id) {
    const root = `/bookings?bookableId=${id}`;
    return date ? `${root}&date=${shortISO(date)}` : root;
  }

  return (
    <main className="bookings-page">
      <BookablesList
        bookable={bookable}
        bookables={bookables}
        getUrl={getUrl}
      />
      <Bookings
        bookable={bookable}
      />
    </main>
  );
}