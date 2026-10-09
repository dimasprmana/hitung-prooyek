import { Outlet } from 'react-router'
import Header from '../components/Header'

function UserLayout() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default UserLayout