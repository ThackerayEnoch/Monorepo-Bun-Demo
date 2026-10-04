import { RouterProvider } from "react-router";
import {router} from "@web/router/router"

function App(): React.ReactNode {
  return <RouterProvider router={router} />
}

export default App;
