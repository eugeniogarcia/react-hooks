import {useTransition} from 'react';
import Spinner from "./Spinner";

export default function ButtonPending ({children, onClick, ...props}) {
  const [startTransition, isPending] = useTransition({
    timeoutMs: 3000
  });

  function handleClick () {
    startTransition(onClick);
  }

  return (
    <button onClick={handleClick} {...props}>
      {isPending && <Spinner/>}
      {children}
      {isPending && <Spinner/>}
    </button>
  );
}