// Responsive D3 Scatter Plot: Power vs. Screen Size using Ex5_TV_energy.csv

function renderScatterPlot(data) {
    // Remove any existing SVG or tooltip
    d3.select("#chart1").selectAll("*").remove();

    // Responsive sizing
    const container = d3.select("#chart1").node();
    const width = container.offsetWidth || 400;
    const height = width * 0.6;

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain([
            d3.min(data, d => d.screensize) - 5,
            d3.max(data, d => d.screensize) + 5
        ])
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.energy_consumpt) * 1.1])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

    g.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Screen Size (inches)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Energy Consumption (kWh/year)");

    // Points
    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.screensize))
        .attr("cy", d => y(d.energy_consumpt))
        .attr("r", 4)
        .attr("fill", "#3498db")
        .attr("opacity", 0.7);

    // Tooltip
    const tooltip = d3.select("#chart1")
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

    g.selectAll("circle")
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(150).style("opacity", 1);
            tooltip.html(
                `<strong>Brand:</strong> ${d.brand}<br>
                 <strong>Tech:</strong> ${d.screen_tech}<br>
                 <strong>Screen Size:</strong> ${d.screensize}"<br>
                 <strong>Energy:</strong> ${d.energy_consumpt} kWh/year`
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
function loadAndRenderScatterPlot() {
    d3.csv("Ex5_TV_energy.csv", d => ({
        brand: d['brand'],
        screen_tech: d['screen_tech'],
        screensize: +d['screensize'],
        energy_consumpt: +d['energy_consumpt']
    })).then(data => {
        renderScatterPlot(data);
        // Redraw on resize
        window.addEventListener("resize", () => renderScatterPlot(data));
    });
}

loadAndRenderScatterPlot();
