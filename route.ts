import { PDFLoader } from 
"langchain/document_loaders/fs/pdf";
import { NextRequest, NextResponse } from 
"next/server";
import { PineconeClient } from 
"@pinecone-database/pinecone";
import { OpenAIEmbeddings } from 
"langchain/embeddings/openai";
import { PineconeStore } from 
"langchain/vectorstores/pinecone";

export async function POST(request: NextRequest) {
  // Initialize the Pinecone client with your 
specific details
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: "gcp-starter",
    apiKey: 
"9ed5388a-561b-424f-a6a2-9683257a1e20",
  });
  const pineconeIndex = 
pinecone.Index("pdf-licker");

  // Extract FormData from the request
  const data = await request.formData();
  // Extract the uploaded file from the FormData
  const file: File | null = data.get("file") as 
unknown as File;

  // Make sure file exists
  if (!file) {
    return NextResponse.json({ success: false, 
error: "No file found" });
  }

  // Make sure file is a PDF
  if (file.type !== "application/pdf") {
    return NextResponse.json({ success: false, 
error: "Invalid file type" });
  }

  // Use the PDFLoader to load the PDF and split 
it into smaller documents
  const pdfLoader = new PDFLoader(file);
  const splitDocuments = await 
pdfLoader.loadAndSplit();

  // Use Langchain's integration with Pinecone to 
store the documents
  await 
PineconeStore.fromDocuments(splitDocuments, new 
OpenAIEmbeddings(), {
    pineconeIndex,
  });

  return NextResponse.json({ success: true });
}

