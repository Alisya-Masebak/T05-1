// D3 Line Chart: Average Price Trends Over Years using Ex5_ARE_Spot_Prices.csv

function renderLineChart(data) {
    // Remove any existing SVG or tooltip
    d3.select("#chart2").selectAll("*").remove();

    // Responsive sizing
    const container = d3.select("#chart2").node();
    const width = container.offsetWidth || 400;
    const height = width * 0.6;

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select("#chart2")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.avg_price) * 1.1])
        .range([innerHeight, 0]);

    // Axes
    g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
        .call(d3.axisLeft(y));

    // Axis labels
    g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Year");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "13px")
        .text("Average Price ($/MWh)");

    // Line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.avg_price));

    // Draw line
    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#e67e22")
        .attr("stroke-width", 2.5)
        .attr("d", line);

    // Draw points
    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.avg_price))
        .attr("r", 4)
        .attr("fill", "#e67e22");

    // Tooltip
    const tooltip = d3.select("#chart2")
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
                `<strong>Year:</strong> ${d.year}<br>
                 <strong>Avg Price:</strong> $${d.avg_price} /MWh`
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
function loadAndRenderLineChart() {
    d3.csv("Ex5_ARE_Spot_Prices.csv", d => ({
        year: +d["Year"],
        avg_price: +d["Average Price (notTas-Snowy)"]
    })).then(data => {
        renderLineChart(data);
        // Redraw on resize
        window.addEventListener("resize", () => renderLineChart(data));
    });
}

loadAndRenderLineChart();