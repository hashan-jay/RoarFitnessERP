/**
 * Shell layout for public marketing pages: header, animated main outlet, footer.
 * Role: Public layout.
 */
import { AnimatePresence } from 'framer-motion';

import { Outlet, useLocation } from 'react-router-dom';

import { Header } from './Header';

import { Footer } from './Footer';

import { PageTransition } from './motion';



export function PublicLayout() {

  const location = useLocation();



  return (

    <div className="app-layout">

      <Header />

      <main className="app-layout__main">

        <AnimatePresence mode="wait">

          <PageTransition routeKey={location.pathname}>

            <Outlet />

          </PageTransition>

        </AnimatePresence>

      </main>

      <Footer />

    </div>

  );

}


