import Login from "../pages/Login";
import Registration from "../pages/Registration";
import Chat from "../components/Chat";




export const appRoutes = [
    {id: 1, path: '/login', element: <Login/>, exact: true},
    {id: 2, path: '/signup', element: <Registration/>, exact: true},
    {id: 3, path: '/main', element: <Chat/>, exact: true},
]