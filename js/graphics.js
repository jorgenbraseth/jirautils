
function makeIssueNodeGraphic(node) {
    var nodeGraphic = Viva.Graph.svg('g');
    var type = node.data.nodeType;


    var img = ICON_SET[type];
    if(node.data && node.data.status.name == "Closed" || node.data.status.name == "Resolved"){
        img = ICON_SET[type + "_done"];
    }else if(node.data && node.data.status.name == "In Progress"){
        img = ICON_SET[type + "_in_progress"];
    }

    var issueIcon = makeIcon(32, img);
    nodeGraphic.append(issueIcon);

    if (node.data && node.data.type.iconUrl) {
        var typeIcon = Viva.Graph.svg('image')
            .attr('width', 12)
            .attr('height', 12)
            .attr('x',3)
            .attr('y',6)
            .link(node.data.type.iconUrl);

        nodeGraphic.append(typeIcon);
    }

    if(node.data.poengestimat != undefined) {
        var estimatedPoints = node.data.poengestimat;
        var height = 1 + (12 * estimatedPoints);
        var disc = Viva.Graph.svg("rect")
            .attr("height", height)
            .attr("width",5)
            .attr("y",15-height)
            .attr("x",-20)
            .attr("fill","rgba(0,0,0,0.6)");
        nodeGraphic.append(disc)
    }
    if(node.data.estimat != undefined) {
        var estimatedWeeks = node.data.estimat / 36000;
        var height = 1 + (4 * estimatedWeeks);
        var disc = Viva.Graph.svg("rect")
            .attr("height", height)
            .attr("width",5)
            .attr("y",15-height)
            .attr("x",-25)
            .attr("fill","rgba(255,255,0,0.6)");
        nodeGraphic.append(disc)
    }

    var label = Viva.Graph.svg('g');
    var name = makeLabel(node.id, 35);
    var summary = makeLabel(node.data.summary, 50);
    label.append(name);
    label.append(summary)

    makePinable(nodeGraphic, label, node);
    makeRemoveable(nodeGraphic,node);

    $(label).dblclick(function(){
        graph.removeNode(node.id)
    });


    $(issueIcon).dblclick(function(){
        window.open(node.data.url);
    });

    return nodeGraphic;
}

function makeVersionNodeGraphic(node) {
    var nodeGraphic = Viva.Graph.svg('g');
    var icon = makeIcon(48, ICON_SET[node.data.nodeType]);
    nodeGraphic.append(icon);

    var label = makeLabel(node.id, 45);

    makePinable(nodeGraphic, label, node);
    makeRemoveable(nodeGraphic,node);

    return nodeGraphic;
}

function makePersonNodeGraphic(node) {
    var nodeGraphic = Viva.Graph.svg('g');
    var icon = ICON_SET[node.data.nodeType];
    if(node.data.icon){
        icon = node.data.icon;
    }

    var label = Viva.Graph.svg('g');
    var name = makeLabel(node.data.name, 35);
    var id = makeLabel(node.id, 50);
    label.append(name);
    label.append(id);

//    var label = makeLabel(node.id, 40);

    var icon = makeIcon(36, icon);

    nodeGraphic.append(icon);

    makePinable(nodeGraphic, label, node);
    makeRemoveable(nodeGraphic,node);
    return nodeGraphic;
}

function makeComponentNodeGraphic(node) {
    var nodeGraphic = Viva.Graph.svg('g');
    var icon = ICON_SET[node.data.nodeType];
    if(node.data.icon){
        icon = node.data.icon;
    }
    var icon = makeIcon(42, icon)
    nodeGraphic.append(icon);

    var label = makeLabel(node.id, 40);

    makePinable(nodeGraphic, label, node);
    makeRemoveable(nodeGraphic,node);
    return nodeGraphic;
}

function makeRemoveable(closeElement,node) {
    $(closeElement).on("contextmenu",function(e){
        e.preventDefault();
        graph.removeNode(node.id)
    });
}

function makePinable(nodeGraphic, label, node) {
    var lock = Viva.Graph.svg('image')
        .attr('x', -20)
        .attr('y', -20)
        .attr('width', 16)
        .attr('height', 16)
        .link(ICON_SET.unlocked);

    $(nodeGraphic).mouseover(function () {
        nodeGraphic.append(label);
        nodeGraphic.append(lock);
    });
    $(nodeGraphic).mouseout(function () {
        if (!node.isPinned) {
            lock.remove();
            label.remove();
        }
    });
    $(nodeGraphic).mousedown(function () {
        node.isPinned = true
        lock.link(node.isPinned ? ICON_SET.locked : ICON_SET.unlocked);
    });

    $(lock).click(function () {
        if(node.isPinned){
            node.isPinned = false;
            lock.link(node.isPinned ? ICON_SET.locked : ICON_SET.unlocked);
        }
    });
}

function makeLabel(text, yPos) {
    return Viva.Graph.svg('text')
        .attr('y', yPos)
        .attr("text-anchor", "middle")
        .attr('font-family', 'verdana')
        .text(text);
}

function makeIcon(size, img) {
    var icon = Viva.Graph.svg('image')
        .attr('x', -0.5 * size)
        .attr('y', -0.5 * size)
        .attr('width', size)
        .attr('height', size)
        .link(img);
    return icon;
}
