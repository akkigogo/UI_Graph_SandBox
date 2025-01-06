import React, { useEffect, useRef, useState } from 'react';
import { Graph, Node, Link } from './types';
import { NODE_RADIUS } from './const';
import { getAdjustedCoordinates, calculateFontSize } from './util';

type GraphProps = {
  graph: Graph;
  onMouseDown: (e: React.MouseEvent<SVGCircleElement>, node: Node) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  deleteLink: (link : Link) => void;
};

const GraphComponent: React.FC<GraphProps> = ({ graph, onMouseMove, onMouseUp, onMouseDown, deleteLink }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('mousemove', onMouseMove);
    svg.addEventListener('mouseup', onMouseUp);

    return () => {
      svg.removeEventListener('mousemove', onMouseMove);
      svg.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  const handleLinkClick = (link: Link, e: React.MouseEvent) => {
    setSelectedLink(link); // 辺を選択状態にする
  };

  const calculateTrashIconPosition = (link: Link): { x: number; y: number } | null => {
    const sourceNode = graph.nodes.find((node) => node.id === link.source);
    const targetNode = graph.nodes.find((node) => node.id === link.target);
    if (sourceNode && targetNode) {
      // 矢印の右上にゴミ箱を配置する座標を計算
      const { x1, y1, x2, y2 } = getAdjustedCoordinates(sourceNode, targetNode);
      const x = (x1 + x2) / 2;
      const y = (y1 + y2) / 2;
      return {x, y};
    }
    return null;
  }

  const trashIconPosition = selectedLink ? calculateTrashIconPosition(selectedLink) : null;

  const handleTrashIconClick = () => {
    if (selectedLink) {
      deleteLink(selectedLink);
      setSelectedLink(null); // 選択を解除
    }
  };

  return (
    <svg ref={svgRef} width="1800" height="600">
        {/* 矢印マーカーの定義 */}
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="10" /* 矢印の位置を調整 */
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="black" />
        </marker>
      </defs>

      <defs>
        <marker
          id="arrow-red"
          markerWidth="10"
          markerHeight="10"
          refX="10" /* 矢印の位置を調整 */
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill="red" />
        </marker>
      </defs>

      

      {graph.links.map((link, index) => {
        const sourceNode = graph.nodes.find((node) => node.id === link.source);
        const targetNode = graph.nodes.find((node) => node.id === link.target);
        if (sourceNode && targetNode) {
            const { x1, y1, x2, y2 } = getAdjustedCoordinates(sourceNode, targetNode);
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth="2"
              markerEnd={selectedLink === link ? "url(#arrow-red)" : "url(#arrow)"} /* 矢印マーカーを適用 */
              stroke={selectedLink === link ? 'red' : 'black'}
              onClick={(e) => handleLinkClick(link, e)} 
            />
          );
        }
        return null;
      })}

      {graph.nodes.map((node) => 
      {
        const fontSize = calculateFontSize(node.id, NODE_RADIUS); 
        return (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={NODE_RADIUS}
            fill="skyblue"
            onMouseDown={(e) => onMouseDown(e, node)}
          />
          <text x={node.x} y={node.y} fill="black" textAnchor="middle" dominantBaseline="middle" fontSize = {fontSize}>
            {node.id}
          </text>
        </g>
        );
      }
      )}

      {/* ゴミ箱アイコン */}
      {trashIconPosition && (
        <g
          onClick={handleTrashIconClick}
          style={{ cursor: 'pointer' }}
        >
          <text
            x={trashIconPosition.x + 10}
            y={trashIconPosition.y + 15}
            textAnchor="middle"
            fontSize="12"
            fill="white"
          >
            🗑️
          </text>
        </g>
      )}
    </svg>
  );
};

export default GraphComponent;
