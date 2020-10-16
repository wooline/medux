declare namespace meduxCore {
  interface Document {
    getElementById: (id: string) => Record<string, unknown> | null;
  }

  interface ENV {
    document: Document;
  }
}
