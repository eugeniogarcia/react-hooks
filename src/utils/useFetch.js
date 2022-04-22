import {useEffect, useState} from "react";
import getData from "./api";

//hook para hacer consultas
//Devuelve una terna: {data, status, error}
//Los datos que devuelve son estados de React. Cualquier cambio en sus valores produce un re-render de los componentes que los utilicen
export default function useFetch (url) {
  //Definimos los tres estados que vamos a seguir. El hook solo retorna el valor del estado; Esto significa que es el propio hook el unico que puede cambiar el valor del estado
  const [data, setData] = useState(); //datos
  const [error, setError] = useState(null); //estado
  const [status, setStatus] = useState("idle"); //error

  //Usamos un useEffect. De esta forma la recuperación de datos se inicia una vez se ha hecho el renderizado de componentes. Con suspense mejoraremos las opciones, y tendremos la posibilidad de recuperar datos al mismo tiempo que se hace el renderizado
  useEffect(() => {
    let doUpdate = true; //En caso de que el componente se destruya, nos permite abortar cualquier cambio de estado que fuera necesario hacer cuando una Promise se resuelva

    //Estados iniciales
    setStatus("loading");
    setData(undefined);
    setError(null);

    //Este método devuelve una Promise que se resuelve con la respuesta de la api - con el json
    getData(url)
      .then(data => {
        if (doUpdate) { //Actualizamos los estados para indicar que ya tenemos los datos
          setData(data);
          setStatus("success");
        }
      })
      .catch(error => { //Actualizamos los estados para indicar que hubo un error
        if (doUpdate) {
          setError(error);
          setStatus("error");
        }
      });

    return () => doUpdate = false;
  }, [url]);

  return {data, status, error};
}