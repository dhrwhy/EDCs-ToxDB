import type { PublicationYearData, OrganDistributionData } from "../types";

export function buildPubYearOption(pubYears: PublicationYearData[]) {
  if (pubYears.length === 0) return null;
  return {
    tooltip: { trigger: "axis" as const },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: "category" as const,
      data: pubYears.map((d) => String(d.year)),
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: pubYears.map((d) => d.count),
        itemStyle: { color: "#3a7bd5" },
        barMaxWidth: 40,
      },
    ],
  };
}

export function buildOrganPieOption(
  organDist: OrganDistributionData[],
  isMobile: boolean
) {
  if (organDist.length === 0) return null;

  const categoryMap: Record<
    string,
    { name: string; total: number; children: { name: string; value: number }[] }
  > = {};
  organDist.forEach((d) => {
    if (!categoryMap[d.tissue_category]) {
      categoryMap[d.tissue_category] = {
        name: d.tissue_category,
        total: 0,
        children: [],
      };
    }
    categoryMap[d.tissue_category].total += d.count;
    if (d.tissue_subcategory) {
      categoryMap[d.tissue_category].children.push({
        name: d.tissue_subcategory,
        value: d.count,
      });
    } else {
      categoryMap[d.tissue_category].children.push({
        name: d.tissue_category,
        value: d.count,
      });
    }
  });

  const colors = [
    "#3a7bd5",
    "#2b579a",
    "#e8a735",
    "#1d8348",
    "#c0392b",
    "#8e44ad",
    "#2c3e50",
  ];
  const categories = Object.values(categoryMap);

  const innerData = categories.map((cat, i) => ({
    name: cat.name,
    value: cat.total,
    itemStyle: { color: colors[i % colors.length] },
  }));

  const outerData: { name: string; value: number; itemStyle: { color: string } }[] =
    [];
  categories.forEach((cat, i) => {
    const baseColor = colors[i % colors.length];
    cat.children.forEach((child, j) => {
      const lighten = 0.15 + j * 0.12;
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      const nr = Math.min(255, Math.round(r + (255 - r) * lighten));
      const ng = Math.min(255, Math.round(g + (255 - g) * lighten));
      const nb = Math.min(255, Math.round(b + (255 - b) * lighten));
      outerData.push({
        name: child.name,
        value: child.value,
        itemStyle: { color: `rgb(${nr},${ng},${nb})` },
      });
    });
  });

  return {
    tooltip: {
      trigger: "item" as const,
      formatter: (params: any) => `${params.name}: ${params.value}`,
    },
    series: [
      {
        type: "pie",
        radius: ["0%", "35%"],
        center: ["50%", "50%"],
        label: {
          position: "inner" as const,
          fontSize: isMobile ? 9 : 11,
          fontWeight: "bold" as const,
          color: "#fff",
          formatter: (params: any) =>
            params.percent && params.percent > 5 ? params.name : "",
        },
        itemStyle: { borderWidth: 2, borderColor: "#fff" },
        data: innerData,
      },
      {
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "50%"],
        label: {
          position: "outside" as const,
          fontSize: isMobile ? 8 : 10,
          color: "#333",
          formatter: (params: any) => `${params.name}: ${params.value}`,
          overflow: "truncate" as const,
        },
        labelLine: {
          show: true,
          length: isMobile ? 8 : 12,
          length2: isMobile ? 6 : 10,
        },
        labelLayout: {
          hideOverlap: true,
        },
        itemStyle: { borderWidth: 1, borderColor: "#fff" },
        data: outerData,
      },
    ],
  };
}
