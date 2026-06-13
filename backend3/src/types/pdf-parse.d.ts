// pdf-parse类型声明
declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  // pdf-parse的默认导出是一个函数
  function pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>;
  export = pdfParse;
}
