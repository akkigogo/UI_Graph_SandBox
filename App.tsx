import React, { useState, useCallback } from 'react';
import GraphComponent from './Graph';
import { Graph, Node, Link } from './types';
import { NODE_RADIUS } from './const';
import { importEdgesFromExcel } from './EdgeImporter';
import { arrangeNodes, randomPosition } from './NodeArrange';

const generateGraph = (): Graph => {
  return { nodes: [], links: [] };
};

const App: React.FC = () => {
  const [graph, setGraph] = useState<Graph>(generateGraph());
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [draggingNode, setDraggingNode] = useState<Node | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const generateRandomPosition = () => {
    return randomPosition();
  };

  // ノードの位置を更新
  const updateNodePosition = (id: string, x: number, y: number) => {
    setGraph((prevGraph) => {
      const updatedNodes = prevGraph.nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node
      );
      return { ...prevGraph, nodes: updatedNodes };
    });
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent<SVGCircleElement>, node: Node) => {
      setDraggingNode(node);
      // マウスのオフセット（クリック位置のずれ）を計算
      const rect = e.currentTarget.getBoundingClientRect();
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNode) {
        const rect = e.currentTarget.getBoundingClientRect();
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;
        updateNodePosition(draggingNode.id, newX - rect.x + NODE_RADIUS, newY - rect.y + NODE_RADIUS);
      }
    },
    [draggingNode, offset]
  );

  const onMouseUp = useCallback(() => {
    setDraggingNode(null); // ドラッグ終了
  }, []);

  const addLink = () => {
    const newLink: Link = { source, target };

    setGraph((prevGraph) => {
      let newNodes = [...prevGraph.nodes];
      if (!prevGraph.nodes.find((node) => node.id === source)) {
        newNodes.push({ id: source, ...generateRandomPosition() });
      }
      if (!prevGraph.nodes.find((node) => node.id === target)) {
        newNodes.push({ id: target, ...generateRandomPosition() });
      }

      const newLinks = [...prevGraph.links, newLink];
      return { nodes: newNodes, links: newLinks };
    });
  };

  const deleteLink = (link : Link) => {
    setGraph((prevGraph) => {
      const newLinks = prevGraph.links.filter((l) => l !== link);
      return { ...prevGraph, links: newLinks };
    });
  }

  const deleteNode = (node : Node) => {
    setGraph((prevGraph) => {
      const newNodes = prevGraph.nodes.filter((n) => n !== node);
      const newLinks = prevGraph.links.filter((l) => l.source !== node.id && l.target !== node.id);
      return { nodes: newNodes, links: newLinks };
    });
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sheetName = prompt("読み込むシート名を入力してください", "Sheet1");
    const sourceCol = prompt("出発ノードの列名を入力してください", "A");
    const targetCol = prompt("到達ノードの列名を入力してください", "B");

    if (sheetName && sourceCol && targetCol) {
      try {
        const { nodes, links } = await importEdgesFromExcel(file, sheetName, sourceCol, targetCol, graph);

        setGraph(() => ({
          nodes: nodes,
          links: links,
        }));
      } catch (error) {
        alert("エラーが発生しました: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="App">
      <GraphComponent graph={graph} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseDown={onMouseDown}
      deleteLink={deleteLink} deleteNode={deleteNode}/>
      <div>
        <input
          type="text"
          placeholder="出発ノードID"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="到達ノードID"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button onClick={addLink}>辺を追加</button>
      </div>
      <div>
        <h3>Excelファイルから辺を追加</h3>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      </div>
      <div>
        <h3>ソート</h3>
        <button onClick={() => {arrangeNodes(graph)}}>トポロジカルソート</button>
      </div>
    </div>
  );
};

export default App;
