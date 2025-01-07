import ExcelJS from "exceljs";
import { Graph, Node, Link } from "./type";

export const importEdgesFromExcel = async (
  file: File,
  sheetName: string,
  sourceCol: string,
  targetCol: string,
  graph: Graph
): Promise<{ nodes: Node[]; links: Link[] }> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    throw new Error(`シート "${sheetName}" が見つかりません`);
  }

  const newLinks: Link[] = [];
  const newNodes: Node[] = [];

  sheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) return; // ヘッダーをスキップ

    const source = row.getCell(sourceCol).value?.toString() || "";
    const target = row.getCell(targetCol).value?.toString() || "";

    if (!source || !target) {
        throw new Error(`行 ${rowIndex}: 出発ノードまたは到達ノードが空です`);
    }

    if (source && target) {
      // ノードがすでに存在しない場合、追加
      if (!newNodes.find((node) => node.id === source)) {
        newNodes.push({
          id: source,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
        });
      }
      if (!newNodes.find((node) => node.id === target)) {
        newNodes.push({
          id: target,
          x: Math.random() * 700 + 50,
          y: Math.random() * 500 + 50,
        });
      }

      // 辺を追加
      newLinks.push({ source, target });
    }
  });

  return { nodes: newNodes, links: newLinks };
};