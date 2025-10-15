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
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AntApp>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: collapsed ? "18px" : "20px",
              fontWeight: "bold",
              transition: "all 0.2s",
            }}
          >
            {collapsed ? "PF" : "Process First"}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onSelect={({ key }) => setSelectedKey(key)}
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
              background: colorBgContainer,
              display: "flex",
              alignItems: "center",
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
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "normal" }}>
              Process First LLC - Dashboard
            </h1>
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
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
