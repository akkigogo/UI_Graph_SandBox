export type Node = {
    id: string;
    x: number; // ノードのX座標
    y: number; // ノードのY座標
  };
  
  export type Link = {
    source: string;
    target: string;
  };
  
  export type Graph = {
    nodes: Node[];
    links: Link[];
  };
  