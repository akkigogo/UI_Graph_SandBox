import React, { useEffect, useRef } from 'react';
import { Graph, Node, Link } from './types';
import { NODE_RADIUS } from './const';
import { getAdjustedCoordinates, calculateFontSize } from './util';

type GraphProps = {
  graph: Graph;
  onMouseDown: (e: React.MouseEvent<SVGCircleElement>, node: Node) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
};

const GraphComponent: React.FC<GraphProps> = ({ graph, onMouseMove, onMouseUp, onMouseDown }) => {
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
              stroke="black"
              strokeWidth="2"
              markerEnd="url(#arrow)" /* 矢印マーカーを適用 */
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
    </svg>
  );
};

export default GraphComponent;
