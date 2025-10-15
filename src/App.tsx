import {
  DashboardOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, App as AntApp } from "antd";
import { useState } from "react";
import ProcessFlow from "./ProcessFlow/ProcessFlow";
import ReportGenerator from "./components/ReportGenerator";

const { Header, Sider, Content } = Layout;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("1");

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  return (
    <AntApp>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: "#141414",
            borderRight: "1px solid #434343",
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
              borderBottom: "1px solid #434343",
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
              background: "#141414",
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
              padding: 0,
              background: "#141414",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #434343",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.45)",
            }}
          >
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
                color: "rgba(255, 255, 255, 0.85)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
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
                color: "rgba(255, 255, 255, 0.85)",
                letterSpacing: "0.3px",
              }}
            >
              Dashboard
            </h1>
          </Header>
          <Content
            style={{
              margin: "24px",
              padding: "32px",
              minHeight: 280,
              background: "#141414",
              borderRadius: borderRadiusLG,
              border: "1px solid #434343",
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
