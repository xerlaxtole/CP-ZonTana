import { LogoutIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logout from '../accounts/Logout';

import { useChat } from '../../contexts/ChatContext';

export default function Header() {
  const [modal, setModal] = useState(false);

  const { currentUser } = useChat();

  return (
    <>
      <nav className="px-2 sm:px-4 py-2.5 bg-pink-50 border-pink-200 dark:bg-pink-900 dark:border-pink-700 text-gray-900 text-sm rounded border dark:text-white shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Zontana Logo" className="h-10 w-10 " />
            <span className="self-center text-lg font-bold whitespace-nowrap text-pink-700 dark:text-white">
              ZonTana
            </span>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 md:order-2">        

            {currentUser && (
              <>
                <button
                  className="text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-800 focus:outline-none rounded-lg text-sm p-2.5 transition"
                  onClick={() => setModal(true)}
                >
                  <LogoutIcon className="h-8 w-8" aria-hidden="true" />
                </button>

                <Link
                  to="/profile"
                  className="text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-800 focus:outline-none rounded-full text-sm p-2.5 transition"
                >
                  <img
                    className="h-8 w-8 rounded-full border-2 border-pink-400 dark:border-pink-300"
                    src={currentUser.avatar}
                    alt=""
                  />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {modal && <Logout modal={modal} setModal={setModal} />}
    </>
  );
}
