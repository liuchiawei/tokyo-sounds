import { streamText, UIMessage, convertToModelMessages } from "ai";
import { google, GoogleGenerativeAIProviderMetadata } from "@ai-sdk/google";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const {
    messages,
    sources,
    providerMetadata,
  }: { messages: UIMessage[]; sources: string[]; providerMetadata: any } =
    await req.json();

  // TODO: Use FileSearchStore to create a RAG chatbot
  //  const sampleFile = await ai.files.upload({
  //    file: "sample.txt",
  //    config: { name: "file-name" },
  //  });

  //  const fileSearchStore = await ai.fileSearchStores.create({
  //    config: { displayName: "tokyo-sounds-file-search-store" },
  //  });

  //  let operation = await ai.fileSearchStores.importFile({
  //    fileSearchStoreName: fileSearchStore.name!,
  //    fileName: sampleFile.name!,
  //  });

  //  while (!operation.done) {
  //    await new Promise((resolve) => setTimeout(resolve, 5000));
  //    operation = await ai.operations.get({ operation: operation });
  //  }

  const result = streamText({
    model: google("gemini-pro-latest"),
    system: `You are a helpful assistant that can answer questions about the following sources: ${sources.join(
      ", "
    )}`,
    messages: convertToModelMessages(messages),
    tools: {
      // TODO: Use File Search, URL Context, and Google Search tools to create a repo chatbot
      file_search: google.tools.fileSearch({
        fileSearchStoreNames: [fileSearchStore.name!],
        topK: 8,
      }),
      url_context: google.tools.urlContext({}),
      google_search: google.tools.googleSearch({}),
    },
  });

  const metadata = providerMetadata?.google as
    | GoogleGenerativeAIProviderMetadata
    | undefined;
  const groundingMetadata = metadata?.groundingMetadata;
  const urlContextMetadata = metadata?.urlContextMetadata;

  const reader = result.textStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    process.stdout.write(value);
  }

  console.log(result.toTextStreamResponse());
  console.log(result.steps);
  return result.toUIMessageStreamResponse();
}
