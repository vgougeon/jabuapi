import { ScrollArea } from "@mantine/core";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { isblEditorDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useObservable } from "react-use";
import appService from "../services/app.service";
import collectionService from "../services/collection.service";
import { ConvertToTypescript } from "../utils/typescript-convert";

export default function ApiDocTypes() {
    const collectionsConfig = useObservable(appService.collections)
    const collections = collectionService.getCollectionsFromConfig(collectionsConfig)
    const relations = collectionService.getRelationsFromConfig(collectionsConfig)
    const enums = collectionService.getEnumsFromConfig(collectionsConfig)
    const typescript = ConvertToTypescript(collections, relations, enums)
    return (
        <ScrollArea className="h-screen w-full bg-[#18212E]">
            <SyntaxHighlighter language="typescript" style={isblEditorDark} showLineNumbers
                lineNumberStyle={{ fontSize: 12, opacity: 0.3 }}
                customStyle={{ fontSize: 16, background: '#18212E', padding: 40, width: '100%', height: '100%' }}>
                {typescript}
            </SyntaxHighlighter>
        </ScrollArea>
    )
}