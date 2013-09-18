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

function newSearch() {
    hasher.setHash($("#searchTerm").val());
}

function componentFromName(name) {
    var id = COMPONENT_IDS[name];
    if(id) {
        return drawing().find(id);
    }
}
function highlightElement() {
    if(this.style.fill.substr(0,15) == "#linearGradient") {
        this.style.fill = "#ffeeaa"
    }
    $(this).children().each(function () {
        highlightElement.call(this);
    });
}
function highlight(element) {
    if(element){
        element.each(function () {
            $(this).children().each(function () {
                highlightElement.call(this);
            });
        });
    }
}

function drawing() {
    return $($("#drawing")[0].contentDocument);
}
function update() {
    var fullUrl = rootUrl + maxResults + "&jql=" + jql;
    refreshGraphics();
    $("object").css("visibility","hidden");
    var loadingtext = $("<br/><span>Searching...</span>")
    $("#graphicsWrapper").append(loadingtext)
    $.getJSON(fullUrl, {}, function (data) {
        graphData = makeGraphData(data.issues);
        console.log(graphData);
        $.each(graphData.components, function (idx, component) {
            var element = componentFromName(component.id);
            highlight(element);
        });
    }).fail(function(error){
            console.log(error);
            alert("Something went wrong!\n\n"+error.responseJSON.errorMessages)
        }).complete(function(){
            $("object").css("visibility","visible")
            loadingtext.remove();
        })
}

//handle hash changes
function handleChanges(newHash, oldHash) {
    jql = newHash;
    $("#searchTerm").val(jql)
    update();
}

function refreshGraphics() {
    var graphics = $("object").attr("data","img/mapping.svg")
    graphics.remove();
    $("#graphicsWrapper").append(graphics);

}

$(function () {
    hasher.changed.add(handleChanges); //add hash change listener
    hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
    hasher.init(); //initialize hasher (start listening for history changes)
});

