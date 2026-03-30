export const externalLinks = {
  pubchem: (cid: string) =>
    `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,

  geo: (gseId: string) =>
    `https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${gseId}`,

  sra: (srrId: string) =>
    `https://www.ncbi.nlm.nih.gov/sra/?term=${srrId}`,

  bioproject: (id: string) =>
    `https://www.ncbi.nlm.nih.gov/bioproject/${id}`,

  doi: (rawDoi: string) => {
    const cleaned = rawDoi.replace(/^(doi:|DOI：)\s*/i, "");
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      return cleaned;
    }
    return `https://doi.org/${cleaned}`;
  },
};
