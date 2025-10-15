import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ConfigProvider, theme } from 'antd';
import App from './App.tsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './index.css';

ModuleRegistry.registerModules([AllCommunityModule]);

function ThemedApp() {
  const { theme: themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          Layout: {
            headerBg: isDark ? '#141414' : '#ffffff',
            siderBg: isDark ? '#141414' : '#001529',
            bodyBg: isDark ? '#000000' : '#f0f2f5',
          },
          Card: {
            colorBgContainer: isDark ? '#141414' : '#ffffff',
            colorBorderSecondary: isDark ? '#303030' : '#d9d9d9',
            colorBorder: isDark ? '#303030' : '#d9d9d9',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </StrictMode>,
)
