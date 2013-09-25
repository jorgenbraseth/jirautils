var NODES_TO_SHOW = {
    nodes: true,
    fixVersions: true,
    people: true,
    components: true
};

function upsertNode(node, graph) {
    if (graph.getNode(node.id) == undefined) {
        node.ui = graph.addNode(node.id, node);
    }
}
function makeLink(link, graph) {
    if (graph.getNode(link.from) && graph.getNode(link.to)) {
        link.ui = graph.addLink(link.from, link.to, link);
    }
}
function addNodes(graphData, graph) {
    $.each(graphData.nodes, function (idx, node) {
        upsertNode(node, graph);
    });
    $.each(graphData.issueLinks, function (idx, link) {
        link.ui = graph.addLink(link.from, link.to, link);
    });
}
function addVersions(graphData, graph) {
    $.each(graphData.fixVersions, function (idx, version) {
        upsertNode(version, graph);
    });
    $.each(graphData.versionLinks, function (idx, link) {
        makeLink(link, graph);
    });
}
function addPeople(graphData, graph) {
    $.each(graphData.people, function (idx, person) {
        upsertNode(person, graph);
    });
    $.each(graphData.peopleLinks, function (idx, link) {
        makeLink(link, graph);
    });
}
function addComponents(graphData, graph) {
    $.each(graphData.components, function (idx, component) {
        upsertNode(component, graph);
    });
    $.each(graphData.componentLinks, function (idx, link) {
        makeLink(link, graph);
    });
}
function updateGraphics(graph, graphData) {
    if (NODES_TO_SHOW.nodes) {
        addNodes(graphData, graph);
    }
    if (NODES_TO_SHOW.fixVersions) {
        addVersions(graphData, graph);
    }
    if (NODES_TO_SHOW.people) {
        addPeople(graphData, graph);
    }
    if (NODES_TO_SHOW.components) {
        addComponents(graphData, graph);
    }
}

function newSearch() {
    hasher.setHash($("#searchTerm").val());
}

function update(graph) {
    var fullUrl = rootUrl + maxResults + "&jql=" + encodeURIComponent(jql);
    $.getJSON(fullUrl, {}, function (data) {
        graphData = makeGraphData(data.issues);
        updateGraphics(graph, graphData);
    })
}

function initGraph() {
    graph = Viva.Graph.graph();
    var graphics = Viva.Graph.View.svgGraphics();

    graphics.node(function (node) {
        if (node.data == undefined) return Viva.Graph.svg('image')
            .attr('x', -12).attr('width', 24)
            .attr('y', -12).attr('height', 24)
            .link(ICON_SET.unknown_nodetype);
        var nodeType = node.data.nodeType;
        if (nodeType == "issue" || nodeType == "dependantIssue") {
            var nodeGraphics = makeIssueNodeGraphic(node);
            return  nodeGraphics;
        } else if (nodeType == "version") {
            var nodeGraphics = makeVersionNodeGraphic(node);
            return  nodeGraphics;
        } else if (nodeType == "person") {
            var nodeGraphics = makePersonNodeGraphic(node);
            return  nodeGraphics;
        } else if (nodeType == "component") {
            var nodeGraphics = makeComponentNodeGraphic(node);
            return  nodeGraphics;
        } else {
            return Viva.Graph.svg('image')
                .attr('x', -12).attr('width', 24)
                .attr('y', -12).attr('height', 24)
                .link(ICON_SET.unknown_nodetype);
        }
    }).placeNode(function (nodeUI, pos) {
            var w = nodeUI.getBBox().width;
            var h = nodeUI.getBBox().height;
            nodeUI.attr('transform',
                'translate(' +
                    (pos.x) + ',' + (pos.y) +
                    ')');
        });


    graphics.link(function (link) {
        var style = LINK_STYLES[link.data.type] || LINK_STYLES.default;
        var line = Viva.Graph.svg('path')
            .attr('stroke', style.stroke)
            .attr("stroke-width", style.strokeWidth)
            .attr("stroke-dasharray", style.style);
        if (link.data.type == "Requires") {
            line.attr("marker-start", "url(#arrow)");
        }

        return  line;
    })
        .placeLink(function (linkUI, fromPos, toPos) {
            var data = 'M' + fromPos.x + ',' + fromPos.y +
                'L' + toPos.x + ',' + toPos.y;
            linkUI.attr("d", data);
        });

    layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength: 145,
        springCoeff: 0.00008,
        dragCoeff: 0.02,
        gravity: -5.2,
        theta: 0.3
    });

    var renderer = Viva.Graph.View.renderer(graph,
        {
            layout: layout,
            graphics: graphics,
            container: document.getElementById('graph1')
        });

    renderer.run();

    return graph;
}

//handle hash changes
function handleChanges(newHash, oldHash) {
    jql = newHash;
    $("#searchTerm").val(jql)
    document.title = jql
    graph.clear();
    update(graph);
}

function invertColor(hexTripletColor) {
    if(hexTripletColor == null) {
        return null;
    }
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}

function updateColors(hex) {
    $("body").css("background-color", hex);
    $("text").css("fill", invertColor(hex));
}
$(function () {
    initGraph();

    $("#springLengthSlider").slider({
        range: "min",
        value: 0.00018,
        min: 0.00001,
        max: 0.0005,
        step: 0.00001,
        slide: function (event, ui) {
            layout.springCoeff(ui.value);
        }
    });

    $("#graph1").on("mousemove", function () {
        updateColors($.totalStorage("bgcolor"));
    });

    var bgcolor = $.totalStorage("bgcolor");
    updateColors(bgcolor);
    $("#bgcolor").minicolors({
        control: "saturation",
        defaultValue: bgcolor,
        change: function (hex, opacity) {
            updateColors(hex);
            $.totalStorage("bgcolor", hex);
        }
    });
    $("#bgcolor").change();
    $("body").css("background-color", bgcolor);
    $("text").css("fill", invertColor(bgcolor));

    $(".toggleNodeType").each(function () {
        var el = $(this);
        el.click(function () {
            var type = el.data("node-type");
            var checked = el.is(":checked");
            NODES_TO_SHOW[type] = checked;

            if (!checked) {
                removeNodes(graph, graphData[type]);
            } else {
                updateGraphics(graph, graphData);
            }
        });
    });

    hasher.changed.add(handleChanges); //add hash change listener
    hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
    hasher.init(); //initialize hasher (start listening for history changes)

});

