import { NODE_RADIUS, SVG_HEIGHT, SVG_WIDTH } from "./const";
import { topologicalSort } from "./TopologicalSort";
import { Graph, Node } from "./types";
import { isIntersecting } from "./util";

export const randomPosition = () => {
    return {
        x: Math.random() * (SVG_WIDTH - NODE_RADIUS * 2) + NODE_RADIUS,
        y: Math.random() * (SVG_HEIGHT - NODE_RADIUS * 2) + NODE_RADIUS,
    };
}

// 与えられた順番でノードを左から優先して配置する
export const arrangeNodes = (graph : Graph) : void => {
    const sortedNodeIds = topologicalSort(graph);
    // 隣接グラフを作成
    const adjacentGraph = new Map<string, string[]>();
    graph.links.forEach(link => {
        if (!adjacentGraph.has(link.source)) {
            adjacentGraph.set(link.source, []);
        }
        adjacentGraph.get(link.source)!.push(link.target);
    });

    const level = new Map<string, number>();
    sortedNodeIds.forEach(nodeId => {
        if (!level.has(nodeId)) {
            level.set(nodeId, 0);
        }
        adjacentGraph.get(nodeId)?.forEach(target => {
            level.set(target, Math.max(level.get(target) || 0, level.get(nodeId)! + 1));
        })
    });

    // level毎の辞書
    const levelMap = new Map<number, string[]>();
    level.forEach((value, key) => {
        if (!levelMap.has(value)) {
            levelMap.set(value, []);
        }
        levelMap.get(value)!.push(key);
    });
 
    // ノードの配置
    levelMap.forEach((nodeIds, level) => {
        const x = (SVG_WIDTH / (levelMap.size + 1)) * (level + 1);
        nodeIds.forEach((nodeId, index) => {
            const node = graph.nodes.find(node => node.id === nodeId);
            if (node) {
                node.x = x;
                node.y = SVG_HEIGHT / (nodeIds.length + 1) * (index + 1);
            }
        });
    });
}

// グラフの辺と辺の交差数を計算する
const calculateScore = (nodes : {id : string, x : number, y : number}[], links : {source : string, target : string}[]): number => {
    let score = 0;
    for (let i = 0; i < links.length; i++) {
        for (let j = i + 1; j < links.length; j++) {
            const link1 = links[i];
            const link2 = links[j];
            const source1 = nodes.find(node => node.id === link1.source);
            const target1 = nodes.find(node => node.id === link1.target);
            const source2 = nodes.find(node => node.id === link2.source);
            const target2 = nodes.find(node => node.id === link2.target);
            if (source1 && target1 && source2 && target2) {
                if (isIntersecting(source1.x, source1.y, target1.x, target1.y, source2.x, source2.y, target2.x, target2.y)) {
                    score++;
                }
            }
        }
    }
    return score;
}

// 2つのノードの高さを交換する
const swapHeight = (node1 : {id : string, x : number, y : number}, node2 : {id : string, x : number, y : number}) : void => {
    const temp = node1.y;
    node1.y = node2.y;
    node2.y = temp;
}

export const sa = (graph: Graph, startTemp : number, endTemp : number, maxIter: number): void => {
    let currentTemp = startTemp;
    const linkLists = graph.links.map(link => ({ source: link.source, target: link.target }));
    let currentNodePositions = graph.nodes.map(node => ({ id: node.id, x: node.x, y: node.y }));
    let currentScore = calculateScore(currentNodePositions, linkLists);
    let bestNodePositions = currentNodePositions;
    let bestScore = currentScore;
    console.log("initial score: " + currentScore);

    for (let i = 0; i < maxIter; i++) {
        const node1 = currentNodePositions[Math.floor(Math.random() * currentNodePositions.length)];
        const node2 = currentNodePositions[Math.floor(Math.random() * currentNodePositions.length)];
        if (Math.abs(node1.x - node2.x) > NODE_RADIUS) continue;
        swapHeight(node1, node2);
        const newScore = calculateScore(currentNodePositions, linkLists);
        const diff = currentScore - newScore;
        // スコアは小さいほど良い
        if (diff > 0 || Math.random() < Math.exp(diff / currentTemp)) {
            currentScore = newScore;
            if (newScore < bestScore) {
                bestScore = newScore;
                bestNodePositions = JSON.parse(JSON.stringify(currentNodePositions));
            }
        }
        else {
            swapHeight(node1, node2);
        }
        currentTemp = startTemp + (endTemp - startTemp) * (i / maxIter);
    }
    // ベストなノードの位置を反映
    graph.nodes.forEach(node => {
        const bestNode = bestNodePositions.find(n => n.id === node.id);
        if (bestNode) {
            node.x = bestNode.x;
            node.y = bestNode.y;
        }
    });
    console.log("best score: " + bestScore);
}