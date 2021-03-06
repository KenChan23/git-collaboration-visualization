(function(){
  var width = 1500,
      height = 1500,
      root;

  var force = d3.layout.force()
      .linkDistance(80)
      .charge(-300)
      .gravity(.05)
      .size([width, height])
      .on("tick", tick);

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var link = svg.selectAll(".link"),
      node = svg.selectAll(".node");

  queue()
      .defer(d3.json, "../../sample_data/test.json")
      .defer(d3.json, "../../sample_data/viz.json")
      .await(function(error, file1, file2) { console.log(file1, file2); });


  d3.json("../../sample_data/test.json", function(error, json) {
    if (error) throw error;

    console.log(json);

    // linkScale = d3.scale.linear()
    //                     .domain([])
    //                     .range([]);

    root = json;
    update();
  });

  function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

    // Update links.
    link = link.data(links, function(d) { return d.target.id; });

    link.exit().remove();

    link.enter().insert("line", ".node")
        // .attr("class", "link")
        .attr("stroke-width", function(d){
          console.log('Source: ', d.source);  //  Sources are the repositories/branches.
          console.log('Target: ', d.target);  //  Targets are the contributors.

          if(d.source.key){
            return Math.sqrt(d.source.values);
          }
          else if(d.target.key){
            return Math.sqrt(d.target.values);
          }
          else{
            return 2;
          }
        })
       .attr("stroke", function(d){
          return (d.source.key || d.target.key) ? '#88D3A1' : '#646464';
       });

    // Update nodes.
    node = node.data(nodes, function(d) { console.log('Node: ', d); return d.id; });

    node.exit().remove();

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .on("click", click)
        .call(force.drag);

    nodeEnter.append("circle")
        .attr("r", function(d, i) { 
          return (d.values) ? d.values : 4.5; 
        });

    nodeEnter.append("text")
        .attr("dy", ".35em")
        .text(function(d) { return (d.name) ? d.name : d.key; })
        .style("fill", "white");

    node.select("circle")
        .style("fill", function(d) {
          return "#805489";
        });
  }

  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  // Toggle children on click.
  function click(d) {
    if (d3.event.defaultPrevented) return; // ignore drag
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update();
  }

  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
      if (node.children) 
        node.children.forEach(recurse);
      if (!node.id) 
        node.id = ++i;
      nodes.push(node);
    }

    recurse(root);
    return nodes;
  }
})();