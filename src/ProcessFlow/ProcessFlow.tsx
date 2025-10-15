import {
  ApartmentOutlined,
  BranchesOutlined,
  DeleteOutlined,
  DotChartOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  TableOutlined,
} from "@ant-design/icons";
import type { CellValueChangedEvent, ColDef, GridApi } from "ag-grid-community";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Grid,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import FlowCanvas from "../components/FlowCanvas";
import PaginatedTable from "../components/PaginatedTable";
import { useTheme } from "../contexts/ThemeContext";

const { Title } = Typography;

export type Node = {
  id: string;
  name: string;
  type: "type1" | "type2" | "type3";
};

export type Edge = {
  id: string;
  upstreamNode: string;
  downstreamNode: string;
};

export default function ProcessFlow() {
  const { message } = App.useApp();
  const { theme } = useTheme();
  const screens = Grid.useBreakpoint();
  const isDark = theme === 'dark';

  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", name: "Reactor A", type: "type1" },
    { id: "2", name: "Mixer B", type: "type2" },
    { id: "3", name: "Filter C", type: "type3" },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { id: "1", upstreamNode: "Reactor A", downstreamNode: "Mixer B" },
    { id: "2", upstreamNode: "Mixer B", downstreamNode: "Filter C" },
  ]);

  const nodeGridApiRef = useRef<GridApi<Node> | null>(null);
  const edgeGridApiRef = useRef<GridApi<Edge> | null>(null);

  const nodeColumns: ColDef<Node>[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      maxWidth: 50,
      suppressHeaderMenuButton: true,
      resizable: false,
    },
    { field: "name", headerName: "Name", editable: true },
    {
      field: "type",
      headerName: "Type",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["type1", "type2", "type3"],
      },
    },
  ];

  const edgeColumns: ColDef<Edge>[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      maxWidth: 50,
      suppressHeaderMenuButton: true,
      resizable: false,
    },
    {
      field: "upstreamNode",
      headerName: "Upstream Node",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: nodes.map((n) => n.name),
      },
    },
    {
      field: "downstreamNode",
      headerName: "Downstream Node",
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: nodes.map((n) => n.name),
      },
    },
  ];

  const handleCellValueChanged = <T extends { id: string }>(
    event: CellValueChangedEvent<T>,
    setState: Dispatch<SetStateAction<T[]>>
  ) => {
    const updatedItem = event.data;
    setState((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleAddNode = () => {
    const newId = String(Math.max(0, ...nodes.map((n) => parseInt(n.id))) + 1);
    const newNode: Node = {
      id: newId,
      name: `New Node ${newId}`,
      type: "type1",
    };
    setNodes([...nodes, newNode]);
    message.success("Node added successfully!");
  };

  const handleAddEdge = () => {
    const newId = String(Math.max(0, ...edges.map((e) => parseInt(e.id))) + 1);
    const defaultNode = nodes.length > 0 ? nodes[0].name : "";
    const newEdge: Edge = {
      id: newId,
      upstreamNode: defaultNode,
      downstreamNode: defaultNode,
    };
    setEdges([...edges, newEdge]);
    message.success("Edge added successfully!");
  };

  const handleRemoveNode = () => {
    if (!nodeGridApiRef.current) {
      message.error("Grid not ready. Please try again.");
      return;
    }

    const selectedNodes = nodeGridApiRef.current.getSelectedRows();

    if (selectedNodes.length === 0) {
      message.warning("Please select at least one node to remove");
      return;
    }

    const deletedNodeNames = selectedNodes.map((node) => node.name);

    const remainingNodes = nodes.filter(
      (node) => !selectedNodes.find((selected) => selected.id === node.id)
    );
    setNodes(remainingNodes);

    const remainingEdges = edges.filter(
      (edge) =>
        !deletedNodeNames.includes(edge.upstreamNode) &&
        !deletedNodeNames.includes(edge.downstreamNode)
    );
    setEdges(remainingEdges);

    message.success(`${selectedNodes.length} node(s) removed successfully!`);
  };

  const handleRemoveEdge = () => {
    if (!edgeGridApiRef.current) {
      message.error("Grid not ready. Please try again.");
      return;
    }

    const selectedEdges = edgeGridApiRef.current.getSelectedRows();

    if (selectedEdges.length === 0) {
      message.warning("Please select at least one edge to remove");
      return;
    }

    const remainingEdges = edges.filter(
      (edge) => !selectedEdges.find((selected) => selected.id === edge.id)
    );
    setEdges(remainingEdges);

    message.success(`${selectedEdges.length} edge(s) removed successfully!`);
  };

  return (
    <div>
      <Title
        level={2}
        style={{
          marginBottom: '24px',
          fontWeight: 600,
          fontSize: screens.md ? '28px' : '24px',
          color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
        }}
      >
        Process Flow Visualization
      </Title>

      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Total Nodes"
              value={nodes.length}
              prefix={<NodeIndexOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Total Edges"
              value={edges.length}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable>
            <Statistic
              title="Node Types"
              value={new Set(nodes.map((n) => n.type)).size}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Space>
          <TableOutlined />
          <span>Data Tables</span>
        </Space>
      </Divider>

      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} xl={12}>
          <Card
            title="Node Table"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNode}
                >
                  Add Node
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveNode}
                >
                  Remove
                </Button>
              </Space>
            }
          >
            <PaginatedTable
              columnDefs={nodeColumns}
              rowData={nodes}
              onCellValueChanged={(event) =>
                handleCellValueChanged(event, setNodes)
              }
              rowSelection="multiple"
              onGridReady={(event) => (nodeGridApiRef.current = event.api)}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title="Edge Table"
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddEdge}
                >
                  Add Edge
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveEdge}
                >
                  Remove
                </Button>
              </Space>
            }
          >
            <PaginatedTable
              columnDefs={edgeColumns}
              rowData={edges}
              onCellValueChanged={(event) =>
                handleCellValueChanged(event, setEdges)
              }
              rowSelection="multiple"
              onGridReady={(event) => (edgeGridApiRef.current = event.api)}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">
        <Space>
          <DotChartOutlined />
          <span>Interactive Graph</span>
        </Space>
      </Divider>

      <Card>
        <FlowCanvas nodes={nodes} edges={edges} />
      </Card>
    </div>
  );
}
