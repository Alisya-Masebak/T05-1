// D3 Bar Chart: Average Energy Consumption by Screen Technology using Ex5_TV_energy_Allsizes_byScreenType.csv

function renderBarChart(data) {
    // Remove any existing SVG or tooltip
    d3.select("#chart3").selectAll("*").remove();

    // Responsive sizing
    const container = d3.select("#chart3").node();
    const width = container.offsetWidth || 400;
    const height = width * 0.6;

    const margin = { top: 30, right: 30, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Sort by energy descending
    data.sort((a, b) => b.energy - a.energy);

    // Create SVG
    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.tech))
        .range([0, innerWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy) * 1.1])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-20)")
        .style("text-anchor", "end");

    g.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 45)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Screen Technology");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Mean Energy Consumption (kWh/year)");

    // Bars
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.tech))
        .attr("y", d => y(d.energy))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.energy))
        .attr("fill", "#27ae60")
        .attr("opacity", 0.8);

    // Tooltip
    const tooltip = d3.select("#chart3")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "13px");

    g.selectAll(".bar")
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(150).style("opacity", 1);
            tooltip.html(
                `<strong>${d.tech}</strong><br>
                 Mean Energy: ${d.energy.toFixed(1)} kWh/year`
            )
            .style("left", (event.offsetX + 20) + "px")
            .style("top", (event.offsetY - 10) + "px");
            d3.select(this).attr("stroke", "#222").attr("stroke-width", 2);
        })
        .on("mouseout", function () {
            tooltip.transition().duration(200).style("opacity", 0);
            d3.select(this).attr("stroke", "none");
        });
}

// Load data from CSV and render chart
function loadAndRenderBarChart() {
    d3.csv("Ex5_TV_energy_Allsizes_byScreenType.csv", d => ({
        tech: d['Screen_Tech'],
        energy: +d['Mean(Labelled energy consumption (kWh/year))']
    })).then(data => {
        renderBarChart(data);
        // Redraw on resize
        window.addEventListener("resize", () => renderBarChart(data));
    });
}

loadAndRenderBarChart();