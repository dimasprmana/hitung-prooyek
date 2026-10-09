import { useState } from 'react'
import { NavLink } from 'react-router'
import {
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

import BrandLogo from './BrandLogo'
import { useAuth } from '../context/useAuth'
import '../styles/header-auth.css'

const navItems = [
  {
    label: 'Beranda',
    path: '/',
    end: true,
  },
  {
    label: 'Hitung',
    path: '/hitung',
  },
  {
    label: 'Proyek',
    path: '/proyek',
  },
  {
    label: 'Material',
    path: '/material',
  },
]

function Header() {
  const { user, logout } = useAuth()

  const isUserLoggedIn = user?.role === 'user'

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const [logoutOpen, setLogoutOpen] =
    useState(false)

  const [loggingOut, setLoggingOut] =
    useState(false)

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  function openLogoutConfirm() {
    closeMobileMenu()
    setLogoutOpen(true)
  }

  function closeLogoutConfirm() {
    if (loggingOut) return

    setLogoutOpen(false)
  }

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    try {
      await logout()

      setLogoutOpen(false)

      window.location.href = '/login'
    } catch (error) {
      console.error('Logout gagal:', error)

      setLoggingOut(false)
      setLogoutOpen(false)
    }
  }

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="site-header">

        {/* =================================================
            HEADER INNER
        ================================================= */}

        <div className="header-inner">

          {/* =================================================
              BRAND
          ================================================= */}

          <NavLink
            to="/"
            className="header-brand"
            aria-label="HitungProyek"
            onClick={closeMobileMenu}
          >
            <BrandLogo />
          </NavLink>


          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav
            className="main-nav"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? 'nav-link-active'
                      : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>


          {/* =================================================
              DESKTOP USER / AUTH
          ================================================= */}

          <div className="header-right">

            {isUserLoggedIn ? (
              <NavLink
                to="/profil"
                className={({ isActive }) =>
                  `header-profile-link ${
                    isActive
                      ? 'header-profile-active'
                      : ''
                  }`
                }
                aria-label="Buka profil saya"
              >

                {/* AVATAR */}

                <span className="header-user-avatar">

                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                    />
                  ) : (
                    <span>
                      {user.name
                        ?.charAt(0)
                        ?.toUpperCase() || 'U'}
                    </span>
                  )}

                </span>


                {/* USER INFO */}

                <span className="header-user-copy">

                  <strong>
                    {user.name || 'User'}
                  </strong>

                  <small>
                    User
                  </small>

                </span>


                {/* ARROW */}

                <ChevronRight
                  className="header-profile-arrow"
                  size={17}
                />

              </NavLink>
            ) : (

              /* LOGIN / REGISTER */

              <div className="header-auth-actions">

                <NavLink
                  to="/login"
                  className="header-login-button"
                >
                  Masuk
                </NavLink>

                <NavLink
                  to="/register"
                  className="header-register-button"
                >
                  Daftar
                </NavLink>

              </div>
            )}

          </div>


          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current
              )
            }
            aria-label={
              mobileMenuOpen
                ? 'Tutup menu'
                : 'Buka menu'
            }
            aria-expanded={mobileMenuOpen}
          >

            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>

        </div>


        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <div
          className={`mobile-menu ${
            mobileMenuOpen
              ? 'mobile-menu-open'
              : ''
          }`}
        >

          <nav
            className="mobile-menu-list"
            aria-label="Navigasi mobile"
          >

            {/* NAVIGATION */}

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `mobile-menu-link ${
                    isActive
                      ? 'mobile-menu-link-active'
                      : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}


            {/* =================================================
                USER MENU
            ================================================= */}

            {isUserLoggedIn && (
              <>

                {/* PROFILE */}

                <NavLink
                  to="/profil"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `mobile-menu-link ${
                      isActive
                        ? 'mobile-menu-link-active'
                        : ''
                    }`
                  }
                >
                  Profil
                </NavLink>


                {/* LOGOUT */}

                <button
                  type="button"
                  className="mobile-menu-logout"
                  onClick={openLogoutConfirm}
                >
                  <LogOut size={17} />

                  <span>
                    Keluar
                  </span>
                </button>

              </>
            )}


            {/* =================================================
                MOBILE LOGIN / REGISTER
            ================================================= */}

            {!isUserLoggedIn && (
              <div className="mobile-auth-actions">

                <NavLink
                  to="/login"
                  className="mobile-login-button"
                  onClick={closeMobileMenu}
                >
                  Masuk
                </NavLink>

                <NavLink
                  to="/register"
                  className="mobile-register-button"
                  onClick={closeMobileMenu}
                >
                  Daftar
                </NavLink>

              </div>
            )}

          </nav>

        </div>

      </header>


      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {logoutOpen && (

        <div
          className="header-logout-overlay"
          onMouseDown={closeLogoutConfirm}
        >

          <div
            className="header-logout-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              className="header-logout-close"
              onClick={closeLogoutConfirm}
              disabled={loggingOut}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>


            {/* ICON */}

            <div className="header-logout-icon">
              <LogOut size={24} />
            </div>


            {/* TITLE */}

            <h2>
              Keluar dari akun?
            </h2>


            {/* DESCRIPTION */}

            <p>
              Apakah Anda yakin ingin
              keluar dari akun
              HitungProyek?
            </p>


            {/* ACTIONS */}

            <div className="header-logout-actions">

              {/* CANCEL */}

              <button
                type="button"
                className="header-logout-cancel"
                onClick={closeLogoutConfirm}
                disabled={loggingOut}
              >
                Batal
              </button>


              {/* CONFIRM */}

              <button
                type="button"
                className="header-logout-confirm"
                onClick={handleLogout}
                disabled={loggingOut}
              >

                <LogOut size={16} />

                {loggingOut
                  ? 'Keluar...'
                  : 'Keluar'}

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  )
}

export default Header