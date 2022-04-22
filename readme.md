## Arrancar la aplicación

```ps
npm start
```

```ps
json-server --watch .\db.json --port 3001 --delay 3000
```

## Javascript coding tips

```js
//Crea un Set para que del array de groups, se eliminen los duplicados. A continuación usa destructuring para crear el array, que ya no tendrá duplicados
const groups = [...new Set(bookables.map(b => b.group))];
```

```js
//Si id es undefined, usaremos bookables[0]. Puede ser undefined porque id sea undefined, o porque el id no lo tengamos en el array de bookables
const bookable = bookables.find(b => b.id === parseInt(id, 10)) || bookables[0];
```

```js
//Lazy imports. El modulo se importará la primera vez que se use. Por ejemplo, hasta que no tengamos que navegar al componente que crea un Bookable, no se cargará. Esto acelera la carga de la aplicación
const BookablesView = lazy(() => import("./BookablesView"));
const BookableEdit = lazy(() => import("./BookableEdit"));
const BookableNew = lazy(() => import("./BookableNew"));
```

## Comentarios

### Context Provider

En la App podemos observar:

```js
export default function App () {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
```

En `UserProvider` estamos enpaquetando dos context providers:

```js
export function UserProvider ({children}) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={user}>
      <UserSetContext.Provider value={setUser}>
        {children}
      </UserSetContext.Provider>
    </UserContext.Provider>
  );
}
```

Con los dos contextos proporcionamos más granularidad, podemos tener componentes que se subscriban a uno u otro, o a los dos. Para usar un contexto tendriamos que importarlo, pero en este ejemplo se incluye un nivel de abstraccion más elevado, y se crea un custom hook para acceder al contexto:

```js
export function useUser () {

  const user = useContext(UserContext);
  const setUser = useContext(UserSetContext);

  if (!setUser) {
    throw new Error("The UserProvider is missing.");
  }

  return [user, setUser];
}
```

El hook devuelve los dos contextos e implementa la lógica para comprobar la presencia de un proveedor del contexto en la jerarquía. Como indicaba antes, un componente podrá usar uno u otro contexto. Por ejemplo si queremos usar los dos:

```js
const [user, setUser] = useUser();
```

si queremos usar solo uno `user`:

```js
const [user] = useUser();
```

Cuando se actualice el valor del contexto en el proveedor, todos los componentes que lo usen - que se han subscrito -, se renderizarán (en el ejemplo anterior, si se cambiara el contexto valor del proveedor `UserSetContext` no se actualizaría el componente).

En `UserPicker` nos subscribimos a los dos contextos:

```js
import {useUser} from "./UserContext";

export default function UserPicker () {
  const [user, setUser] = useUser();

  // switch from useFetch to useQuery
  const {data: users = [], status} = useQuery(
    "users",
    () => getData("http://localhost:3001/users")
  );

  useEffect(() => {
    setUser(users[0]);
  }, [users, setUser]);

  function handleSelect (e) {
    const selectedID = parseInt(e.target.value, 10);
    const selectedUser = users.find(u => u.id === selectedID);
    setUser(selectedUser);
  }

  if (status === "loading") {
    return <Spinner/>
  }

  if (status === "error") {
    return <span>Error!</span>
  }

  return (
    <select
      className="user-picker"
      onChange={handleSelect}
      value={user?.id}
    >
      {users.map(u => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  );
}
```

El usuario que sale seleccionado por defecto es el del contexto:

```js
  return (
    <select
      className="user-picker"
      onChange={handleSelect}
      value={user?.id}
    >
```

Listamos todos los usuarios que recuperamos de la api:

```js
  return (
    <select
      className="user-picker"
      onChange={handleSelect}
      value={user?.id}
    >
      {users.map(u => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
```

Para recuperar los usuarios usamos el hook:

```js
  // switch from useFetch to useQuery
  const {data: users = [], status} = useQuery(
    "users",
    () => getData("http://localhost:3001/users")
  );
```

Una vez tenemos el array `users` el `useEffect` se actualiza:

```js
  useEffect(() => {
    setUser(users[0]);
  }, [users, setUser]);
```

de modo que actualizamos el usuario del contexto - forzando el refresco de todos los componentes que usen el contexto.

### Router

En la App creamos un router, con sus links y sus rutas:

