import { pascalCase } from 'change-case';
import ReactFlow, { applyNodeChanges, Background, Controls, Handle, Position } from 'react-flow-renderer';
import React, { Component, Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useObservable } from 'react-use'
import appService from '../../services/app.service'
import collectionService from '../../services/collection.service'
import { getType, TYPES } from "../../constants/types"
import './merise.scss'
import axios from 'axios';

function Entity({ data }) {
    const collectionsConfig = useObservable(appService.collections)
    const [fields, setFields] = useState(collectionService.getFieldsFromCollection(data.options))
    const [relations, setRelations] = useState(collectionService.getRelationsFromConfigAndCollection(collectionsConfig, data.name))
    useEffect(() => {
        console.log("DATA CHANGED")
        setFields(collectionService.getFieldsFromCollection(data.options))
        setRelations(collectionService.getRelationsFromConfigAndCollection(collectionsConfig, data.name))
    }, [data, collectionsConfig])
    return (
        <div className="bg-white dark:bg-neutral-900 dark:border-gray-700 border-4 border-white rounded shadow overflow-hidden min-w-[200px]" key={`${data.name}`}>
            <div className="px-5 py-2 border-b border-gray-200 dark:border-gray-700 text-center">{data.name}</div>
            <Handle type="target" position={Position.Left} style={{ top: 25, left: -2 }} id={`${data.name}-target`} />
            <Handle type="source" position={Position.Right} style={{ top: 25, right: -2 }} id={`${data.name}-source`} />
            <div className="flex flex-col my-1 mt-2">
                {fields.map((field, i) =>
                    <div key={i} className="w-full h-10 px-2 flex text-sm items-center gap-2 hover:bg-white dark:hover:bg-gray-700 pl-6 py-1">
                        <div className={`w-8 h-8 text-xs p-1 rounded ${getType(field.options.type).class} bg-opacity-25`}>
                            {getType(field.options.type).icon}

                        </div>
                        <span className="font-light">{field.name}</span>
                        {field.options.type === 'ID' &&
                            <Handle type="target" key={`${data.name}-${field.name}-l`} position={Position.Left} style={{ top: 69 + i * 40, left: -2 }} id={`${data.name}-${field.name}-l`} />
                        }
                    </div>
                )}

                {relations.map((field, i) =>
                    <div key={i} className="w-full h-10 px-2 flex text-sm items-center gap-2 hover:bg-white dark:hover:bg-gray-700 pl-6 py-1">
                        <div className={`w-8 h-8 text-xs p-1 rounded ${getType(field.options.type).class} bg-opacity-25`}>
                            {getType(field.options.type).icon}
                        </div>
                        <span className="font-light">{field.name}</span>
                        {(field.options.type === 'ASYMMETRIC' || field.options.type === 'MANY TO MANY') &&
                            <Handle type="source" key={`${data.name}-${field.name}-r`} position={Position.Right} style={{ top: 69 + (i + fields.length) * 40, right: -2 }} id={`${data.name}-${field.name}-r`} />
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

function Association({ data }) {
    return (
        <div className="bg-pink-200 bg-opacity-50 border-4 border-white rounded-full shadow overflow-hidden min-w-[200px]" key={`${data.name}`}>
            <div className="px-5 py-2 border-b border-gray-200 rounded text-center">{data.name}</div>
            <Handle type="target" position={Position.Left} id={`associations-l-${data.name}`} />
            <Handle type="target" position={Position.Right} id={`associations-r-${data.name}`} />
        </div>
    );
}

const types = { entity: Entity, association: Association }

export function Merise() {
    const app = useObservable(appService.collections)
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])

    useEffect(() => {
        const collections = collectionService.getCollectionsFromConfig(app)
        const associations = []
        for (let collection of collections) {
            const fields = collectionService.getFieldsFromCollection(collection.options)
            for (let field of fields) {
                if (field.options.type === 'MANY TO MANY') {
                    associations.push({
                        id: collection.name + '_' + field.name,
                        type: 'association',
                        position: { x: 200, y: 200 },
                        data: field
                    })
                }
            }
        }
        setNodes([
            ...collections.map(
                (item, i) => ({
                    id: item.name,
                    type: 'entity',
                    position: { x: 100 + i * 250, y: 100 },
                    ...(item.options.position ? { position: item.options.position } : {}),
                    data: item
                })),
            ...associations]
        )

    }, [app])

    useEffect(() => {
        const collections = collectionService.getCollectionsFromConfig(app)
        if (nodes.length) {
            const edges = []
            for (let collection of collections) {
                const fields = collectionService.getFieldsFromCollection(collection.options)
                for (let field of fields) {
                    if (field.options.type === 'ASYMMETRIC') {
                        edges.push({
                            id: `edge-${collection.name}-${field.name}`,
                            source: `${collection.name}`,
                            target: `${field.options.relation}`,
                            sourceHandle: `${collection.name}-${field.name}-r`,
                            targetHande: `${field.options.relation}-${field.options.reference}-l`,
                            animated: true,
                        })
                    }
                    if (field.options.type === 'MANY TO MANY') {
                        edges.push({
                            id: `edge-${collection.name}-${field.name}`,
                            source: `${collection.name}`,
                            target: `${collection.name}_${field.name}`,
                            sourceHandle: `${collection.name}-${field.name}-r`,
                            targetHande: `associations-l-${field.name}`,
                            animated: true,
                        })
                        const rel = {
                            id: `edge-${collection.name}-${field.name}-association`,
                            source: `${field.options.relation}`,
                            target: `${collection.name}_${field.name}`,
                            sourceHandle: `${field.options.relation}-${field.options.reference}-l`,
                            targetHande: `associations-r-${field.name}`,
                            animated: true,
                        }
                        console.log("rel", rel)
                        edges.push(rel)
                    }

                }
            }
            setEdges(edges)
        }
    }, [nodes])

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => {
            for (let item of changes) {
                if (item.dragging === false) {
                    const node = nds.find(i => i.id === item.id)
                    if (node.type === 'entity') {
                        axios.post('/core-api/collections/' + item.id + '/setMetaData', { position: node.position }).then(() => { })
                    }
                }
            }
            return applyNodeChanges(changes, nds)
        }),
        [setNodes]
    );

    const theme = useObservable(appService.theme)
    return (
        <ReactFlow
            nodeTypes={types}
            nodes={nodes}
            edges={edges}
            className='bg-gray-200 dark:bg-[#222228]'
            onNodesChange={onNodesChange}
            maxZoom={ 1.25 }
            fitView={true}
        >
            <Background variant="dots" gap={24} size={2} color={theme === 'light' ? "#00000010" : "#ffffff07"} />
            <Controls />
        </ReactFlow>
    )
}

