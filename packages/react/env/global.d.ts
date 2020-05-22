declare namespace meduxCore {
  interface Document {
    getElementById: (id: string) => object | null;
  }

  interface ENV {
    document: Document;
  }
}
