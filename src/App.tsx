import {
  DashboardOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import { Layout, Menu, theme, App as AntApp, Button, Tooltip } from "antd";
import { useState } from "react";
import ProcessFlow from "./ProcessFlow/ProcessFlow";
import ReportGenerator from "./components/ReportGenerator";
import { useTheme } from "./contexts/ThemeContext";

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");
  const { theme: themeMode, toggleTheme } = useTheme();

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const isDark = themeMode === 'dark';

  return (
    <AntApp>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: isDark ? "#141414" : "#001529",
            borderRight: isDark ? "1px solid #434343" : "none",
          }}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: collapsed ? "16px" : "18px",
              fontWeight: "600",
              transition: "all 0.2s",
              borderBottom: isDark ? "1px solid #434343" : "1px solid rgba(255, 255, 255, 0.1)",
              letterSpacing: collapsed ? "0px" : "0.5px",
            }}
          >
            {collapsed ? "PF" : "Process First"}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onSelect={({ key }) => setSelectedKey(key)}
            style={{
              background: isDark ? "#141414" : "#001529",
              border: "none",
            }}
            items={[
              {
                key: "1",
                icon: <DashboardOutlined />,
                label: "Process Flow",
              },
              {
                key: "2",
                icon: <LineChartOutlined />,
                label: "Reports",
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: "0 24px 0 0",
              background: isDark ? "#141414" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: isDark ? "1px solid #434343" : "1px solid #f0f0f0",
              boxShadow: isDark ? "0 2px 8px rgba(0, 0, 0, 0.45)" : "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "18px",
                  width: 64,
                  height: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "600",
                  color: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)",
                  letterSpacing: "0.3px",
                }}
              >
                Dashboard
              </h1>
            </div>
            <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              <Button
                type="text"
                icon={isDark ? <BulbOutlined /> : <BulbFilled />}
                onClick={toggleTheme}
                style={{
                  fontSize: "18px",
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#faad14" : "#1890ff",
                }}
              />
            </Tooltip>
          </Header>
          <Content
            style={{
              margin: "24px",
              padding: "32px",
              minHeight: 280,
              background: isDark ? "#141414" : "#ffffff",
              borderRadius: borderRadiusLG,
              border: isDark ? "1px solid #434343" : "1px solid #f0f0f0",
            }}
          >
            {selectedKey === "1" && <ProcessFlow />}
            {selectedKey === "2" && <ReportGenerator />}
          </Content>
        </Layout>
      </Layout>
    </AntApp>
  );
}

export default App;
