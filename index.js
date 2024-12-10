const data = {
  name: "root",
  children: [
    {
      name: "AndroidManifest.xml",
      value: 77824.0,
    },
    {
      name: "DebugProbesKt.bin",
      value: 4096.0,
    },
    {
      name: "META-INF",
      children: [
        {
          name: "androidx.activity_activity-ktx.version",
          value: 4096.0,
        },
        {
          name: "androidx.activity_activity.version",
          value: 4096.0,
        },
        {
          name: "androidx.annotation_annotation-experimental.version",
          value: 4096.0,
        },
        {
          name: "sub-meta",
          children: [
            {
              name: "libsupport.so",
              value: 12288.0,
            },
            {
              name: "support-files",
              children: [
                {
                  name: "libbase.so",
                  value: 25600.0,
                },
                {
                  name: "res",
                  children: [
                    {
                      name: "res_main.xml",
                      value: 5120.0,
                    },
                    {
                      name: "res_secondary.xml",
                      value: 3072.0,
                    },
                    {
                      name: "deep-level",
                      children: [
                        {
                          name: "file-level5.json",
                          value: 1228.8,
                        },
                        {
                          name: "file-level5.txt",
                          value: 600.0,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "assets",
      children: [
        {
          name: "images",
          children: [
            {
              name: "logo.png",
              value: 10240.0,
            },
            {
              name: "background.jpg",
              value: 122880.0,
            },
            {
              name: "sub-images",
              children: [
                {
                  name: "thumbnail.png",
                  value: 2048.0,
                },
                {
                  name: "icon.ico",
                  value: 1228.8,
                },
                {
                  name: "extra-images",
                  children: [
                    {
                      name: "cover.png",
                      value: 15360.0,
                    },
                    {
                      name: "banner.jpg",
                      value: 46080.0,
                    },
                    {
                      name: "deep-level-images",
                      children: [
                        {
                          name: "sample.png",
                          value: 500.0,
                        },
                        {
                          name: "test.svg",
                          value: 2048.0,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "fonts",
          children: [
            {
              name: "font1.ttf",
              value: 20480.0,
            },
            {
              name: "font2.otf",
              value: 35840.0,
            },
            {
              name: "sub-fonts",
              children: [
                {
                  name: "font3.woff",
                  value: 15360.0,
                },
                {
                  name: "sub-level-fonts",
                  children: [
                    {
                      name: "font4.woff2",
                      value: 10240.0,
                    },
                    {
                      name: "deep-font-files",
                      children: [
                        {
                          name: "small-font.woff",
                          value: 5120.0,
                        },
                        {
                          name: "tiny-font.eot",
                          value: 2048.0,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const width = 1200;
const height = 800;

function tile(node, x0, y0, x1, y1) {
  d3.treemapBinary(node, 0, 0, width, height);
  for (const child of node.children) {
    child.x0 = x0 + (child.x0 / width) * (x1 - x0);
    child.x1 = x0 + (child.x1 / width) * (x1 - x0);
    child.y0 = y0 + (child.y0 / height) * (y1 - y0);
    child.y1 = y0 + (child.y1 / height) * (y1 - y0);
  }
}

const root = d3
  .hierarchy(data)
  .sum((d) => d.value)
  .sort((a, b) => b.value - a.value);

d3.treemap().tile(tile)(root);

const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([0, height]);

const svg = d3
  .select("#chart")
  .attr("viewBox", [0.5, -30.5, width, height + 30])
  .attr("width", width)
  .attr("height", height + 30)
  .style("font", "10px sans-serif");

const format = d3.format(",d");
const name = (d) =>
  d
    .ancestors()
    .reverse()
    .map((d) => d.data.name)
    .join("/");

let group = svg.append("g").call(render, root);

function render(group, root) {
  const node = group.selectAll("g").data(root.children.concat(root)).join("g");

  node
    .filter((d) => (d === root ? d.parent : d.children))
    .attr("cursor", "pointer")
    .on("click", (event, d) => (d === root ? zoomout(root) : zoomin(d)));

  node.append("title").text((d) => `${name(d)}\n${format(d.value)}`);

  node
    .append("rect")
    .attr("id", (d) => `leaf-${d.data.name}`)
    .attr("fill", (d) => (d === root ? "#fff" : d.children ? "#ccc" : "#ddd"))
    .attr("stroke", "#fff");

  node
    .append("clipPath")
    .attr("id", (d) => `clip-${d.data.name}`)
    .append("rect")
    .attr("width", (d) => x(d.x1) - x(d.x0))
    .attr("height", (d) => y(d.y1) - y(d.y0));

  node
    .append("text")
    .attr("clip-path", (d) => `url(#clip-${d.data.name})`)
    .attr("font-weight", (d) => (d === root ? "bold" : null))
    .selectAll("tspan")
    .data((d) =>
      (d === root ? name(d) : d.data.name)
        .split(/(?=[A-Z][^A-Z])/g)
        .concat(format(d.value))
    )
    .join("tspan")
    .attr("x", 3)
    .attr(
      "y",
      (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`
    )
    .attr("fill-opacity", (d, i, nodes) =>
      i === nodes.length - 1 ? 0.7 : null
    )
    .attr("font-weight", (d, i, nodes) =>
      i === nodes.length - 1 ? "normal" : null
    )
    .text((d) => d);

  group.call(position, root);
}

function position(group, root) {
  group
    .selectAll("g")
    .attr("transform", (d) =>
      d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`
    )
    .select("rect")
    .attr("width", (d) => (d === root ? width : x(d.x1) - x(d.x0)))
    .attr("height", (d) => (d === root ? 30 : y(d.y1) - y(d.y0)));
}

function zoomin(d) {
  const group0 = group.attr("pointer-events", "none");
  const group1 = (group = svg.append("g").call(render, d));

  x.domain([d.x0, d.x1]);
  y.domain([d.y0, d.y1]);

  svg
    .transition()
    .duration(750)
    .call((t) => group0.transition(t).remove().call(position, d.parent))
    .call((t) =>
      group1
        .transition(t)
        .attrTween("opacity", () => d3.interpolate(0, 1))
        .call(position, d)
    );
}

function zoomout(d) {
  const group0 = group.attr("pointer-events", "none");
  const group1 = (group = svg.insert("g", "*").call(render, d.parent));

  x.domain([d.parent.x0, d.parent.x1]);
  y.domain([d.parent.y0, d.parent.y1]);

  svg
    .transition()
    .duration(750)
    .call((t) =>
      group0
        .transition(t)
        .remove()
        .attrTween("opacity", () => d3.interpolate(1, 0))
        .call(position, d)
    )
    .call((t) => group1.transition(t).call(position, d.parent));
}