```js
<Router>
<div className="App">
<header>
  <nav>
    <ul>
      <li>
        <Link to="/bookings" className="btn btn-header">
          <FaCalendarAlt/>
          <span>Bookings</span>
        </Link>
      </li>
...

</nav>
</header>

...

<Suspense fallback={<PageSpinner/>}>
  <Routes>
    <Route path="/bookings" element={<BookingsPage/>}/>
    <Route path="/bookables/*" element={<BookablesPage/>}/>
    <Route path="/users" element={<UsersPage/>}/>
  </Routes>
</Suspense>
```

En la ruta para el componente `BookablesPage` fijamos el path como `/bookables/*`, de forma que `/bookables/` actua de prefijo. En el componente podemos definir más rutas:

```js
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
```

Esto funciona de manera jerarquica, asi pues, una ruta como `/bookables/new` sera atendida por el componente `.BookableNew`. En `BookablesPage` podemos observar tambien como podemos usar path variables y todo tipo de patrones a la hora de definir las rutas. Router ofrece unos hooks que nos permiten navegar programticamente, acceder a las path variables o a las query strings:

- useNavigate. Retorna una función que podemos usar para navegar a una ruta
- userParams. Retorna las path variables de la ruta
- useSearchParams. Retorna los query strings, y nos permite tambien manipularlos - añadir, cambiar query keys

Por ejemplo obtenemos el `id` del path variable:

```js
export default function BookableEdit () {
  const {id} = useParams();
```

definimos un handler para navegar programáticamente (en este ejemplo, despues de hacer la llamada a la api):

```js
function useUpdateBookable () {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    item => editItem(`http://localhost:3001/bookables/${item.id}`, item),
    {
      onSuccess: bookable => {
        // replace the pre-edited version in the "bookables" cache
        // with the edited bookable
        updateBookablesCache(bookable, queryClient);

        // do the same for the individual "bookable" cache
        queryClient.setQueryData(["bookable", String(bookable.id)], bookable);

        // show the updated bookable
        navigate(`/bookables/${bookable.id}`);
      }
    }
  );
