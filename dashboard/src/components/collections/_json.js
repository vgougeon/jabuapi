import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { generateJson } from "../../utils/json";
import { isblEditorDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function CodeViewer({ children }) {
    return (
        <SyntaxHighlighter language="json" style={isblEditorDark} 
        customStyle={{ fontSize: 16, background: '#18212E', padding: 20, borderRadius: 10}}>
            { children }
        </SyntaxHighlighter>
    )
}