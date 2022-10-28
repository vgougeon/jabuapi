import { pascalCase } from 'change-case';
import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import { useObservable } from 'react-use'
import appService from '../../services/app.service'
import './merise.scss';

export function Merise() {
    const ref = useRef()
    const app = useObservable(appService.collections)
    useEffect(() => {
        if (ref.current && app) new MeriseDrawer(ref.current, app)
    }, [ref, app])
    return (
        <div className="bg-blue-200 w-full h-screen overflow-hidden">
            <div className="w-full h-full" ref={ref}></div>
        </div>
    )
}

class MeriseDrawer {
    collections = []; svg; g;
    constructor(e, app) {
        this.e = e;
        this.collections = Object.entries(app.collections || []).map(([name, options]) => ({ name, options }));

        this.initZoom();
        this.draw();
    }

    initZoom() {
        this.element = d3.select(this.e)
        this.svg = d3.select(this.e)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");
        this.g = this.svg.append('g')

        const handleZoom = (e) => {
            this.g.attr('transform', e.transform);
            console.log("zooming", e)
        }
        const zoom = d3.zoom().on('zoom', handleZoom);
        d3.select(this.e).select('svg').call(zoom);
    }

    draw() {
        this.g
            .selectAll('box')
            .data(this.collections)
            .enter()
            .append('rect')
            .attr("width", 150)
            .attr('height', 100)
            .attr('x', (d, i) => 250 * i + 50)
            .attr('fill', "#fff")

        this.g
            .selectAll('head-separator')
            .data(this.collections)
            .enter()
            .append('line')
            .style("stroke", "#ffffffaa")
            .style("stroke-width", 2)
            .attr("x1", (d, i) => 250 * i - 50)
            .attr("y1", (d, i) => 20)
            .attr("x2", (d, i) => 250 * i + 50)
            .attr("y2", (d, i) => 20)

        this.g.selectAll('text')
            .data(this.collections)
            .enter()
            .append('text')
            .attr('x', (d, i) => 250 * i + 50 + 10)
            .attr('y', 20)
            .text(d => pascalCase(d.name))

    }
}