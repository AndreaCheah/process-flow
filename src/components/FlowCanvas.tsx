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
import type { Edge, Node } from "../ProcessFlow/ProcessFlow";

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export default function FlowCanvas({ nodes, edges }: FlowCanvasProps) {
  const flowNodes: FlowNode[] = useMemo(() => {
    return nodes.map((node, index) => {
      const x = (index % 3) * 250 + 100;
      const y = Math.floor(index / 3) * 150 + 50;

      const colorMap = {
        type1: "#1890ff",
        type2: "#52c41a",
        type3: "#722ed1",
      };

      return {
        id: node.id,
        position: { x, y },
        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "bold" }}>{node.name}</div>
              <div style={{ fontSize: "11px", color: "#666" }}>{node.type}</div>
            </div>
          ),
        },
        style: {
          background: colorMap[node.type],
          color: "white",
          border: "2px solid white",
          borderRadius: "8px",
          padding: "10px",
          width: 150,
          fontSize: "12px",
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
          style: { stroke: "#1890ff", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#1890ff",
          },
          label: "→",
          labelStyle: { fontSize: 12, fontWeight: "bold" },
          labelBgStyle: { fill: "#fff" },
        };
      })
      .filter(Boolean) as FlowEdge[];
  }, [edges, nodes]);

  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(flowNodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(flowEdges);

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
          background: "#f5f5f5",
          borderRadius: "8px",
          color: "#999",
        }}
      >
        No nodes to display. Add some nodes to see the graph visualization.
      </div>
    );
  }

  return (
    <div
      style={{
        height: "500px",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const style = node.style as any;
            return style?.background || "#1890ff";
          }}
          style={{
            background: "#f5f5f5",
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
