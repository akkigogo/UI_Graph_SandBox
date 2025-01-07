export type Node = {
    id: string;
    x: number;
    y: number;
  };
  
  export type Link = {
    source: string;
    target: string;
  };
  
  export type Graph = {
    nodes: Node[];
    links: Link[];
  };
  