import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 기존 라우트들 */}
          </Routes>
        </Layout>
      </AuthProvider>
    </HelmetProvider>
  );
} 