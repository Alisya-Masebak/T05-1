// Fixed D3 Donut Chart (medium, readable) using Ex5_TV_energy_55inchtv_byScreenType.csv
// - responsive
// - tooltip uses page coords
// - legend layout adapts to container width
// - percent labels shown only for slices > 5%

function renderDonutChart(data) {
    d3.select("#chart4").selectAll("*").remove();

    // parse & total
    data = data.map(d => ({ tech: d.tech, energy: +d.energy }));
    const total = d3.sum(data, d => d.energy);
    if (total === 0) {
        d3.select("#chart4").append("div").text("No data");
        return;
    }

    // sizing (medium)
    const container = d3.select("#chart4").node();
    const maxWidth = Math.min(container.offsetWidth || 360, 360);
    const width = Math.max(260, maxWidth); // keep readable minimum
    const height = Math.round(width * 0.78);
    const margin = { top: 36, right: 18, bottom: 18, left: 18 };

    // decide legend placement
    const legendOnRight = width >= 330;

    const svg = d3.select("#chart4")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("role", "img")
        .attr("aria-label", "Donut chart of mean energy by screen technology (55-inch TVs)");

    // title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-weight", "700")
        .attr("fill", "#222")
        .attr("font-size", 14)
        .text("Mean energy by screen tech (55\")");

    // compute drawing area
    const legendWidth = legendOnRight ? 120 : 0;
    const drawW = width - margin.left - margin.right - legendWidth;
    const drawH = height - margin.top - margin.bottom;
    const cx = margin.left + Math.round(drawW / 2);
    const cy = margin.top + Math.round(drawH / 2);

    const radius = Math.min(drawW, drawH) / 2 * 0.95;
    const inner = radius * 0.55;

    const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

    // color
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.tech))
        .range(["#2ecc71", "#3498db", "#f39c12", "#9b59b6", "#e74c3c"]);

    const pie = d3.pie().sort(null).value(d => d.energy);
    const arcs = pie(data);

    const arc = d3.arc().innerRadius(inner).outerRadius(radius);
    const labelArc = d3.arc().innerRadius(inner + (radius - inner) * 0.5).outerRadius(inner + (radius - inner) * 0.5);

    // tooltip
    const tooltip = d3.select("#chart4")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // draw slices
    g.selectAll("path.slice")
        .data(arcs)
        .enter()
        .append("path")
        .attr("class", "slice")
        .attr("d", arc)
        .attr("fill", d => color(d.data.tech))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event, d) {
            d3.select(this).attr("opacity", 0.95);
            tooltip.transition().duration(120).style("opacity", 1);
            const pct = (d.data.energy / total * 100).toFixed(1);
            tooltip.html(`<strong>${d.data.tech}</strong><br>${d.data.energy.toFixed(1)} kWh/yr — ${pct}%`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            d3.select(this).attr("opacity", 1);
            tooltip.transition().duration(150).style("opacity", 0);
        });

    // percent labels (only if > 5%)
    g.selectAll("text.slice-label")
        .data(arcs)
        .enter()
        .append("text")
        .attr("class", "slice-label")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", "#111")
        .attr("font-weight", 600)
        .text(d => {
            const pct = d.data.energy / total * 100;
            return pct >= 5 ? `${Math.round(pct)}%` : "";
        });

    // Legend (right or below)
    const legend = svg.append("g").attr("class", "legend");
    if (legendOnRight) {
        const lx = width - legendWidth + 8;
        const ly = margin.top + 6;
        legend.attr("transform", `translate(${lx},${ly})`);
        const item = legend.selectAll("g").data(data).enter().append("g").attr("transform", (d, i) => `translate(0, ${i * 22})`);
        item.append("rect").attr("width", 14).attr("height", 14).attr("fill", d => color(d.tech)).attr("rx", 2);
        item.append("text").attr("x", 18).attr("y", 11).attr("font-size", 12).text(d => `${d.tech} (${Math.round(d.energy)} kWh/yr)`);
    } else {
        // below chart
        const lx = margin.left;
        const ly = height - margin.bottom - 20;
        legend.attr("transform", `translate(${lx},${ly})`);
        const item = legend.selectAll("g").data(data).enter().append("g").attr("transform", (d, i) => `translate(${i * (width / data.length)}, 0)`);
        item.append("rect").attr("width", 12).attr("height", 12).attr("fill", d => color(d.tech)).attr("rx", 2);
        item.append("text").attr("x", 16).attr("y", 11).attr("font-size", 11).text(d => d.tech);
    }
}

// loader with responsive redraw
function loadAndRenderDonutChart() {
    d3.csv("Ex5_TV_energy_55inchtv_byScreenType.csv", d => ({
        tech: d['Screen_Tech'],
        energy: +d['Mean(Labelled energy consumption (kWh/year))']
    })).then(raw => {
        // initial render
        renderDonutChart(raw);
        // redraw on resize (debounced)
        let t;
        window.addEventListener("resize", () => {
            clearTimeout(t);
            t = setTimeout(() => renderDonutChart(raw), 120);
        });
    }).catch(err => {
        d3.select("#chart4").append("div").text("Failed to load data");
        console.error(err);
    });
}

loadAndRenderDonutChart();