"""Build the Rules Agent knowledge base: a local ChromaDB collection of D&D Basic Rules passages.

Run it once from this folder, with DnD_BasicRules_2018.pdf next to it:
    python create_knowledge_base.py
"""

import os
import sys

import chromadb
from pypdf import PdfReader

PDF_FILE = "DnD_BasicRules_2018.pdf"
DB_PATH = "./dnd_knowledge_base"
COLLECTION = "dnd_basic_rules"
# Printed at the top of almost every page; useless for search, so it is stripped.
FOOTER = "D&D Basic Rules (Version 1.0). Not for resale. Permission granted to print and photocopy this document for personal use only."
CHUNK_SIZE = 1000    # characters per passage
CHUNK_OVERLAP = 200  # characters shared by two consecutive passages, so a rule cut in two stays findable


def extract_chunks(pdf_path: str) -> list[dict]:
    """Read the PDF page by page and cut each page into overlapping passages."""
    chunks = []
    for page_number, page in enumerate(PdfReader(pdf_path).pages, start=1):
        # pypdf separates many words with newlines: normalise all whitespace to single spaces
        text = " ".join((page.extract_text() or "").replace(FOOTER, " ").split())
        start = 0
        while start < len(text):
            end = min(start + CHUNK_SIZE, len(text))
            if end < len(text):  # cut on a space, not in the middle of a word
                cut = text.rfind(" ", start + CHUNK_SIZE // 2, end)
                if cut != -1:
                    end = cut
            passage = text[start:end].strip()
            if len(passage) > 50:
                chunks.append({
                    "id": f"page_{page_number}_offset_{start}",
                    "text": passage,
                    "metadata": {"page": page_number, "source": PDF_FILE},
                })
            if end == len(text):
                break
            start = end - CHUNK_OVERLAP
    return chunks


def create_knowledge_base() -> None:
    print("Extracting text from the PDF...")
    chunks = extract_chunks(PDF_FILE)
    print(f"{len(chunks)} passages extracted")

    client = chromadb.PersistentClient(path=DB_PATH)
    if COLLECTION in [c.name for c in client.list_collections()]:
        print(f"Collection '{COLLECTION}' already exists, rebuilding it")
        client.delete_collection(COLLECTION)
    collection = client.create_collection(COLLECTION)

    print("Embedding passages into ChromaDB (the embedding model is downloaded on first run)...")
    batch = 100
    for i in range(0, len(chunks), batch):
        part = chunks[i:i + batch]
        collection.add(
            ids=[c["id"] for c in part],
            documents=[c["text"] for c in part],
            metadatas=[c["metadata"] for c in part],
        )
        print(f"  {min(i + batch, len(chunks))}/{len(chunks)}")

    print(f"Knowledge base created at {DB_PATH} ({collection.count()} passages in '{COLLECTION}')")


if __name__ == "__main__":
    if not os.path.exists(PDF_FILE):
        sys.exit(f"'{PDF_FILE}' not found. Download it next to this script first (see the workshop instructions).")
    create_knowledge_base()
    print("Knowledge base creation complete!")
