import {useEffect, useState} from "react";

//hook que permite almacenar data, y ofrece la posibilidad de manipularla de dos formas diferentes
export default function useFormState (data) {
  //Crea un estado con el valor inicial pasado como data la primera vez
  const [state, setState] = useState(data);
  //Con cada rendering del componente, si los data ha cambiado, actualiza el estado
  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  //incluimos en el estado la propiedad y el valor asociados al evento
  function handleChange (e) {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  }


  function handleChecked (e) {
    const {name, value, checked} = e.target;
    const values = new Set(state[name]);
    const intValue = parseInt(value, 10);

    values.delete(intValue);
    if (checked) values.add(intValue);

    setState({
      ...state,
      [name]: [...values]
    });
  }

  return {
    state,
    handleChange,
    handleChecked
  };
}