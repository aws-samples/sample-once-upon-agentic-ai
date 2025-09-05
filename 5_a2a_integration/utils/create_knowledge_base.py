#!/usr/bin/env python3
"""
D&D Basic Rules Knowledge Base Creator
Creates a ChromaDB knowledge base from the D&D Basic Rules PDF
"""

import os
import sys
from pathlib import Path
import PyPDF2
import chromadb
from chromadb.config import Settings
import uuid
from typing import List, Dict

def extract_text_from_pdf(pdf_path: str) -> List[Dict[str, str]]:
    """Extract text from PDF and split into chunks"""
    chunks = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                text = page.extract_text()
                
                if text.strip():  # Only process pages with text
                    # Split into smaller chunks for better retrieval
                    paragraphs = text.split('\n\n')
                    
                    for para_idx, paragraph in enumerate(paragraphs):
                        if len(paragraph.strip()) > 50:  # Filter out very short chunks
                            chunks.append({
                                'id': f"page_{page_num + 1}_para_{para_idx}",
                                'text': paragraph.strip(),
                                'metadata': {
                                    'page': page_num + 1,
                                    'paragraph': para_idx,
                                    'source': 'DnD_BasicRules_2018.pdf'
                                }
                            })
    
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return []
    
    return chunks

def create_knowledge_base(pdf_path: str, db_path: str = "./dnd_knowledge_base"):
    """Create ChromaDB knowledge base from PDF"""
    
    print("Extracting text from PDF...")
    chunks = extract_text_from_pdf(pdf_path)
    
    if not chunks:
        print("No text chunks extracted from PDF")
        return
    
    print(f"Extracted {len(chunks)} text chunks")
    
    # Initialize ChromaDB
    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(path=db_path)
    
    # Create or get collection
    collection_name = "dnd_basic_rules"
    try:
        collection = client.get_collection(collection_name)
        print(f"Collection '{collection_name}' already exists. Deleting and recreating...")
        client.delete_collection(collection_name)
    except:
        pass
    
    collection = client.create_collection(
        name=collection_name,
        metadata={"description": "D&D Basic Rules 2018 Knowledge Base"}
    )
    
    # Prepare data for ChromaDB
    documents = [chunk['text'] for chunk in chunks]
    metadatas = [chunk['metadata'] for chunk in chunks]
    ids = [chunk['id'] for chunk in chunks]
    
    # Add documents to collection in batches
    batch_size = 100
    print("Adding documents to ChromaDB...")
    
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i + batch_size]
        batch_metas = metadatas[i:i + batch_size]
        batch_ids = ids[i:i + batch_size]
        
        collection.add(
            documents=batch_docs,
            metadatas=batch_metas,
            ids=batch_ids
        )
        
        print(f"Added batch {i//batch_size + 1}/{(len(documents) + batch_size - 1)//batch_size}")
    
    print(f"Knowledge base created successfully at: {db_path}")
    print(f"Collection: {collection_name}")
    print(f"Total documents: {len(documents)}")

if __name__ == "__main__":
    pdf_file = "DnD_BasicRules_2018.pdf"
    
    if not os.path.exists(pdf_file):
        print(f"PDF file '{pdf_file}' not found!")
        sys.exit(1)
    
    create_knowledge_base(pdf_file)
    print("Knowledge base creation complete!")