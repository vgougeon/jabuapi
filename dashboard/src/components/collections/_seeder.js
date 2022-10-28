import ReactFlow, { Background, Controls, Handle, Position } from 'react-flow-renderer';
import React, { useEffect, useState } from 'react'
import { useObservable } from 'react-use'
import appService from '../../services/app.service'
import './merise.scss'
import { getSeederFlow } from '../../utils/seeder';
import seederService from '../../services/seeder.service';
import { Plus } from 'tabler-icons-react';
import { motion } from 'framer-motion';
import NewSeed from './_seed_insert';
import { Modal } from '@mantine/core';


function Seed({ data, id }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 dark:border-gray-500 bg-opacity-50 border-4 border-white shadow overflow-hidden min-w-[200px]" key={`${data.label}`}>
            <div className="px-5 py-2 rounded text-center">{data.label}</div>
            {data.h >= 1 && <Handle type="target" position={Position.Left} id={`${id}`} />}
            <Handle onClick={() => seederService.toggleCreate(data.id)}
                className='add-handle' type="source" position={Position.Right} id={`${id}`}>
                <Plus size={14} />
            </Handle>
        </motion.div>
    );
}

const types = { seed: Seed }
export function SeederGraph() {
    const seed = useObservable(seederService.seeding)
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const createModal = useObservable(seederService.createModal)
    useEffect(() => {
        const [n, e] = getSeederFlow(seed || [])
        console.log(n)
        setNodes(n); setEdges(e)
    }, [seed])

    const theme = useObservable(appService.theme)
    return (
        <>
            <ReactFlow
                nodeTypes={types}
                nodes={nodes}
                edges={edges}
                className='bg-gray-200 dark:bg-[#222228]'
                maxZoom={1.25}
                fitView={true}
            >
                <Background variant="dots" gap={24} size={2} color={theme === 'light' ? "#00000010" : "#ffffff07"} />
                <Controls />
            </ReactFlow>
            <Modal
                withCloseButton={false}
                opened={createModal}
                onClose={() => seederService.toggleCreate()}
                padding={0}
                size={'auto'}
            >
                <NewSeed close={() => seederService.toggleCreate()} />
            </Modal>
        </>
    )
}

