import { max } from "d3"

export function getSeederFlow(data) {
    const nodes = getSeederNodes(data)
    const edges = getSeederEdges(nodes)
    return [nodes, edges]
}

export function getSeederNodes(data) {
    let ID = 1
    let nodes = [{
        id: '1',
        position: { x: 0, y: 0 },
        data: { label: 'Start seeding', h: 0 },
        type: 'seed',
    }]
    const add = (item, parent, h) => {
        ID++
        const w = {
            id: String(ID),
            position: { x: 0, y: 0 },
            type: 'seed',
            data: { ...item, label: item.collection, parent, h },
        }
        nodes.push(w)
        return w
    }
    for (let item of data) {
        const recursion = (_item, parent, level) => {
            const added = add(_item, parent, level)
            if(_item.children && Array.isArray(_item.children)) {
                for(let child of _item.children) {
                    console.log(child.name)
                    recursion(child, added.id, added.data.h + 1)
                }
            }
        }
        recursion(item, '1', 1)
        console.log(nodes)
    }
    for(let i = 1; i <= max(nodes.map(n => n.data.h)); i++) {
        const array = nodes.filter(n => n.data.h === i)
        const length = array.length
        for(let j = 0; j < length; j++) {
            array[j].position.x = i * (300);
            array[j].position.y = ((length-1) * 70)/2 - (j * 70)
            console.log(array[j].position.x)
        }
    }
    return nodes
}

export function getSeederEdges(nodes) {
    const edges = []
    for (let node of nodes) {
        if (node.data.parent) {
            edges.push(
                {
                    id: `${node.data.parent}-${node.id}`,
                    source: node.data.parent,
                    target: node.id,
                    label: '',
                    animated: true,
                    type: 'step'
                })
        }
    }
    return edges
}