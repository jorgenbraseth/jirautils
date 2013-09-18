var NODES_TO_SHOW = {
    nodes: true,
    fixVersions: true,
    people: true,
    components: true
};

function upsertNode(node, graph) {
    if(graph.getNode(node.id) == undefined){
        node.ui = graph.addNode(node.id, node);
    }
}
function makeLink(link, graph) {
    if(graph.getNode(link.from) && graph.getNode(link.to)) {
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
    if(NODES_TO_SHOW.nodes){
        addNodes(graphData, graph);
    }
    if(NODES_TO_SHOW.fixVersions){
        addVersions(graphData, graph);
    }
    if(NODES_TO_SHOW.people){
        addPeople(graphData, graph);
    }
    if(NODES_TO_SHOW.components){
        addComponents(graphData, graph);
    }
}

function newSearch(){
    hasher.setHash($("#searchTerm").val());
}

function invertColor(hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
}

function highlight(component) {
    console.log("Highlighting "+component.id)
    var viz = drawing().find("#" + component.id.replace(" ", "_"));
    viz.each(function(){
       $(this).children().each(function(){
           if(this.style.fill){
               this.style.fill=invertColor(this.style.fill);
           }
           if(this.style.stroke){
               this.style.stroke=invertColor(this.style.stroke);
           }
       });
    });
}

function drawing() {
    return $($("#drawing")[0].contentDocument);
}
function update() {
    var fullUrl =  rootUrl + maxResults + "&jql=" + jql;
    $.getJSON(fullUrl, {}, function (data) {
        graphData = makeGraphData(data.issues);
        console.log(graphData)
        $.each(graphData.components,function(idx,component){
            highlight(component);
        });
    })
}

//handle hash changes
function handleChanges(newHash, oldHash){
    jql = newHash;
    $("#searchTerm").val(jql)
    update();

}

$(function () {
    hasher.changed.add(handleChanges); //add hash change listener
    hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
    hasher.init(); //initialize hasher (start listening for history changes)

});

