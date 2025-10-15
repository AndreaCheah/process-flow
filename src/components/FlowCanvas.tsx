import { useEffect, useMemo } from "react";
import ReactFlow, {
  type Edge as FlowEdge,
  type Node as FlowNode,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTheme } from "../contexts/ThemeContext";
import type { Edge, Node } from "../pages/ProcessFlow";

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export default function FlowCanvas({ nodes, edges }: FlowCanvasProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const flowNodes: FlowNode[] = useMemo(() => {
    return nodes.map((node, index) => {
      const x = (index % 3) * 250 + 100;
      const y = Math.floor(index / 3) * 150 + 50;

      const colorMap = {
        type1: "#1890ff",
        type2: "#52c41a",
        type3: "#722ed1",
      };

      const borderColorMap = {
        type1: "#40a9ff",
        type2: "#73d13d",
        type3: "#9254de",
      };

      return {
        id: node.id,
        position: { x, y },
        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "600", fontSize: "13px" }}>
                {node.name}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.65)",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {node.type}
              </div>
            </div>
          ),
        },
        style: {
          background: colorMap[node.type],
          color: "rgba(255, 255, 255, 0.95)",
          border: `2px solid ${borderColorMap[node.type]}`,
          borderRadius: "8px",
          padding: "12px",
          width: 160,
          fontSize: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        },
      };
    });
  }, [nodes]);

  const flowEdges: FlowEdge[] = useMemo(() => {
    return edges
      .map((edge) => {
        const sourceNode = nodes.find((n) => n.name === edge.upstreamNode);
        const targetNode = nodes.find((n) => n.name === edge.downstreamNode);

        if (!sourceNode || !targetNode) {
          return null;
        }

        return {
          id: edge.id,
          source: sourceNode.id,
          target: targetNode.id,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#40a9ff", strokeWidth: 2.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#40a9ff",
          },
          label: "→",
          labelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            fill: "rgba(255, 255, 255, 0.85)",
          },
          labelBgStyle: { fill: "#1f1f1f", fillOpacity: 0.9 },
        };
      })
      .filter(Boolean) as FlowEdge[];
  }, [edges, nodes]);

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] =
    useNodesState(flowNodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] =
    useEdgesState(flowEdges);

  useEffect(() => {
    setReactFlowNodes(flowNodes);
  }, [flowNodes, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(flowEdges);
  }, [flowEdges, setReactFlowEdges]);

  if (nodes.length === 0) {
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#0a0a0a" : "#f5f5f5",
          borderRadius: "8px",
          color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)",
          border: isDark ? "1px solid #434343" : "1px solid #d9d9d9",
        }}
      >
        No nodes to display. Add some nodes to see the graph visualization.
      </div>
    );
  }

  return (
    <div
      style={{
        height: "550px",
        border: isDark ? "1px solid #434343" : "1px solid #d9d9d9",
        borderRadius: "8px",
        overflow: "hidden",
        background: isDark ? "#0a0a0a" : "#fafafa",
      }}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        style={{
          background: isDark ? "#0a0a0a" : "#fafafa",
        }}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const style = node.style as any;
            return style?.background || "#1890ff";
          }}
          style={{
            background: isDark ? "#141414" : "#ffffff",
            border: isDark ? "1px solid #434343" : "1px solid #d9d9d9",
          }}
          maskColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.1)"}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color={isDark ? "#434343" : "#e0e0e0"}
          style={{ background: isDark ? "#0a0a0a" : "#fafafa" }}
        />
      </ReactFlow>
    </div>
  );
}
