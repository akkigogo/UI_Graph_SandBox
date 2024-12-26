import { Node } from './types';
import { NODE_RADIUS } from './const';

// ノードの境界に基づいて終点を調整する関数
export const getAdjustedCoordinates = (
    sourceNode: Node,
    targetNode: Node
  ): { x1: number; y1: number; x2: number; y2: number } => {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // ノード境界の位置
    const x1 = sourceNode.x + (dx / distance) * NODE_RADIUS;
    const y1 = sourceNode.y + (dy / distance) * NODE_RADIUS;
    const x2 = targetNode.x - (dx / distance) * NODE_RADIUS;
    const y2 = targetNode.y - (dy / distance) * NODE_RADIUS;

    return { x1, y1, x2, y2 };
};

export const calculateFontSize = (text: string, radius: number) => {
    const diameter = radius * 2; // ノードの直径
    const maxFontSize = 20; // 最大フォントサイズ
    const padding = 4; // テキストと円の余白
    const availableWidth = diameter - padding; // テキストが収まる最大幅
    const fontSize = Math.min(maxFontSize, availableWidth / (text.length * 0.6)); // フォントサイズを計算
    return fontSize;
};