```

Veamos en este ejemplo como podemos crear custom hooks que usen los hooks proporcionados por `react-router`:

```js
export function useBookingsParams () {
  //Recupera la querystring, y una funcion que nos permite manipularla
  const [searchParams, setSearchParams] = useSearchParams();
  //Obtenemos los valores de las variables date y bookableId del querystring. Undefined si la variable no existe
  const searchDate = searchParams.get("date");
  const bookableId = searchParams.get("bookableId");

  //Obtenemos la fecha. 
  const date = isDate(searchDate)? new Date(searchDate): new Date();

  const idInt = parseInt(bookableId, 10);
  const hasId = !isNaN(idInt);

  //Creamos un handler que nos permitirá especificar la fecha en el query string - manteniendo el bookableId
  function setBookingsDate (date) {
    const params = {};

    if (hasId) {
      params.bookableId = bookableId
    }
    if (isDate(date)) {
      params.date = date
    }

    if (params.date || params.bookableId !== undefined) {
      setSearchParams(params, {replace: true});
    }
  }

  return {
    date,
    bookableId: hasId ? idInt : undefined,
    setBookingsDate
  };
}
```

### Formulario

En Bookings tenemos una serie de componentes y hooks que nos permiten crear, editar, borrar y ver bookings. Se ha creado un componente generico, `BookableForm` para proporcionar estas cuatro funcionalidades. Por ejemplo, veamos el componente que edita un booking:

```js
export default function BookableEdit () {
  const {id} = useParams();
  const {data, isLoading} = useBookable(id);
  const formState = useFormState(data);

...

  return (
    <BookableForm
      formState={formState}
      handleSubmit={handleSubmit}
      handleDelete={handleDelete}
    />
  );

```

Recupera el `id` de la path variable, busca el booking con ese id, y los datos que recupera los guarda en un hook custom, `useFormState` que guarda el estado y proporciona una serie de funciones para administralo. `useBookable` es otro hook custom que se apoya en 'fetch`:

Al formulario le pasamos el estado, y los métodos que se tendrán que usar para actualizarlo (estos métodos actualizan el estado y llaman a las apis que lo persisten en el servidor).

En el formulario hacemos el de-structuring  de datos:

```js
export default function BookableForm ({formState = {}, handleSubmit, handleDelete}) {
  const {state = {}, handleChange, handleChecked} = formState;
  const {title = "", group = "", notes = ""} = state;
  const {days = [], sessions = []} = state;

```

En los campos del formulario especificamos el estado, y los handlers que lo actualizan:

```js
  return (
    <main className="bookables-form">
      <div className="item item-form">
        <div className="item-header">
          <h2>{handleDelete ? "Edit" : "New"} Bookable</h2>
        </div>


        <label htmlFor="title" className="field">Title</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={handleChange}
        />

...

  </main>
  );
}
```

### useQuery

En `useFectch` tenemos un hook que esta diseñado para operar en modo no Suspense y que hace la llamada a la api una vez se ha renderizado el componente - en el useEffect. El hook retorna tres datos, {data, status, error}. Son _estados_ react, en los que tenemos el estado, y los datos - _data_ o _error_ según haya habido éxito o no en la llamada.

Este hook esta pensado para funcionar en modo _"no"_ suspense.

Para usar xxxx definimos un proveedor que será luego utilizado por los diferentes componentes. El proveedor aporta al hook una cache, de modo que si varios componentes, por ejemplo, hacen la misma petición, no se tenga que repetir la query varias veces.

```js
const queryClient = new QueryClient();

export default function App () {
  return (
    <QueryClientProvider client={queryClient}>
```

#### useQuery

Para hacer queries tenemos dos opciones, usando suspense o no. Si usamos supense, el hook throw un Promise cuando la Promise no se haya resuelto, un throw cuando haya un error, o los datos. En este sentido de la respuesta del hook solo nos tenemos que preocupar de capturar los datos - los throw se gestionarán en el componente _Suspense_ o en el _ErrorBoundary_. Si no usaramos suspense, ademas lo que recibiríamos del hook sería la terna.

El primer argumento de useQuery es una key. Se usará como key para el cacheado. En este ejemplo pasamos una constante, pero si la query tuviera parametros, le podríamos pasar un array con todos los valores - en el siguiente ejemplo lo veremos. El segundo parametro será una Promise:

```js
export default function BookablesView () {
  const {data: bookables = []} = useQuery(
    "bookables",
    () => getData("http://localhost:3001/bookables"),
    {
      suspense: true
    }
  );
```

Veamos otro ejemplo sin suspense:

```js
function useBookable (id) {
  const queryClient = useQueryClient();
  return useQuery(
    ["bookable", id],
    () => getData(`http://localhost:3001/bookables/${id}`),
    {
      // refetching causes problems after deleting a bookable
      refetchOnWindowFocus: false,

      initialData: queryClient
        .getQueryData("bookables")
        ?.find(b => b.id === parseInt(id, 10))
    }
  );
}
```

Aqui hay que destacar algunas cosas:
- La key es un array, en el que incluimos el _id_ que buscamos
- No usamos suspense. Podemos ver por ejemplo en los _usuarios_ de este hook como además de los datos el estado:

```js
const {data, isLoading} = useBookable(id);
```

- En este ejemplo podemos tambien apreciar como podemos usar la cache. Para usar la cache necesitamos el _queryClient_

#### useMutation

Para actualizar datos usamos este hook. Es similar al hook anterior. No aplica el concepto de key en este hook, tambien pasamos un handler que retorna una Promise, y tenemos la posibilidad de definir un callback con la respuesta del Promise. En este caso lo que haremos es actualizar la cache, y navegar a otro componente:

```js
function useUpdateBookable () {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation(
    item => editItem(`http://localhost:3001/bookables/${item.id}`, item),
    {
      onSuccess: bookable => {
        // replace the pre-edited version in the "bookables" cache
        // with the edited bookable
        updateBookablesCache(bookable, queryClient);

        // do the same for the individual "bookable" cache
        queryClient.setQueryData(["bookable", String(bookable.id)], bookable);

        // show the updated bookable
        navigate(`/bookables/${bookable.id}`);
      }
    }
  );
```

#### prefetch

Otra feature que tiene _react-query_ es la de poder simultanear la ejecución de una llamada a la api con su renderizado. Para hacer esto podemos usar _prefetchQuery_. Es muy similar al caso normal, con la excepción de que no tenemos las propiedades de Suspend/Status, ya que no aplican en este escenario. Podemos ejecutar cualquier Promise:

```js
    queryClient.prefetchQuery(["user", nextUser.id],
      () => getData(`http://localhost:3001/users/${nextUser.id}`)
    );
```

Otro ejemplo:

```js
    queryClient.prefetchQuery(`http://localhost:3001/img/${nextUser.img}`,
      () => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = `http://localhost:3001/img/${nextUser.img}`;
      })
    );
  }
