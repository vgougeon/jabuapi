import { AppShell, Navbar, Header, ThemeIcon, Space, Burger, Tooltip, Alert } from '@mantine/core'
import { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { useObservable } from 'react-use';
import { Home, Versions, Ticket, UserCheck, Settings, Planet, AccessPoint, Refresh, UserCircle, CalendarTime, AlertCircle, Moon, Sun, Seeding } from 'tabler-icons-react';
import appService from './services/app.service';
import Collection from './views/Collections';
import Dashboard from './views/Dashboard';
import cx from 'classnames';
import { AnimateSharedLayout, motion } from 'framer-motion';
import CollectionInsert from './views/CollectionInsert';
import ApiDoc, { ApiDocDefault } from './views/ApiDoc';
import ApiDocTypes from './views/ApiDocTypes';
import Seeder from './views/Seeder';

const data = [
  { icon: <Home size={24} />, color: 'blue', label: 'Dashboard', url: '/', isActive: (pathname) => pathname === '/' },
  { icon: <Versions size={24} />, color: 'blue', label: 'Collections', url: '/collections', isActive: (pathname) => pathname.startsWith('/collections') },
  { icon: <Planet size={24} />, color: 'blue', label: 'API', url: '/api-doc', isActive: (pathname) => pathname.startsWith('/api-doc') },
  { icon: <Seeding size={24} />, color: 'blue', label: 'Seeding', url: '/seeding', isActive: (pathname) => pathname.startsWith('/seeding') },
  { icon: <UserCheck size={24} />, color: 'blue', label: 'Roles', url: '/roles', isActive: (pathname) => pathname.startsWith('/roles') },
  { icon: <CalendarTime size={24} />, color: 'blue', label: 'CRON', url: '/cron', isActive: (pathname) => pathname.startsWith('/cron') },
  { icon: <Ticket size={24} />, color: 'blue', label: 'Board', url: '/board', isActive: (pathname) => pathname.startsWith('/board') },
  { icon: <Settings size={24} />, color: 'blue', label: 'Settings', url: '/settings', isActive: (pathname) => pathname.startsWith('/settings') },
];

function CustomNavbar({ open }) {
  const location = useLocation()
  const theme = useObservable(appService.theme)
  return (
    <Navbar hiddenBreakpoint="sm" className='overflow-hidden transition-all duration-200 dark:bg-slate-800 dark:border-gray-700' hidden={!open} width={{ base: '4rem' }} height={'100vh'}>
      <div className="h-16 w-full border-b border-gray-200 dark:border-gray-700 flex items-center justify-center text-pink-400">
        <AccessPoint size={46} />
      </div>
      <Navbar.Section grow mt="md" className='mt-4'>
        <AnimateSharedLayout>
          <div className="flex flex-col space-y-1">
            {data.map(item =>
              <Tooltip
                label={item.label}
                position="right"
                color={'gray'}
                withArrow
                key={item.label}
              >
                <Link to={item.url}>
                  <div className="flex items-center">
                    <div className="w-16 flex justify-center shrink-0 relative">
                      <div className={cx("w-12 rounded-full h-12 flex items-center justify-center z-10",
                        { "text-blue-500 dark:text-blue-400": item.isActive(location.pathname) },
                        { "text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:dark:text-blue-500": !item.isActive(location.pathname) })}>
                        {item.icon}
                      </div>
                      {item.isActive(location.pathname) && (
                        <motion.div className="w-12 h-12 absolute left-2 top-0 rounded-full bg-blue-50 dark:bg-slate-900 z-0" layoutId='active'>
                        </motion.div>
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                </Link>
              </Tooltip>
            )}
          </div>
        </AnimateSharedLayout>
      </Navbar.Section>
      <div className="w-full flex flex-col space-y-1 pb-2">
        <div className="flex items-center">
          <div className="w-16 flex justify-center shrink-0 relative">
            <div onClick={() => appService.toggleTheme()}
              className="cursor-pointer w-12 rounded-full h-12 flex items-center justify-center z-10 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-gray-50 hover:dark:bg-gray-900">
              {theme === 'light' ? <Moon size={26} /> : <Sun size={26} />}
            </div>
          </div>
          <span>OFF</span>
        </div>
        <div className="flex items-center">
          <div className="w-16 flex justify-center shrink-0 relative">
            <div className="w-12 rounded-full h-12 flex items-center justify-center z-10 text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-gray-50 hover:dark:bg-gray-900">
              <UserCircle size={26} />
            </div>
          </div>
          <span>OFF</span>
        </div>
      </div>
    </Navbar>
  )
}

function CustomHeader({ open, toggle }) {
  return (
    <Header height={80} p="sm">
      <div className="h-full flex justify-between items-center">
        <div className="flex items-center text-blue-600">
          <Burger opened={open} onClick={() => toggle()} className='md:hidden' />
          <Space px="xs" />
          <h2 className="font-extrabold italic text-xl">GENI</h2>
          <h2 className="text-xl">API</h2>
        </div>
        <ThemeIcon />
      </div>
    </Header>
  )
}

function App() {
  const [open, setOpen] = useState(false)
  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint="sm"
      navbar={<CustomNavbar open={open} />}
      className='bg-white'
    >
      <div className='h-screen relative'>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/collections/" element={<Collection />} />
          <Route path="/seeding/" element={<Seeder />} />
          <Route path="/api-doc/" element={<ApiDoc />}>
            <Route path="typescript" element={<ApiDocTypes />} />
            <Route path=":collection" element={<ApiDocDefault />} />
            <Route index element={<ApiDocDefault />} />
          </Route>
          <Route path="/collections/:collection" element={<Collection />} />
          <Route path="/collections/:collection/insert" element={<CollectionInsert />} />
          <Route path="/collections/:collection/edit/:id" element={<CollectionInsert />} />
        </Routes>
      </div>
    </AppShell>
  );
}



export default App;
