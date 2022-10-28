import ReactFlow, { applyEdgeChanges, applyNodeChanges, Background, Controls, Handle, Position } from 'react-flow-renderer';
import React, { useCallback, useState } from 'react'
import { useObservable } from 'react-use'
import appService from '../../services/app.service'
import './merise.scss'


function Custom({ data }) {
    return (
        <div className="w-36 h-[50px] bg-white rounded shadow">
            <Handle type="source" position={Position.Bottom} id="a" />
            <Handle type="target" position={Position.Top} id="b" />
        </div>
    );
}

const types = { custom: Custom }

export function Merise() {
    const [nodes, setNodes] = useState([
        {
            id: 'a',
            type: 'input',
            data: { label: 'Node A' },
            position: { x: 250, y: 25 },
            type: 'custom'
        },
        {
            id: 'b',
            data: { label: 'Node B' },
            position: { x: 100, y: 125 },
            type: 'custom'
        },
        {
            id: 'c',
            type: 'output',
            data: { label: 'Node C' },
            position: { x: 250, y: 250 },
            type: 'custom'
        },
    ])
    const [edges, setEdges] = useState([
        { id: 'ea-b', source: 'a', target: 'b' }
    ])

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes) => setNodes((nds) => {
            const c = applyEdgeChanges(changes, nds)
            console.log(c)
            return c
        }),
        [setEdges]
    );


    return (
        <ReactFlow
            nodeTypes={types}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            // onEdgesChange={onEdgesChange}
        >
            {/* <Background variant="dots" gap={24} size={2} color={"#00000010"} /> */}
            {/* <Controls /> */}
        </ReactFlow>
    )
}