```

### Grid

Cada celdilla es un tag _td_:

```js
  function cell (session, date) {
    const cellData = bookings?.[session]?.[date]
      || grid[session][date];

    const isSelected = booking?.session === session
      && booking?.date === date;

    return (
      <td
        key={date}
        className={isSelected ? "selected" : null}
        onClick={
          status === "success"
            ? () => setBooking(cellData)
            : null
        }
      >
        {cellData.title}
      </td>
    );
  }
```

y la grid es un componente _table_:

```js
      <table
        className={
          status === "success"
            ? "bookingsGrid active"
            : "bookingsGrid"
        }
      >
        <thead>
        <tr>
          <th>
            <span className="status">
              <Spinner/>
            </span>
          </th>
          {dates.map(d => (
            <th key={d}>
              {(new Date(d)).toDateString()}
            </th>
          ))}
        </tr>
        </thead>

        <tbody>
        {sessions.map(session => (
          <tr key={session}>
            <th>{session}</th>
            {dates.map(date => cell(session, date))}
          </tr>
        ))}
        </tbody>
      </table>
```

### Suspense

El componente suspense se encarga de capturar Promises y mostrar una visión alternativa. Cuando usamos lazy, el método _lazy_ retorna una promise que se resuelve cuando el módulo se ha cargado. Cuando usamos _useQuery_ en modo suspense, cuando la promise no se ha resuelto se retorna una Promise.

#### useTransition

Este hook nos permite informar a react que hay cambios en la UI que no son tan urgentes de aplicar, de modo que en caso de que haya algun bloqueo en el renderizado, se desprioricen estos cambios. 

```js
const [startTransition, isPending] = useTransition({
  timeoutMs: 3000
});
```

con el método _startTransition_ podemos pasar una función, y los cambios de estado que se _motiven_ en la función serán no prioritarios:

```js
function handleClick () {
  startTransition(onClick);
}
```

En este ejemplo _onClick_ provocará cambios _no urgentes_.

Con _isPending_ podremos pintar la información con alguna clase que le indique al usuario que los datos que está viendo son "obsoletos".

#### useDeferredValue

Con este hook lo que hacemos es indicar a react que queremos tener el valor anterior de un campo. En este ejemplo el estado _user_ va a ser _trackeado_. En este ejemplo _deferredUser_ tendrá el valor anterior a que se dispare el cambio. Es decir, en _user_ tendremos el valor final, y en _deferredUser_ el valor inicial:

```js
const deferredUser = useDeferredValue(user) || user;
```

Podemos así podremos renderizar el componente con el valor anterior mientras se prepara - simultáneamente - la nueva UI del componente. Este flag nos permite determinar si el proceso no ha terminado aún:

```js
const isPending = deferredUser !== user;
```

Con _isPending_ podremos pintar la información con alguna clase que le indique al usuario que los datos que está viendo son "obsoletos".

#### SuspenseList

SuspenseList es una feature experimental en react 18. Lo que hace agrupar varios suspense de forma que les podamos dotar de un comportamiento de conjunto. Si tenemos

```js
  <Suspense fallback={<p>Loading user bookings...</p>}>
    <UserBookings id={userID} />
  </Suspense>

  <Suspense fallback={<p>Loading user todos...</p>}>
    <UserTodos id={userID} />
  </Suspense>
```

veremos eventualmente dos spinners, un por cada componente. Si no queremos que sea "una fiesta", podemos usar _SuspenseList_. Los suspense que agrupemos bajo un _SuspenseList_ podemos configurarlos para que se muestren de arriba a abajo, de abajo arriba - en este ejemplo de arriba a abajo. Significa esto que en tanto en cuanto _UserBookings_ no se resuelva, veremos su spinner, pero no le de otros Suspense de la lista. Cuando se resuelva _UserBookings_, se mostrará el siguiente suspense - o su failback -, y así sucesivamente. Esto esta implementado en _UsersDetails.js_, pero lo he quitado al ser una feature experimental.

```js
<SuspenseList revealOrder="forwards" >
  <Suspense fallback={<p>Loading user bookings...</p>}>
    <UserBookings id={userID} />
  </Suspense>

  <Suspense fallback={<p>Loading user todos...</p>}>
    <UserTodos id={userID} />
  </Suspense>
</SuspenseList>
```

### Error Boundary

Con el ErrorBoundary gestionamos las excepciones que los componentes throw. Para personalizar el ErrorBoundary tendremos que crear una clase, al "antiguo" estílo. Podemos verlo en `ErrorBoudary.js`.