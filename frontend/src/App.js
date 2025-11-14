import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import Login from './components/accounts/Login';
import Profile from './components/accounts/Profile';
import WithPrivateRoute from './utils/WithPrivateRoute';
import ChatLayout from './components/layouts/ChatLayout';
import Header from './components/layouts/Header';
import ErrorMessage from './components/layouts/ErrorMessage';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          {/* 🌸 Full-screen Background */}
          <div
            className="fixed inset-0 bg-center bg-cover z-0"
            style={{
              backgroundImage: "url('/CU5.jpg')", // Make sure the file exists in /public
            }}
          ></div>

          {/* 🌸 Overlay with Blur Effect */}
          <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-30 dark:bg-opacity-50 z-10"></div>

          {/* 🌸 Header */}
          <header className="fixed top-0 left-0 w-full z-50">
            <Header />
          </header>

          {/* 🌸 Main Content */}
          <div className="relative z-20 pt-[4.5rem] h-screen overflow-hidden">
            <ErrorMessage />
            <Routes>
              <Route exact path="/login" element={<Login />} />
              <Route
                exact
                path="/profile"
                element={
                  <WithPrivateRoute>
                    <Profile />
                  </WithPrivateRoute>
                }
              />
              <Route
                exact
                path="/"
                element={
                  <WithPrivateRoute>
                    <ChatLayout />
                  </WithPrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
