import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ConfigProvider, theme } from 'antd';
import App from './App.tsx';
import './index.css';

ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
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
            headerBg: '#141414',
            siderBg: '#141414',
            bodyBg: '#000000',
          },
          Card: {
            colorBgContainer: '#141414',
            colorBorderSecondary: '#303030',
            colorBorder: '#303030',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
