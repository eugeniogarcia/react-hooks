import React,{lazy} from "react";
import {Routes, Route} from "react-router-dom";

//Lazy imports. El modulo se importará la primera vez que se use. Por ejemplo, hasta que no tengamos que navegar al componente que crea un Bookable, no se cargará. Esto acelera la carga de la aplicación
const BookablesView = lazy(() => import("./BookablesView"));
const BookableEdit = lazy(() => import("./BookableEdit"));
const BookableNew = lazy(() => import("./BookableNew"));

export default function BookablesPage () {
  return (
    <Routes>
      <Route path="/:id">
        <BookablesView/>
      </Route>
      <Route path="/">
        <BookablesView/>
      </Route>
      <Route path="/:id/edit">
        <BookableEdit/>
      </Route>
      <Route path="/new">
        <BookableNew/>
      </Route>
    </Routes>
  );
}
